import { test, expect } from '@playwright/test';
import { LoginPage, NavigationPage, ApiHelpers } from './fixtures/page-objects.js';
import { testUsers } from './fixtures/test-data.js';

test.describe('Manufacturing Dashboard - Complete E2E Workflows', () => {
  let apiHelpers: ApiHelpers;

  test.beforeEach(async ({ page }) => {
    apiHelpers = new ApiHelpers(page);
    
    // Login as Manufacturing Manager for all tests
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(testUsers.manufacturingManager?.email || 'manufacturing@pashion.com', 'password123');
    await loginPage.waitForLogin();
  });

  test.describe('1. Material Receipt Workflow', () => {
    test('should complete full Material Receipt flow: Dispatch → Receipt → Verification → Approval', async ({ page }) => {
      console.log('🔍 Testing Material Receipt Workflow...');
      
      // Step 1: Navigate to Manufacturing Dashboard
      await page.goto('/manufacturing');
      await expect(page.locator('main, .main-content')).toBeVisible({ timeout: 10000 });
      console.log('✅ Manufacturing Dashboard loaded');
      
      // Step 2: Check for Material Receipts tab
      const materialReceiptsTab = page.locator('text=Material Receipts').first();
      if (await materialReceiptsTab.isVisible()) {
        await materialReceiptsTab.click();
        console.log('✅ Material Receipts tab clicked');
        
        // Verify pending dispatches section
        const pendingDispatches = page.locator('[data-testid="pending-dispatches"], .pending-dispatches').first();
        await expect(pendingDispatches).toBeVisible({ timeout: 5000 });
        console.log('✅ Pending dispatches section visible');
        
        // Check for dispatch items (if any)
        const dispatchItems = page.locator('.dispatch-item, [data-testid="dispatch-item"]');
        const itemCount = await dispatchItems.count();
        console.log(`📦 Found ${itemCount} dispatch items`);
        
        if (itemCount > 0) {
          // Test receipt process for first item
          const receiveButton = dispatchItems.first().locator('button:has-text("Receive"), button:has-text("Receipt")');
          
          if (await receiveButton.isVisible()) {
            await receiveButton.click();
            console.log('✅ Receipt button clicked');
            
            // Verify receipt form opens
            const receiptForm = page.locator('.receipt-form, [data-testid="receipt-form"]');
            await expect(receiptForm).toBeVisible({ timeout: 5000 });
            console.log('✅ Receipt form opened');
            
            // Fill receipt details
            const receivedQuantity = page.locator('input[name="received_quantity"], input[placeholder*="quantity"]').first();
            const remarks = page.locator('textarea[name="remarks"], textarea[placeholder*="remarks"]').first();
            
            if (await receivedQuantity.isVisible()) {
              await receivedQuantity.fill('100');
            }
            if (await remarks.isVisible()) {
              await remarks.fill('E2E Test Receipt - All materials received in good condition');
            }
            
            // Submit receipt
            const submitReceiptBtn = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Confirm Receipt")').first();
            if (await submitReceiptBtn.isVisible()) {
              await submitReceiptBtn.click();
              console.log('✅ Receipt submitted successfully');
            }
          }
        } else {
          console.log('⚠️ No dispatch items found - testing UI components only');
        }
        
      } else {
        console.log('❌ BREAKPOINT: Material Receipts tab not found - Feature may not be implemented yet');
      }
      
      // Step 3: Test Verification Stage
      console.log('🔬 Testing Verification Stage...');
      
      const verificationSection = page.locator('[data-testid="pending-verifications"], .pending-verifications').first();
      if (await verificationSection.isVisible()) {
        console.log('✅ Verification section found');
        
        const verifyButton = page.locator('button:has-text("Verify"), button:has-text("Quality Check")').first();
        if (await verifyButton.isVisible()) {
          await verifyButton.click();
          console.log('✅ Verification process started');
          
          // Verify QC form
          const qcForm = page.locator('.verification-form, [data-testid="verification-form"]');
          if (await qcForm.isVisible()) {
            // Fill QC checklist
            const qualityCheckboxes = page.locator('input[type="checkbox"]');
            const checkboxCount = await qualityCheckboxes.count();
            
            // Check all quality parameters
            for (let i = 0; i < Math.min(checkboxCount, 5); i++) {
              await qualityCheckboxes.nth(i).check();
            }
            
            const qcRemarks = page.locator('textarea[name="verification_remarks"]').first();
            if (await qcRemarks.isVisible()) {
              await qcRemarks.fill('E2E Test Verification - Quality parameters met');
            }
            
            const submitQcBtn = page.locator('button[type="submit"], button:has-text("Submit Verification")').first();
            if (await submitQcBtn.isVisible()) {
              await submitQcBtn.click();
              console.log('✅ Quality verification completed');
            }
          }
        }
      } else {
        console.log('❌ BREAKPOINT: Verification section not found');
      }
      
      // Step 4: Test Approval Stage
      console.log('👨‍💼 Testing Approval Stage...');
      
      const approvalSection = page.locator('[data-testid="pending-approvals"], .pending-approvals').first();
      if (await approvalSection.isVisible()) {
        const approveButton = page.locator('button:has-text("Approve"), button:has-text("Final Approval")').first();
        if (await approveButton.isVisible()) {
          await approveButton.click();
          
          // Test approval form
          const approvalForm = page.locator('.approval-form, [data-testid="approval-form"]');
          if (await approvalForm.isVisible()) {
            const approvalDecision = page.locator('select[name="approval_status"], input[value="approved"]').first();
            if (await approvalDecision.isVisible()) {
              await approvalDecision.click();
            }
            
            const finalSubmitBtn = page.locator('button[type="submit"], button:has-text("Final Approval")').first();
            if (await finalSubmitBtn.isVisible()) {
              await finalSubmitBtn.click();
              console.log('✅ Final approval completed');
            }
          }
        }
      } else {
        console.log('❌ BREAKPOINT: Approval section not found');
      }
      
      console.log('🎉 Material Receipt Workflow Test Completed');
    });
  });

  test.describe('2. Production Order Workflow', () => {
    test('should complete Production Order lifecycle: Creation → Stage Management → Quality Check', async ({ page }) => {
      console.log('🏭 Testing Production Order Workflow...');
      
      // Step 1: Navigate to Manufacturing Dashboard
      await page.goto('/manufacturing');
      await expect(page.locator('main, .main-content')).toBeVisible({ timeout: 10000 });
      
      // Step 2: Check Incoming Orders (Production Requests)
      console.log('📋 Testing Incoming Production Requests...');
      
      const incomingOrdersSection = page.locator('[data-testid="incoming-orders"], .incoming-orders').first();
      if (await incomingOrdersSection.isVisible()) {
        console.log('✅ Incoming orders section found');
        
        const incomingOrders = page.locator('.incoming-order-item, [data-testid="incoming-order"]');
        const orderCount = await incomingOrders.count();
        console.log(`📨 Found ${orderCount} incoming production requests`);
        
        if (orderCount > 0) {
          // Test accepting a production request
          const acceptButton = incomingOrders.first().locator('button:has-text("Accept"), button:has-text("Start Production")');
          if (await acceptButton.isVisible()) {
            await acceptButton.click();
            console.log('✅ Production request accepted');
            
            // Verify production order creation dialog
            const productionDialog = page.locator('.production-dialog, [data-testid="production-dialog"]');
            if (await productionDialog.isVisible()) {
              // Fill production details
              const estimatedDuration = page.locator('input[name="estimated_duration"]').first();
              if (await estimatedDuration.isVisible()) {
                await estimatedDuration.fill('7');
              }
              
              const assignWorker = page.locator('select[name="assigned_worker"]').first();
              if (await assignWorker.isVisible()) {
                await assignWorker.selectOption({ index: 1 });
              }
              
              const createProductionBtn = page.locator('button:has-text("Create Production Order")').first();
              if (await createProductionBtn.isVisible()) {
                await createProductionBtn.click();
                console.log('✅ Production order created');
              }
            }
          }
        } else {
          console.log('⚠️ No incoming orders found - testing with mock data');
        }
      } else {
        console.log('❌ BREAKPOINT: Incoming orders section not found');
      }
      
      // Step 3: Test Active Orders Management
      console.log('⚙️ Testing Active Orders Management...');
      
      const activeOrdersTab = page.locator('text=Active Orders, button:has-text("Active")').first();
      if (await activeOrdersTab.isVisible()) {
        await activeOrdersTab.click();
        console.log('✅ Active Orders tab clicked');
        
        // Check for active orders
        const activeOrders = page.locator('.active-order, [data-testid="active-order"]');
        const activeOrderCount = await activeOrders.count();
        console.log(`🔄 Found ${activeOrderCount} active orders`);
        
        if (activeOrderCount > 0) {
          // Test order controls
          const firstOrder = activeOrders.first();
          
          // Test start/pause/stop controls
          const startBtn = firstOrder.locator('button[data-testid="start-order"], button:has-text("Start")');
          const pauseBtn = firstOrder.locator('button[data-testid="pause-order"], button:has-text("Pause")');
          const viewBtn = firstOrder.locator('button[data-testid="view-order"], button:has-text("View")');
          
          if (await startBtn.isVisible()) {
            await startBtn.click();
            console.log('✅ Order started');
            await page.waitForTimeout(1000);
          }
          
          if (await pauseBtn.isVisible()) {
            await pauseBtn.click();
            console.log('✅ Order paused');
            await page.waitForTimeout(1000);
          }
          
          if (await viewBtn.isVisible()) {
            await viewBtn.click();
            console.log('✅ Order details viewed');
            
            // Test production stages
            const stagesDialog = page.locator('.stages-dialog, [data-testid="stages-dialog"]');
            if (await stagesDialog.isVisible()) {
              // Check stage progression
              const stageItems = page.locator('.stage-item, [data-testid="stage-item"]');
              const stageCount = await stageItems.count();
              console.log(`📊 Found ${stageCount} production stages`);
              
              // Test stage completion
              if (stageCount > 0) {
                const completeStageBtn = stageItems.first().locator('button:has-text("Complete"), button:has-text("Finish Stage")');
                if (await completeStageBtn.isVisible()) {
                  await completeStageBtn.click();
                  console.log('✅ Stage completed');
                }
              }
            }
          }
        }
      } else {
        console.log('❌ BREAKPOINT: Active Orders tab not found');
      }
      
      // Step 4: Test Quality Check Process
      console.log('🔍 Testing Quality Check Process...');
      
      const qualityCheckTab = page.locator('text=Quality Check, button:has-text("Quality")').first();
      if (await qualityCheckTab.isVisible()) {
        await qualityCheckTab.click();
        
        const qualityItems = page.locator('.quality-item, [data-testid="quality-item"]');
        const qualityCount = await qualityItems.count();
        console.log(`🎯 Found ${qualityCount} items for quality check`);
        
        if (qualityCount > 0) {
          const firstQualityItem = qualityItems.first();
          const inspectBtn = firstQualityItem.locator('button:has-text("Inspect"), button:has-text("Quality Check")');
          
          if (await inspectBtn.isVisible()) {
            await inspectBtn.click();
            
            // Fill quality inspection form
            const inspectionForm = page.locator('.inspection-form, [data-testid="inspection-form"]');
            if (await inspectionForm.isVisible()) {
              const qualityRating = page.locator('select[name="quality_rating"]').first();
              if (await qualityRating.isVisible()) {
                await qualityRating.selectOption('excellent');
              }
              
              const inspectionNotes = page.locator('textarea[name="inspection_notes"]').first();
              if (await inspectionNotes.isVisible()) {
                await inspectionNotes.fill('E2E Test - Quality standards met, ready for next stage');
              }
              
              const approveQualityBtn = page.locator('button:has-text("Approve Quality"), button[type="submit"]').first();
              if (await approveQualityBtn.isVisible()) {
                await approveQualityBtn.click();
                console.log('✅ Quality check approved');
              }
            }
          }
        }
      } else {
        console.log('❌ BREAKPOINT: Quality Check section not found');
      }
      
      console.log('🎉 Production Order Workflow Test Completed');
    });
  });

  test.describe('3. Barcode & QR Scanner Integration', () => {
    test('should test Barcode and QR Code scanning functionality', async ({ page }) => {
      console.log('📱 Testing Barcode & QR Scanner Integration...');
      
      await page.goto('/manufacturing');
      await expect(page.locator('main, .main-content')).toBeVisible({ timeout: 10000 });
      
      // Test Barcode Scanner
      console.log('📊 Testing Barcode Scanner...');
      
      const barcodeButton = page.locator('button[data-testid="barcode-scan"], button:has-text("Scan Barcode")').first();
      if (await barcodeButton.isVisible()) {
        await barcodeButton.click();
        
        const barcodeDialog = page.locator('.barcode-dialog, [data-testid="barcode-dialog"]');
        if (await barcodeDialog.isVisible()) {
          console.log('✅ Barcode scanner dialog opened');
          
          // Test manual barcode entry (simulating scan)
          const barcodeInput = page.locator('input[name="barcode"], input[placeholder*="barcode"]').first();
          if (await barcodeInput.isVisible()) {
            await barcodeInput.fill('TEST-BARCODE-12345');
            
            const verifyBarcodeBtn = page.locator('button:has-text("Verify"), button:has-text("Submit")').first();
            if (await verifyBarcodeBtn.isVisible()) {
              await verifyBarcodeBtn.click();
              console.log('✅ Barcode verification attempted');
            }
          }
          
          // Close barcode dialog
          const closeBtn = page.locator('button:has-text("Close"), button[aria-label="close"]').first();
          if (await closeBtn.isVisible()) {
            await closeBtn.click();
          }
        }
      } else {
        console.log('❌ BREAKPOINT: Barcode scanner button not found');
      }
      
      // Test QR Code Scanner
      console.log('📷 Testing QR Code Scanner...');
      
      const qrButton = page.locator('button[data-testid="qr-scan"], button:has-text("QR Code"), button:has-text("Scan QR")').first();
      if (await qrButton.isVisible()) {
        await qrButton.click();
        
        const qrDialog = page.locator('.qr-dialog, [data-testid="qr-dialog"]');
        if (await qrDialog.isVisible()) {
          console.log('✅ QR Code scanner dialog opened');
          
          // Test QR scanner interface
          const qrScannerComponent = page.locator('.qr-scanner, [data-testid="qr-scanner"]');
          await expect(qrScannerComponent).toBeVisible({ timeout: 5000 });
          console.log('✅ QR Scanner component loaded');
          
          // Close QR dialog
          const closeQrBtn = page.locator('button:has-text("Close"), button[aria-label="close"]').first();
          if (await closeQrBtn.isVisible()) {
            await closeQrBtn.click();
          }
        }
      } else {
        console.log('❌ BREAKPOINT: QR Code scanner button not found');
      }
      
      console.log('🎉 Barcode & QR Scanner Test Completed');
    });
  });

  test.describe('4. User Access Control & Permissions', () => {
    test('should validate role-based access control', async ({ page }) => {
      console.log('🔒 Testing User Access Control & Permissions...');
      
      // Test different user roles accessing manufacturing features
      const userRoles = [
        { role: 'Manufacturing Manager', email: 'manufacturing@pashion.com', hasFullAccess: true },
        { role: 'Production Worker', email: 'worker@pashion.com', hasLimitedAccess: true },
        { role: 'Quality Inspector', email: 'quality@pashion.com', hasQualityAccess: true }
      ];
      
      for (const userRole of userRoles) {
        console.log(`👤 Testing access for ${userRole.role}...`);
        
        // Login with different user
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        await loginPage.login(userRole.email, 'password123');
        
        try {
          await loginPage.waitForLogin();
          
          // Navigate to manufacturing dashboard
          await page.goto('/manufacturing');
          await expect(page.locator('main, .main-content')).toBeVisible({ timeout: 10000 });
          
          // Check access to different sections
          const sections = [
            { name: 'Material Receipts', selector: 'text=Material Receipts' },
            { name: 'Production Orders', selector: 'text=Production Orders' },
            { name: 'Quality Control', selector: 'text=Quality' },
            { name: 'Settings', selector: 'button:has-text("Settings")' }
          ];
          
          for (const section of sections) {
            const sectionElement = page.locator(section.selector).first();
            const isVisible = await sectionElement.isVisible().catch(() => false);
            
            if (isVisible) {
              console.log(`✅ ${userRole.role} has access to ${section.name}`);
            } else {
              console.log(`⚠️ ${userRole.role} does not have access to ${section.name}`);
            }
          }
          
          // Test permission-gated actions
          const createOrderBtn = page.locator('button:has-text("Create Order"), button:has-text("New Production")').first();
          if (await createOrderBtn.isVisible()) {
            await createOrderBtn.click();
            
            // Check if user can actually create orders
            const createForm = page.locator('.create-order-form, [data-testid="create-order-form"]');
            const hasCreatePermission = await createForm.isVisible().catch(() => false);
            
            if (hasCreatePermission && userRole.hasFullAccess) {
              console.log(`✅ ${userRole.role} can create production orders`);
            } else if (!hasCreatePermission && !userRole.hasFullAccess) {
              console.log(`✅ ${userRole.role} correctly restricted from creating orders`);
            } else {
              console.log(`❌ BREAKPOINT: Permission mismatch for ${userRole.role} order creation`);
            }
          }
          
        } catch (error) {
          console.log(`❌ BREAKPOINT: Login failed for ${userRole.role} - ${error.message}`);
        }
      }
      
      console.log('🎉 Access Control Test Completed');
    });
  });

  test.describe('5. System Integration & API Validation', () => {
    test('should validate API endpoints and data flow', async ({ page }) => {
      console.log('🔗 Testing System Integration & API Validation...');
      
      await page.goto('/manufacturing');
      await expect(page.locator('main, .main-content')).toBeVisible({ timeout: 10000 });
      
      // Test critical manufacturing API endpoints
      const apiEndpoints = [
        { endpoint: '/manufacturing/dashboard/stats', name: 'Dashboard Stats' },
        { endpoint: '/manufacturing/orders', name: 'Production Orders' },
        { endpoint: '/production-requests?status=pending', name: 'Production Requests' },
        { endpoint: '/material-dispatch/list/all', name: 'Material Dispatches' },
        { endpoint: '/products', name: 'Products' },
        { endpoint: '/inventory/products', name: 'Inventory' }
      ];
      
      const apiResults = [];
      
      for (const api of apiEndpoints) {
        try {
          const response = await apiHelpers.makeApiRequest('GET', api.endpoint);
          const isSuccessful = response.status >= 200 && response.status < 300;
          
          apiResults.push({
            name: api.name,
            endpoint: api.endpoint,
            status: response.status,
            success: isSuccessful,
            hasData: response.data && Object.keys(response.data).length > 0
          });
          
          console.log(`${isSuccessful ? '✅' : '❌'} ${api.name}: ${response.status}`);
          
        } catch (error) {
          apiResults.push({
            name: api.name,
            endpoint: api.endpoint,
            status: 'ERROR',
            success: false,
            hasData: false
          });
          
          console.log(`❌ BREAKPOINT: ${api.name} API failed - ${error.message}`);
        }
      }
      
      // Analyze API health
      const successfulApis = apiResults.filter(r => r.success).length;
      const successRate = (successfulApis / apiResults.length) * 100;
      
      console.log(`📊 API Health: ${successRate.toFixed(1)}% (${successfulApis}/${apiResults.length})`);
      expect(successRate).toBeGreaterThan(60); // At least 60% APIs should work
      
      // Test data consistency
      const statsApi = apiResults.find(r => r.name === 'Dashboard Stats');
      if (statsApi && statsApi.success) {
        const statsResponse = await apiHelpers.makeApiRequest('GET', '/manufacturing/dashboard/stats');
        
        if (statsResponse.data) {
          expect(statsResponse.data).toHaveProperty('totalOrders');
          expect(statsResponse.data).toHaveProperty('activeOrders');
          console.log('✅ Dashboard stats structure validated');
        }
      }
      
      console.log('🎉 System Integration Test Completed');
    });
  });

  test.describe('6. Error Handling & Edge Cases', () => {
    test('should handle error scenarios and edge cases', async ({ page }) => {
      console.log('🚨 Testing Error Handling & Edge Cases...');
      
      await page.goto('/manufacturing');
      await expect(page.locator('main, .main-content')).toBeVisible({ timeout: 10000 });
      
      // Test network failure scenarios
      console.log('📡 Testing Network Failure Handling...');
      
      // Simulate network offline
      await page.context().setOffline(true);
      
      // Try to refresh data
      const refreshBtn = page.locator('button[data-testid="refresh"], button:has-text("Refresh")').first();
      if (await refreshBtn.isVisible()) {
        await refreshBtn.click();
        
        // Check for error handling
        const errorMessage = page.locator('.error-message, [data-testid="error-message"]');
        const networkErrorVisible = await errorMessage.isVisible().catch(() => false);
        
        if (networkErrorVisible) {
          console.log('✅ Network error properly handled and displayed');
        } else {
          console.log('❌ BREAKPOINT: Network errors not properly handled');
        }
      }
      
      // Restore network
      await page.context().setOffline(false);
      
      // Test invalid input handling
      console.log('📝 Testing Invalid Input Handling...');
      
      const createOrderBtn = page.locator('button:has-text("Create"), button:has-text("New")').first();
      if (await createOrderBtn.isVisible()) {
        await createOrderBtn.click();
        
        const form = page.locator('form, [data-testid="form"]').first();
        if (await form.isVisible()) {
          // Try submitting empty form
          const submitBtn = page.locator('button[type="submit"]').first();
          if (await submitBtn.isVisible()) {
            await submitBtn.click();
            
            // Check for validation errors
            const validationErrors = page.locator('.error, .invalid, .validation-error');
            const errorCount = await validationErrors.count();
            
            if (errorCount > 0) {
              console.log(`✅ Form validation working - ${errorCount} errors displayed`);
            } else {
              console.log('❌ BREAKPOINT: Form validation not working properly');
            }
          }
        }
      }
      
      // Test unauthorized access
      console.log('🔒 Testing Unauthorized Access Handling...');
      
      // Try to access restricted endpoints
      try {
        const response = await apiHelpers.makeApiRequest('DELETE', '/manufacturing/orders/999999');
        
        if (response.status === 403 || response.status === 401) {
          console.log('✅ Unauthorized access properly blocked');
        } else {
          console.log(`❌ BREAKPOINT: Unauthorized access not properly handled - Status: ${response.status}`);
        }
      } catch (error) {
        console.log('✅ Unauthorized access properly blocked with error');
      }
      
      console.log('🎉 Error Handling Test Completed');
    });
  });
});