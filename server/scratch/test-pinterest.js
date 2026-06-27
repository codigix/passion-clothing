const axios = require('axios');
const fs = require('fs');

async function testPinterest(query) {
  try {
    const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
    console.log(`Searching Pinterest for: "${query}"`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const html = response.data;
    console.log(`HTML Length: ${html.length}`);
    fs.writeFileSync('scratch/pinterest.html', html);
    
    // Pinterest embeds pin data inside a script tag containing JSON:
    // "images":{"orig":{"url":"https://i.pinimg.com/originals/...
    const regex = /"https:\/\/i\.pinimg\.com\/[a-zA-Z0-9_\-\/]+\.jpg"/g;
    const imgUrls = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      const imgUrl = JSON.parse(match[0]);
      if (!imgUrls.includes(imgUrl)) {
        imgUrls.push(imgUrl);
      }
    }
    
    console.log(`Found ${imgUrls.length} images!`);
    console.log('Top 8 images:');
    imgUrls.slice(0, 8).forEach((img, idx) => {
      console.log(`${idx + 1}. ${img}`);
    });
    return imgUrls;
  } catch (error) {
    console.error('Error during Pinterest search:', error.message);
  }
  return [];
}

testPinterest('pink floral clothing patterns');
