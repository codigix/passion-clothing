const { Sequelize } = require('sequelize');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

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

async function checkAgents() {
  try {
    const results = await sequelize.query(
      `SELECT id, agent_name, courier_company, is_active, is_verified FROM CourierAgents LIMIT 10`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    console.log('📊 Courier Agents in Database:');
    console.log('================================');
    console.log(`Total: ${results.length}\n`);
    
    if (results.length === 0) {
      console.log('❌ NO AGENTS FOUND - This is why you see "No agents available"');
      console.log('You need to create courier agents first.\n');
    } else {
      results.forEach(agent => {
        console.log(`Agent: ${agent.agent_name}`);
        console.log(`  Company: ${agent.courier_company}`);
        console.log(`  Active: ${agent.is_active}, Verified: ${agent.is_verified}`);
        console.log();
      });
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAgents();