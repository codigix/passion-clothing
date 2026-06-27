const axios = require('axios');

async function testBingSearch(query) {
  try {
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
      
      // Basic validation to ensure the image URL is direct and valid
      if (!imgUrls.includes(imgUrl) && 
          imgUrl.startsWith('http') && 
          !imgUrl.includes('google') && 
          !imgUrl.includes('bing') &&
          !imgUrl.includes('w3.org') &&
          !imgUrl.includes('location.png') && 
          (imgUrl.includes('.jpg') || imgUrl.includes('.jpeg') || imgUrl.includes('.png') || imgUrl.includes('.webp') || imgUrl.includes('images') || imgUrl.includes('photo'))) {
        imgUrls.push(imgUrl);
      }
    }
    
    console.log(`\nQuery: "${query}"`);
    console.log(`Found ${imgUrls.length} valid clothing image links.`);
    console.log('Top 6 results:');
    imgUrls.slice(0, 6).forEach((img, idx) => {
      console.log(`  ${idx + 1}. ${img}`);
    });
    return imgUrls;
  } catch (error) {
    console.error(`Error during search for "${query}":`, error.message);
  }
  return [];
}

async function run() {
  await testBingSearch("floral print women's clothing");
  await testBingSearch("pink floral clothing patterns");
  await testBingSearch("women polo t-shirt");
  await testBingSearch("black hoodie women");
}

run();
