const axios = require('axios');

async function testUnsplashSearch(query) {
  try {
    console.log(`Searching Unsplash photos for: "${query}"`);
    const url = `https://unsplash.com/s/photos/${encodeURIComponent(query)}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = response.data;
    const imgUrls = [];
    const regex = /https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-_]+(?:\?[a-zA-Z0-9\-_=&;]+)?/g;
    
    let match;
    while ((match = regex.exec(html)) !== null) {
      const imgUrl = match[0];
      // Clean up the URL to prevent duplicate variations
      const baseUrl = imgUrl.split('?')[0];
      if (!imgUrls.includes(baseUrl) && baseUrl.length > 30) {
        // Let's add a width parameter for preview quality
        imgUrls.push(`${baseUrl}?w=500&auto=format&fit=crop&q=80`);
      }
    }
    
    console.log(`Found ${imgUrls.length} unique images!`);
    console.log('Top 3 images:');
    imgUrls.slice(0, 3).forEach((img, idx) => {
      console.log(`${idx + 1}. ${img}`);
    });
    return imgUrls;
  } catch (error) {
    console.error('Error during Unsplash search:', error.message);
  }
  return null;
}

testUnsplashSearch('pink-floral-pattern-clothing');
