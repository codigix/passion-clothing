const db = require('./config/database');

(async () => {
  try {
    const rows = await db.sequelize.query('SELECT name FROM sequelizemeta ORDER BY name');
    console.log('Executed migrations:');
    rows[0].forEach(r => console.log('  ' + r.name));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
