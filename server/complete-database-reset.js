const { Sequelize } = require('sequelize');
const readline = require('readline');
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function resetDatabase() {
  console.log('\n🔥🔥🔥 COMPLETE DATABASE RESET 🔥🔥🔥\n');
  console.log('⚠️  WARNING: This will DELETE ALL DATA including:');
  console.log('   - All users (you will need to recreate admin)');
  console.log('   - All sales orders');
  console.log('   - All purchase orders');
  console.log('   - All inventory items');
  console.log('   - All production orders/requests');
  console.log('   - All GRN records');
  console.log('   - All notifications');
  console.log('   - ALL mock/test data\n');

  const answer1 = await askQuestion('Type "DELETE ALL DATA" to confirm: ');
  
  if (answer1 !== 'DELETE ALL DATA') {
    console.log('❌ Cancelled - exact text not matched');
    rl.close();
    process.exit(0);
  }

  const answer2 = await askQuestion('Are you ABSOLUTELY sure? Type "YES": ');
  
  if (answer2 !== 'YES') {
    console.log('❌ Cancelled');
    rl.close();
    process.exit(0);
  }

  rl.close();

  try {
    await sequelize.authenticate();
    console.log('\n✅ Connected to database\n');

    // Get all tables
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}'
      AND TABLE_NAME != 'SequelizeMeta'
    `);

    console.log(`📋 Found ${tables.length} tables to drop\n`);

    // Disable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('🔓 Disabled foreign key checks');

    // Drop all tables
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      console.log(`🗑️  Dropping table: ${tableName}`);
      await sequelize.query(`DROP TABLE IF EXISTS \`${tableName}\``);
    }

    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🔒 Re-enabled foreign key checks\n');

    console.log('✅ ALL TABLES DROPPED SUCCESSFULLY!\n');
    console.log('📝 Next Steps:');
    console.log('   1. Stop the server (Ctrl+C)');
    console.log('   2. Run migrations: cd server && npx sequelize-cli db:migrate');
    console.log('   3. Create admin user: node server/create-admin-quick.js');
    console.log('   4. Start server: npm run dev');
    console.log('   5. Test with REAL data flow!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

resetDatabase();