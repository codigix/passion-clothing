const fs = require('fs');
const html = fs.readFileSync('scratch/google-mobile.html', 'utf8');

console.log('Title tag:', html.match(/<title>(.*?)<\/title>/i)?.[1]);
console.log('HTML contains "Before you continue":', html.includes('Before you continue'));
console.log('HTML contains "consent":', html.includes('consent'));

// Check for redirection links
const hrefs = html.match(/href="([^"]+)"/g) || [];
console.log(`Found ${hrefs.length} hrefs.`);
hrefs.slice(0, 10).forEach(h => console.log(h));
