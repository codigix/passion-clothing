const axios = require('axios');

async function testBingFashion(query) {
  try {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}`;
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
    
    console.log(`Query: "${query}"`);
    console.log(`Found ${imgUrls.length} unique images:`);
    imgUrls.slice(0, 5).forEach((url, idx) => {
      console.log(`  ${idx + 1}. ${url}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function run() {
  await testBingFashion("floral print women's clothing");
  await testBingFashion("women polo t-shirt");
}

run();
