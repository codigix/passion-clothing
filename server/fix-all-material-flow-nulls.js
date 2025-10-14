/**
 * Comprehensive Material Flow NULL Data Fix
 * Fills NULL fields across all material flow tables:
 * - project_material_requests (MRN)
 * - material_dispatches
 * - material_receipts
 * - material_verifications
 * - production_approvals
 */

const { Op } = require('sequelize');
const { 
  sequelize, 
  ProjectMaterialRequest, 
  SalesOrder, 
  Product, 
  Customer,
  MaterialDispatch,
  MaterialReceipt,
  MaterialVerification,
  ProductionApproval
} = require('./config/database');

// Statistics
const stats = {
  mrn: { processed: 0, updated: 0, failed: 0 },
  dispatch: { processed: 0, updated: 0, failed: 0 },
  receipt: { processed: 0, updated: 0, failed: 0 },
  verification: { processed: 0, updated: 0, failed: 0 },
  approval: { processed: 0, updated: 0, failed: 0 },
  salesOrders: { created: 0, found: 0 },
  products: { created: 0, found: 0 },
  customers: { created: 0, found: 0 }
};

/**
 * Extract customer name from manufacturing notes
 */
function extractCustomerName(notes) {
  if (!notes) return null;
  const customerMatch = notes.match(/Customer:\s*([^\n]+)/i);
  return customerMatch ? customerMatch[1].trim() : null;
}

/**
 * Extract product name from notes or materials
 */
function extractProductName(mrn) {
  // Try manufacturing_notes first
  if (mrn.manufacturing_notes) {
    const productMatch = mrn.manufacturing_notes.match(/Product:\s*([^\n(]+)/i);
    if (productMatch) return productMatch[1].trim();
  }

  // Try materials_requested array
  if (mrn.materials_requested && Array.isArray(mrn.materials_requested) && mrn.materials_requested.length > 0) {
    const firstMaterial = mrn.materials_requested[0];
    return firstMaterial.description || firstMaterial.material_name || null;
  }

  return null;
}

/**
 * Extract quantity from notes or materials
 */
function extractQuantity(mrn) {
  // Try materials_requested array first
  if (mrn.materials_requested && Array.isArray(mrn.materials_requested) && mrn.materials_requested.length > 0) {
    const totalQty = mrn.materials_requested.reduce((sum, mat) => {
      return sum + (parseFloat(mat.quantity_required) || 0);
    }, 0);
    if (totalQty > 0) return totalQty;
  }

  // Try parsing from notes
  if (mrn.manufacturing_notes) {
    const qtyMatch = mrn.manufacturing_notes.match(/Quantity:\s*([\d,]+(?:\.\d+)?)/i);
    if (qtyMatch) {
      return parseFloat(qtyMatch[1].replace(/,/g, ''));
    }
  }

  return 1; // Default fallback
}

/**
 * Find or create customer
 */
async function findOrCreateCustomer(customerName) {
  if (!customerName) return null;

  try {
    // Try to find existing customer
    let customer = await Customer.findOne({
      where: {
        name: {
          [Op.like]: `%${customerName}%`
        }
      }
    });

    if (customer) {
      stats.customers.found++;
      return customer.id;
    }

    // Create new customer
    const newCustomer = await Customer.create({
      customer_code: `CUST-AUTO-${Date.now()}`,
      name: customerName,
      customer_type: 'regular',
      status: 'active',
      payment_terms: 'Net 30',
      created_by: 1 // System
    });

    stats.customers.created++;
    console.log(`  ✓ Created new customer: ${customerName} (ID: ${newCustomer.id})`);
    return newCustomer.id;
  } catch (error) {
    console.error(`  ✗ Error finding/creating customer "${customerName}":`, error.message);
    return null;
  }
}

/**
 * Find or create product
 */
async function findOrCreateProduct(productName) {
  if (!productName) return null;

  try {
    // Try to find existing product
    let product = await Product.findOne({
      where: {
        name: {
          [Op.like]: `%${productName}%`
        }
      }
    });

    if (product) {
      stats.products.found++;
      return product.id;
    }

    // Create new product with required fields
    const newProduct = await Product.create({
      product_code: `PRD-AUTO-${Date.now()}`,
      name: productName,
      description: `Auto-created product from MRN migration - ${productName}`,
      category: 'finished_goods', // Valid ENUM: raw_materials, work_in_progress, finished_goods, accessories, packaging
      product_type: 'finished_goods', // Required field
      unit_of_measurement: 'PCS', // Required field
      status: 'active',
      created_by: 1 // System
    });

    stats.products.created++;
    console.log(`  ✓ Created new product: ${productName} (ID: ${newProduct.id})`);
    return newProduct.id;
  } catch (error) {
    console.error(`  ✗ Error finding/creating product "${productName}":`, error.message);
    return null;
  }
}

/**
 * Find or create sales order
 */
async function findOrCreateSalesOrder(projectName, productId, productName, customerId, quantity) {
  if (!projectName) return null;

  try {
    // Try exact match first
    let salesOrder = await SalesOrder.findOne({
      where: { order_number: projectName }
    });

    if (salesOrder) {
      stats.salesOrders.found++;
      return salesOrder.id;
    }

    // Try fuzzy match
    salesOrder = await SalesOrder.findOne({
      where: {
        order_number: {
          [Op.like]: `%${projectName}%`
        }
      }
    });

    if (salesOrder) {
      stats.salesOrders.found++;
      return salesOrder.id;
    }

    // Create new sales order
    const items = JSON.stringify([
      {
        product_id: productId,
        product_name: productName,
        quantity: quantity || 1,
        unit_price: 0,
        total_price: 0
      }
    ]);

    const newSalesOrder = await SalesOrder.create({
      order_number: projectName,
      customer_id: customerId,
      product_id: productId,
      product_name: productName,
      order_date: new Date(),
      delivery_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      order_type: 'regular',
      items: items, // Required field
      total_quantity: quantity || 1,
      total_amount: 0,
      final_amount: 0,
      status: 'pending',
      priority: 'medium',
      approval_status: 'pending',
      created_by: 1 // System
    });

    stats.salesOrders.created++;
    console.log(`  ✓ Created new sales order: ${projectName} (ID: ${newSalesOrder.id})`);
    return newSalesOrder.id;
  } catch (error) {
    console.error(`  ✗ Error finding/creating sales order "${projectName}":`, error.message);
    return null;
  }
}

/**
 * Fix MRN records
 */
async function fixMRNRecords() {
  console.log('\n📋 STEP 1: Fixing MRN Records (project_material_requests)');
  console.log('='.repeat(80));

  const mrns = await ProjectMaterialRequest.findAll({
    where: {
      [Op.or]: [
        { sales_order_id: null },
        { product_id: null },
        { product_name: null }
      ]
    },
    order: [['created_at', 'DESC']]
  });

  console.log(`Found ${mrns.length} MRN records with NULL fields\n`);

  for (const mrn of mrns) {
    stats.mrn.processed++;
    console.log(`\n📦 Processing MRN: ${mrn.request_number}`);
    console.log(`   Project: ${mrn.project_name}`);

    const updates = {};
    let needsUpdate = false;

    try {
      // Extract data
      const productName = mrn.product_name || extractProductName(mrn);
      const customerName = extractCustomerName(mrn.manufacturing_notes);
      const quantity = extractQuantity(mrn);

      console.log(`   Extracted - Product: ${productName}, Customer: ${customerName}, Qty: ${quantity}`);

      // Find/create customer
      const customerId = customerName ? await findOrCreateCustomer(customerName) : null;

      // Find/create product
      let productId = mrn.product_id;
      if (!productId && productName) {
        productId = await findOrCreateProduct(productName);
        if (productId) {
          updates.product_id = productId;
          needsUpdate = true;
        }
      }

      // Update product_name if missing
      if (!mrn.product_name && productName) {
        updates.product_name = productName;
        needsUpdate = true;
      }

      // Find/create sales order
      let salesOrderId = mrn.sales_order_id;
      if (!salesOrderId && mrn.project_name) {
        salesOrderId = await findOrCreateSalesOrder(
          mrn.project_name,
          productId,
          productName,
          customerId,
          quantity
        );
        if (salesOrderId) {
          updates.sales_order_id = salesOrderId;
          needsUpdate = true;
        }
      }

      // Apply updates
      if (needsUpdate) {
        await mrn.update(updates);
        stats.mrn.updated++;
        console.log(`   ✅ Updated MRN with:`, updates);
      } else {
        console.log(`   ℹ️  No updates needed`);
      }

      // Return the complete data for downstream use
      mrn.enrichedData = {
        sales_order_id: updates.sales_order_id || mrn.sales_order_id,
        product_id: updates.product_id || mrn.product_id,
        product_name: updates.product_name || mrn.product_name
      };

    } catch (error) {
      stats.mrn.failed++;
      console.error(`   ✗ Error processing MRN ${mrn.request_number}:`, error.message);
    }
  }

  return mrns;
}

/**
 * Fix Material Dispatch records
 */
async function fixMaterialDispatches(enrichedMRNs) {
  console.log('\n\n📤 STEP 2: Fixing Material Dispatch Records');
  console.log('='.repeat(80));

  const dispatches = await MaterialDispatch.findAll({
    where: {
      [Op.or]: [
        { product_id: null },
        { product_name: null }
      ]
    }
  });

  console.log(`Found ${dispatches.length} dispatch records with NULL fields\n`);

  for (const dispatch of dispatches) {
    stats.dispatch.processed++;
    console.log(`\n📤 Processing Dispatch: ${dispatch.dispatch_number}`);

    try {
      // Find corresponding MRN
      const mrn = enrichedMRNs.find(m => m.id === dispatch.mrn_request_id);
      if (!mrn || !mrn.enrichedData) {
        console.log(`   ⚠️  No matching MRN found`);
        continue;
      }

      const updates = {};
      let needsUpdate = false;

      if (!dispatch.product_id && mrn.enrichedData.product_id) {
        updates.product_id = mrn.enrichedData.product_id;
        needsUpdate = true;
      }

      if (!dispatch.product_name && mrn.enrichedData.product_name) {
        updates.product_name = mrn.enrichedData.product_name;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await dispatch.update(updates);
        stats.dispatch.updated++;
        console.log(`   ✅ Updated dispatch with:`, updates);
      } else {
        console.log(`   ℹ️  No updates needed`);
      }
    } catch (error) {
      stats.dispatch.failed++;
      console.error(`   ✗ Error:`, error.message);
    }
  }
}

/**
 * Fix Material Receipt records
 */
async function fixMaterialReceipts(enrichedMRNs) {
  console.log('\n\n📥 STEP 3: Fixing Material Receipt Records');
  console.log('='.repeat(80));

  const receipts = await MaterialReceipt.findAll({
    where: {
      [Op.or]: [
        { product_id: null },
        { product_name: null }
      ]
    }
  });

  console.log(`Found ${receipts.length} receipt records with NULL fields\n`);

  for (const receipt of receipts) {
    stats.receipt.processed++;
    console.log(`\n📥 Processing Receipt: ${receipt.receipt_number}`);

    try {
      // Find corresponding MRN
      const mrn = enrichedMRNs.find(m => m.id === receipt.mrn_request_id);
      if (!mrn || !mrn.enrichedData) {
        console.log(`   ⚠️  No matching MRN found`);
        continue;
      }

      const updates = {};
      let needsUpdate = false;

      if (!receipt.product_id && mrn.enrichedData.product_id) {
        updates.product_id = mrn.enrichedData.product_id;
        needsUpdate = true;
      }

      if (!receipt.product_name && mrn.enrichedData.product_name) {
        updates.product_name = mrn.enrichedData.product_name;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await receipt.update(updates);
        stats.receipt.updated++;
        console.log(`   ✅ Updated receipt with:`, updates);
      } else {
        console.log(`   ℹ️  No updates needed`);
      }
    } catch (error) {
      stats.receipt.failed++;
      console.error(`   ✗ Error:`, error.message);
    }
  }
}

/**
 * Fix Material Verification records
 */
async function fixMaterialVerifications(enrichedMRNs) {
  console.log('\n\n🔍 STEP 4: Fixing Material Verification Records');
  console.log('='.repeat(80));

  const verifications = await MaterialVerification.findAll({
    where: {
      [Op.or]: [
        { product_id: null },
        { product_name: null }
      ]
    }
  });

  console.log(`Found ${verifications.length} verification records with NULL fields\n`);

  for (const verification of verifications) {
    stats.verification.processed++;
    console.log(`\n🔍 Processing Verification: ${verification.verification_number}`);

    try {
      // Find corresponding MRN
      const mrn = enrichedMRNs.find(m => m.id === verification.mrn_request_id);
      if (!mrn || !mrn.enrichedData) {
        console.log(`   ⚠️  No matching MRN found`);
        continue;
      }

      const updates = {};
      let needsUpdate = false;

      if (!verification.product_id && mrn.enrichedData.product_id) {
        updates.product_id = mrn.enrichedData.product_id;
        needsUpdate = true;
      }

      if (!verification.product_name && mrn.enrichedData.product_name) {
        updates.product_name = mrn.enrichedData.product_name;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await verification.update(updates);
        stats.verification.updated++;
        console.log(`   ✅ Updated verification with:`, updates);
      } else {
        console.log(`   ℹ️  No updates needed`);
      }
    } catch (error) {
      stats.verification.failed++;
      console.error(`   ✗ Error:`, error.message);
    }
  }
}

/**
 * Fix Production Approval records
 */
async function fixProductionApprovals(enrichedMRNs) {
  console.log('\n\n✅ STEP 5: Fixing Production Approval Records');
  console.log('='.repeat(80));

  const approvals = await ProductionApproval.findAll({
    where: {
      [Op.or]: [
        { product_id: null },
        { product_name: null }
      ]
    }
  });

  console.log(`Found ${approvals.length} approval records with NULL fields\n`);

  for (const approval of approvals) {
    stats.approval.processed++;
    console.log(`\n✅ Processing Approval: ${approval.approval_number}`);

    try {
      // Find corresponding MRN
      const mrn = enrichedMRNs.find(m => m.id === approval.mrn_request_id);
      if (!mrn || !mrn.enrichedData) {
        console.log(`   ⚠️  No matching MRN found`);
        continue;
      }

      const updates = {};
      let needsUpdate = false;

      if (!approval.product_id && mrn.enrichedData.product_id) {
        updates.product_id = mrn.enrichedData.product_id;
        needsUpdate = true;
      }

      if (!approval.product_name && mrn.enrichedData.product_name) {
        updates.product_name = mrn.enrichedData.product_name;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await approval.update(updates);
        stats.approval.updated++;
        console.log(`   ✅ Updated approval with:`, updates);
      } else {
        console.log(`   ℹ️  No updates needed`);
      }
    } catch (error) {
      stats.approval.failed++;
      console.error(`   ✗ Error:`, error.message);
    }
  }
}

/**
 * Print final summary
 */
function printSummary() {
  console.log('\n\n');
  console.log('='.repeat(80));
  console.log('📊 COMPREHENSIVE MIGRATION SUMMARY');
  console.log('='.repeat(80));
  
  console.log('\n📋 MRN Records:');
  console.log(`   Processed: ${stats.mrn.processed} | Updated: ${stats.mrn.updated} | Failed: ${stats.mrn.failed}`);
  
  console.log('\n📤 Material Dispatches:');
  console.log(`   Processed: ${stats.dispatch.processed} | Updated: ${stats.dispatch.updated} | Failed: ${stats.dispatch.failed}`);
  
  console.log('\n📥 Material Receipts:');
  console.log(`   Processed: ${stats.receipt.processed} | Updated: ${stats.receipt.updated} | Failed: ${stats.receipt.failed}`);
  
  console.log('\n🔍 Material Verifications:');
  console.log(`   Processed: ${stats.verification.processed} | Updated: ${stats.verification.updated} | Failed: ${stats.verification.failed}`);
  
  console.log('\n✅ Production Approvals:');
  console.log(`   Processed: ${stats.approval.processed} | Updated: ${stats.approval.updated} | Failed: ${stats.approval.failed}`);
  
  console.log('\n🏢 Data Creation:');
  console.log(`   Sales Orders Created: ${stats.salesOrders.created} | Found: ${stats.salesOrders.found}`);
  console.log(`   Products Created: ${stats.products.created} | Found: ${stats.products.found}`);
  console.log(`   Customers Created: ${stats.customers.created} | Found: ${stats.customers.found}`);
  
  const totalProcessed = stats.mrn.processed + stats.dispatch.processed + stats.receipt.processed + 
                          stats.verification.processed + stats.approval.processed;
  const totalUpdated = stats.mrn.updated + stats.dispatch.updated + stats.receipt.updated + 
                       stats.verification.updated + stats.approval.updated;
  const totalFailed = stats.mrn.failed + stats.dispatch.failed + stats.receipt.failed + 
                      stats.verification.failed + stats.approval.failed;
  
  console.log('\n📊 TOTALS:');
  console.log(`   Total Records Processed: ${totalProcessed}`);
  console.log(`   Total Records Updated: ${totalUpdated}`);
  console.log(`   Total Failures: ${totalFailed}`);
  console.log('='.repeat(80));
  
  if (totalFailed === 0) {
    console.log('\n✨ Migration completed successfully! All NULL fields have been filled.');
  } else {
    console.log(`\n⚠️  Migration completed with ${totalFailed} failures. Please review the logs above.`);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Comprehensive Material Flow NULL Data Migration...\n');
  console.log('='.repeat(80));
  console.log('This script will fix NULL fields across ALL material flow tables:');
  console.log('  • project_material_requests (MRN)');
  console.log('  • material_dispatches');
  console.log('  • material_receipts');
  console.log('  • material_verifications');
  console.log('  • production_approvals');
  console.log('='.repeat(80));

  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connected successfully\n');

    // Step 1: Fix MRNs first (they are the source of truth)
    const enrichedMRNs = await fixMRNRecords();

    // Step 2-5: Fix all downstream records
    await fixMaterialDispatches(enrichedMRNs);
    await fixMaterialReceipts(enrichedMRNs);
    await fixMaterialVerifications(enrichedMRNs);
    await fixProductionApprovals(enrichedMRNs);

    // Print summary
    printSummary();

  } catch (error) {
    console.error('\n❌ Fatal Error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the migration
main();