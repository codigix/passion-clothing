const axios = require('axios');

async function testClassic(ua) {
  try {
    const url = `https://www.google.com/search?q=pink+floral+clothing+patterns&tbm=isch`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': ua
      }
    });
    const html = response.data;
    console.log(`UA: ${ua.substring(0, 40)}... -> Length: ${html.length}`);
    if (html.includes('Update your browser')) {
      console.log('  Blocked: Update your browser');
      return false;
    }
    
    // Look for image source tags
    const regex = /<img[^>]+src="([^"]+)"/g;
    const imgUrls = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      const src = match[1];
      if (src.startsWith('http') || src.startsWith('https://encrypted-tbn')) {
        imgUrls.push(src);
      }
    }
    
    console.log(`  Found ${imgUrls.length} images!`);
    imgUrls.slice(0, 3).forEach(img => console.log(`    - ${img.substring(0, 60)}`));
    return imgUrls.length > 0;
  } catch (err) {
    console.error(`  Error: ${err.message}`);
    return false;
  }
}

async function run() {
  const uas = [
    'Opera/9.80 (J2ME/MIDP; Opera Mini/9.80 (S60; SymbOS; Opera Mobi/23.348; U; en) Presto/2.5.25 Version/10.54',
    'Nokia5000/2.0 (04.89) Profile/MIDP-2.1 Configuration/CLDC-1.1',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25',
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
  ];
  for (const ua of uas) {
    await testClassic(ua);
  }
}

run();
