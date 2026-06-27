const axios = require('axios');

async function testUserAgents(query) {
  const userAgents = [
    // Googlebot (often bypasses consent walls)
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    // Old iOS Mobile Safari (simple layout)
    'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0_2 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12A405 Safari/600.1.4',
    // Android WebKit
    'Mozilla/5.0 (Linux; U; Android 4.0.3; ko-kr; LG-L160L Build/IML74K) AppleWebkit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30'
  ];

  for (const ua of userAgents) {
    try {
      console.log(`\nTesting User-Agent: "${ua.substring(0, 50)}..."`);
      const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': ua
        }
      });
      
      const html = response.data;
      
      // Look for images. Google's old/simple HTML layout has images in table/img tags with src starting with /images/ or encrypted URLs.
      // Or in the mobile layout, they are direct img src attributes.
      const regex = /<img[^>]+src="([^"]+)"/g;
      const imgUrls = [];
      let match;
      while ((match = regex.exec(html)) !== null) {
        const src = match[1];
        if (src.startsWith('http') && !src.includes('google.com') && !imgUrls.includes(src)) {
          imgUrls.push(src);
        } else if (src.startsWith('https://encrypted-tbn') && !imgUrls.includes(src)) {
          // Encrypted Google Image cache hotlinks (these are fully valid, fast images that render in browsers!)
          imgUrls.push(src);
        }
      }
      
      console.log(`Success! Found ${imgUrls.length} images.`);
      if (imgUrls.length > 0) {
        console.log('Sample image URLs:');
        imgUrls.slice(0, 3).forEach((img, idx) => {
          console.log(`  ${idx + 1}. ${img}`);
        });
        return { ua, imgUrls };
      }
    } catch (err) {
      console.error(`Failed for User-Agent: ${err.message}`);
    }
  }
  return null;
}

testUserAgents('pink floral clothing patterns');
