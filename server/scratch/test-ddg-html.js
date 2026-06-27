const axios = require('axios');
const fs = require('fs');

async function testDDGHtml(query) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    console.log(`Searching DDG HTML: "${url}"`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = response.data;
    console.log(`HTML Length: ${html.length}`);
    fs.writeFileSync('scratch/ddg-html.html', html);
    
    // Look for result links
    const regex = /class="result__url"[^>]*href="([^"]+)"/g;
    const links = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      links.push(match[1]);
    }
    
    console.log(`Found ${links.length} results!`);
    links.slice(0, 5).forEach((lnk, idx) => {
      console.log(`  ${idx+1}. ${lnk}`);
    });
    return links;
  } catch (error) {
    console.error('Error during DDG HTML search:', error.message);
  }
  return [];
}

testDDGHtml('pink floral dress');
