const axios = require('axios');

async function getLoremFlickrImage(query) {
  try {
    const tags = query.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ',');
    const url = `https://loremflickr.com/500/500/fashion,clothing,${tags}`;
    console.log(`Fetching from Lorem Flickr: ${url}`);
    
    const response = await axios.get(url, {
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    // axios request stores the final redirect URL in response.request.res.responseUrl
    const finalUrl = response.request.res.responseUrl || response.url;
    console.log(`Final image URL: ${finalUrl}`);
    return finalUrl;
  } catch (error) {
    console.error('Error fetching Lorem Flickr image:', error.message);
  }
  return null;
}

getLoremFlickrImage('pink floral pattern');
