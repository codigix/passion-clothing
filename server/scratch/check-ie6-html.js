const fs = require('fs');
const axios = require('axios');

async function checkIE6() {
  try {
    const url = `https://www.google.com/search?q=pink+floral+clothing+patterns&tbm=isch`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)'
      }
    });
    console.log(response.data);
  } catch (err) {
    console.error(err.message);
  }
}

checkIE6();
