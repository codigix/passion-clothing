const fs = require('fs');

function parseBing() {
  const html = fs.readFileSync('scratch/bing.html', 'utf8');
  const regex = /&quot;murl&quot;:&quot;(http[s]?:\/\/.*?)&quot;/g;
  const imgUrls = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    let imgUrl = match[1];
    // Decode HTML entity escapes if present
    imgUrl = imgUrl.replace(/&amp;/g, '&');
    if (!imgUrls.includes(imgUrl)) {
      imgUrls.push(imgUrl);
    }
  }
  
  console.log(`Found ${imgUrls.length} unique images:`);
  imgUrls.slice(0, 8).forEach((url, idx) => {
    console.log(`${idx + 1}. ${url}`);
  });
}

parseBing();
