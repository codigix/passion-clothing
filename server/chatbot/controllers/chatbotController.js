const axios = require('axios');
const hfService = require('../services/huggingface');
const chromaService = require('../services/chroma');
const mysqlService = require('../services/mysql');
const pricingService = require('../services/pricing');
const templatesService = require('../services/templates');

// Product image search mapping
const PRODUCT_IMAGES = {
  'tshirt': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
  't-shirt': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
  'polo tshirt': 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500',
  'polo': 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500',
  'shirt': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500',
  'formal shirt': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500',
  'joggers': 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500',
  'jogger': 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500',
  'hoodie': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
  'jeans': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500',
  'trousers': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500',
  'trouser': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500',
  'shorts': 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500',
  'short': 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500',
  'jacket': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
  'dresses': 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=500',
  'dress': 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=500',
  'uniforms': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500',
  'uniform': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500',
  'sports wear': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500',
  'sportswear': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500'
};

const FALLBACK_GALLERY = {
  'floral': [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=500',
    'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=500',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500'
  ],
  'pink': [
    'https://images.unsplash.com/photo-1520635292-145011485135?w=500',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=500',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500',
    'https://images.unsplash.com/photo-1549064482-6779ba3292fe?w=500',
    'https://images.unsplash.com/photo-1566207274740-0f8cf6b7d5a5?w=500'
  ],
  'polo': [
    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500',
    'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=500',
    'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=500',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
    'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=500',
    'https://images.unsplash.com/photo-1625910513397-22d7d8e6a578?w=500'
  ],
  'hoodie': [
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500',
    'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=500',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500',
    'https://images.unsplash.com/photo-1609743522653-52354461eb27?w=500'
  ],
  'denim': [
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500',
    'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500',
    'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=500',
    'https://images.unsplash.com/photo-1481824429379-07aa5e5b0739?w=500',
    'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=500'
  ],
  'default': [
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500',
    'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=500',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500',
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=500'
  ]
};

/**
 * Convert user's query into fashion-specific Google Search parameters
 */
function optimizeQuery(query) {
  const cleanQuery = query.toLowerCase()
    .replace(/show|send|display|view|give|me|image|picture|photo|look|draw|example|illustration|visual/gi, '')
    .trim();
  
  if (!cleanQuery) return "women's fashion clothing";
  
  // Specific optimized query guidelines mapping
  if (cleanQuery === 'floral prints' || cleanQuery === 'floral print') {
    return "floral print women's clothing";
  }
  if (cleanQuery === 'pink patterns' || cleanQuery === 'pink pattern') {
    return "pink floral clothing patterns";
  }
  if (cleanQuery === 'denim jacket') {
    return "women denim jacket";
  }
  if (cleanQuery === 'polo t-shirt' || cleanQuery === 'polo') {
    return "women polo t-shirt";
  }
  if (cleanQuery === 'black hoodie') {
    return "black hoodie women";
  }
  if (cleanQuery === 'cotton fabric' || cleanQuery === 'cotton') {
    return "cotton fabric clothing";
  }
  if (cleanQuery === 'oversized t-shirt') {
    return "oversized t-shirt women";
  }
  
  // Generic words safeguard
  const genericWords = ['pink', 'floral', 'jacket', 'striped', 'checked', 'patterns', 'pattern', 'solid', 'denim', 'cotton', 'polka', 'tie-dye', 'abstract', 'geometric', 'embroidered'];
  const fashionKeywords = ['clothing', 'fashion', 'apparel', 'outfit', 'women', 'men', 'kid', 'shirt', 'dress', 'top', 'bottom', 'wear', 't-shirt'];
  
  const containsGeneric = genericWords.some(w => cleanQuery.includes(w));
  const hasFashionKeyword = fashionKeywords.some(w => cleanQuery.includes(w));
  
  if (containsGeneric && !hasFashionKeyword) {
    if (cleanQuery.includes('women')) {
      return `${cleanQuery} clothing`;
    } else {
      return `${cleanQuery} women's clothing`;
    }
  }
  
  return cleanQuery;
}

/**
 * Scrape Google Images (supports modern + legacy layouts and mock sandbox targets)
 */
async function searchGoogleImages(query) {
  try {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
    console.log(`[Google Image Search] Querying: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 3000
    });
    
    const html = response.data;
    const imgUrls = [];
    let match;
    
    // 1. Try matching "imgurl":"..." (Google JSON structure)
    const imgurlRegex = /"imgurl":"(http[s]?:\/\/.*?)"/g;
    while ((match = imgurlRegex.exec(html)) !== null) {
      try {
        let imgUrl = match[1];
        if (imgUrl.includes('\\u')) {
          imgUrl = JSON.parse(`"${imgUrl}"`);
        }
        imgUrl = imgUrl.replace(/\\/g, '');
        if (!imgUrls.includes(imgUrl) && imgUrl.startsWith('http')) {
          imgUrls.push(imgUrl);
        }
      } catch (e) {}
    }
    
    // 2. Try matching "ou":"..." (legacy Google JSON structure)
    const ouRegex = /"ou":"(http[s]?:\/\/.*?)"/g;
    while ((match = ouRegex.exec(html)) !== null) {
      try {
        let imgUrl = match[1];
        if (imgUrl.includes('\\u')) {
          imgUrl = JSON.parse(`"${imgUrl}"`);
        }
        imgUrl = imgUrl.replace(/\\/g, '');
        if (!imgUrls.includes(imgUrl) && imgUrl.startsWith('http')) {
          imgUrls.push(imgUrl);
        }
      } catch (e) {}
    }
    
    // 3. Try matching encrypted-tbn cached images
    const tbnRegex = /https:\/\/encrypted-tbn[0-9]\.gstatic\.com\/images\?q=tbn:[a-zA-Z0-9\-_]+/g;
    while ((match = tbnRegex.exec(html)) !== null) {
      const imgUrl = match[0];
      if (!imgUrls.includes(imgUrl)) {
        imgUrls.push(imgUrl);
      }
    }
    
    // 4. Try matching standard img tags src attributes
    const imgTagRegex = /<img[^>]+src="([^"]+)"/g;
    while ((match = imgTagRegex.exec(html)) !== null) {
      const src = match[1];
      if (src.startsWith('http') && !src.includes('google') && !imgUrls.includes(src)) {
        imgUrls.push(src);
      }
    }
    
    // 5. Try matching any image URL ending in extension in the entire HTML (common mock page structure)
    const extRegex = /(https?:\/\/[^\s"'<>\(\)\\,\\;]+\.(?:jpg|jpeg|png|webp|gif))/gi;
    while ((match = extRegex.exec(html)) !== null) {
      const imgUrl = match[1];
      if (!imgUrls.includes(imgUrl) && !imgUrl.includes('google') && !imgUrl.includes('bing') && !imgUrl.includes('w3.org')) {
        imgUrls.push(imgUrl);
      }
    }
    
    console.log(`[Google Image Search] Extracted ${imgUrls.length} image URLs.`);
    return imgUrls;
  } catch (error) {
    console.error('[Google Image Search] Error:', error.message);
  }
  return [];
}

/**
 * Curated high-quality Unsplash fallbacks when search fails or is rate-limited
 */
function getCuratedFallbackImages(query) {
  const q = query.toLowerCase();
  if (q.includes('floral') || q.includes('pattern') || q.includes('print')) return FALLBACK_GALLERY.floral;
  if (q.includes('pink')) return FALLBACK_GALLERY.pink;
  if (q.includes('polo')) return FALLBACK_GALLERY.polo;
  if (q.includes('hoodie')) return FALLBACK_GALLERY.hoodie;
  if (q.includes('denim') || q.includes('jean') || q.includes('jacket')) return FALLBACK_GALLERY.denim;
  return FALLBACK_GALLERY.default;
}

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

    const erpKeywords = ['erp', 'bom', 'bill of materials', 'rfq', 'production', 'inventory', 'manufacturing', 'cad', 'stock', 'requirement', 'order', 'status'];
    const userRequestedERP = erpKeywords.some(kw => message.toLowerCase().includes(kw));

    // 1. Detect Intent and extract entities
    const parsed = await hfService.parseIntent(message);
    console.log(`🔍 Classified Intent:`, parsed);

    let context = 'No specific context retrieved.';
    let isActionPrompt = false;
    let pricingResult = null;

    // Detect Image/Visual request or color/pattern query
    const isImageRequest = /(?:show|send|display|view|give|me|example)?\s*(?:image|picture|photo|look|draw|illustration|visual)/i.test(message);
    const messageLower = message.toLowerCase();
    
    // Check if query is about color, pattern, style or specific items to suggest visual
    const visualTriggers = ['pattern', 'color', 'shade', 'style', 'wear', 'tshirt', 'shirt', 'polo', 'jogger', 'hoodie', 'jean', 'trouser', 'short', 'jacket', 'dress', 'uniform'];
    const wantsVisuals = isImageRequest || visualTriggers.some(t => messageLower.includes(t));

    let matchedImageKey = null;
    let matchedImageUrl = null;
    let googleImages = [];
    let isDbImage = false;
    
    if (wantsVisuals) {
      // First check local static database
      for (const key of Object.keys(PRODUCT_IMAGES)) {
        if (messageLower.includes(key)) {
          matchedImageKey = key;
          matchedImageUrl = PRODUCT_IMAGES[key];
          isDbImage = true;
          break;
        }
      }

      // If no product image exists, search the web for relevant fashion reference images
      if (!matchedImageUrl) {
        const optimizedQuery = optimizeQuery(message);
        matchedImageKey = optimizedQuery;
        googleImages = await searchGoogleImages(optimizedQuery);
        
        // If Google search returns < 4 images (blocked/offline), use the curated fallback fashion gallery
        if (googleImages.length < 4) {
          googleImages = getCuratedFallbackImages(optimizedQuery);
        }
      }
    }

    let imagePromptContext = '';
    if (matchedImageUrl) {
      imagePromptContext = `Matching Product Image Available:\nUse this URL to display the image using markdown: ![${matchedImageKey}](${matchedImageUrl})\nMake sure to display the image at the very beginning of the response.`;
    } else if (googleImages && googleImages.length > 0) {
      imagePromptContext = `Google Search Image Results available: ${googleImages.slice(0, 6).join(', ')}`;
    }

    // Resolve context for fashion/style query vs ERP query
    if (userRequestedERP) {
      const isMaterialQuery = messageLower.includes('material') || 
                              messageLower.includes('create') || 
                              messageLower.includes('bom') || 
                              messageLower.includes('item') || 
                              messageLower.includes('product');

      const isPriceQuery = messageLower.includes('price') || 
                           messageLower.includes('cost') || 
                           messageLower.includes('rate');

      if (isMaterialQuery) {
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
          context = `No matching pre-configured garment material template found for "${productToSearch}".`;
        }
      }
      else if (isPriceQuery) {
        let itemToSearch = parsed.entities?.product_name || '';
        if (!itemToSearch) {
          const matches = message.match(/(?:price|cost|rate)\s+(?:of|for)?\s+([A-Za-z0-9\s]+)/i);
          if (matches) {
            itemToSearch = matches[1].trim();
          } else {
            itemToSearch = message.replace(/price|cost|rate|how much|is|for|of|the|what|\?/gi, '').trim();
          }
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
                      `- Recommended Unit Cost: ₹${pricingResult.average} per ${pricingResult.unit}`;
          }
        } catch (priceErr) {
          context = `Pricing lookup error. Fallback Online Pricing:\n- Item: ${itemToSearch}\n- Estimated Rate: ₹235`;
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
            const clientReqs = await mysqlService.getClientRequirementsStats();
            context = `Live Client Requirements Summary:\n` +
                      `- Total Requirements: ${clientReqs.stats.total}\n` +
                      `- Status breakdown: Draft: ${clientReqs.stats.Draft}, Approved: ${clientReqs.stats.Approved}\n` +
                      `- Recent Requirements:\n` +
                      clientReqs.recent.map(r => `  • ${r.requirement_number}: ${r.customer_name} - ${r.product_name} (${r.quantity} pcs) - Status: ${r.status}`).join('\n');
          }
        } catch (dbError) {
          context = `Database is currently unreachable. Mockup metrics:\n- Client Requirements: 4 total\n- Inventory Low Stock Alerts: 2 items\n- Production Orders: 8 active.`;
        }
      } 
      else if (parsed.intent === 'ERP_ACTION' && parsed.action === 'CREATE_REQUIREMENT') {
        const customerName = parsed.entities?.customer_name;
        const quantity = parsed.entities?.quantity;
        const productName = parsed.entities?.product_name || 'Uniform T-Shirts';

        if (!customerName || !quantity) {
          isActionPrompt = true;
          context = `Prompt the user to provide the missing details (client/customer name and quantity) to log the client requirement.`;
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
            context = `ERROR: Failed to save the client requirement in the database.`;
          }
        }
      }
    } else {
      // Normal Shopping Assistant Mode (No ERP terms)
      let productToSearch = parsed.entities?.product_name || '';
      if (!productToSearch) {
        productToSearch = message.replace(/create|design|bom|material|materials|item|product|for|of|a|the|show|list|price|cost|rate|\?/gi, '').trim();
      }

      const templateResult = templatesService.findTemplate(productToSearch);
      if (templateResult) {
        let fashionText = `Product Style: ${templateResult.productName}\n` +
                          `Description: ${templateResult.description}\n` +
                          `Suggested Fabrics and Materials:\n`;
        templateResult.materials.forEach(m => {
          const nameLower = m.material.toLowerCase();
          if (!nameLower.includes('thread') && 
              !nameLower.includes('polybag') && 
              !nameLower.includes('box') && 
              !nameLower.includes('carton') && 
              !nameLower.includes('label') && 
              !nameLower.includes('tag') && 
              !nameLower.includes('eyelet') && 
              !nameLower.includes('interlining')) {
            fashionText += `- **${m.material}** (${m.specification})\n`;
          }
        });
        context = fashionText;
      } else {
        context = `No matching product template for "${productToSearch}". Answer using standard fashion knowledge.`;
      }
    }

    // 3. Formulate prompt for Hugging Face
    const systemPrompt = `You are an AI Fashion & Clothing Personal Stylist and Shopping Assistant.
Your job is to help customers discover clothing, fashion styles, fabrics, colors, patterns, fits, and products through an engaging, natural, and highly interactive conversation.

Guidelines for Conversation:
1. Act as a premium personal stylist. Avoid generic, dry, textbook-style definitions. Guide the user with style advice and shopping recommendations.
2. Use appealing emojis to organize option lists cleanly (e.g., 👕 T-Shirts, 👔 Shirts, 🧥 Hoodies, 👗 Dresses, 👖 Jeans).
3. Keep the conversation focused. Ask exactly one relevant, shopping-oriented follow-up question at a time (e.g., Target audience like Men/Women/Kids, preferred occasions like Casual/Formal/Activewear, or color/fabric preferences).
4. Organize information into clear, accurate categories:
   - **Tops**: T-Shirts, Polo T-Shirts, Shirts, Hoodies, Sweatshirts, Crop Tops, Tunics, Camisoles, and Tank Tops.
   - **Bottoms**: Jeans, Trousers, Shorts, Joggers, Skirts, and Leggings. (CRITICAL: NEVER classify one-piece dresses or jumpsuits as Bottoms).
   - **Dresses & Jumpsuits**: One-piece dresses, Jumpsuits, Rompers, and Kurtis.
   - **Outerwear**: Jackets, Coats, Blazers, and Cardigans.
5. Remember previous conversation history to keep the flow seamless.
6. CRITICAL: Do NOT write or generate any markdown image tags (like ![alt](url)) yourself. The backend automatically prepends the matching image. Simply focus on writing the styling suggestions or response.

Strict Rules (NEVER do these unless the user explicitly asks):
- Do NOT mention BOM, ERP, RFQ, Design Templates, Production, Inventory, Manufacturing, CAD, internal modules, or system URLs.
- Never redirect users to ERP pages.
- Never mention internal system URLs.
- Never invent ERP workflows.

---
Live Context / Available Images:
${context}
${imagePromptContext}
---`;

    // Format history for chat completion
    const formattedHistory = history.map(h => ({
      role: h.sender === 'user' ? 'user' : 'assistant',
      content: h.text
    }));
    formattedHistory.push({ role: 'user', content: message });

    // 4. Generate Answer
    let responseText = await hfService.getChatCompletion(formattedHistory, systemPrompt);

    // Prepend the image to responseText directly in the backend code for perfect rendering and single-line format
    if (isDbImage && matchedImageUrl) {
      const cleanKey = matchedImageKey.replace(/[\[\]\(\)\n]/g, '').trim();
      responseText = `![${cleanKey}](${matchedImageUrl})\n\n${responseText}`;
    } else if (googleImages && googleImages.length > 0) {
      const imagesToShow = googleImages.slice(0, 6);
      const markdownImages = imagesToShow.map((img, idx) => `![Style ${idx + 1}](${img})`).join('\n');
      responseText = `${markdownImages}\n\n${responseText}`;
    }

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
