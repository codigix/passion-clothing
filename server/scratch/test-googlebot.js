const axios = require('axios');
const fs = require('fs');

async function testGooglebot() {
  try {
    const query = 'pink floral clothing patterns';
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
    console.log(`Searching Google Images using Googlebot User-Agent...`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      }
    });
    
    const html = response.data;
    console.log(`HTML downloaded. Length: ${html.length}`);
    
    // Find all occurrences of "encrypted-tbn" or "gstatic"
    const matches = [];
    const searchStr = 'gstatic';
    let idx = html.indexOf(searchStr);
    while (idx !== -1) {
      // print 100 characters before and after the match
      const start = Math.max(0, idx - 50);
      const end = Math.min(html.length, idx + 150);
      matches.push(html.substring(start, end));
      idx = html.indexOf(searchStr, idx + 1);
      if (matches.length >= 5) break;
    }
    
    console.log(`Found ${matches.length} matches around "gstatic":`);
    matches.forEach((m, i) => {
      console.log(`Match ${i+1}:\n${m}\n`);
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testGooglebot();
