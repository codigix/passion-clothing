const axios = require('axios');

async function testGoogleImages(query) {
  try {
    console.log(`Searching Google Images for: "${query}"`);
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = response.data;
    const imgUrls = [];
    
    // Google Images HTML search results usually have direct image URLs inside metadata blocks or img tags.
    // In Google Images HTML, the raw source URLs are often inside elements like:
    // "ou":"http://..." or "imgurl":"http://..." or in JSON strings
    // Let's search for patterns like: "imgurl":"(http[s]?://.*?)"
    const regex = /"imgurl":"(http[s]?:\/\/.*?)"/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      let imgUrl = match[1];
      // Clean up unicode escapes in JSON if any
      imgUrl = JSON.parse(`"${imgUrl}"`);
      if (!imgUrls.includes(imgUrl) && imgUrl.startsWith('http')) {
        imgUrls.push(imgUrl);
      }
    }
    
    // Fallback: If "imgurl" is not in the HTML (sometimes Google returns a simpler layout for certain User-Agents),
    // let's try matching standard img src attributes.
    if (imgUrls.length === 0) {
      console.log('No "imgurl" matches found. Trying fallback <img> src scraper...');
      const fallbackRegex = /<img[^>]+src="([^"]+)"/g;
      let fbMatch;
      while ((fbMatch = fallbackRegex.exec(html)) !== null) {
        const src = fbMatch[1];
        if (src.startsWith('http') && !src.includes('google') && !imgUrls.includes(src)) {
          imgUrls.push(src);
        }
      }
    }

    console.log(`Found ${imgUrls.length} unique images from Google!`);
    console.log('Top 8 image links:');
    imgUrls.slice(0, 8).forEach((img, idx) => {
      console.log(`${idx + 1}. ${img}`);
    });
    return imgUrls;
  } catch (error) {
    console.error('Error during Google Images search:', error.message);
  }
  return [];
}

testGoogleImages('pink floral clothing patterns');
