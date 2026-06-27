const axios = require('axios');

async function testBingSearchGeneric(query) {
  try {
    console.log(`Searching Bing images for: "${query}"`);
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = response.data;
    
    // Look for image extensions
    const regex = /(https?:\/\/[^\s"'<>\(\)\\,\\;]+\.(?:jpg|jpeg|png))/gi;
    const imgUrls = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      const imgUrl = match[1];
      // Filter out Bing's own assets or tracker pixels
      if (!imgUrl.includes('bing.com') && !imgUrl.includes('bing.net') && !imgUrl.includes('w3.org') && imgUrl.length > 25) {
        if (!imgUrls.includes(imgUrl)) {
          imgUrls.push(imgUrl);
        }
      }
    }
    
    console.log(`Found ${imgUrls.length} unique images!`);
    console.log('Top 5 images:');
    imgUrls.slice(0, 5).forEach((img, idx) => {
      console.log(`${idx + 1}. ${img}`);
    });
    return imgUrls;
  } catch (error) {
    console.error('Error during Bing search:', error.message);
  }
  return null;
}

testBingSearchGeneric('pink floral pattern clothing');
