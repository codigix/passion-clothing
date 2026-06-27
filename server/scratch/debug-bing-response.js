const axios = require('axios');

async function debugBing(query) {
  try {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    console.log(`Query: "${query}"`);
    console.log(`Status Code: ${response.status}`);
    console.log(`HTML Length: ${response.data.length}`);
    
    // Find count of &quot;murl&quot; matches
    const regex = /&quot;murl&quot;:&quot;(http[s]?:\/\/.*?)&quot;/g;
    const matches = [];
    let match;
    while ((match = regex.exec(response.data)) !== null) {
      matches.push(match[1]);
    }
    console.log(`Found ${matches.length} matches.`);
    matches.slice(0, 5).forEach((m, idx) => console.log(`  ${idx+1}: ${m}`));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

debugBing("women polo t-shirt clothing");
