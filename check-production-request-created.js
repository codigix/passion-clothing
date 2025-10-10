const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').join(__dirname, 'server', '.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'passion_erp',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

async function checkProductionRequests() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected successfully\n');

    // Check all production requests
    const [requests] = await sequelize.query(`
      SELECT 
        id,
        request_number,
        sales_order_id,
        sales_order_number,
        po_id,
        po_number,
        project_name,
        product_name,
        quantity,
        unit,
        priority,
        status,
        requested_by,
        created_at
      FROM production_requests
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.log(`Found ${requests.length} production request(s):\n`);
    
    if (requests.length === 0) {
      console.log('❌ No production requests found in database!');
      console.log('The request creation might have failed.');
    } else {
      requests.forEach((req, index) => {
        console.log(`\n=== Request ${index + 1} ===`);
        console.log(`ID: ${req.id}`);
        console.log(`Request Number: ${req.request_number}`);
        console.log(`Sales Order ID: ${req.sales_order_id || 'NULL'}`);
        console.log(`Sales Order Number: ${req.sales_order_number || 'NULL'}`);
        console.log(`PO ID: ${req.po_id || 'NULL'}`);
        console.log(`PO Number: ${req.po_number || 'NULL'}`);
        console.log(`Project: ${req.project_name}`);
        console.log(`Product: ${req.product_name}`);
        console.log(`Quantity: ${req.quantity} ${req.unit}`);
        console.log(`Priority: ${req.priority}`);
        console.log(`Status: ${req.status}`);
        console.log(`Requested By (User ID): ${req.requested_by}`);
        console.log(`Created: ${req.created_at}`);
      });
    }
    
    // Check notifications for manufacturing
    console.log('\n\n=== Checking Notifications ===\n');
    const [notifications] = await sequelize.query(`
      SELECT 
        id,
        user_id,
        type,
        title,
        message,
        is_read,
        created_at
      FROM notifications
      WHERE type LIKE '%production%'
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.log(`Found ${notifications.length} production-related notification(s):\n`);
    notifications.forEach((notif, index) => {
      console.log(`${index + 1}. [${notif.is_read ? 'READ' : 'UNREAD'}] ${notif.title}`);
      console.log(`   Type: ${notif.type}`);
      console.log(`   User ID: ${notif.user_id}`);
      console.log(`   Message: ${notif.message}`);
      console.log(`   Created: ${notif.created_at}\n`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

checkProductionRequests();