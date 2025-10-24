/**
 * DIAGNOSTIC SCRIPT: Material Validation Issue
 * 
 * Use this to inspect the exact material data structure from the receipt
 * for project SO-SO-20251016-0001
 * 
 * Run in browser console (F12) while on ProductionWizardPage
 */

async function diagnoseMaterialValidation() {
  console.log('🔍 DIAGNOSTIC: Material Validation Issue');
  console.log('===============================================');
  
  const projectName = 'SO-SO-20251016-0001';
  console.log(`📋 Checking project: ${projectName}`);
  
  try {
    // Step 1: Get all approvals for this project
    console.log('\n📌 Step 1: Fetching approvals for project...');
    const approvalsResponse = await fetch(
      `http://localhost:5000/api/production-approvals?project_name=${projectName}&limit=100`,
      { 
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      }
    );
    
    if (!approvalsResponse.ok) {
      console.error('❌ Failed to fetch approvals:', approvalsResponse.status);
      return;
    }
    
    const approvalsData = await approvalsResponse.json();
    const approvals = approvalsData.data || [];
    console.log(`✅ Found ${approvals.length} approval(s)`);
    
    if (approvals.length === 0) {
      console.warn('⚠️ No approvals found for this project');
      return;
    }
    
    // Step 2: For each approval, check material receipts
    console.log('\n📌 Step 2: Checking material receipts...');
    
    for (let i = 0; i < approvals.length; i++) {
      const approval = approvals[i];
      console.log(`\n📦 Approval #${i + 1}:`);
      console.log(`   ID: ${approval.id}`);
      console.log(`   Status: ${approval.status}`);
      console.log(`   Sales Order: ${approval.sales_order_id}`);
      
      // Get material receipts for this approval
      const receiptsResponse = await fetch(
        `http://localhost:5000/api/material-receipts?approval_id=${approval.id}&limit=100`,
        { 
          method: 'GET',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        }
      );
      
      if (!receiptsResponse.ok) {
        console.warn(`   ⚠️ Could not fetch receipts (status ${receiptsResponse.status})`);
        continue;
      }
      
      const receiptsData = await receiptsResponse.json();
      const receipts = receiptsData.data || [];
      console.log(`   📫 Found ${receipts.length} receipt(s)`);
      
      for (let j = 0; j < receipts.length; j++) {
        const receipt = receipts[j];
        console.log(`\n   📬 Receipt #${j + 1}:`);
        console.log(`      ID: ${receipt.id}`);
        console.log(`      Status: ${receipt.status}`);
        console.log(`      Items: ${receipt.items?.length || 0}`);
        
        // Show full item structure
        if (receipt.items && receipt.items.length > 0) {
          console.log('      📋 Item Structure:');
          receipt.items.forEach((item, k) => {
            console.log(`\n      Item #${k + 1}:`);
            console.table({
              inventory_id: item.inventory_id,
              material_code: item.material_code,
              product_id: item.product_id,
              material_name: item.material_name,
              name: item.name,
              description: item.description,
              quantity_received: item.quantity_received,
              quantity: item.quantity,
              quantity_dispatched: item.quantity_dispatched,
              quantity_required: item.quantity_required,
              barcode_scanned: item.barcode_scanned,
              uom: item.uom,
              unit: item.unit,
              status: item.status,
              condition: item.condition,
            });
            
            // VALIDATION CHECK
            console.log('      ✅ VALIDATION CHECK:');
            const hasId = item.inventory_id || item.material_code || item.barcode_scanned;
            const hasDescription = item.material_name || item.name || item.description;
            const hasQuantity = item.quantity_received || item.quantity || item.quantity_dispatched;
            
            console.log(`         Has ID (inventory_id|material_code|barcode_scanned): ${hasId ? '✅ YES' : '❌ NO'}`);
            if (!hasId) {
              console.log(`            - inventory_id: ${item.inventory_id}`);
              console.log(`            - material_code: ${item.material_code}`);
              console.log(`            - barcode_scanned: ${item.barcode_scanned}`);
            }
            
            console.log(`         Has Description (material_name|name|description): ${hasDescription ? '✅ YES' : '❌ NO'}`);
            if (!hasDescription) {
              console.log(`            - material_name: ${item.material_name}`);
              console.log(`            - name: ${item.name}`);
              console.log(`            - description: ${item.description}`);
            }
            
            console.log(`         Has Quantity (quantity_received|quantity|quantity_dispatched): ${hasQuantity ? '✅ YES' : '❌ NO'}`);
            if (!hasQuantity) {
              console.log(`            - quantity_received: ${item.quantity_received}`);
              console.log(`            - quantity: ${item.quantity}`);
              console.log(`            - quantity_dispatched: ${item.quantity_dispatched}`);
            }
            
            if (hasId && hasDescription && hasQuantity) {
              console.log(`         🎯 RESULT: ✅ WOULD PASS FILTER`);
            } else {
              console.log(`         🎯 RESULT: ❌ WOULD BE FILTERED OUT`);
            }
          });
        }
      }
    }
    
    console.log('\n===============================================');
    console.log('📊 SUMMARY:');
    console.log('If items show ❌ WOULD BE FILTERED OUT, check which field is missing');
    console.log('Then update validation logic in ProductionWizardPage.jsx:936-947');
    
  } catch (error) {
    console.error('❌ Diagnostic error:', error);
  }
}

// Run it
diagnoseMaterialValidation();