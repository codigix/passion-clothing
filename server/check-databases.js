const { Sequelize } = require('sequelize');

async function checkDatabases() {
  // Check passion_erp
  console.log('🔍 Checking database: passion_erp\n');
  try {
    const seq1 = new Sequelize('passion_erp', 'root', 'root', {
      host: 'localhost',
      port: 3306,
      dialect: 'mysql',
      logging: false
    });
    await seq1.authenticate();
    const [results1] = await seq1.query("SHOW TABLES LIKE 'production_requests'");
    if (results1.length > 0) {
      const [cols1] = await seq1.query("SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'passion_erp' AND TABLE_NAME = 'production_requests'");
      console.log(`✅ Database 'passion_erp' has production_requests table (${cols1[0].count} columns)\n`);
    } else {
      console.log(`❌ Database 'passion_erp' exists but NO production_requests table\n`);
    }
    await seq1.close();
  } catch (e) {
    console.log(`❌ Database 'passion_erp' error: ${e.message}\n`);
  }
  
  // Check passion_erp
  console.log('🔍 Checking database: passion_erp (with h)\n');
  try {
    const seq2 = new Sequelize('passion_erp', 'root', 'root', {
      host: 'localhost',
      port: 3306,
      dialect: 'mysql',
      logging: false
    });
    await seq2.authenticate();
    const [results2] = await seq2.query("SHOW TABLES LIKE 'production_requests'");
    if (results2.length > 0) {
      const [cols2] = await seq2.query("SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'passion_erp' AND TABLE_NAME = 'production_requests'");
      console.log(`✅ Database 'passion_erp' has production_requests table (${cols2[0].count} columns)\n`);
    } else {
      console.log(`❌ Database 'passion_erp' exists but NO production_requests table\n`);
    }
    await seq2.close();
  } catch (e) {
    console.log(`❌ Database 'passion_erp' error: ${e.message}\n`);
  }
  
  console.log('📝 Server is configured to use: passion_erp (from .env)');
}

checkDatabases().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });