const { HfInference } = require('@huggingface/inference');
require('dotenv').config();

let hf = null;
const model = process.env.HF_MODEL || 'Qwen/Qwen2.5-7B-Instruct';

try {
  if (process.env.HF_TOKEN) {
    hf = new HfInference(process.env.HF_TOKEN);
    console.log(`🤖 Hugging Face Service initialized using model: ${model}`);
  } else {
    console.warn('⚠️ HF_TOKEN is not set in environment. Chatbot will run in simulation mode.');
  }
} catch (error) {
  console.error('❌ Failed to initialize Hugging Face Inference:', error.message);
}

/**
 * Perform chat completion using HF Inference API
 * @param {Array} messages - Chat history in OpenAI format [{role: 'user', content: '...'}]
 * @param {string} systemPrompt - Instruction for the system role
 * @returns {Promise<string>} Generated response
 */
async function getChatCompletion(messages, systemPrompt = '') {
  if (!hf) {
    return simulateResponse(messages[messages.length - 1].content);
  }

  try {
    const formattedMessages = [];
    if (systemPrompt) {
      formattedMessages.push({ role: 'system', content: systemPrompt });
    }
    
    // Add history (max last 5 messages to avoid token blowup)
    const recentHistory = messages.slice(-5);
    formattedMessages.push(...recentHistory);

    const response = await hf.chatCompletion({
      model: model,
      messages: formattedMessages,
      max_tokens: 600,
      temperature: 0.3,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('❌ Hugging Face API call failed:', error.message);
    return simulateResponse(messages[messages.length - 1].content);
  }
}

/**
 * Classify user message intent and extract entities
 * @param {string} userMessage - User raw prompt
 * @returns {Promise<Object>} Intent and entities
 */
async function parseIntent(userMessage) {
  const systemInstruction = `You are the NLP parser for a clothing factory ERP AI assistant.
Classify the user's intent into exactly one of these:
- QUERY_ERP_DATA: User wants to check current statistics, low stock, summaries, or reports.
- ERP_ACTION: User wants to create, edit, or delete items (e.g. create requirement, add RFQ, new quotation).
- KNOWLEDGE_SEARCH: User asks "how-to" questions, asks about standard operating procedures (SOPs), manuals, drawing, or policies.
- CONVERSATION: Greetings, checkins, or simple chit-chat.

Also detect if the user's request matches a specific action:
- CREATE_REQUIREMENT: request to add or create a client requirement.
- CHECK_INVENTORY: request to verify stock levels, check alerts, or lookup items.
- PRODUCTION_STATUS: request to view current jobs or status of production.
- NONE: no specific mapped action.

Extract entities if mentioned (e.g. customer_name, product_name, quantity).

Return ONLY a valid JSON object. Do not include markdown codeblocks or explanation.
Example:
{
  "intent": "QUERY_ERP_DATA",
  "action": "CHECK_INVENTORY",
  "entities": {
    "product_name": "Aluminium Section"
  }
}`;

  const prompt = `User message: "${userMessage}"
JSON:`;

  if (!hf) {
    return fallbackIntentDetection(userMessage);
  }

  try {
    const response = await hf.chatCompletion({
      model: model,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ],
      max_tokens: 150,
      temperature: 0.1,
    });

    const cleanJson = response.choices[0].message.content.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('❌ Intent parsing failed:', error.message);
    return fallbackIntentDetection(userMessage);
  }
}

/**
 * Simple local regex fallback for intent parsing when Hugging Face is unreachable
 */
function fallbackIntentDetection(text) {
  const normalized = text.toLowerCase();
  
  let intent = 'CONVERSATION';
  let action = 'NONE';
  let entities = {};

  if (normalized.includes('create') || normalized.includes('add') || normalized.includes('new') || normalized.includes('register')) {
    intent = 'ERP_ACTION';
    if (normalized.includes('req') || normalized.includes('requirement')) {
      action = 'CREATE_REQUIREMENT';
    }
  } else if (normalized.includes('summary') || normalized.includes('count') || normalized.includes('status') || normalized.includes('alert') || normalized.includes('stock') || normalized.includes('inventory')) {
    intent = 'QUERY_ERP_DATA';
    if (normalized.includes('stock') || normalized.includes('inventory') || normalized.includes('alert')) {
      action = 'CHECK_INVENTORY';
    } else if (normalized.includes('production') || normalized.includes('job') || normalized.includes('stage')) {
      action = 'PRODUCTION_STATUS';
    }
  } else if (normalized.includes('how') || normalized.includes('process') || normalized.includes('sop') || normalized.includes('manual') || normalized.includes('rfq') || normalized.includes('quotation')) {
    intent = 'KNOWLEDGE_SEARCH';
  }

  // Simple Entity Extraction
  if (action === 'CREATE_REQUIREMENT') {
    const qtyMatch = normalized.match(/(\d+)\s*(pcs|pieces|qty|quantity)?/);
    if (qtyMatch) {
      entities.quantity = parseInt(qtyMatch[1]);
    }
    
    const customerMatch = text.match(/(for|client|customer)\s+([A-Za-z0-9\s]+?)(?=(qty|\d+|$))/i);
    if (customerMatch) {
      entities.customer_name = customerMatch[2].trim();
    }
  }

  return { intent, action, entities };
}

/**
 * Simple rule-based chatbot simulator when HF client is inactive
 */
function simulateResponse(text) {
  const normalized = text.toLowerCase().trim();

  // Handle greetings
  if (normalized === 'hi' || normalized === 'hello' || normalized === 'hey') {
    return `Hello! I am your AI Fashion & Clothing Personal Stylist. I'm here to help you discover beautiful styles, fabrics, patterns, and colors, and guide you to the perfect outfit!

Which category would you like to explore?
👕 **Tops** (T-Shirts, Polo T-Shirts, Shirts, Hoodies, Crop Tops, Sweatshirts, Tunics, Camisoles)
👖 **Bottoms** (Jeans, Trousers, Joggers, Shorts, Skirts, Leggings)
👗 **Dresses & Jumpsuits** (One-piece dresses, Jumpsuits, Rompers, Kurtis)
🧥 **Outerwear** (Jackets, Coats, Blazers, Cardigans)

Let me know what you are looking for, or choose a category above to start!`;
  }

  // Handle Tops
  if (normalized === 'tops' || normalized === 'top' || normalized.includes('types of tops') || normalized.includes('top styles') || normalized.includes('show tops')) {
    return `Awesome! Let's explore some stylish tops. We have a wide range of options:
👕 **T-Shirts & Polo T-Shirts** (Casual, sports, or premium styles)
👔 **Shirts** (Formal, casual button-downs, or party shirts)
🧥 **Hoodies & Sweatshirts** (Comfortable streetwear and layers)
👚 **Crop Tops, Tunics & Camisoles** (Trendy and elegant options for women)

To find the perfect match for you:
1. Are you shopping for **Men**, **Women**, or **Kids**?
2. What style or occasion are you looking for (e.g., Casual, Formal, Sports, or Party Wear)?`;
  }

  // Handle Bottoms
  if (normalized === 'bottoms' || normalized === 'bottom' || normalized.includes('types of bottoms') || normalized.includes('bottom styles') || normalized.includes('show bottoms')) {
    return `Great choice! A good pair of bottoms completes any outfit. Here are the categories we can explore:
👖 **Jeans & Trousers** (Denim, chinos, or formal pants)
🩳 **Shorts & Skirts** (Casual summer styles or elegant options)
🏃‍♂️ **Joggers & Leggings** (Comfortable activewear or loungewear)

To help me guide your search:
1. Are you shopping for **Men**, **Women**, or **Kids**?
2. What occasion are these bottoms for (e.g., Casual, Active/Sports, Formal, or Loungewear)?`;
  }

  // Handle Dresses & Jumpsuits
  if (normalized === 'dresses' || normalized === 'dress' || normalized.includes('types of dresses') || normalized.includes('dress styles') || normalized.includes('show dresses') || normalized.includes('jumpsuit') || normalized.includes('jumpsuits')) {
    return `Dresses and jumpsuits are perfect for making a stylish statement! Here are the options we can explore:
👗 **One-piece Dresses** (Casual sundresses, maxi dresses, or party wear)
👚 **Kurtis & Tunics** (Traditional and fusion daily wear)
👖 **Jumpsuits & Rompers** (Chic, modern all-in-one outfits)

What occasion are you dressing up for (e.g., Daily Casual, Work Wear, Festive, or a Party/Evening event)?`;
  }

  // Handle Types of clothing
  if (normalized.includes('types of clothing') || normalized.includes('what are types of clothing') || normalized.includes('clothing categories') || normalized.includes('categories')) {
    return `We offer a beautifully curated range of clothing categories:

👕 **Tops** - T-Shirts, Polo T-Shirts, Shirts, Hoodies, Sweatshirts, Crop Tops, Tunics, and Camisoles.
👖 **Bottoms** - Jeans, Trousers, Shorts, Joggers, Skirts, and Leggings.
👗 **Dresses & Jumpsuits** - One-piece dresses, Jumpsuits, Rompers, and Kurtis.
🧥 **Outerwear** - Jackets, Coats, Blazers, and Cardigans.

Which category would you like to explore?
👕 T-Shirts
👔 Shirts
🧥 Hoodies
👗 Dresses
👖 Jeans`;
  }

  // Handle Floral Prints
  if (normalized.includes('floral print') || normalized.includes('floral prints') || normalized.includes('floral')) {
    return `Floral prints are incredibly popular for a fresh, vibrant, and stylish look! We offer a gorgeous selection of floral patterns across various styles:
🌸 **Floral Dresses & Kurtis** (Vibrant, airy, and perfect for warm weather/outings)
👕 **Floral T-Shirts & Polo T-Shirts** (Great for casual weekend styles)
👔 **Floral Shirts** (Chic casual button-downs)
🧥 **Floral Hoodies** (Unique, artistic streetwear)

Which style are you looking to explore?
👗 Dresses
👔 Shirts
👕 T-Shirts
🧥 Hoodies`;
  }

  // Handle Pink Patterns
  if (normalized.includes('pink pattern') || normalized.includes('pink patterns') || (normalized.includes('pink') && normalized.includes('pattern'))) {
    return getPinkPatternsResponse();
  }

  // Handle Patterns
  if (normalized.includes('patterns for tops') || normalized.includes('clothing patterns') || normalized.includes('patterns')) {
    return `Common clothing patterns include:
✨ **Solid** (Classic and minimalist)
🏁 **Stripes** (Elongating and timeless)
🌸 **Floral** (Fresh and vibrant)
⚪ **Polka Dot** (Retro and playful)
🏁 **Checked/Plaid** (Casual or smart-casual)
🎨 **Tie-Dye** (Artistic and laid-back)
📐 **Geometric & Abstract** (Modern and bold)
🪡 **Embroidered** (Elegant and detailed)

Which of these prints matches your style preference?`;
  }

  // Handle Solid colors / pink shades
  if (normalized.includes('solid colors') || normalized.includes('colors')) {
    if (normalized.includes('pink')) {
      return getPinkPatternsResponse();
    }
    return `We offer products in a beautiful spectrum of solid colors:
    🖤 **Black** & 🤍 **White** (The timeless essentials)
    💙 **Navy Blue** & 💎 **Sky Blue** (Professional and serene)
    💗 **Pink** & ❤️ **Red** (Vibrant and expressive)
    💚 **Green** & 💛 **Yellow** (Fresh and energetic)
    💜 **Purple** (Rich and elegant)

Are there any particular shades or color families you have in mind for your outfit?`;
  }

  if (normalized === 'pink' || normalized.includes('shade of pink') || normalized.includes('pink colors')) {
    return getPinkPatternsResponse();
  }

  // Specific check for joggers
  if (normalized.includes('jogger')) {
    return `Joggers are comfortable bottoms with an elastic waistband and tapered leg ankle cuffs, making them perfect for casual styling, loungewear, or sporty looks. They pair wonderfully with fitted t-shirts, cropped hoodies, or denim jackets.

Would you like to explore matching tops or fabrics for joggers?`;
  }

  // General fallback
  return `I can help you explore fashion styles, fabrics, patterns, fits, and colors! Let me know if you want to search for tops, bottoms, outerwear, or specific items like Joggers or Jeans. What style profile are you looking for today?`;
}

function getPinkPatternsResponse() {
  return `Here are some popular pink clothing patterns:
🌸 **Solid Pink**
🌸 **Floral Pink**
🌸 **Pink Stripes**
🌸 **Pink Polka Dots**
🌸 **Pink Checked**
🌸 **Pink Tie-Dye**
🌸 **Pink Abstract**
🌸 **Pink Geometric**
🌸 **Pink Embroidered**

Which style do you like most?`;
}

module.exports = {
  getChatCompletion,
  parseIntent
};
