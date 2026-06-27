const fs = require('fs');

function parseSavedHtml() {
  const html = fs.readFileSync('scratch/google-images.html', 'utf8');
  console.log(`HTML Length: ${html.length}`);
  
  // Find all img tags
  const imgRegex = /<img[^>]+>/g;
  const imgTags = html.match(imgRegex) || [];
  console.log(`Found ${imgTags.length} img tags in HTML.`);
  
  imgTags.slice(0, 10).forEach((tag, idx) => {
    console.log(`${idx + 1}: ${tag}`);
  });
  
  // Search for any strings starting with https://encrypted-tbn
  const tbnRegex = /https:\/\/encrypted-tbn[^\s"'<>\)]+/g;
  const tbns = html.match(tbnRegex) || [];
  console.log(`Found ${tbns.length} encrypted-tbn matches.`);
  tbns.slice(0, 5).forEach((tbn, idx) => {
    console.log(`${idx + 1}: ${tbn}`);
  });
}

parseSavedHtml();
