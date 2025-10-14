/**
 * Verification Script: Check Material Flow Data Integrity
 * Displays all material flow records and their key fields
 */

const { 
  sequelize, 
  ProjectMaterialRequest, 
  MaterialDispatch,
  MaterialReceipt,
  MaterialVerification,
  ProductionApproval,
  User
} = require('./config/database');

async function verifyMaterialFlowData() {
  console.log('🔍 Material Flow Data Integrity Check\n');
  console.log('='.repeat(100));

  try {
    await sequelize.authenticate();
    console.log('✓ Database connected\n');

    // Check MRN Records
    console.log('\n📋 PROJECT MATERIAL REQUESTS (MRN)');
    console.log('-'.repeat(100));
    const mrns = await ProjectMaterialRequest.findAll({
      order: [['created_at', 'DESC']],
      limit: 10
    });
    
    console.log(`Total MRNs: ${mrns.length}\n`);
    mrns.forEach(mrn => {
      console.log(`Request: ${mrn.request_number}`);
      console.log(`  Project: ${mrn.project_name || 'NULL'}`);
      console.log(`  Sales Order ID: ${mrn.sales_order_id || 'NULL'}`);
      console.log(`  Product ID: ${mrn.product_id || 'NULL'}`);
      console.log(`  Product Name: ${mrn.product_name || 'NULL'}`);
      console.log(`  Status: ${mrn.status}`);
      console.log(`  Created: ${mrn.created_at}`);
      
      // Check for NULL fields
      const nullFields = [];
      if (!mrn.sales_order_id) nullFields.push('sales_order_id');
      if (!mrn.product_id) nullFields.push('product_id');
      if (!mrn.product_name) nullFields.push('product_name');
      
      if (nullFields.length > 0) {
        console.log(`  ⚠️  NULL FIELDS: ${nullFields.join(', ')}`);
      } else {
        console.log(`  ✅ All key fields populated`);
      }
      console.log('');
    });

    // Check Material Dispatches
    console.log('\n📤 MATERIAL DISPATCHES');
    console.log('-'.repeat(100));
    const dispatches = await MaterialDispatch.findAll({
      include: [
        { model: User, as: 'dispatcher', attributes: ['name', 'email'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });
    
    console.log(`Total Dispatches: ${dispatches.length}\n`);
    dispatches.forEach(dispatch => {
      console.log(`Dispatch: ${dispatch.dispatch_number}`);
      console.log(`  Project: ${dispatch.project_name || 'NULL'}`);
      console.log(`  MRN Request ID: ${dispatch.mrn_request_id || 'NULL'}`);
      console.log(`  Product ID: ${dispatch.product_id || 'NULL'}`);
      console.log(`  Product Name: ${dispatch.product_name || 'NULL'}`);
      console.log(`  Dispatched By: ${dispatch.dispatcher?.name || 'Unknown'}`);
      console.log(`  Status: ${dispatch.received_status}`);
      
      const nullFields = [];
      if (!dispatch.product_id) nullFields.push('product_id');
      if (!dispatch.product_name) nullFields.push('product_name');
      
      if (nullFields.length > 0) {
        console.log(`  ⚠️  NULL FIELDS: ${nullFields.join(', ')}`);
      } else {
        console.log(`  ✅ All key fields populated`);
      }
      console.log('');
    });

    // Check Material Receipts
    console.log('\n📥 MATERIAL RECEIPTS');
    console.log('-'.repeat(100));
    const receipts = await MaterialReceipt.findAll({
      include: [
        { model: User, as: 'receiver', attributes: ['name', 'email'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });
    
    console.log(`Total Receipts: ${receipts.length}\n`);
    receipts.forEach(receipt => {
      console.log(`Receipt: ${receipt.receipt_number}`);
      console.log(`  Project: ${receipt.project_name || 'NULL'}`);
      console.log(`  MRN Request ID: ${receipt.mrn_request_id || 'NULL'}`);
      console.log(`  Product ID: ${receipt.product_id || 'NULL'}`);
      console.log(`  Product Name: ${receipt.product_name || 'NULL'}`);
      console.log(`  Received By: ${receipt.receiver?.name || 'Unknown'}`);
      console.log(`  Has Discrepancy: ${receipt.has_discrepancy ? 'Yes' : 'No'}`);
      console.log(`  Verification Status: ${receipt.verification_status}`);
      
      const nullFields = [];
      if (!receipt.product_id) nullFields.push('product_id');
      if (!receipt.product_name) nullFields.push('product_name');
      
      if (nullFields.length > 0) {
        console.log(`  ⚠️  NULL FIELDS: ${nullFields.join(', ')}`);
      } else {
        console.log(`  ✅ All key fields populated`);
      }
      console.log('');
    });

    // Check Material Verifications
    console.log('\n🔍 MATERIAL VERIFICATIONS');
    console.log('-'.repeat(100));
    const verifications = await MaterialVerification.findAll({
      include: [
        { model: User, as: 'verifier', attributes: ['name', 'email'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });
    
    console.log(`Total Verifications: ${verifications.length}\n`);
    verifications.forEach(verification => {
      console.log(`Verification: ${verification.verification_number}`);
      console.log(`  Project: ${verification.project_name || 'NULL'}`);
      console.log(`  MRN Request ID: ${verification.mrn_request_id || 'NULL'}`);
      console.log(`  Product ID: ${verification.product_id || 'NULL'}`);
      console.log(`  Product Name: ${verification.product_name || 'NULL'}`);
      console.log(`  Verified By: ${verification.verifier?.name || 'Unknown'}`);
      console.log(`  Overall Result: ${verification.overall_result}`);
      console.log(`  Approval Status: ${verification.approval_status}`);
      
      const nullFields = [];
      if (!verification.product_id) nullFields.push('product_id');
      if (!verification.product_name) nullFields.push('product_name');
      
      if (nullFields.length > 0) {
        console.log(`  ⚠️  NULL FIELDS: ${nullFields.join(', ')}`);
      } else {
        console.log(`  ✅ All key fields populated`);
      }
      console.log('');
    });

    // Check Production Approvals
    console.log('\n✅ PRODUCTION APPROVALS');
    console.log('-'.repeat(100));
    const approvals = await ProductionApproval.findAll({
      include: [
        { model: User, as: 'approver', attributes: ['name', 'email'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });
    
    console.log(`Total Approvals: ${approvals.length}\n`);
    approvals.forEach(approval => {
      console.log(`Approval: ${approval.approval_number}`);
      console.log(`  Project: ${approval.project_name || 'NULL'}`);
      console.log(`  MRN Request ID: ${approval.mrn_request_id || 'NULL'}`);
      console.log(`  Product ID: ${approval.product_id || 'NULL'}`);
      console.log(`  Product Name: ${approval.product_name || 'NULL'}`);
      console.log(`  Approved By: ${approval.approver?.name || 'Unknown'}`);
      console.log(`  Approval Status: ${approval.approval_status}`);
      console.log(`  Production Started: ${approval.production_started ? 'Yes' : 'No'}`);
      
      const nullFields = [];
      if (!approval.product_id) nullFields.push('product_id');
      if (!approval.product_name) nullFields.push('product_name');
      
      if (nullFields.length > 0) {
        console.log(`  ⚠️  NULL FIELDS: ${nullFields.join(', ')}`);
      } else {
        console.log(`  ✅ All key fields populated`);
      }
      console.log('');
    });

    // Summary
    console.log('\n' + '='.repeat(100));
    console.log('📊 SUMMARY');
    console.log('='.repeat(100));
    
    const mrnNulls = mrns.filter(m => !m.product_name || !m.product_id).length;
    const dispatchNulls = dispatches.filter(d => !d.product_name || !d.product_id).length;
    const receiptNulls = receipts.filter(r => !r.product_name || !r.product_id).length;
    const verificationNulls = verifications.filter(v => !v.product_name || !v.product_id).length;
    const approvalNulls = approvals.filter(a => !a.product_name || !a.product_id).length;
    
    const totalNulls = mrnNulls + dispatchNulls + receiptNulls + verificationNulls + approvalNulls;
    
    console.log(`\nRecords with NULL fields:`);
    console.log(`  MRNs: ${mrnNulls}/${mrns.length}`);
    console.log(`  Dispatches: ${dispatchNulls}/${dispatches.length}`);
    console.log(`  Receipts: ${receiptNulls}/${receipts.length}`);
    console.log(`  Verifications: ${verificationNulls}/${verifications.length}`);
    console.log(`  Approvals: ${approvalNulls}/${approvals.length}`);
    console.log(`\nTotal NULL records: ${totalNulls}`);
    
    if (totalNulls === 0) {
      console.log('\n✅ All material flow records have complete data!');
    } else {
      console.log(`\n⚠️  ${totalNulls} records still have NULL fields. Run fix-all-material-flow-nulls.js to fix them.`);
    }
    
    console.log('='.repeat(100));

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

verifyMaterialFlowData();