const axios = require('axios');
const fs = require('fs');

async function downloadGoogleMobile(query) {
  try {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53'
      }
    });
    
    const html = response.data;
    console.log(`Mobile HTML length: ${html.length}`);
    fs.writeFileSync('scratch/google-mobile.html', html);
    
    // Scan for img tags
    const imgRegex = /<img[^>]+src="([^"]+)"/g;
    const imgUrls = [];
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
      const src = match[1];
      if (src.startsWith('http') || src.startsWith('data:image')) {
        imgUrls.push(src);
      }
    }
    
    console.log(`Found ${imgUrls.length} images!`);
    imgUrls.slice(0, 5).forEach((url, idx) => {
      console.log(`${idx + 1}. ${url.substring(0, 100)}...`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

downloadGoogleMobile('pink floral clothing patterns');
