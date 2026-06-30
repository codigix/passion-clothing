const chatbotController = require('../chatbot/controllers/chatbotController');

// Simulates req and res to verify route output
const mockRes = {
  status: function(code) { this.statusCode = code; return this; },
  json: function(data) { this.body = data; return this; }
};

async function runTest(message) {
  const req = { body: { message, history: [] } };
  const res = { ...mockRes };
  await chatbotController.handleMessage(req, res);
  console.log(`Input: "${message}"`);
  console.log(`Output Images Count: ${res.body.images?.length || 0}`);
  console.log(`Output suggestMaterialList: ${res.body.suggestMaterialList}`);
  console.log(`Output text preview: "${res.body.text?.slice(0, 80)}..."`);
  console.log('---');
}

async function testAll() {
  await runTest('Show Joggers');
  await runTest('Material List for Hoodie');
  await runTest('Price of Polo T-Shirt');
  await runTest('Explain Denim Jacket');
}

testAll();
