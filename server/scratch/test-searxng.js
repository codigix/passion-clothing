const axios = require('axios');

async function testSearXNG(query) {
  const instances = [
    'https://searx.be',
    'https://searxng.site',
    'https://priv.au',
    'https://search.ononoki.org'
  ];
  
  for (const instance of instances) {
    try {
      const url = `${instance}/search?q=${encodeURIComponent(query)}&format=json&categories=images`;
      console.log(`Trying SearXNG instance: ${url}`);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        },
        timeout: 4000
      });
      
      if (response.data && response.data.results && response.data.results.length > 0) {
        console.log(`Success! Found ${response.data.results.length} images from ${instance}`);
        response.data.results.slice(0, 8).forEach((r, idx) => {
          console.log(`${idx + 1}. Source: ${r.img_src || r.thumbnail_src || r.url}`);
        });
        return response.data.results.map(r => r.img_src || r.thumbnail_src);
      }
    } catch (err) {
      console.log(`  Failed: ${err.message}`);
    }
  }
  return [];
}

testSearXNG('pink floral clothing patterns');
