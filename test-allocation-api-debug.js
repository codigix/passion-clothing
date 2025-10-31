const http = require('http');

// Valid JWT token (admin user)
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IlN1cGVyIEFkbWluIiwiZW1haWwiOiJhZG1pbkBwYXNzaW9uLmNvbSIsImRlcGFydG1lbnQiOiJhZG1pbiIsImlhdCI6MTczMDc5MDExMjAwMH0.F5pYwCxT9lL5fZ0kzX4dQj9lVq0vJ8M0R2E6nQ3vZ8s';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/inventory/allocations/projects-overview',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
    
    try {
      const response = JSON.parse(data);
      console.log('\n=== PARSED RESPONSE ===');
      console.log(JSON.stringify(response, null, 2));
    } catch (e) {
      console.log('Could not parse JSON');
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end();