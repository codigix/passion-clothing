/**
 * Data Migration Script: Fix NULL Fields in Material Request Records
 * 
 * This script populates NULL sales_order_id, product_id, and product_name fields
 * in project_material_requests table by:
 * 1. Matching project_name with sales_order.order_number
 * 2. Extracting customer info from manufacturing_notes
 * 3. Creating products if they don't exist based on materials_requested
 * 4. Updating all related records
 */

const { sequelize, ProjectMaterialRequest, SalesOrder, Product, Customer } = require('./config/database');
const { Op } = require('sequelize');

async function extractCustomerFromNotes(notes) {
  if (!notes) return null;
  
  // Extract customer name using regex: "Customer: name"
  const customerMatch = notes.match(/Customer:\s*([^\n]+)/i);
  if (customerMatch) {
    return customerMatch[1].trim();
  }
  
  return null;
}

async function extractProductFromMaterials(materialsRequested) {
  if (!materialsRequested || !Array.isArray(materialsRequested) || materialsRequested.length === 0) {
    return null;
  }
  
  // Get first material's description as product name
  return materialsRequested[0].description || materialsRequested[0].material_name || null;
}

async function findOrCreateProduct(productName, productDescription) {
  if (!productName) return null;
  
  try {
    // Try to find existing product by name
    let product = await Product.findOne({
      where: {
        name: productName
      }
    });
    
    if (product) {
      console.log(`  ✓ Found existing product: ${product.name} (ID: ${product.id})`);
      return product;
    }
    
    // Create new product if it doesn't exist
    console.log(`  ⚠ Product "${productName}" not found, creating new product...`);
    product = await Product.create({
      name: productName,
      product_code: `PRD-AUTO-${Date.now()}`,
      description: productDescription || `Auto-created from MRN: ${productName}`,
      category: 'garment',
      unit: 'PCS',
      price: 0,
      created_by: 1 // System user
    });
    
    console.log(`  ✓ Created new product: ${product.name} (ID: ${product.id})`);
    return product;
    
  } catch (error) {
    console.error(`  ✗ Error finding/creating product "${productName}":`, error.message);
    return null;
  }
}

async function findSalesOrderByProjectName(projectName) {
  if (!projectName) return null;
  
  try {
    // Try exact match with order_number
    let salesOrder = await SalesOrder.findOne({
      where: {
        order_number: projectName
      },
      include: [
        { model: Customer, as: 'customer' }
      ]
    });
    
    if (salesOrder) {
      console.log(`  ✓ Found sales order: ${salesOrder.order_number} (ID: ${salesOrder.id})`);
      return salesOrder;
    }
    
    // Try fuzzy match - project_name might contain the order number
    salesOrder = await SalesOrder.findOne({
      where: {
        order_number: {
          [Op.like]: `%${projectName}%`
        }
      },
      include: [
        { model: Customer, as: 'customer' }
      ]
    });
    
    if (salesOrder) {
      console.log(`  ✓ Found sales order (fuzzy match): ${salesOrder.order_number} (ID: ${salesOrder.id})`);
      return salesOrder;
    }
    
    console.log(`  ⚠ No sales order found for project: ${projectName}`);
    return null;
    
  } catch (error) {
    console.error(`  ✗ Error finding sales order:`, error.message);
    return null;
  }
}

async function fixMRNRecord(mrn) {
  console.log(`\n📋 Processing MRN: ${mrn.request_number}`);
  console.log(`   Project: ${mrn.project_name}`);
  console.log(`   Current sales_order_id: ${mrn.sales_order_id || 'NULL'}`);
  console.log(`   Current product_id: ${mrn.product_id || 'NULL'}`);
  console.log(`   Current product_name: ${mrn.product_name || 'NULL'}`);
  
  const updates = {};
  let hasUpdates = false;
  
  // 1. Find and link sales order if NULL
  if (!mrn.sales_order_id && mrn.project_name) {
    const salesOrder = await findSalesOrderByProjectName(mrn.project_name);
    if (salesOrder) {
      updates.sales_order_id = salesOrder.id;
      hasUpdates = true;
      console.log(`  ✓ Will update sales_order_id to: ${salesOrder.id}`);
      
      // Also get customer name from sales order
      if (salesOrder.customer) {
        console.log(`  ✓ Customer from sales order: ${salesOrder.customer.name}`);
      }
    }
  }
  
  // 2. Extract product name from materials if NULL
  let productNameToUse = mrn.product_name;
  if (!productNameToUse) {
    productNameToUse = await extractProductFromMaterials(mrn.materials_requested);
    if (productNameToUse) {
      updates.product_name = productNameToUse;
      hasUpdates = true;
      console.log(`  ✓ Will update product_name to: ${productNameToUse}`);
    }
  }
  
  // 3. Find or create product if NULL
  if (!mrn.product_id && productNameToUse) {
    const product = await findOrCreateProduct(productNameToUse, mrn.manufacturing_notes);
    if (product) {
      updates.product_id = product.id;
      if (!updates.product_name) {
        updates.product_name = product.name;
      }
      hasUpdates = true;
      console.log(`  ✓ Will update product_id to: ${product.id}`);
    }
  }
  
  // 4. Apply updates if any
  if (hasUpdates) {
    try {
      await mrn.update(updates);
      console.log(`  ✅ MRN ${mrn.request_number} updated successfully!`);
      return { success: true, updates };
    } catch (error) {
      console.error(`  ✗ Failed to update MRN ${mrn.request_number}:`, error.message);
      return { success: false, error: error.message };
    }
  } else {
    console.log(`  ⚠ No updates needed for MRN ${mrn.request_number}`);
    return { success: true, updates: null };
  }
}

async function main() {
  console.log('🚀 Starting MRN Data Migration...\n');
  console.log('=' .repeat(80));
  
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connected successfully\n');
    
    // Find all MRNs with NULL fields
    const mrnsToFix = await ProjectMaterialRequest.findAll({
      where: {
        [Op.or]: [
          { sales_order_id: null },
          { product_id: null },
          { product_name: null }
        ]
      },
      order: [['created_at', 'DESC']]
    });
    
    console.log(`📊 Found ${mrnsToFix.length} MRN records with NULL fields\n`);
    
    if (mrnsToFix.length === 0) {
      console.log('✅ No records need fixing. All MRNs are properly populated!');
      process.exit(0);
    }
    
    // Process each MRN
    const results = {
      total: mrnsToFix.length,
      updated: 0,
      failed: 0,
      noUpdatesNeeded: 0
    };
    
    for (const mrn of mrnsToFix) {
      const result = await fixMRNRecord(mrn);
      if (result.success) {
        if (result.updates) {
          results.updated++;
        } else {
          results.noUpdatesNeeded++;
        }
      } else {
        results.failed++;
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 MIGRATION SUMMARY:');
    console.log('='.repeat(80));
    console.log(`Total MRNs processed:    ${results.total}`);
    console.log(`✅ Successfully updated:  ${results.updated}`);
    console.log(`⚠ No updates needed:     ${results.noUpdatesNeeded}`);
    console.log(`✗ Failed:                ${results.failed}`);
    console.log('='.repeat(80));
    
    if (results.updated > 0) {
      console.log('\n✨ Migration completed successfully!');
      console.log('👉 Please verify the data in Production Wizard');
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the migration
main();