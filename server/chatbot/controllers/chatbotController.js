const axios = require('axios');
const hfService = require('../services/huggingface');
const chromaService = require('../services/chroma');
const mysqlService = require('../services/mysql');
const pricingService = require('../services/pricing');
const templatesService = require('../services/templates');
const imageService = require('../services/imageService');

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
 * Handle incoming chatbot messages
 */
async function handleMessage(req, res) {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    console.log(`💬 User message received: "${message}"`);

    const textLower = message.toLowerCase().trim();

    // 1. Detect Intent and extract entities using HF parsing
    const parsed = await hfService.parseIntent(message);
    console.log(`🔍 NLP Classifier Parsing:`, parsed);

    // 2. Detect Product Type
    const productTypes = [
      'polo t-shirt', 'polo tshirt', 'polo shirt', 'polo',
      'round neck t-shirt', 'round neck tshirt',
      'v-neck t-shirt', 'v-neck tshirt',
      'oversized t-shirt', 'oversized tshirt',
      't-shirt', 'tshirt', 'sweatshirt', 'hoodie',
      'track pant', 'trackpant', 'cargo pant', 'cargopant', 'cargo',
      'jeans', 'jean', 'trouser', 'trousers', 'shorts', 'short',
      'formal shirt', 'casual shirt', 'denim shirt', 'shirt',
      'denim jacket', 'jacket', 'blazer', 'coat', 'kurti', 'dress', 'skirt',
      'jogger', 'joggers', 'leggings', 'uniform', 'sportswear', 'activewear', 'nightwear',
      'kids wear', 'kidswear', 'baby wear', 'babywear', 'fabric', 'shoes', 'bags', 'bag', 'caps', 'cap', 'accessories'
    ];

    let detectedProduct = '';
    for (const prod of productTypes) {
      const regex = new RegExp(`\\b${prod}s?\\b`, 'i');
      if (regex.test(textLower)) {
        detectedProduct = prod;
        break;
      }
    }

    if (!detectedProduct && parsed.entities && parsed.entities.product_name) {
      detectedProduct = parsed.entities.product_name.toLowerCase();
    }

    // 3. Classify Explicit Intent Type
    let intentType = 'IMAGE_REQUEST'; // default fallback

    const isTryOn = /\b(try on|try-on|virtual try|wear|fitting|fit|preview)\b/i.test(textLower) || 
                    (parsed && parsed.intent === 'VIRTUAL_TRY_ON');

    const isBOM = /\b(bom|material|component|fabric|accessories|thread|label|bag|polybag|box|list)\b/i.test(textLower) ||
                  textLower.includes('bill of materials') || 
                  textLower.includes('apply material') || 
                  textLower.includes('generate bom');

    const isPrice = /\b(price|cost|rate|how much)\b/i.test(textLower);

    const isInfo = /\b(explain|describe|tell me about|what is|information|info)\b/i.test(textLower);

    const isImage = /\b(show|send|display|view|give|image|picture|photo|look|draw|example|illustration|visual|gallery|images)\b/i.test(textLower);

    if (isTryOn) {
      intentType = 'VIRTUAL_TRY_ON';
    } else if (isBOM) {
      intentType = 'BOM_REQUEST';
    } else if (isPrice) {
      intentType = 'PRICE_REQUEST';
    } else if (isInfo) {
      intentType = 'PRODUCT_INFO';
    } else if (isImage) {
      intentType = 'IMAGE_REQUEST';
    } else if (detectedProduct) {
      intentType = 'IMAGE_REQUEST';
    } else {
      intentType = 'CONVERSATION';
    }

    console.log(`🎯 Categorized Chatbot Workflow: [${intentType}] for Product: [${detectedProduct || 'none'}]`);

    let responseText = '';
    let images = [];
    let suggestMaterialList = false;
    let materials = null;
    let materialListName = '';
    let totalEstimatedCost = 0;
    let isActionPrompt = false;
    let pricingResult = null;
    let suggestTryOn = false;
    let tryOnProduct = '';

    // 4. Execute matching workflow routing
    if (intentType === 'VIRTUAL_TRY_ON') {
      suggestTryOn = true;
      tryOnProduct = detectedProduct || 'Casual Shirt';
      const formattedProductName = tryOnProduct.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      responseText = `✨ **Virtual Try-On Initiated** for **${formattedProductName}**!\n\nI can help you visualize how this garment fits your body structure. Click the **"✨ Try On Now"** button below to upload your photo or open your camera to begin the AI fitting process!`;
    }
    else if (intentType === 'BOM_REQUEST') {
      // BOM/Material list workflow (DO NOT fetch images)
      const productToSearch = detectedProduct || 'hoodie';
      const templateResult = templatesService.findTemplate(productToSearch);
      
      if (templateResult) {
        suggestMaterialList = true;
        materialListName = templateResult.productName;
        
        const rates = {
          'pique fabric': 100, 'piqué cotton fabric': 100, 'single jersey fabric': 150,
          'collar rib': 100, 'rib collar': 100, 'sleeve rib': 100, 'sleeve rib / cuff': 100,
          'polyester thread': 60, 'sewing thread': 60, 'neck herringbone tape': 15,
          'neck label': 5, 'brand label': 5, 'size label': 3, 'wash care label': 5,
          'hang tag': 5, 'poly bag': 5, 'polybag': 5, 'carton box': 40
        };

        const enriched = templateResult.materials.map(m => {
          const nameClean = m.material.toLowerCase().trim();
          let unitCost = rates[nameClean] || 10;
          const qtyVal = parseFloat(m.qty) || 0;
          return {
            material: m.material,
            specification: m.specification,
            qty: m.qty,
            unit: m.unit,
            unitCost,
            totalCost: Math.round(qtyVal * unitCost)
          };
        });

        materials = enriched;
        totalEstimatedCost = enriched.reduce((s, x) => s + x.totalCost, 0);
        
        responseText = `✅ Here is the standard material list and estimated BOM cost details for **${materialListName}**:\n\n` +
                       templateResult.materials.map(m => `- **${m.material}** (${m.specification}): ${m.qty} ${m.unit}`).join('\n') +
                       `\n\nEstimated total material cost is **₹${totalEstimatedCost}**.`;
      } else {
        responseText = `No pre-configured garment material template found for "${productToSearch}". Please configure it in the ERP templates database first.`;
      }
    }
    else if (intentType === 'PRICE_REQUEST') {
      // Pricing workflow (DO NOT fetch images)
      const itemToSearch = detectedProduct || 'hoodie';
      try {
        pricingResult = await pricingService.lookupPrice(itemToSearch);
        if (pricingResult.foundInDb) {
          responseText = `### ERP Database Price Match:\n` +
                         `- **Item Name**: ${pricingResult.product_name}\n` +
                         `- **Unit Cost**: ₹${pricingResult.price} per ${pricingResult.unit}\n` +
                         `- **Source**: Internal ERP Database Record.`;
        } else {
          responseText = `### Online Market Price Search for "${pricingResult.product_name}":\n` +
                         `- **IndiaMART**: ${pricingResult.indiamart}\n` +
                         `- **Alibaba**: ${pricingResult.alibaba}\n` +
                         `- **Recommended Unit Cost**: ₹${pricingResult.average} per ${pricingResult.unit}`;
        }
      } catch (priceErr) {
        responseText = `Pricing lookup error. Fallback Online Pricing:\n- **Item**: ${itemToSearch}\n- **Estimated Rate**: ₹235`;
      }
    }
    else if (intentType === 'PRODUCT_INFO') {
      // Product information workflow (FETCH optional images)
      const productToSearch = detectedProduct || 'hoodie';
      const templateResult = templatesService.findTemplate(productToSearch);
      
      let productDetails = '';
      if (templateResult) {
        productDetails = `Description: ${templateResult.description}\n`;
      }
      
      const systemPrompt = `You are an AI Fashion & Clothing Personal Stylist and Shopping Assistant.
Provide product information explaining styles, fabrics, features, and common uses for the garment query.
Query Context: ${productDetails}
Explain concisely using bullet points and emojis.`;

      responseText = await hfService.getChatCompletion([{ role: 'user', content: message }], systemPrompt);
      
      const optimizedQuery = optimizeQuery(message);
      images = await imageService.search(optimizedQuery);
    }
    else if (intentType === 'IMAGE_REQUEST') {
      // Image request workflow (ONLY fetch images, do NOT show BOM or pricing)
      const optimizedQuery = optimizeQuery(message);
      images = await imageService.search(optimizedQuery);
      
      responseText = `Here are some high-quality style reference references matching your search for **${detectedProduct || message}**:`;
    }
    else {
      // Conversational flow
      const systemPrompt = `You are an AI Fashion & Clothing Personal Stylist and Shopping Assistant.
Help the customer discover clothing, styles, colors, and fits in a natural conversational flow. Ask one relevant follow-up question.`;
      
      const formattedHistory = history.map(h => ({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.text
      }));
      formattedHistory.push({ role: 'user', content: message });
      
      responseText = await hfService.getChatCompletion(formattedHistory, systemPrompt);
    }

    const uniqueImages = [...new Set(images || [])];
    console.log(`[Chatbot Controller] Unique images count: ${uniqueImages.length}`);

    res.json({
      text: responseText,
      images: uniqueImages,
      parsedIntent: parsed,
      isActionPrompt,
      suggestRate: pricingResult && !pricingResult.foundInDb ? true : false,
      rate: pricingResult ? pricingResult.average : null,
      item: pricingResult ? pricingResult.product_name : null,
      suggestMaterialList,
      materials,
      materialListName,
      totalEstimatedCost,
      suggestTryOn,
      tryOnProduct
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
