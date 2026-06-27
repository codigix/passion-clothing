const axios = require('axios');

async function searchUnsplashViaDDG(query) {
  try {
    const searchQuery = `${query} site:unsplash.com/photos/`;
    console.log(`Searching DDG for: "${searchQuery}"`);
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = response.data;
    const photoIds = [];
    
    // Look for unsplash.com/photos/ID
    // DuckDuckGo links are formatted like: href="https://unsplash.com/photos/ID" or similar
    const regex = /unsplash\.com\/photos\/([a-zA-Z0-9\-_]+)/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const id = match[1];
      // Skip some common false positives like "terms", "license", etc.
      if (!['terms', 'license', 'privacy', 'explore', 'images'].includes(id.toLowerCase())) {
        if (!photoIds.includes(id)) {
          photoIds.push(id);
        }
      }
    }
    
    console.log(`Found ${photoIds.length} Unsplash photo IDs!`);
    const imgUrls = photoIds.map(id => {
      // Build a reliable source image URL from the Unsplash ID
      return `https://images.unsplash.com/photo-${id}?w=500&auto=format&fit=crop&q=80`;
    });
    
    console.log('Top 5 reconstructed image URLs:');
    imgUrls.slice(0, 5).forEach((url, idx) => {
      console.log(`${idx + 1}. ${url}`);
    });
    return imgUrls;
  } catch (error) {
    console.error('Error during search:', error.message);
  }
  return [];
}

searchUnsplashViaDDG('pink floral pattern clothing');
