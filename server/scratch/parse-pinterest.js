const fs = require('fs');

function parsePinterest() {
  const html = fs.readFileSync('scratch/pinterest.html', 'utf8');
  console.log(`HTML Length: ${html.length}`);
  
  // Find any URL matching i.pinimg.com
  const regex = /https:\/\/i\.pinimg\.com\/[a-zA-Z0-9_\-\/]+/g;
  const matches = html.match(regex) || [];
  console.log(`Found ${matches.length} matches for i.pinimg.com`);
  
  const unique = [...new Set(matches)];
  console.log(`Unique matches: ${unique.length}`);
  unique.slice(0, 10).forEach((m, idx) => {
    console.log(`${idx + 1}. ${m}`);
  });
}

parsePinterest();
