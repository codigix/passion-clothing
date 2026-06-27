const axios = require('axios');

async function testBingSearch(query) {
  try {
    console.log(`Searching Bing images for: "${query}"`);
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = response.data;
    const imgUrls = [];
    
    // Bing image search results page puts image links inside `mimg` or JSON structures like m="{"murl":"url",...}"
    const regex = /m="\{&quot;murl&quot;:&quot;(http[s]?:\/\/[^&]+)&quot;/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const imgUrl = match[1];
      if (!imgUrls.includes(imgUrl)) {
        imgUrls.push(imgUrl);
      }
    }
    
    console.log(`Found ${imgUrls.length} unique images from Bing!`);
    console.log('Top 3 images:');
    imgUrls.slice(0, 3).forEach((img, idx) => {
      console.log(`${idx + 1}. ${img}`);
    });
    return imgUrls;
  } catch (error) {
    console.error('Error during Bing search:', error.message);
  }
  return null;
}

testBingSearch('pink floral pattern clothing');
