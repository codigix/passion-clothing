const { Sequelize } = require('sequelize');
const { generateBarcode } = require('./utils/barcodeUtils');
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

async function addCotton() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Check if cotton already exists
    const [existing] = await sequelize.query(`
      SELECT * FROM inventory 
      WHERE product_name LIKE '%cotton%' OR product_code = 'COT-001'
      LIMIT 1
    `);

    if (existing.length > 0) {
      console.log('⚠️  Cotton already exists in inventory:');
      console.log(JSON.stringify(existing[0], null, 2));
      console.log('\n🔄 Updating quantity instead...\n');
      
      await sequelize.query(`
        UPDATE inventory 
        SET current_stock = current_stock + 100,
            available_stock = available_stock + 100,
            updated_at = NOW()
        WHERE id = ?
      `, { replacements: [existing[0].id] });
      
      console.log('✅ Added 100 meters to existing cotton stock!\n');
      
      const [updated] = await sequelize.query(`
        SELECT id, product_name, product_code, current_stock, available_stock, unit_of_measurement, barcode 
        FROM inventory 
        WHERE id = ?
      `, { replacements: [existing[0].id] });
      
      console.log('📦 Updated Cotton Details:');
      console.log('==========================');
      console.log(JSON.stringify(updated[0], null, 2));
      
      return;
    }

    // Generate barcode
    const barcode = 'BC-COT-' + Date.now();

    // Add new cotton to inventory
    const [result] = await sequelize.query(`
      INSERT INTO inventory (
        product_name,
        product_code,
        barcode,
        current_stock,
        available_stock,
        initial_quantity,
        reserved_stock,
        consumed_quantity,
        unit_of_measurement,
        category,
        product_type,
        condition,
        quality_status,
        minimum_level,
        maximum_level,
        reorder_level,
        location,
        description,
        cost_price,
        unit_cost,
        is_active,
        created_by,
        created_at,
        updated_at
      ) VALUES (
        'Cotton Fabric',
        'COT-001',
        ?,
        100.00,
        100.00,
        100.00,
        0.00,
        0.00,
        'meter',
        'raw_material',
        'raw_material',
        'new',
        'approved',
        20.00,
        500.00,
        30.00,
        'Warehouse A - Textile Section',
        'Premium cotton fabric for T-shirt manufacturing',
        50.00,
        50.00,
        1,
        1,
        NOW(),
        NOW()
      )
    `, { replacements: [barcode] });

    console.log('✅ Successfully added Cotton to inventory!\n');

    // Fetch the inserted record
    const [inserted] = await sequelize.query(`
      SELECT * FROM inventory 
      WHERE id = ?
    `, { replacements: [result] });

    console.log('📦 Cotton Details:');
    console.log('==================');
    console.log(JSON.stringify(inserted[0], null, 2));
    console.log('\n');

    // Check MRN status
    console.log('📋 Checking MRN Status...');
    console.log('==========================\n');

    const [mrns] = await sequelize.query(`
      SELECT id, request_number, project_name, status, materials_requested
      FROM project_material_requests
      WHERE status = 'pending_inventory_review'
    `);

    if (mrns.length > 0) {
      console.log(`Found ${mrns.length} MRN(s) waiting for inventory review:`);
      mrns.forEach(mrn => {
        console.log(`\n  MRN ${mrn.request_number}:`);
        console.log(`  Project: ${mrn.project_name}`);
        console.log(`  Status: ${mrn.status}`);
        console.log(`  Materials: ${JSON.stringify(mrn.materials_requested, null, 2)}`);
      });
      
      console.log('\n✅ You can now proceed to dispatch materials for the MRN!');
      console.log('   Next step: Login as Inventory Manager');
      console.log('   Navigate to: /inventory/dispatch/1\n');
    } else {
      console.log('   No MRNs waiting for review.\n');
    }

    // Show inventory summary
    const [inventory] = await sequelize.query(`
      SELECT COUNT(*) as total_items, 
             SUM(quantity) as total_quantity,
             GROUP_CONCAT(DISTINCT category) as categories
      FROM inventory
      WHERE status = 'in_stock'
    `);

    console.log('📊 Inventory Summary:');
    console.log('=====================');
    console.log(`Total Items: ${inventory[0].total_items}`);
    console.log(`Categories: ${inventory[0].categories}`);
    console.log('\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

addCotton();