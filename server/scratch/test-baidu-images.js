const axios = require('axios');

async function testBaiduImages(query) {
  try {
    const url = `https://image.baidu.com/search/acjson?tn=resultjson_com&ipn=rj&ct=201326592&fp=result&queryWord=${encodeURIComponent(query)}&word=${encodeURIComponent(query)}&cl=2&lm=-1&ie=utf-8&oe=utf-8&st=-1&ic=0&word=${encodeURIComponent(query)}&face=0&istype=2&nc=1&pn=0&rn=30`;
    console.log(`Searching Baidu Images: "${query}"`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/plain, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    
    // Baidu returns JSON containing array of image items in response.data.data
    if (response.data && response.data.data) {
      const imgUrls = [];
      response.data.data.forEach(item => {
        if (item.hoverURL && item.hoverURL.startsWith('http')) {
          imgUrls.push(item.hoverURL);
        } else if (item.middleURL && item.middleURL.startsWith('http')) {
          imgUrls.push(item.middleURL);
        } else if (item.thumbURL && item.thumbURL.startsWith('http')) {
          imgUrls.push(item.thumbURL);
        }
      });
      
      console.log(`Success! Found ${imgUrls.length} images.`);
      console.log('Top 8 images:');
      imgUrls.slice(0, 8).forEach((img, idx) => {
        console.log(`${idx + 1}. ${img}`);
      });
      return imgUrls;
    }
  } catch (error) {
    console.error('Error during Baidu search:', error.message);
  }
  return [];
}

testBaiduImages('pink floral clothing patterns');
