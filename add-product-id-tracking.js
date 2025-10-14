/**
 * Migration Script: Add Product ID Tracking
 * 
 * This script adds product_id and product_name fields to all workflow tables
 * to enable complete product tracking from Sales Order to Production
 */

const path = require('path');
const { Sequelize } = require(path.join(__dirname, 'server', 'node_modules', 'sequelize'));
require(path.join(__dirname, 'server', 'node_modules', 'dotenv')).config({ path: './server/.env' });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: console.log
  }
);

async function addProductIdTracking() {
  try {
    console.log('🚀 Starting Product ID Tracking Migration...\n');

    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Get QueryInterface
    const queryInterface = sequelize.getQueryInterface();

    // Tables to update
    const tables = [
      'sales_orders',
      'purchase_orders',
      'goods_receipt_notes',
      'project_material_requests',
      'material_dispatches',
      'material_receipts',
      'material_verifications',
      'production_approvals'
    ];

    console.log('📋 Tables to update:', tables.join(', '), '\n');

    // Step 1: Add product_id and product_name columns to each table
    for (const table of tables) {
      try {
        console.log(`\n🔧 Processing table: ${table}`);

        // Check if product_id column already exists
        const tableDescription = await queryInterface.describeTable(table);
        
        if (!tableDescription.product_id) {
          console.log(`  ➕ Adding product_id column...`);
          await queryInterface.addColumn(table, 'product_id', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'products',
              key: 'id'
            },
            comment: 'Final product being manufactured'
          });
          console.log(`  ✅ product_id column added`);
        } else {
          console.log(`  ⏭️  product_id column already exists`);
        }

        if (!tableDescription.product_name) {
          console.log(`  ➕ Adding product_name column...`);
          await queryInterface.addColumn(table, 'product_name', {
            type: Sequelize.STRING(200),
            allowNull: true,
            comment: 'Product name for quick reference'
          });
          console.log(`  ✅ product_name column added`);
        } else {
          console.log(`  ⏭️  product_name column already exists`);
        }

        // Add index on product_id for better query performance
        const indexName = `idx_${table}_product_id`;
        console.log(`  ➕ Adding index: ${indexName}...`);
        
        try {
          await sequelize.query(`
            CREATE INDEX ${indexName} ON ${table}(product_id)
          `);
          console.log(`  ✅ Index created`);
        } catch (indexError) {
          if (indexError.original && indexError.original.code === 'ER_DUP_KEYNAME') {
            console.log(`  ⏭️  Index already exists`);
          } else {
            console.log(`  ⚠️  Could not create index:`, indexError.message);
          }
        }

        console.log(`  ✅ Completed: ${table}`);

      } catch (error) {
        console.error(`  ❌ Error processing ${table}:`, error.message);
        // Continue with other tables even if one fails
      }
    }

    // Step 2: Verify changes
    console.log('\n\n📊 Verification - Checking all tables...\n');
    
    for (const table of tables) {
      const tableDescription = await queryInterface.describeTable(table);
      const hasProductId = !!tableDescription.product_id;
      const hasProductName = !!tableDescription.product_name;
      
      console.log(`${table}:`);
      console.log(`  product_id: ${hasProductId ? '✅' : '❌'}`);
      console.log(`  product_name: ${hasProductName ? '✅' : '❌'}`);
    }

    // Step 3: Show sample update queries
    console.log('\n\n📝 Sample Data Update Queries:\n');
    console.log('-- Link existing Purchase Orders to Products (via Sales Orders)');
    console.log(`
UPDATE purchase_orders po
JOIN sales_orders so ON po.linked_sales_order_id = so.id
SET po.product_id = so.product_id,
    po.product_name = so.product_name
WHERE po.product_id IS NULL 
  AND so.product_id IS NOT NULL;
    `.trim());

    console.log('\n-- Link GRNs to Products (via Purchase Orders)');
    console.log(`
UPDATE goods_receipt_notes grn
JOIN purchase_orders po ON grn.purchase_order_id = po.id
SET grn.product_id = po.product_id,
    grn.product_name = po.product_name
WHERE grn.product_id IS NULL 
  AND po.product_id IS NOT NULL;
    `.trim());

    console.log('\n-- Link MRNs to Products (via Purchase Orders)');
    console.log(`
UPDATE project_material_requests pmr
JOIN purchase_orders po ON pmr.purchase_order_id = po.id
SET pmr.product_id = po.product_id,
    pmr.product_name = po.product_name
WHERE pmr.product_id IS NULL 
  AND po.product_id IS NOT NULL;
    `.trim());

    console.log('\n-- Link Material Dispatches to Products (via MRN)');
    console.log(`
UPDATE material_dispatches md
JOIN project_material_requests pmr ON md.mrn_request_id = pmr.id
SET md.product_id = pmr.product_id,
    md.product_name = pmr.product_name
WHERE md.product_id IS NULL 
  AND pmr.product_id IS NOT NULL;
    `.trim());

    console.log('\n-- Link Material Receipts to Products (via Dispatch)');
    console.log(`
UPDATE material_receipts mr
JOIN material_dispatches md ON mr.dispatch_id = md.id
SET mr.product_id = md.product_id,
    mr.product_name = md.product_name
WHERE mr.product_id IS NULL 
  AND md.product_id IS NOT NULL;
    `.trim());

    console.log('\n-- Link Material Verifications to Products (via Receipt)');
    console.log(`
UPDATE material_verifications mv
JOIN material_receipts mr ON mv.receipt_id = mr.id
SET mv.product_id = mr.product_id,
    mv.product_name = mr.product_name
WHERE mv.product_id IS NULL 
  AND mr.product_id IS NOT NULL;
    `.trim());

    console.log('\n-- Link Production Approvals to Products (via Verification)');
    console.log(`
UPDATE production_approvals pa
JOIN material_verifications mv ON pa.verification_id = mv.id
SET pa.product_id = mv.product_id,
    pa.product_name = mv.product_name
WHERE pa.product_id IS NULL 
  AND mv.product_id IS NOT NULL;
    `.trim());

    console.log('\n\n✅ Migration completed successfully!');
    console.log('\n📌 Next Steps:');
    console.log('1. Update Sequelize models to include product_id and product_name fields');
    console.log('2. Update API routes to carry forward product_id');
    console.log('3. Update frontend to display and manage product_id');
    console.log('4. Run the data update queries above to link existing records');

    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    await sequelize.close();
    process.exit(1);
  }
}

// Run migration
addProductIdTracking();