const fs = require('fs');
const html = fs.readFileSync('scratch/google-images.html', 'utf8');
console.log('FIRST 1000 CHARACTERS:');
console.log(html.substring(0, 1000));
