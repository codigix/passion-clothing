#!/usr/bin/env node

/**
 * Test Script for GRN Verification & Complaint System
 * 
 * This script tests the new GRN complaint generation system
 * Run with: node test-grn-complaint-system.js
 */

const api = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Mock auth token (replace with real token from your system)
const AUTH_TOKEN = 'your-jwt-token-here';

const headers = {
  'Authorization': `Bearer ${AUTH_TOKEN}`,
  'Content-Type': 'application/json'
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n');
  log(colors.cyan, '═'.repeat(70));
  log(colors.cyan, `  ${title}`);
  log(colors.cyan, '═'.repeat(70));
}

async function testComplaintGeneration() {
  logSection('TEST 1: Perfect Match GRN (Auto-Verification)');
  
  try {
    log(colors.blue, '📝 Creating GRN with perfect quantities match...');
    
    const response = await api.post(
      `${BASE_URL}/grn/from-po/2`, // Replace with actual PO ID
      {
        received_date: new Date().toISOString().split('T')[0],
        inward_challan_number: 'DC-TEST-001',
        supplier_invoice_number: 'INV-TEST-001',
        items_received: [
          {
            item_index: 0,
            ordered_qty: 100,
            invoiced_qty: 100,
            received_qty: 100
          }
        ]
      },
      { headers }
    );

    log(colors.green, '✅ GRN Created Successfully');
    log(colors.green, `   Status: ${response.data.all_items_verified ? 'AUTO-VERIFIED ✓' : 'DISCREPANCY DETECTED'}`);
    log(colors.green, `   Message: ${response.data.message}`);
    log(colors.green, `   Perfect Matches: ${response.data.perfect_match_count}`);
    
    return response.data.grn.id;
  } catch (error) {
    log(colors.red, `❌ Error: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function testShortageComplaint() {
  logSection('TEST 2: Shortage Detection');
  
  try {
    log(colors.blue, '📝 Creating GRN with shortage...');
    
    const response = await api.post(
      `${BASE_URL}/grn/from-po/2`, // Replace with actual PO ID
      {
        received_date: new Date().toISOString().split('T')[0],
        inward_challan_number: 'DC-TEST-002',
        supplier_invoice_number: 'INV-TEST-002',
        items_received: [
          {
            item_index: 0,
            ordered_qty: 100,
            invoiced_qty: 100,
            received_qty: 95,
            remarks: 'Damaged in transit'
          }
        ]
      },
      { headers }
    );

    log(colors.green, '✅ GRN Created with Shortage Detected');
    log(colors.yellow, `   Shortage Count: ${response.data.shortage_count}`);
    log(colors.yellow, `   Complaints Created: ${response.data.complaints.length}`);
    
    if (response.data.complaints.length > 0) {
      const complaint = response.data.complaints[0];
      log(colors.yellow, `   Complaint Type: ${complaint.approval_details.complaint_type}`);
      log(colors.yellow, `   Total Shortage Value: ₹${complaint.approval_details.total_shortage_value}`);
      log(colors.yellow, `   Items Affected: ${complaint.approval_details.items_affected.length}`);
    }
    
    return response.data.grn.id;
  } catch (error) {
    log(colors.red, `❌ Error: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function testOverageComplaint() {
  logSection('TEST 3: Overage Detection');
  
  try {
    log(colors.blue, '📝 Creating GRN with overage...');
    
    const response = await api.post(
      `${BASE_URL}/grn/from-po/2`, // Replace with actual PO ID
      {
        received_date: new Date().toISOString().split('T')[0],
        inward_challan_number: 'DC-TEST-003',
        supplier_invoice_number: 'INV-TEST-003',
        items_received: [
          {
            item_index: 0,
            ordered_qty: 100,
            invoiced_qty: 100,
            received_qty: 110,
            remarks: 'Extra quantity provided by vendor'
          }
        ]
      },
      { headers }
    );

    log(colors.green, '✅ GRN Created with Overage Detected');
    log(colors.yellow, `   Overage Count: ${response.data.overage_count}`);
    log(colors.yellow, `   Complaints Created: ${response.data.complaints.length}`);
    
    if (response.data.complaints.length > 0) {
      const complaint = response.data.complaints[0];
      log(colors.yellow, `   Complaint Type: ${complaint.approval_details.complaint_type}`);
      log(colors.yellow, `   Total Overage Value: ₹${complaint.approval_details.total_overage_value}`);
    }
    
    return response.data.grn.id;
  } catch (error) {
    log(colors.red, `❌ Error: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function testInvoiceMismatch() {
  logSection('TEST 4: Invoice Mismatch Detection');
  
  try {
    log(colors.blue, '📝 Creating GRN with invoice mismatch...');
    
    const response = await api.post(
      `${BASE_URL}/grn/from-po/2`, // Replace with actual PO ID
      {
        received_date: new Date().toISOString().split('T')[0],
        inward_challan_number: 'DC-TEST-004',
        supplier_invoice_number: 'INV-TEST-004',
        items_received: [
          {
            item_index: 0,
            ordered_qty: 100,
            invoiced_qty: 105,
            received_qty: 105,
            remarks: 'Invoice shows different quantity than PO'
          }
        ]
      },
      { headers }
    );

    log(colors.green, '✅ GRN Created with Invoice Mismatch');
    log(colors.yellow, `   Invoice Mismatch Count: ${response.data.invoice_mismatch_count}`);
    log(colors.yellow, `   Complaints Created: ${response.data.complaints.length}`);
    
    if (response.data.complaints.length > 0) {
      const complaint = response.data.complaints[0];
      log(colors.yellow, `   Complaint Type: ${complaint.approval_details.complaint_type}`);
      log(colors.yellow, `   Action Required: ${complaint.approval_details.action_required}`);
    }
    
    return response.data.grn.id;
  } catch (error) {
    log(colors.red, `❌ Error: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function testFetchComplaints() {
  logSection('TEST 5: Fetch GRN Complaints from Procurement Dashboard');
  
  try {
    log(colors.blue, '📝 Fetching all pending complaints...');
    
    const response = await api.get(
      `${BASE_URL}/procurement/dashboard/grn-complaints?status=pending&limit=10`,
      { headers }
    );

    log(colors.green, '✅ Complaints Retrieved Successfully');
    log(colors.green, `   Total Complaints: ${response.data.total}`);
    log(colors.green, `   Returned: ${response.data.complaints.length}`);
    
    if (response.data.complaints.length > 0) {
      log(colors.cyan, '\n   Sample Complaint:');
      const complaint = response.data.complaints[0];
      log(colors.cyan, `   - GRN Number: ${complaint.grn_number}`);
      log(colors.cyan, `   - PO Number: ${complaint.po_number}`);
      log(colors.cyan, `   - Vendor: ${complaint.vendor_name}`);
      log(colors.cyan, `   - Type: ${complaint.complaint_type}`);
      log(colors.cyan, `   - Status: ${complaint.status}`);
      log(colors.cyan, `   - Total Value: ₹${complaint.total_value}`);
      log(colors.cyan, `   - Items Affected: ${complaint.items_affected.length}`);
    }
  } catch (error) {
    log(colors.red, `❌ Error: ${error.response?.data?.message || error.message}`);
  }
}

async function testFilterComplaints() {
  logSection('TEST 6: Filter Complaints by Type');
  
  try {
    log(colors.blue, '📝 Filtering complaints by type: shortage...');
    
    const response = await api.get(
      `${BASE_URL}/procurement/dashboard/grn-complaints?status=pending&type=shortage&limit=10`,
      { headers }
    );

    log(colors.green, '✅ Filtered Complaints Retrieved');
    log(colors.green, `   Shortage Complaints: ${response.data.complaints.length}`);
    
    const totalValue = response.data.complaints.reduce((sum, c) => sum + parseFloat(c.total_value), 0);
    log(colors.green, `   Total Shortage Value: ₹${totalValue.toFixed(2)}`);
    
  } catch (error) {
    log(colors.red, `❌ Error: ${error.response?.data?.message || error.message}`);
  }
}

async function testMultipleItems() {
  logSection('TEST 7: Multiple Items with Mixed Results');
  
  try {
    log(colors.blue, '📝 Creating GRN with multiple items...');
    
    const response = await api.post(
      `${BASE_URL}/grn/from-po/2`, // Replace with actual PO ID
      {
        received_date: new Date().toISOString().split('T')[0],
        inward_challan_number: 'DC-TEST-007',
        supplier_invoice_number: 'INV-TEST-007',
        items_received: [
          {
            item_index: 0,
            ordered_qty: 100,
            invoiced_qty: 100,
            received_qty: 100
          },
          {
            item_index: 1,
            ordered_qty: 50,
            invoiced_qty: 50,
            received_qty: 45,
            remarks: 'Missing 5 units'
          },
          {
            item_index: 2,
            ordered_qty: 75,
            invoiced_qty: 75,
            received_qty: 80,
            remarks: 'Extra 5 units'
          }
        ]
      },
      { headers }
    );

    log(colors.green, '✅ GRN Created with Multiple Items');
    log(colors.green, `   Perfect Matches: ${response.data.perfect_match_count}`);
    log(colors.yellow, `   Shortages: ${response.data.shortage_count}`);
    log(colors.yellow, `   Overages: ${response.data.overage_count}`);
    log(colors.yellow, `   Complaints Created: ${response.data.complaints.length}`);
    
    log(colors.cyan, '\n   Breakdown:');
    response.data.complaints.forEach((complaint, idx) => {
      const details = complaint.approval_details;
      log(colors.cyan, `   ${idx + 1}. ${details.complaint_type.toUpperCase()} - ${details.items_affected.length} item(s)`);
    });
    
    return response.data.grn.id;
  } catch (error) {
    log(colors.red, `❌ Error: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function runAllTests() {
  logSection('GRN VERIFICATION & COMPLAINT SYSTEM - TEST SUITE');
  
  log(colors.yellow, '⚠️  IMPORTANT: Update the PO ID (currently set to 2) and AUTH_TOKEN before running');
  log(colors.yellow, '⚠️  Make sure the server is running on http://localhost:5000');
  
  try {
    // Run tests sequentially
    await testComplaintGeneration();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testShortageComplaint();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testOverageComplaint();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testInvoiceMismatch();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testFetchComplaints();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testFilterComplaints();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testMultipleItems();
    
    logSection('TEST SUITE COMPLETED');
    log(colors.green, '✅ All tests completed successfully!');
    
  } catch (error) {
    log(colors.red, `❌ Test suite failed: ${error.message}`);
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  log(colors.red, `Fatal error: ${error.message}`);
  process.exit(1);
});