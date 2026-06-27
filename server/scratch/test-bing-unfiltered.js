const axios = require('axios');

async function testBingUnfiltered(query) {
  try {
    const searchQuery = `${query} site:unsplash.com`;
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(searchQuery)}`;
    console.log(`Searching Bing Images: "${searchQuery}"`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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
    
    console.log(`Found ${imgUrls.length} unfiltered images!`);
    console.log('Top 8 images:');
    imgUrls.slice(0, 8).forEach((img, idx) => {
      console.log(`${idx + 1}. ${img}`);
    });
    return imgUrls;
  } catch (error) {
    console.error('Error:', error.message);
  }
  return [];
}

testBingUnfiltered("pink floral dress");
