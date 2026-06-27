const axios = require('axios');
const fs = require('fs');

async function testGoogleBypass(query) {
  try {
    console.log(`Searching Google Images with bypass headers for: "${query}"`);
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1'
      }
    });
    
    const html = response.data;
    console.log(`HTML Length: ${html.length}`);
    fs.writeFileSync('scratch/google-bypass.html', html);
    
    // Check if it's blocked
    if (html.includes('consent.google.com') || html.includes('Before you continue') || html.includes('/httpservice/retry')) {
      console.log('  Blocked by consent redirection or JavaScript check.');
      return false;
    }
    
    // In modern Google Images search pages, the image search results are present inside script tags containing AF_initDataCallback
    // Let's use a regex to look for image URLs (which usually start with https://encrypted-tbn0.gstatic.com/images?q=tbn:...)
    const regex = /https:\/\/encrypted-tbn[0-9]\.gstatic\.com\/images\?q=tbn:[a-zA-Z0-9\-_]+/g;
    const imgUrls = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      const imgUrl = match[0];
      if (!imgUrls.includes(imgUrl)) {
        imgUrls.push(imgUrl);
      }
    }
    
    console.log(`Found ${imgUrls.length} encrypted-tbn cached image URLs!`);
    imgUrls.slice(0, 8).forEach((img, idx) => {
      console.log(`${idx + 1}. ${img}`);
    });
    return imgUrls;
  } catch (error) {
    console.error('Error:', error.message);
  }
  return [];
}

testGoogleBypass('pink floral clothing patterns');
