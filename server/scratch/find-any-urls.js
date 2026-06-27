const fs = require('fs');

function findAnyUrls() {
  const html = fs.readFileSync('scratch/google-images.html', 'utf8');
  console.log(`HTML Length: ${html.length}`);
  
  // Search for any URL starting with http/https and ending with a quote or bracket
  const regex = /(https?:\/\/[^\s"'<>\(\)]+)/g;
  const urls = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const url = match[1];
    if (!urls.includes(url)) {
      urls.push(url);
    }
  }
  
  console.log(`Found ${urls.length} total URLs in HTML.`);
  
  // Print URLs matching gstatic, encrypted-tbn, google, or other domains
  const gstatics = urls.filter(u => u.includes('gstatic.com'));
  const tbns = urls.filter(u => u.includes('encrypted-tbn'));
  const others = urls.filter(u => !u.includes('google.com') && !u.includes('gstatic.com') && !u.includes('google.co.in'));
  
  console.log(`Gstatic URLs: ${gstatics.length}`);
  gstatics.slice(0, 5).forEach((u, i) => console.log(`  ${i+1}. ${u}`));
  
  console.log(`Encrypted-TBN URLs: ${tbns.length}`);
  tbns.slice(0, 5).forEach((u, i) => console.log(`  ${i+1}. ${u}`));
  
  console.log(`Non-Google URLs: ${others.length}`);
  others.slice(0, 5).forEach((u, i) => console.log(`  ${i+1}. ${u}`));
}

findAnyUrls();
