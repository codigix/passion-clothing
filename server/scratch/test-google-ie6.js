const axios = require('axios');

async function testGoogleIE6(query) {
  try {
    console.log(`Searching Google Images for: "${query}"`);
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)'
      }
    });
    
    const html = response.data;
    console.log(`HTML Length: ${html.length}`);
    
    // In IE6 layout, Google returns direct <img> tags. Let's look for src attributes.
    const regex = /<img[^>]+src="([^"]+)"/g;
    const imgUrls = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      const src = match[1];
      if (src.startsWith('http') || src.startsWith('https://encrypted-tbn')) {
        imgUrls.push(src);
      }
    }
    
    console.log(`Found ${imgUrls.length} images!`);
    console.log('Top 8 images:');
    imgUrls.slice(0, 8).forEach((img, idx) => {
      console.log(`${idx + 1}. ${img.substring(0, 120)}...`);
    });
    return imgUrls;
  } catch (error) {
    console.error('Error during Google Images search:', error.message);
  }
  return [];
}

testGoogleIE6('pink floral clothing patterns');
