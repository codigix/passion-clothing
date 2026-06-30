const imageService = require('../chatbot/services/imageService');
require('dotenv').config();

async function test() {
  console.log('Testing imageService.search with placeholder keys...');
  const results = await imageService.search('polo t-shirt');
  console.log('Results:', results);
}

test();
