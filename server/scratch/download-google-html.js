const axios = require('axios');
const fs = require('fs');

async function downloadGoogleHtml(query) {
  try {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = response.data;
    console.log(`Downloaded HTML length: ${html.length}`);
    
    // Save to a file in scratch
    fs.writeFileSync('scratch/google-images.html', html);
    console.log('Saved HTML to scratch/google-images.html');
    
    // Check if it's the cookie consent page
    if (html.includes('consent.google.com') || html.includes('Before you continue')) {
      console.log('Detected cookie consent page redirect!');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

downloadGoogleHtml('pink floral clothing patterns');
