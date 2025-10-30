#!/usr/bin/env node

/**
 * Production Orders Duplicate Cleanup Utility
 * 
 * This script finds and cleans up all duplicate production orders,
 * keeping only the first (oldest) for each sales order.
 * 
 * Usage: node cleanup-production-duplicates.js
 */

const { ProductionOrder, SalesOrder, Shipment, sequelize } = require('./config/database');
const { Op } = require('sequelize');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}═══ ${msg} ═══${colors.reset}\n`)
};

const cleanupDuplicates = async () => {
  const transaction = await sequelize.transaction();
  
  try {
    log.header('PRODUCTION ORDERS DUPLICATE CLEANUP');
    
    // ============================================================
    // STEP 1: IDENTIFY DUPLICATES
    // ============================================================
    log.header('STEP 1: IDENTIFYING DUPLICATES');
    
    const duplicates = await sequelize.query(`
      SELECT 
        so.order_number,
        po.sales_order_id,
        COUNT(*) as duplicate_count,
        GROUP_CONCAT(po.id ORDER BY po.created_at) as ids,
        GROUP_CONCAT(po.production_number ORDER BY po.created_at) as numbers,
        MIN(po.created_at) as first_created
      FROM production_orders po
      LEFT JOIN sales_orders so ON po.sales_order_id = so.id
      WHERE po.sales_order_id IS NOT NULL
      GROUP BY po.sales_order_id
      HAVING COUNT(*) > 1
      ORDER BY COUNT(*) DESC
    `, { transaction });
    
    if (!duplicates || duplicates.length === 0) {
      log.success('No duplicates found! ✨');
      process.exit(0);
    }
    
    log.info(`Found ${duplicates.length} sales orders with duplicate production orders:\n`);
    
    duplicates.forEach((dup, idx) => {
      console.log(
        `${idx + 1}. Sales Order: ${dup.order_number || 'N/A'} (${dup.duplicate_count} orders)`
      );
      console.log(`   Production Numbers: ${dup.numbers}`);
      console.log(`   IDs: ${dup.ids}`);
      console.log();
    });
    
    // ============================================================
    // STEP 2: SHOW WHAT WILL BE CANCELLED
    // ============================================================
    log.header('STEP 2: DUPLICATES TO BE CANCELLED');
    
    const toCancel = [];
    const toKeep = [];
    
    for (const dup of duplicates) {
      const orderIds = dup.ids.split(',').map(Number);
      const orderNumbers = dup.numbers.split(',');
      
      // First ID is the one to keep
      const keepId = orderIds[0];
      const cancelIds = orderIds.slice(1);
      
      toKeep.push({ id: keepId, number: orderNumbers[0], salesOrderId: dup.sales_order_id });
      
      for (let i = 0; i < cancelIds.length; i++) {
        toCancel.push({
          id: cancelIds[i],
          number: orderNumbers[i + 1],
          salesOrderId: dup.sales_order_id
        });
      }
    }
    
    log.info(`Will KEEP: ${toKeep.length} production orders (first/oldest of each group)`);
    log.info(`Will CANCEL: ${toCancel.length} duplicate production orders\n`);
    
    toCancel.slice(0, 10).forEach(item => {
      console.log(`  - ${item.number} (ID: ${item.id})`);
    });
    
    if (toCancel.length > 10) {
      console.log(`  ... and ${toCancel.length - 10} more`);
    }
    console.log();
    
    // ============================================================
    // STEP 3: UPDATE SHIPMENTS
    // ============================================================
    log.header('STEP 3: UPDATING SHIPMENT REFERENCES');
    
    for (const dup of duplicates) {
      const orderIds = dup.ids.split(',').map(Number);
      const keepId = orderIds[0];
      const cancelIds = orderIds.slice(1);
      
      // Find shipments referencing duplicate orders
      const shipmentsToUpdate = await Shipment.findAll({
        where: {
          production_order_id: {
            [Op.in]: cancelIds
          }
        },
        transaction
      });
      
      if (shipmentsToUpdate.length > 0) {
        log.info(`Updating ${shipmentsToUpdate.length} shipments for sales order ${dup.order_number}`);
        
        for (const shipment of shipmentsToUpdate) {
          shipment.production_order_id = keepId;
          await shipment.save({ transaction });
        }
      }
    }
    
    log.success('Shipment references updated');
    
    // ============================================================
    // STEP 4: CANCEL DUPLICATES
    // ============================================================
    log.header('STEP 4: MARKING DUPLICATES AS CANCELLED');
    
    let cancelledCount = 0;
    
    for (const item of toCancel) {
      const order = await ProductionOrder.findByPk(item.id, { transaction });
      if (order) {
        const note = `[AUTO-CANCELLED ${new Date().toISOString().split('T')[0]}] Duplicate production order - consolidated to production_order_id: ${toKeep.find(k => k.salesOrderId === item.salesOrderId).id}`;
        
        order.status = 'cancelled';
        order.manufacturing_notes = order.manufacturing_notes 
          ? `${order.manufacturing_notes}\n${note}`
          : note;
        
        await order.save({ transaction });
        cancelledCount++;
      }
    }
    
    log.success(`Marked ${cancelledCount} duplicate orders as cancelled`);
    
    // ============================================================
    // STEP 5: VERIFY
    // ============================================================
    log.header('STEP 5: VERIFICATION');
    
    const remaining = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT sales_order_id) as sales_orders_with_duplicates
      FROM production_orders po
      WHERE po.sales_order_id IN (
        SELECT sales_order_id 
        FROM production_orders 
        WHERE sales_order_id IS NOT NULL
        GROUP BY sales_order_id 
        HAVING COUNT(*) > 1
      )
      AND po.status NOT IN ('cancelled')
    `, { transaction });
    
    const remainingDupCount = remaining[0][0].sales_orders_with_duplicates;
    
    if (remainingDupCount === 0) {
      log.success('✨ No remaining duplicates found!');
    } else {
      log.warning(`⚠️ ${remainingDupCount} sales orders still have duplicate active orders`);
    }
    
    // ============================================================
    // COMMIT TRANSACTION
    // ============================================================
    await transaction.commit();
    
    log.header('CLEANUP COMPLETE ✅');
    console.log(`
${colors.green}═══════════════════════════════════════════════════════${colors.reset}
${colors.green}Summary:${colors.reset}
  • Kept: ${toKeep.length} production orders (oldest of each group)
  • Cancelled: ${toCancel.length} duplicate orders
  • Updated: ${toCancel.length} shipment references
  • Status: ${remainingDupCount === 0 ? '✅ COMPLETE' : `⚠️ ${remainingDupCount} groups remain`}
${colors.green}═══════════════════════════════════════════════════════${colors.reset}

Next steps:
  1. Refresh your Manufacturing Dashboard (F5)
  2. Check "Incoming Orders" tab to verify single orders
  3. Test workflow - should now move smoothly
  4. Check Production Tracking for no conflicts
    `);
    
  } catch (error) {
    await transaction.rollback();
    log.error(`Cleanup failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
};

// Run the cleanup
cleanupDuplicates()
  .then(() => process.exit(0))
  .catch(err => {
    log.error(`Fatal error: ${err.message}`);
    process.exit(1);
  });