const jwt = require('jsonwebtoken');

const payload = {
  id: 1,
  name: 'Super Admin',
  email: 'admin@passion.com',
  department: 'admin'
};

const secret = 'your_jwt_secret_key_here'; // This should match your .env or config
const token = jwt.sign(payload, secret, { expiresIn: '24h' });

console.log('Generated Token:');
console.log(token);
console.log('\nToken Details:');
console.log(JSON.stringify(jwt.decode(token), null, 2));