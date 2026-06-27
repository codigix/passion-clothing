const axios = require('axios');
const fs = require('fs');

async function downloadBing(query) {
  try {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = response.data;
    console.log(`Bing HTML length: ${html.length}`);
    fs.writeFileSync('scratch/bing.html', html);
    
    // Save first 1000 characters
    console.log('Title:', html.match(/<title>(.*?)<\/title>/i)?.[1]);
    
    // Search for murl in the html (Bing JSON metadata has "murl":"http...")
    // In Bing, the JSON is escaped as &quot;murl&quot;:&quot;http...&quot;
    const regex = /&quot;murl&quot;:&quot;(http[s]?:\/\/.*?)&quot;/g;
    const imgUrls = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      imgUrls.push(match[1]);
    }
    console.log(`Found ${imgUrls.length} image URLs via &quot;murl&quot;`);
    
    // Fallback: search for direct image tags
    const imgTagRegex = /<img[^>]+src="([^"]+)"/g;
    let imgTagsCount = 0;
    while (imgTagRegex.exec(html) !== null) {
      imgTagsCount++;
    }
    console.log(`Found ${imgTagsCount} img tags`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

downloadBing('pink floral clothing patterns');
