const axios = require('axios');

async function testYahooImages(query) {
  try {
    const url = `https://images.search.yahoo.com/search/images?p=${encodeURIComponent(query)}`;
    console.log(`Searching Yahoo Images for: "${url}"`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = response.data;
    console.log(`HTML Length: ${html.length}`);
    
    // In Yahoo Images, individual image results are structured inside HTML elements containing JSON strings
    // like {"iurl":"http://..."} or inside img tag src attributes.
    // Let's use a regex to look for "iurl":"(http[s]?://.*?)"
    const regex = /"iurl":"(http[s]?:\/\/.*?)"/g;
    const imgUrls = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      let imgUrl = match[1];
      // Clean up backslashes/escapes
      imgUrl = imgUrl.replace(/\\/g, '');
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
    console.error('Error during Yahoo search:', error.message);
  }
  return [];
}

testYahooImages('pink floral clothing patterns');
