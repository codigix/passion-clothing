const axios = require('axios');
const fs = require('fs');

async function testGoogleSout(query) {
  try {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&sout=1`;
    console.log(`Searching Google Images with sout=1: "${url}"`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const html = response.data;
    console.log(`HTML Length: ${html.length}`);
    fs.writeFileSync('scratch/google-sout.html', html);
    
    // In legacy Google layout, image search results are served inside table cells containing <a> tags with <img> tags.
    // The image sources are cached thumbnails from encrypted-tbn0.gstatic.com or gstatic.com
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
      console.log(`${idx + 1}. ${img.substring(0, 150)}...`);
    });
    return imgUrls;
  } catch (error) {
    console.error('Error during Google sout search:', error.message);
  }
  return [];
}

testGoogleSout('pink floral clothing patterns');
