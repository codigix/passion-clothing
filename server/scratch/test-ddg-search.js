const axios = require('axios');

async function testImageSearch(query) {
  try {
    console.log(`Searching images for: "${query}"`);
    // DuckDuckGo image search endpoint
    const url = `https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&o=json`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json'
      }
    });
    
    if (response.data && response.data.results && response.data.results.length > 0) {
      console.log('Successfully found images from DDG!');
      console.log('Top 3 results:');
      response.data.results.slice(0, 3).forEach((r, idx) => {
        console.log(`${idx + 1}. Title: ${r.title}\n   URL: ${r.image}\n`);
      });
      return response.data.results.map(r => r.image);
    } else {
      console.log('No results found in DDG response.');
    }
  } catch (error) {
    console.error('Error during DDG image search:', error.message);
  }
  return null;
}

testImageSearch('pink floral pattern clothing');
