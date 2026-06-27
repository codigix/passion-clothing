const axios = require('axios');

async function testQwantImages(query) {
  try {
    const url = `https://api.qwant.com/v3/search/images?q=${encodeURIComponent(query)}&locale=en_US&count=10&t=images&safesearch=1`;
    console.log(`Searching Qwant Images: "${query}"`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (response.data && response.data.data && response.data.data.result && response.data.data.result.items) {
      const items = response.data.data.result.items;
      console.log(`Success! Found ${items.length} images.`);
      items.slice(0, 8).forEach((item, idx) => {
        console.log(`${idx + 1}. Title: ${item.title}\n   URL: ${item.media}\n`);
      });
      return items.map(item => item.media);
    } else {
      console.log('Qwant response structure did not match or returned empty.');
    }
  } catch (error) {
    console.error('Error during Qwant search:', error.message);
  }
  return [];
}

testQwantImages('pink floral clothing patterns');
