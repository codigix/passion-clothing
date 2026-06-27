const axios = require('axios');
const fs = require('fs');

async function testGoogleUS(query) {
  try {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&gl=us&hl=en`;
    console.log(`Searching Google US: "${url}"`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const html = response.data;
    console.log(`HTML Length: ${html.length}`);
    fs.writeFileSync('scratch/google-us.html', html);
    
    if (html.includes('Before you continue') || html.includes('consent.google.com')) {
      console.log('  Blocked by consent screen even with gl=us.');
      return false;
    }
    
    // Look for encrypted-tbn cached Google images: https://encrypted-tbn0.gstatic.com/images?q=tbn:...
    const regex = /https:\/\/encrypted-tbn[0-9]\.gstatic\.com\/images\?q=tbn:[a-zA-Z0-9\-_]+/g;
    const imgUrls = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      const imgUrl = match[0];
      if (!imgUrls.includes(imgUrl)) {
        imgUrls.push(imgUrl);
      }
    }
    
    console.log(`Found ${imgUrls.length} images!`);
    imgUrls.slice(0, 8).forEach((img, idx) => {
      console.log(`${idx + 1}. ${img}`);
    });
    return imgUrls;
  } catch (error) {
    console.error('Error during Google US search:', error.message);
  }
  return [];
}

testGoogleUS('pink floral clothing patterns');
