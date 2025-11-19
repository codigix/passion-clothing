/**
 * Diagnostic Script: GRN Request Flow Analysis
 * Checks:
 * 1. Pending GRN requests (Approval records)
 * 2. Actual GRN records
 * 3. Purchase Orders with received status
 * 4. The complete flow from PO to GRN
 */

const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const {
  PurchaseOrder,
  Approval,
  GoodsReceiptNote,
  sequelize,
} = require('./config/database');

async function diagnoseGRNFlow() {
  try {
    console.log('🔍 GRN Request Flow Diagnostic\n');
    console.log('=' .repeat(60));

    // 1. Check for pending GRN requests (Approval entities)
    console.log('\n1️⃣  PENDING GRN REQUESTS (Approval Records)');
    console.log('-' .repeat(60));
    
    const grnRequests = await Approval.findAll({
      where: { entity_type: 'grn_creation' },
      order: [['created_at', 'DESC']],
      limit: 10,
    });

    if (grnRequests.length === 0) {
      console.log('❌ NO PENDING GRN REQUESTS FOUND');
    } else {
      console.log(`✅ Found ${grnRequests.length} GRN request(s):\n`);
      grnRequests.forEach((req, idx) => {
        console.log(`   ${idx + 1}. ID: ${req.id}`);
        console.log(`      Status: ${req.status}`);
        console.log(`      Entity ID: ${req.entity_id}`);
        console.log(`      Created: ${req.created_at}`);
        console.log(`      Approved: ${req.approval_date || 'N/A'}`);
      });
    }

    // 2. Check for actual GRN records
    console.log('\n2️⃣  ACTUAL GRN RECORDS (GoodsReceiptNote)');
    console.log('-' .repeat(60));

    const grns = await GoodsReceiptNote.findAll({
      order: [['created_at', 'DESC']],
      limit: 10,
    });

    if (grns.length === 0) {
      console.log('❌ NO GRN RECORDS FOUND');
    } else {
      console.log(`✅ Found ${grns.length} GRN record(s):\n`);
      grns.forEach((grn, idx) => {
        console.log(`   ${idx + 1}. GRN ID: ${grn.id}`);
        console.log(`      PO ID: ${grn.purchase_order_id}`);
        console.log(`      Status: ${grn.status}`);
        console.log(`      Created: ${grn.created_at}`);
      });
    }

    // 3. Check POs with "materials_received" status
    console.log('\n3️⃣  PURCHASE ORDERS WITH MATERIALS RECEIVED');
    console.log('-' .repeat(60));

    const posReceived = await PurchaseOrder.findAll({
      where: { status: ['materials_received', 'grn_requested'] },
      order: [['updated_at', 'DESC']],
      limit: 10,
    });

    if (posReceived.length === 0) {
      console.log('❌ NO POs WITH MATERIALS RECEIVED STATUS');
    } else {
      console.log(`✅ Found ${posReceived.length} PO(s):\n`);
      posReceived.forEach((po, idx) => {
        console.log(`   ${idx + 1}. PO: ${po.po_number}`);
        console.log(`      ID: ${po.id}`);
        console.log(`      Status: ${po.status}`);
        console.log(`      Updated: ${po.updated_at}`);

        // Check if GRN request exists for this PO
        const request = grnRequests.find(r => r.entity_id === po.id);
        const grn = grns.find(g => g.purchase_order_id === po.id);

        if (request) {
          console.log(`      ✅ GRN Request: PENDING (${request.status})`);
        } else if (grn) {
          console.log(`      ✅ GRN Created: ${grn.id}`);
        } else {
          console.log(`      ❌ NO GRN REQUEST OR GRN CREATED`);
        }
      });
    }

    // 4. Summary & Recommendations
    console.log('\n4️⃣  FLOW ANALYSIS & RECOMMENDATIONS');
    console.log('-' .repeat(60));

    if (grnRequests.length === 0 && posReceived.length > 0) {
      console.log('⚠️  ISSUE: Materials marked as received, but no GRN requests created');
      console.log('   ACTION: Check that material-received endpoint creates Approval records');
      console.log('   ENDPOINT: POST /api/procurement/purchase-orders/:poId/material-received');
    } else if (grnRequests.length > 0 && grns.length === 0) {
      console.log('⚠️  ISSUE: GRN requests pending but no actual GRNs created');
      console.log('   ACTION: Inventory must APPROVE the pending GRN requests');
      console.log('   ENDPOINT: POST /api/inventory/grn-requests/:id/approve');
      console.log('   OR: Create GRN manually via: /inventory/grn/create?po_id=<po_id>');
    } else if (grnRequests.length > 0 && grns.length > 0) {
      console.log('✅ FLOW WORKING: Both requests and GRNs exist');
    } else {
      console.log('✅ NO DATA: No materials have been received yet');
    }

    console.log('\n' + '=' .repeat(60));
    console.log('📍 Expected Flow:');
    console.log('  1. Procurement: Mark PO materials as received');
    console.log('  2. System: Auto-creates GRN request (Approval)');
    console.log('  3. Inventory: Sees pending request in dashboard');
    console.log('  4. Inventory: Approves request OR creates GRN manually');
    console.log('  5. System: GRN appears in /inventory/grn page');

  } catch (error) {
    console.error('❌ Error during diagnosis:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

diagnoseGRNFlow();