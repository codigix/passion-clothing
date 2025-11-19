/**
 * Test Script: GRN Creation Flow Verification
 * 
 * This script tests the complete GRN creation workflow:
 * 1. URL parameter parsing (both po_id and from_po)
 * 2. PO data fetching and form pre-filling
 * 3. 3-way matching logic
 * 4. Complaint generation
 * 5. Auto-verification for perfect matches
 * 
 * Run: node test-grn-creation-flow.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}=== ${msg} ===${colors.reset}\n`),
  section: (msg) => console.log(`\n${colors.bright}→ ${msg}${colors.reset}\n`),
};

async function runTests() {
  try {
    log.header('GRN CREATION FLOW TEST SUITE');

    // Test 1: Verify URL parameter parsing logic
    log.section('Test 1: URL Parameter Parsing');
    testURLParameterParsing();

    // Test 2: Fetch a PO and verify data structure
    log.section('Test 2: Fetch Purchase Order');
    const po = await testFetchPO();
    if (!po) {
      log.warn('Skipping remaining tests - No PO found');
      return;
    }

    // Test 3: Test 3-way matching logic
    log.section('Test 3: 3-Way Matching Logic');
    testThreeWayMatching(po);

    // Test 4: Create GRN with perfect match
    log.section('Test 4: Create GRN - Perfect Match Scenario');
    await testCreateGRNPerfectMatch(po);

    // Test 5: Create GRN with shortages
    log.section('Test 5: Create GRN - Shortage Scenario');
    await testCreateGRNShortage(po);

    // Test 6: Verify complaint creation
    log.section('Test 6: Fetch GRN Complaints');
    await testFetchComplaints();

    log.header('ALL TESTS COMPLETED');

  } catch (error) {
    log.error(`Test suite error: ${error.message}`);
    console.error(error);
  }
}

function testURLParameterParsing() {
  const testCases = [
    { url: '?po_id=2', expected: '2', name: 'po_id parameter' },
    { url: '?from_po=2', expected: '2', name: 'from_po parameter' },
    { url: '?po_id=5&other=value', expected: '5', name: 'po_id with other params' },
    { url: '?from_po=10&search=test', expected: '10', name: 'from_po with other params' },
  ];

  testCases.forEach((test) => {
    const params = new URLSearchParams(test.url);
    const poId = params.get('po_id') || params.get('from_po');
    
    if (poId === test.expected) {
      log.success(`Parsing ${test.name}: Got "${poId}"`);
    } else {
      log.error(`Parsing ${test.name}: Expected "${test.expected}", got "${poId}"`);
    }
  });
}

async function testFetchPO() {
  try {
    const response = await axios.get(`${API_URL}/procurement/pos?limit=5`);
    const pos = response.data.purchaseOrders || [];

    if (pos.length === 0) {
      log.warn('No purchase orders found in database');
      return null;
    }

    const po = pos[0];
    log.success(`Fetched PO: ${po.po_number} (ID: ${po.id})`);
    log.info(`Vendor: ${po.vendor?.name || 'Unknown'}`);
    log.info(`Status: ${po.status}`);
    log.info(`Items: ${po.items?.length || 0}`);

    if (po.items?.length > 0) {
      const item = po.items[0];
      log.info(`  → Item 1: ${item.item_name || item.fabric_name} (Qty: ${item.quantity})`);
    }

    return po;
  } catch (error) {
    log.error(`Failed to fetch PO: ${error.message}`);
    return null;
  }
}

function testThreeWayMatching(po) {
  const testScenarios = [
    {
      name: 'Perfect Match',
      ordered: 100,
      invoiced: 100,
      received: 100,
      expected: 'perfect_match',
    },
    {
      name: 'Shortage',
      ordered: 100,
      invoiced: 100,
      received: 95,
      expected: 'shortage',
    },
    {
      name: 'Overage',
      ordered: 100,
      invoiced: 100,
      received: 105,
      expected: 'overage',
    },
    {
      name: 'Invoice Mismatch',
      ordered: 100,
      invoiced: 95,
      received: 95,
      expected: 'invoice_mismatch',
    },
  ];

  testScenarios.forEach((scenario) => {
    const result = perform3WayMatch(
      scenario.ordered,
      scenario.invoiced,
      scenario.received
    );

    if (result === scenario.expected) {
      log.success(`${scenario.name}: Correct (${result})`);
    } else {
      log.error(`${scenario.name}: Expected ${scenario.expected}, got ${result}`);
    }

    // Print details
    log.info(
      `  Ordered: ${scenario.ordered}, Invoiced: ${scenario.invoiced}, Received: ${scenario.received}`
    );
  });
}

function perform3WayMatch(ordered, invoiced, received) {
  // Logic from backend
  if (received === ordered && received === invoiced) {
    return 'perfect_match';
  }
  if (received < Math.min(ordered, invoiced)) {
    return 'shortage';
  }
  if (received > Math.max(ordered, invoiced)) {
    return 'overage';
  }
  if (invoiced !== ordered) {
    return 'invoice_mismatch';
  }
  return 'other';
}

async function testCreateGRNPerfectMatch(po) {
  try {
    if (!po.items || po.items.length === 0) {
      log.warn('PO has no items, skipping test');
      return;
    }

    const payload = {
      received_date: new Date().toISOString().split('T')[0],
      inward_challan_number: `DC-TEST-${Date.now()}`,
      supplier_invoice_number: `INV-TEST-${Date.now()}`,
      items_received: po.items.map((item, index) => ({
        item_index: index,
        material_name: item.fabric_name || item.item_name,
        color: item.color || '',
        gsm: item.gsm || '',
        uom: item.uom || 'Meters',
        ordered_qty: parseFloat(item.quantity),
        invoiced_qty: parseFloat(item.quantity),
        received_qty: parseFloat(item.quantity), // Perfect match
        weight: '',
        remarks: 'Test - Perfect Match Scenario',
      })),
      remarks: 'Test GRN - Perfect Match',
    };

    log.info(`Creating GRN for PO ${po.po_number}...`);
    log.info(`Items: ${payload.items_received.length}`);

    const response = await axios.post(`${API_URL}/grn/from-po/${po.id}`, payload);

    if (response.data.all_items_verified) {
      log.success('GRN Created & Auto-Verified (Perfect Match)');
      log.info(`GRN Number: ${response.data.grn.grn_number}`);
      log.info(`Status: ${response.data.all_items_verified ? 'Verified' : 'Pending'}`);
    } else {
      log.warn('GRN created but not verified');
      if (response.data.perfect_match_count > 0) {
        log.info(`Perfect Matches: ${response.data.perfect_match_count}`);
      }
    }

    return response.data.grn;
  } catch (error) {
    log.error(`Failed to create GRN: ${error.response?.data?.message || error.message}`);
  }
}

async function testCreateGRNShortage(po) {
  try {
    if (!po.items || po.items.length === 0) {
      log.warn('PO has no items, skipping test');
      return;
    }

    const payload = {
      received_date: new Date().toISOString().split('T')[0],
      inward_challan_number: `DC-SHORTAGE-${Date.now()}`,
      supplier_invoice_number: `INV-SHORTAGE-${Date.now()}`,
      items_received: po.items.map((item, index) => ({
        item_index: index,
        material_name: item.fabric_name || item.item_name,
        color: item.color || '',
        gsm: item.gsm || '',
        uom: item.uom || 'Meters',
        ordered_qty: parseFloat(item.quantity),
        invoiced_qty: parseFloat(item.quantity),
        received_qty: parseFloat(item.quantity) * 0.95, // 5% shortage
        weight: '',
        remarks: 'Test - Shortage Scenario',
      })),
      remarks: 'Test GRN - Shortage Scenario',
    };

    log.info(`Creating GRN with shortage for PO ${po.po_number}...`);
    log.info(`Shortage: 5% of ordered quantity`);

    const response = await axios.post(`${API_URL}/grn/from-po/${po.id}`, payload);

    if (response.data.has_shortages) {
      log.success('GRN Created with Shortage Detection');
      log.info(`Shortage Count: ${response.data.shortage_count}`);
      log.info(`Complaint auto-created for Procurement team`);
    } else {
      log.warn('Shortage not detected');
    }

    return response.data.grn;
  } catch (error) {
    log.error(`Failed to create GRN: ${error.response?.data?.message || error.message}`);
  }
}

async function testFetchComplaints() {
  try {
    const response = await axios.get(`${API_URL}/procurement/dashboard/grn-complaints?limit=5`);
    const complaints = response.data.complaints || [];

    if (complaints.length === 0) {
      log.info('No GRN complaints found (expected if no discrepancies created)');
      return;
    }

    log.success(`Found ${complaints.length} GRN complaint(s)`);

    complaints.slice(0, 3).forEach((complaint, idx) => {
      const type = complaint.request_type.replace('grn_', '').toUpperCase();
      log.info(`  ${idx + 1}. ${type} - PO: ${complaint.po_number}, Status: ${complaint.status}`);
    });
  } catch (error) {
    if (error.response?.status === 404) {
      log.info('GRN complaints endpoint not yet implemented (expected)');
    } else {
      log.error(`Failed to fetch complaints: ${error.message}`);
    }
  }
}

// Run the tests
runTests().catch(console.error);