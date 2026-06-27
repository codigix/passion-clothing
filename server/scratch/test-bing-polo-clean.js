const axios = require('axios');

async function testBingPolo() {
  try {
    const query = "women polo t shirt";
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const html = response.data;
    const regex = /&quot;murl&quot;:&quot;(http[s]?:\/\/.*?)&quot;/g;
    const imgUrls = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      let imgUrl = match[1];
      imgUrl = imgUrl.replace(/&amp;/g, '&');
      if (!imgUrls.includes(imgUrl)) {
        imgUrls.push(imgUrl);
      }
    }
    
    console.log(`Query: "${query}"`);
    console.log(`Found ${imgUrls.length} matches.`);
    imgUrls.slice(0, 8).forEach((img, idx) => {
      console.log(`${idx + 1}. ${img}`);
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testBingPolo();
