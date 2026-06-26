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
 * Simple rule-based chatbot simulator when HF client is inactive or errors
 */
function simulateResponse(text) {
  const normalized = text.toLowerCase();
  if (normalized.includes('hi') || normalized.includes('hello') || normalized.includes('hey')) {
    return "Hello! I am Passion AI Assistant. How can I help you manage the ERP today?";
  }
  return "I am operating in offline fallback mode. Please configure HF_TOKEN in your environment for advanced natural language replies.";
}

module.exports = {
  getChatCompletion,
  parseIntent
};
