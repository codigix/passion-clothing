const { sequelize } = require('../config/database');

async function checkStatus() {
  try {
    const [results] = await sequelize.query(`
      SHOW COLUMNS FROM project_material_requests WHERE Field = 'status'
    `);
    
    console.log('Current status ENUM:');
    console.log(results[0].Type);
    console.log('');
    console.log('Default:', results[0].Default);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkStatus();