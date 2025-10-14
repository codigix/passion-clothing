/**
 * Check MRN Data Status - Verification Script
 * 
 * This script displays the current state of all MRN records
 * showing which fields are NULL and what data can be extracted
 */

const { sequelize, ProjectMaterialRequest, SalesOrder, Product, Customer } = require('./config/database');

async function checkMRNData() {
  console.log('🔍 Checking MRN Data Status...\n');
  console.log('=' .repeat(100));
  
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected\n');
    
    // Get all MRNs
    const allMRNs = await ProjectMaterialRequest.findAll({
      include: [
        {
          model: SalesOrder,
          as: 'salesOrder',
          required: false,
          include: [{ model: Customer, as: 'customer' }]
        },
        {
          model: Product,
          as: 'product',
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    console.log(`📊 Total MRNs in database: ${allMRNs.length}\n`);
    
    let needsFix = 0;
    let complete = 0;
    
    for (const mrn of allMRNs) {
      const hasNulls = !mrn.sales_order_id || !mrn.product_id || !mrn.product_name;
      
      if (hasNulls) {
        needsFix++;
        console.log(`\n❌ MRN: ${mrn.request_number}`);
      } else {
        complete++;
        console.log(`\n✅ MRN: ${mrn.request_number}`);
      }
      
      console.log(`   Project: ${mrn.project_name}`);
      console.log(`   Sales Order ID: ${mrn.sales_order_id || '❌ NULL'}`);
      console.log(`   Product ID: ${mrn.product_id || '❌ NULL'}`);
      console.log(`   Product Name: ${mrn.product_name || '❌ NULL'}`);
      
      // Show what can be extracted
      if (hasNulls) {
        console.log(`\n   📋 Available Data to Extract:`);
        
        // Check manufacturing notes
        if (mrn.manufacturing_notes) {
          const customerMatch = mrn.manufacturing_notes.match(/Customer:\s*([^\n]+)/i);
          if (customerMatch) {
            console.log(`   ✓ Customer in notes: "${customerMatch[1].trim()}"`);
          }
          
          const productMatch = mrn.manufacturing_notes.match(/Product:\s*([^\n(]+)/i);
          if (productMatch) {
            console.log(`   ✓ Product in notes: "${productMatch[1].trim()}"`);
          }
        }
        
        // Check materials_requested
        if (mrn.materials_requested && Array.isArray(mrn.materials_requested) && mrn.materials_requested.length > 0) {
          const firstMaterial = mrn.materials_requested[0];
          console.log(`   ✓ Material description: "${firstMaterial.description || 'N/A'}"`);
          console.log(`   ✓ Material quantity: ${firstMaterial.quantity_required || 0}`);
        }
        
        // Check if sales order exists
        const salesOrder = await SalesOrder.findOne({
          where: { order_number: mrn.project_name },
          include: [{ model: Customer, as: 'customer' }]
        });
        
        if (salesOrder) {
          console.log(`   ✓ Sales Order found: SO-${salesOrder.id} "${salesOrder.order_number}"`);
          if (salesOrder.customer) {
            console.log(`   ✓ Customer from SO: "${salesOrder.customer.name}"`);
          }
        } else {
          console.log(`   ⚠ No Sales Order found for project: "${mrn.project_name}"`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(100));
    console.log('📊 SUMMARY:');
    console.log('='.repeat(100));
    console.log(`Total MRNs:              ${allMRNs.length}`);
    console.log(`✅ Complete records:      ${complete}`);
    console.log(`❌ Records needing fix:   ${needsFix}`);
    console.log('='.repeat(100));
    
    if (needsFix > 0) {
      console.log('\n👉 Run "node fix-mrn-null-data.js" to fix NULL fields');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

checkMRNData();