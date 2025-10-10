const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
  }
);

async function checkSchema() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Check project_material_requests schema
    console.log('📋 PROJECT_MATERIAL_REQUESTS SCHEMA:');
    console.log('======================================\n');
    const [columns] = await sequelize.query('DESCRIBE project_material_requests');
    columns.forEach(col => {
      console.log(`  ${col.Field.padEnd(30)} | ${col.Type.padEnd(20)} | ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    console.log('\n\n📋 PROJECT_MATERIAL_REQUESTS DATA:');
    console.log('====================================\n');
    
    const [mrns] = await sequelize.query(`
      SELECT * 
      FROM project_material_requests 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    if (mrns.length === 0) {
      console.log('   No MRN requests found.\n');
    } else {
      mrns.forEach(mrn => {
        console.log(JSON.stringify(mrn, null, 2));
        console.log('\n---\n');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkSchema();