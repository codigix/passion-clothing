const hfService = require('../services/huggingface');
const chromaService = require('../services/chroma');
const mysqlService = require('../services/mysql');
const pricingService = require('../services/pricing');
const templatesService = require('../services/templates');

/**
 * Handle incoming chatbot messages
 */
async function handleMessage(req, res) {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    console.log(`💬 User message received: "${message}"`);

    // 1. Detect Intent and extract entities
    const parsed = await hfService.parseIntent(message);
    console.log(`🎯 Classified Intent:`, parsed);

    let context = 'No specific context retrieved.';
    let isActionPrompt = false;
    let pricingResult = null;

    // Detect material/BOM template queries
    const isMaterialQuery = message.toLowerCase().includes('material') || 
                            message.toLowerCase().includes('create') || 
                            message.toLowerCase().includes('bom') || 
                            message.toLowerCase().includes('design') || 
                            message.toLowerCase().includes('item') || 
                            message.toLowerCase().includes('product');

    // Detect pricing queries
    const isPriceQuery = message.toLowerCase().includes('price') || 
                         message.toLowerCase().includes('cost') || 
                         message.toLowerCase().includes('how much') || 
                         message.toLowerCase().includes('rate');

    // 2. Resolve Context based on intent and query type
    if (isMaterialQuery) {
      // Find what product they are asking about
      let productToSearch = parsed.entities?.product_name || '';
      if (!productToSearch) {
        productToSearch = message.replace(/create|design|bom|material|materials|item|product|for|of|a|the|show|list|\?/gi, '').trim();
      }
      
      const templateResult = templatesService.findTemplate(productToSearch);
      if (templateResult) {
        let matListText = `Standard Material Specifications for ${templateResult.productName}:\n` +
                          `Description: ${templateResult.description}\n\n`;
        templateResult.materials.forEach(m => {
          matListText += `- **${m.material}** (${m.specification}): ${m.qty} ${m.unit}\n`;
        });
        context = matListText;
      } else {
        context = `No matching pre-configured garment material template found for "${productToSearch}". Guide the user with standard design principles.`;
      }
    }
    else if (isPriceQuery) {
      // Extract product name
      let itemToSearch = parsed.entities?.product_name || '';
      if (!itemToSearch) {
        // Fallback regex to capture item names after "of", "for", "price", "cost"
        const matches = message.match(/(?:price|cost|rate)\s+(?:of|for)?\s+([A-Za-z0-9\s]+)/i);
        if (matches) {
          itemToSearch = matches[1].trim();
        } else {
          // Fallback parsing: remove query words
          itemToSearch = message.replace(/price|cost|rate|how much|is|for|of|the|what|\?/gi, '').trim();
        }
      }
      
      if (!itemToSearch || itemToSearch.length < 2) {
        itemToSearch = 'clothing paint'; // default fallback for demo
      }

      try {
        pricingResult = await pricingService.lookupPrice(itemToSearch);
        if (pricingResult.foundInDb) {
          context = `ERP Database Price Match:\n` +
                    `- Item Name: ${pricingResult.product_name}\n` +
                    `- Unit Cost: ₹${pricingResult.price} per ${pricingResult.unit}\n` +
                    `- Source: Internal ERP Database Record.`;
        } else {
          context = `Online Market Price Search for "${pricingResult.product_name}":\n` +
                    `- IndiaMART: ${pricingResult.indiamart}\n` +
                    `- Alibaba: ${pricingResult.alibaba}\n` +
                    `- Recommended Unit Cost: ₹${pricingResult.average} per ${pricingResult.unit}\n` +
                    `- Confidence: ${pricingResult.confidence}\n` +
                    `- Note: Not found in ERP Database. Present the estimated rate and suggest applying it.`;
        }
      } catch (priceErr) {
        console.error('❌ Price lookup failed, using fallback context:', priceErr.message);
        context = `Pricing lookup error. Fallback Online Pricing:\n- Item: ${itemToSearch}\n- Estimated Rate: ₹235\n- Sources: IndiaMART, Alibaba`;
      }
    }
    else if (parsed.intent === 'QUERY_ERP_DATA') {
      try {
        if (parsed.action === 'CHECK_INVENTORY') {
          const items = await mysqlService.getLowStockAlerts();
          if (items.length > 0) {
            context = `Live Low Stock Alerts:\n` + items.map(i => `- ${i.name} (${i.code}): ${i.availableQuantity} ${i.unit} remaining (Reorder Level: ${i.minQuantity})`).join('\n');
          } else {
            context = `Inventory Check: All stock levels are currently healthy and above safety thresholds.`;
          }
        } 
        else if (parsed.action === 'PRODUCTION_STATUS') {
          const prod = await mysqlService.getProductionStatus();
          context = `Live Production Status:\n` +
                    `- Total Work Orders: ${prod.total}\n` +
                    `- Stages Count: ${JSON.stringify(prod.statusCounts)}\n` +
                    `- Recent Work Orders:\n` +
                    prod.recentJobs.map(j => `  • ${j.productionNumber}: ${j.productName} (Qty: ${j.quantity}) - Status: ${j.status}`).join('\n');
        } 
        else {
          // Default: Client Requirements Summary
          const clientReqs = await mysqlService.getClientRequirementsStats();
          context = `Live Client Requirements Summary:\n` +
                    `- Total Requirements: ${clientReqs.stats.total}\n` +
                    `- Status breakdown: Draft: ${clientReqs.stats.Draft}, Approved: ${clientReqs.stats.Approved}, Quotation Generated: ${clientReqs.stats["Quotation Generated"] || 0}, Converted to SO: ${clientReqs.stats["Converted to SO"] || 0}\n` +
                    `- Recent Requirements:\n` +
                    clientReqs.recent.map(r => `  • ${r.requirement_number}: ${r.customer_name} - ${r.product_name} (${r.quantity} pcs) - Status: ${r.status}`).join('\n');
        }
      } catch (dbError) {
        console.warn('⚠️ Database query failed, using static fallback for context:', dbError.message);
        context = `Database is currently unreachable. Fallback mockup metrics:\n` +
                  `- Client Requirements: 4 total (1 Draft, 0 Approved, 3 Quotations)\n` +
                  `- Inventory Low Stock Alerts: 2 items (Aluminium Section, Joint Cleat)\n` +
                  `- Production Orders: 8 active.`;
      }
    } 
    else if (parsed.intent === 'ERP_ACTION') {
      if (parsed.action === 'CREATE_REQUIREMENT') {
        const customerName = parsed.entities?.customer_name;
        const quantity = parsed.entities?.quantity;
        const productName = parsed.entities?.product_name || 'Uniform T-Shirts';

        if (!customerName || !quantity) {
          // Missing entities, ask the user to clarify
          isActionPrompt = true;
          context = `Prompt the user friendly to provide the missing details (we need BOTH a client/customer name and a quantity) in order to log a client requirement.`;
        } else {
          try {
            const requirement = await mysqlService.createClientRequirementDirect({
              customerName,
              quantity,
              productName,
              description: 'Created automatically via Passion AI Assistant'
            });
            context = `SUCCESS: I have created a new Client Requirement with number **${requirement.requirement_number}** for **${requirement.customer_name}** with quantity **${requirement.quantity}** pcs.`;
          } catch (createError) {
            console.error('❌ Failed to create requirement:', createError.message);
            context = `ERROR: Failed to save the client requirement in the database. Please guide the user to fill out the form manually.`;
          }
        }
      } else {
        context = `Inform the user that the action ${parsed.action} is not directly supported via chat commands yet, but they can click the sidebar to manage it.`;
      }
    } 
    else if (parsed.intent === 'KNOWLEDGE_SEARCH') {
      const searchResults = await chromaService.searchSOPs(message, 3);
      if (searchResults.length > 0) {
        context = `Standard Operating Procedure (SOP) Reference Material:\n` +
                  searchResults.map((r, idx) => `[Source ${idx+1} - ${r.category}]: ${r.text}`).join('\n\n');
      } else {
        context = `No matching SOP documentation found. Answer using general manufacturing ERP best practices.`;
      }
    }

    // 3. Formulate prompt for Hugging Face
    const systemPrompt = `You are the Passion ERP AI Assistant, a professional virtual helper for a clothing and garment manufacturing ERP system.
Your job is to answer queries and guide employees with operations.
Use the live database context or SOP context provided below to formulate your response.

Guidelines:
1. Be concise, polite, and direct.
2. If database query shows success, report the created document number clearly.
3. If data is retrieved, format it beautifully with bullet points.
4. Keep technical guidelines aligned with the SOP manuals.
5. If displaying online pricing estimate, inform the user they can apply the suggested rate to the database using the action button.

---
Live ERP Context:
${context}
---`;

    // Format history for chat completion
    const formattedHistory = history.map(h => ({
      role: h.sender === 'user' ? 'user' : 'assistant',
      content: h.text
    }));
    formattedHistory.push({ role: 'user', content: message });

    // 4. Generate Answer
    const responseText = await hfService.getChatCompletion(formattedHistory, systemPrompt);

    res.json({
      text: responseText,
      parsedIntent: parsed,
      isActionPrompt,
      suggestRate: pricingResult && !pricingResult.foundInDb ? true : false,
      rate: pricingResult ? pricingResult.average : null,
      item: pricingResult ? pricingResult.product_name : null
    });

  } catch (error) {
    console.error('❌ Chatbot Controller Error:', error);
    res.status(500).json({ 
      message: 'Failed to process message',
      error: error.message 
    });
  }
}

/**
 * Handle user clicking "Apply Rate"
 */
async function applyRate(req, res) {
  try {
    const { item, rate } = req.body;
    if (!item || !rate) {
      return res.status(400).json({ message: 'Item name and rate are required' });
    }

    console.log(`Applying rate of ₹${rate} to item: "${item}"`);
    const result = await pricingService.applyPriceRate(item, rate);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('❌ Apply rate controller failed:', error);
    res.status(500).json({ 
      message: 'Failed to apply rate to database',
      error: error.message 
    });
  }
}

module.exports = {
  handleMessage,
  applyRate
};
