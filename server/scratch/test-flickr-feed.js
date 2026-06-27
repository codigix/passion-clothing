const axios = require('axios');

async function testFlickrFeed(query) {
  try {
    const tags = query.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ',');
    const url = `https://www.flickr.com/services/feeds/photos_public.gne?tags=${encodeURIComponent(tags)}&format=json&nojsoncallback=1`;
    console.log(`Querying Flickr Feed: "${url}"`);
    
    const response = await axios.get(url, { timeout: 5000 });
    
    if (response.data && response.data.items) {
      const items = response.data.items;
      console.log(`Success! Found ${items.length} items from Flickr.`);
      const imgUrls = items.map(item => item.media.m.replace('_m.jpg', '_b.jpg')); // get high-res version
      
      console.log('Top 8 images:');
      imgUrls.slice(0, 8).forEach((img, idx) => {
        console.log(`${idx + 1}. ${img}`);
      });
      return imgUrls;
    }
  } catch (error) {
    console.error('Error fetching Flickr Feed:', error.message);
  }
  return [];
}

testFlickrFeed('pink floral top');
