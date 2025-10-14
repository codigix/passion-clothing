const { sequelize } = require('./server/config/database');

async function checkTables() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Check if tables exist
    const tables = [
      'production_orders',
      'production_stages', 
      'material_requirements',
      'quality_checkpoints'
    ];

    for (const table of tables) {
      const [results] = await sequelize.query(`SHOW TABLES LIKE '${table}'`);
      if (results.length > 0) {
        console.log(`✅ Table '${table}' exists`);
        
        // Get column info
        const [columns] = await sequelize.query(`DESCRIBE ${table}`);
        console.log(`   Columns (${columns.length}):`, columns.map(c => c.Field).join(', '));
      } else {
        console.log(`❌ Table '${table}' DOES NOT EXIST`);
      }
    }

    // Check production order #3
    console.log('\n--- Production Order #3 ---');
    const [order] = await sequelize.query(`SELECT * FROM production_orders WHERE id = 3`);
    if (order.length > 0) {
      console.log('✅ Production Order #3 exists:');
      console.log('   ID:', order[0].id);
      console.log('   Number:', order[0].production_number);
      console.log('   Status:', order[0].status);
      console.log('   Product ID:', order[0].product_id);
      console.log('   Sales Order ID:', order[0].sales_order_id);
      console.log('   Supervisor ID:', order[0].supervisor_id);
      console.log('   Assigned To:', order[0].assigned_to);
      console.log('   QA Lead ID:', order[0].qa_lead_id);
      
      // Check if related records exist
      const [stages] = await sequelize.query(`SELECT COUNT(*) as count FROM production_stages WHERE production_order_id = 3`);
      console.log('   Stages:', stages[0].count);
      
      const [matReqs] = await sequelize.query(`SELECT COUNT(*) as count FROM material_requirements WHERE production_order_id = 3`);
      console.log('   Material Requirements:', matReqs[0].count);
      
      const [qcPoints] = await sequelize.query(`SELECT COUNT(*) as count FROM quality_checkpoints WHERE production_order_id = 3`);
      console.log('   Quality Checkpoints:', qcPoints[0].count);
      
      // Check if foreign keys are valid
      if (order[0].product_id) {
        const [product] = await sequelize.query(`SELECT id, name FROM products WHERE id = ${order[0].product_id}`);
        console.log('   Product:', product.length > 0 ? product[0].name : '❌ PRODUCT NOT FOUND');
      }
      
      if (order[0].sales_order_id) {
        const [salesOrder] = await sequelize.query(`SELECT id, order_number FROM sales_orders WHERE id = ${order[0].sales_order_id}`);
        console.log('   Sales Order:', salesOrder.length > 0 ? salesOrder[0].order_number : '❌ SALES ORDER NOT FOUND');
      }
      
      if (order[0].supervisor_id) {
        const [supervisor] = await sequelize.query(`SELECT id, name FROM users WHERE id = ${order[0].supervisor_id}`);
        console.log('   Supervisor:', supervisor.length > 0 ? supervisor[0].name : '❌ SUPERVISOR NOT FOUND');
      }
      
      if (order[0].assigned_to) {
        const [assignedUser] = await sequelize.query(`SELECT id, name FROM users WHERE id = ${order[0].assigned_to}`);
        console.log('   Assigned User:', assignedUser.length > 0 ? assignedUser[0].name : '❌ USER NOT FOUND');
      }
      
      if (order[0].qa_lead_id) {
        const [qaLead] = await sequelize.query(`SELECT id, name FROM users WHERE id = ${order[0].qa_lead_id}`);
        console.log('   QA Lead:', qaLead.length > 0 ? qaLead[0].name : '❌ QA LEAD NOT FOUND');
      }
    } else {
      console.log('❌ Production Order #3 DOES NOT EXIST');
    }

    await sequelize.close();
    console.log('\n✅ Check complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkTables();