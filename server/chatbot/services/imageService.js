const axios = require('axios');

/**
 * Clean and translate a raw search query into highly specific clothing/fashion product terms
 */
function optimizeSearchQuery(query) {
  const clean = query.toLowerCase()
    .replace(/show|send|display|view|give|me|image|picture|photo|look|draw|example|illustration|visual/gi, '')
    .replace(/t-shirt/g, 'tshirt')
    .trim();

  if (!clean) return "men's fashion clothing isolated product white background";

  // Specific mappings for exact or close matches to guarantee product focus
  if (clean === 'polo' || clean === 'polo tshirt' || clean === 'polo shirt') {
    return "men's polo t-shirt isolated product white background";
  }
  if (clean === 'black polo' || clean === 'black polo shirt') {
    return "men's black polo t-shirt isolated product white background";
  }
  if (clean === 'hoodie' || clean === 'hoodies') {
    return "men's oversized hoodie isolated product white background";
  }
  if (clean === 'jogger' || clean === 'joggers') {
    return "men's jogger pants isolated product white background";
  }
  if (clean === 'denim jacket' || clean === 'denim') {
    return "men's blue denim jacket isolated product white background";
  }
  if (clean === 'formal shirt' || clean === 'shirt' || clean === 'shirts') {
    return "men's formal cotton shirt isolated product white background";
  }
  if (clean === 'tshirt' || clean === 'tshirts' || clean === 't-shirts') {
    return "men's cotton t-shirt isolated product white background";
  }
  if (clean === 'trouser' || clean === 'trousers' || clean === 'jeans' || clean === 'jean') {
    return "men's casual trousers denim pants isolated product white background";
  }
  if (clean === 'dress' || clean === 'dresses') {
    return "women's fashion dress isolated product white background";
  }

  // Generic keyword check
  const fashionKeywords = ['clothing', 'fashion', 'apparel', 'outfit', 'wear', 'tshirt', 'shirt', 'polo', 'hoodie', 'jacket', 'pants', 'trousers', 'dress', 'sportswear'];
  const hasFashionWord = fashionKeywords.some(kw => clean.includes(kw));

  if (!hasFashionWord) {
    return `${clean} isolated product white background`;
  }

  return `${clean} isolated product white background`;
}

/**
 * Categorize a search query to verify if metadata aligns with the query intent
 */
function getQueryCategory(query) {
  const q = query.toLowerCase();
  if (q.includes('polo')) return 'polo';
  if (q.includes('hoodie')) return 'hoodie';
  if (q.includes('jogger') || q.includes('pant') || q.includes('trouser') || q.includes('jean')) return 'pants';
  if (q.includes('jacket') || q.includes('coat')) return 'jacket';
  if (q.includes('tshirt') || q.includes('t-shirt')) return 'tshirt';
  if (q.includes('dress')) return 'dress';
  if (q.includes('shirt')) return 'shirt';
  return '';
}

/**
 * Filter out irrelevant or background images based on text metadata (alt, tags, description)
 */
function shouldKeepImage(metadataText, query) {
  const text = (metadataText || '').toLowerCase();
  if (!text) return true; // Keep if no metadata is available to inspect

  const blacklist = [
    'bag', 'handbag', 'backpack', 'accessories', 'furniture', 'nature', 'landscape',
    'building', 'animal', 'artwork', 'background', 'rack', 'hanger', 'interior',
    'room', 'decor', 'home', 'office', 'store', 'shop', 'wildlife', 'cat', 'dog',
    'garden', 'tree', 'forest', 'mountain', 'sea', 'beach', 'sky', 'ocean', 'house',
    'city', 'street', 'car', 'vehicle', 'abstract', 'texture', 'hanger', 'racks'
  ];

  // Discard if matching generic blacklist terms
  const matchesBlacklist = blacklist.some(term => {
    // Exact word boundaries or inclusions
    return text.includes(term);
  });
  if (matchesBlacklist) return false;

  // Cross-category validation: Discard upper body clothing when searching pants, and vice-versa
  const category = getQueryCategory(query);
  if (category === 'pants') {
    // If searching pants, reject images talking ONLY about top apparel without pants terms
    const hasPantsTerm = ['pant', 'jogger', 'trouser', 'jeans', 'jean', 'sweatpants', 'leggings', 'denim'].some(t => text.includes(t));
    const hasOnlyTopTerm = ['jacket', 'hoodie', 'polo', 'shirt'].some(t => text.includes(t)) && !hasPantsTerm;
    if (hasOnlyTopTerm) return false;
  } else if (['polo', 'hoodie', 'tshirt', 'shirt', 'jacket'].includes(category)) {
    // If searching tops, reject images talking ONLY about trousers/pants
    const hasTopTerm = ['polo', 'hoodie', 'tshirt', 't-shirt', 'shirt', 'jacket', 'top', 'apparel', 'clothing'].some(t => text.includes(t));
    const hasOnlyPantsTerm = ['pant', 'jogger', 'trouser', 'jeans', 'sweatpants'].some(t => text.includes(t)) && !hasTopTerm;
    if (hasOnlyPantsTerm) return false;
  }

  return true;
}

/**
 * Scrape Google Images (supports modern + legacy layouts and mock sandbox targets)
 */
async function searchGoogleImages(query) {
  try {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
    console.log(`[Google Image Search Fallback] Querying: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 3000
    });
    
    const html = response.data;
    const imgUrls = [];
    let match;
    
    // 1. Try matching "imgurl":"..." (Google JSON structure)
    const imgurlRegex = /"imgurl":"(http[s]?:\/\/.*?)"/g;
    while ((match = imgurlRegex.exec(html)) !== null) {
      try {
        let imgUrl = match[1];
        if (imgUrl.includes('\\u')) {
          imgUrl = JSON.parse(`"${imgUrl}"`);
        }
        imgUrl = imgUrl.replace(/\\/g, '');
        if (!imgUrls.includes(imgUrl) && imgUrl.startsWith('http')) {
          imgUrls.push(imgUrl);
        }
      } catch (e) {}
    }
    
    // 2. Try matching "ou":"..." (legacy Google JSON structure)
    const ouRegex = /"ou":"(http[s]?:\/\/.*?)"/g;
    while ((match = ouRegex.exec(html)) !== null) {
      try {
        let imgUrl = match[1];
        if (imgUrl.includes('\\u')) {
          imgUrl = JSON.parse(`"${imgUrl}"`);
        }
        imgUrl = imgUrl.replace(/\\/g, '');
        if (!imgUrls.includes(imgUrl) && imgUrl.startsWith('http')) {
          imgUrls.push(imgUrl);
        }
      } catch (e) {}
    }
    
    // 3. Try matching encrypted-tbn cached images
    const tbnRegex = /https:\/\/encrypted-tbn[0-9]\.gstatic\.com\/images\?q=tbn:[a-zA-Z0-9\-_]+/g;
    while ((match = tbnRegex.exec(html)) !== null) {
      const imgUrl = match[0];
      if (!imgUrls.includes(imgUrl)) {
        imgUrls.push(imgUrl);
      }
    }
    
    // 4. Try matching standard img tags src attributes
    const imgTagRegex = /<img[^>]+src="([^"]+)"/g;
    while ((match = imgTagRegex.exec(html)) !== null) {
      const src = match[1];
      if (src.startsWith('http') && !src.includes('google') && !imgUrls.includes(src)) {
        imgUrls.push(src);
      }
    }
    
    // 5. Try matching any image URL ending in extension in the entire HTML (common mock page structure)
    const extRegex = /(https?:\/\/[^\s"'<>\(\)\\,\\;]+\.(?:jpg|jpeg|png|webp|gif))/gi;
    while ((match = extRegex.exec(html)) !== null) {
      const imgUrl = match[1];
      if (!imgUrls.includes(imgUrl) && !imgUrl.includes('google') && !imgUrl.includes('bing') && !imgUrl.includes('w3.org')) {
        imgUrls.push(imgUrl);
      }
    }
    
    console.log(`[Google Image Search Fallback] Extracted ${imgUrls.length} image URLs.`);
    return imgUrls;
  } catch (error) {
    console.error('[Google Image Search Fallback] Error:', error.message);
  }
  return [];
}

async function search(query) {
  const optimizedQuery = optimizeSearchQuery(query);
  console.log(`[Image Service] Raw Query: "${query}" -> Optimized: "${optimizedQuery}"`);

  let fetchedImages = [];

  // 1. Try Pexels API
  if (process.env.PEXELS_API_KEY && !process.env.PEXELS_API_KEY.startsWith('your_')) {
    try {
      console.log(`[Image Service] Fetching Pexels images for: "${optimizedQuery}"`);
      const response = await axios.get('https://api.pexels.com/v1/search', {
        params: { query: optimizedQuery, per_page: 80 },
        headers: { Authorization: process.env.PEXELS_API_KEY },
        timeout: 5000
      });
      if (response.data && response.data.photos) {
        fetchedImages = response.data.photos
          .filter(photo => shouldKeepImage(`${photo.alt} ${photo.url}`, query))
          .map(photo => photo.src.large);
      }
    } catch (error) {
      console.error('[Image Service] Pexels search failed:', error.message);
    }
  }

  // 2. Try Pixabay API
  if (fetchedImages.length === 0 && process.env.PIXABAY_API_KEY && !process.env.PIXABAY_API_KEY.startsWith('your_')) {
    try {
      console.log(`[Image Service] Fetching Pixabay images for: "${optimizedQuery}"`);
      const response = await axios.get('https://pixabay.com/api/', {
        params: { key: process.env.PIXABAY_API_KEY, q: optimizedQuery, per_page: 80, image_type: 'photo' },
        timeout: 5000
      });
      if (response.data && response.data.hits) {
        fetchedImages = response.data.hits
          .filter(hit => shouldKeepImage(hit.tags, query))
          .map(hit => hit.largeImageURL);
      }
    } catch (error) {
      console.error('[Image Service] Pixabay search failed:', error.message);
    }
  }

  // 3. Try Unsplash API
  if (fetchedImages.length === 0 && process.env.UNSPLASH_ACCESS_KEY && !process.env.UNSPLASH_ACCESS_KEY.startsWith('your_')) {
    try {
      console.log(`[Image Service] Fetching Unsplash images for: "${optimizedQuery}"`);
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: { query: optimizedQuery, per_page: 80 },
        headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
        timeout: 5000
      });
      if (response.data && response.data.results) {
        fetchedImages = response.data.results
          .filter(photo => shouldKeepImage(`${photo.description} ${photo.alt_description}`, query))
          .map(photo => photo.urls.regular);
      }
    } catch (error) {
      console.error('[Image Service] Unsplash search failed:', error.message);
    }
  }

  // 4. Scraper fallback if no key is configured or API returns nothing
  if (fetchedImages.length === 0) {
    console.log(`[Image Service] Using Google scraping fallback for: "${optimizedQuery}"`);
    const scraped = await searchGoogleImages(optimizedQuery);
    fetchedImages = scraped.filter(url => shouldKeepImage(url, query));
  }

  // Final fallback generator if we got absolutely nothing
  if (fetchedImages.length === 0) {
    console.log('[Image Service] No URLs remaining after filters. Generating dynamic loremflickr fallback URLs.');
    for (let i = 1; i <= 30; i++) {
      fetchedImages.push(`https://loremflickr.com/640/480/fashion,clothing,outfit?random=${i}`);
    }
  }

  return fetchedImages.slice(0, 30);
}

module.exports = { search };
