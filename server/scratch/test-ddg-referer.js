const axios = require('axios');

async function testDDGImageSearch(query) {
  try {
    console.log(`Searching DDG Images for: "${query}"`);
    
    // DuckDuckGo expects specific params, including a token 'vqd' which is retrieved from the main search page
    // First, let's get the main page to retrieve the 'vqd' token
    console.log('Retrieving vqd token from DuckDuckGo...');
    const mainUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    const mainResponse = await axios.get(mainUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = mainResponse.data;
    // Find vqd="TOKEN" or vqd='TOKEN'
    const vqdMatch = html.match(/vqd=["']?([0-9\-]+)["']?/);
    if (!vqdMatch) {
      console.log('Could not find vqd token in main response. Falling back...');
    }
    const vqd = vqdMatch ? vqdMatch[1] : '';
    console.log(`Retrieved vqd token: "${vqd}"`);
    
    // Now request the image search
    const imgUrl = `https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&o=json&vqd=${vqd}&f=,,,`;
    const response = await axios.get(imgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://duckduckgo.com/'
      }
    });
    
    if (response.data && response.data.results) {
      const results = response.data.results;
      console.log(`Success! Found ${results.length} images.`);
      results.slice(0, 5).forEach((r, i) => {
        console.log(`${i+1}. Image: ${r.image}\n   Thumbnail: ${r.thumbnail}\n   Title: ${r.title}\n`);
      });
      return results.map(r => r.image);
    }
  } catch (error) {
    console.error('Error during DDG search:', error.message);
  }
  return [];
}

testDDGImageSearch('pink floral clothing patterns');
