const axios = require('axios');

async function findWorkingSearXNG() {
  try {
    console.log('Fetching SearXNG instances list...');
    const listUrl = 'https://searx.space/data/instances.json';
    const response = await axios.get(listUrl, { timeout: 5000 });
    
    if (response.data && response.data.instances) {
      const instances = response.data.instances;
      console.log(`Found ${Object.keys(instances).length} instances.`);
      
      // Filter instances that are online and support JSON and image search
      const candidates = [];
      for (const [domain, data] of Object.entries(instances)) {
        // Check status (should be online and have no errors)
        const isOnline = data.monitoring && data.monitoring.status === 'ok';
        const supportsJson = data.configured_formats && data.configured_formats.includes('json');
        
        if (isOnline && supportsJson) {
          candidates.push({
            domain: domain,
            url: data.ssl ? `https://${domain}` : `http://${domain}`,
            responseTime: data.monitoring.response_time || 9999
          });
        }
      }
      
      // Sort by response time (fastest first)
      candidates.sort((a, b) => a.responseTime - b.responseTime);
      console.log(`Found ${candidates.length} online JSON candidates.`);
      
      // Test the top 5 candidates
      for (const candidate of candidates.slice(0, 5)) {
        try {
          const testUrl = `${candidate.url}/search?q=floral+print+women+clothing&format=json&categories=images`;
          console.log(`Testing instance: ${candidate.url}...`);
          const testRes = await axios.get(testUrl, { timeout: 4000 });
          
          if (testRes.data && testRes.data.results && testRes.data.results.length > 0) {
            console.log(`🎉 SUCCESS! Instance ${candidate.url} is working and returned ${testRes.data.results.length} images.`);
            return candidate.url;
          } else {
            console.log(`  No results from ${candidate.url}`);
          }
        } catch (testErr) {
          console.log(`  Failed: ${testErr.message}`);
        }
      }
    }
  } catch (err) {
    console.error('Error finding SearXNG instance:', err.message);
  }
  return null;
}

findWorkingSearXNG();
