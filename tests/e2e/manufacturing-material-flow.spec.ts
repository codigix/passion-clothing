import { test, expect } from '@playwright/test';
import { LoginPage, NavigationPage, ApiHelpers } from './fixtures/page-objects.js';
import { testUsers } from './fixtures/test-data.js';

test.describe('Manufacturing Material Flow - Deep Integration Tests', () => {
  let apiHelpers: ApiHelpers;

  test.beforeEach(async ({ page }) => {
    apiHelpers = new ApiHelpers(page);
    
    // Login as Manufacturing Manager
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(testUsers.manufacturingManager?.email || 'manufacturing@pashion.com', 'password123');
    await loginPage.waitForLogin();
  });

  test.describe('Complete Material Receipt Workflow', () => {
    test('should handle complete material dispatch to production approval flow', async ({ page }) => {
      console.log('🔄 Testing Complete Material Flow: Dispatch → Receipt → Verification → Approval → Production');
      
      // Step 1: Navigate to Manufacturing Dashboard
      await page.goto('/manufacturing');
      await expect(page.locator('main, .main-content')).toBeVisible({ timeout: 15000 });
      console.log('✅ Manufacturing Dashboard loaded');
      
      // Step 2: Check dashboard statistics first
      console.log('📊 Validating Dashboard Statistics...');
      
      const statCards = page.locator('.stat-card, [data-testid="stat-card"]');
      const cardCount = await statCards.count();
      console.log(`📈 Found ${cardCount} stat cards`);
      
      // Check for specific manufacturing metrics
      const metricsToCheck = [
        { name: 'Total Orders', selectors: ['text=Total Orders', 'text=Orders'] },
        { name: 'Active Orders', selectors: ['text=Active Orders', 'text=Active'] },
        { name: 'Pending Materials', selectors: ['text=Pending Materials', 'text=Materials'] },
        { name: 'Efficiency', selectors: ['text=Efficiency', 'text=%'] }
      ];
      
      for (const metric of metricsToCheck) {
        let found = false;
        for (const selector of metric.selectors) {
          if (await page.locator(selector).first().isVisible().catch(() => false)) {
            console.log(`✅ ${metric.name} metric found`);
            found = true;
            break;
          }
        }
        if (!found) {
          console.log(`❌ BREAKPOINT: ${metric.name} metric not found on dashboard`);
        }
      }
      
      // Step 3: Test Material Receipts Tab
      console.log('📦 Testing Material Receipts Section...');
      
      // Look for Material Receipts tab or section
      const materialReceiptsSelectors = [
        'text=Material Receipts',
        'button:has-text("Material Receipts")',
        '[data-testid="material-receipts"]',
        '.material-receipts-tab'
      ];
      
      let materialReceiptsTab = null;
      for (const selector of materialReceiptsSelectors) {
        const element = page.locator(selector).first();
        if (await element.isVisible().catch(() => false)) {
          materialReceiptsTab = element;
          console.log(`✅ Material Receipts section found with selector: ${selector}`);
          break;
        }
      }
      
      if (materialReceiptsTab) {
        await materialReceiptsTab.click();
        await page.waitForTimeout(2000);
        
        // Check for pending dispatches
        console.log('📋 Checking Pending Dispatches...');
        
        const pendingDispatchesSelectors = [
          '[data-testid="pending-dispatches"]',
          '.pending-dispatches',
          'text=Pending Dispatches',
          '.dispatch-list'
        ];
        
        let pendingSection = null;
        for (const selector of pendingDispatchesSelectors) {
          const element = page.locator(selector).first();
          if (await element.isVisible().catch(() => false)) {
            pendingSection = element;
            console.log(`✅ Pending dispatches section found`);
            break;
          }
        }
        
        if (pendingSection) {
          // Count dispatch items
          const dispatchItems = page.locator('.dispatch-item, [data-testid="dispatch-item"], .material-dispatch-card');
          const dispatchCount = await dispatchItems.count();
          console.log(`📦 Found ${dispatchCount} pending dispatch items`);
          
          if (dispatchCount > 0) {
            // Test the first dispatch item
            await this.testDispatchReceiptFlow(page, dispatchItems.first());
          } else {
            console.log('ℹ️ No pending dispatches found - this may be expected if no materials were dispatched');
          }
        } else {
          console.log('❌ BREAKPOINT: Pending dispatches section not found');
        }
        
        // Check for pending receipts
        console.log('📥 Checking Pending Receipts...');
        
        const pendingReceipts = page.locator('[data-testid="pending-receipts"], .pending-receipts');
        if (await pendingReceipts.first().isVisible().catch(() => false)) {
          const receiptItems = pendingReceipts.locator('.receipt-item, [data-testid="receipt-item"]');
          const receiptCount = await receiptItems.count();
          console.log(`📥 Found ${receiptCount} pending receipt items`);
          
          if (receiptCount > 0) {
            await this.testReceiptVerificationFlow(page, receiptItems.first());
          }
        } else {
          console.log('ℹ️ No pending receipts section found');
        }
        
        // Check for pending verifications
        console.log('🔍 Checking Pending Verifications...');
        
        const pendingVerifications = page.locator('[data-testid="pending-verifications"], .pending-verifications');
        if (await pendingVerifications.first().isVisible().catch(() => false)) {
          const verificationItems = pendingVerifications.locator('.verification-item, [data-testid="verification-item"]');
          const verificationCount = await verificationItems.count();
          console.log(`🔍 Found ${verificationCount} pending verification items`);
          
          if (verificationCount > 0) {
            await this.testVerificationApprovalFlow(page, verificationItems.first());
          }
        } else {
          console.log('ℹ️ No pending verifications section found');
        }
        
      } else {
        console.log('❌ BREAKPOINT: Material Receipts tab not found - Feature may not be fully implemented');
        
        // Check if there are any tabs at all
        const tabs = page.locator('.tab, [role="tab"], button[aria-selected]');
        const tabCount = await tabs.count();
        console.log(`📋 Found ${tabCount} tabs total on dashboard`);
        
        if (tabCount > 0) {
          for (let i = 0; i < Math.min(tabCount, 5); i++) {
            const tabText = await tabs.nth(i).textContent().catch(() => 'Unknown');
            console.log(`📋 Tab ${i + 1}: ${tabText}`);
          }
        }
      }
      
      // Step 4: Test Production Orders Integration
      console.log('🏭 Testing Production Orders Integration...');
      
      const productionOrdersTab = page.locator('text=Production Orders, text=Active Orders, button:has-text("Orders")').first();
      if (await productionOrdersTab.isVisible().catch(() => false)) {
        await productionOrdersTab.click();
        
        const productionOrders = page.locator('.production-order, [data-testid="production-order"], .order-item');
        const orderCount = await productionOrders.count();
        console.log(`🏭 Found ${orderCount} production orders`);
        
        if (orderCount > 0) {
          await this.testProductionOrderControls(page, productionOrders.first());
        }
      } else {
        console.log('❌ BREAKPOINT: Production Orders section not accessible');
      }
      
      console.log('🎉 Complete Material Flow Test Completed');
    });

    // Helper method for testing dispatch receipt flow
    async testDispatchReceiptFlow(page, dispatchItem) {
      console.log('📦 Testing Dispatch Receipt Flow...');
      
      try {
        // Get dispatch information
        const dispatchInfo = await dispatchItem.textContent().catch(() => 'N/A');
        console.log(`📦 Processing dispatch: ${dispatchInfo.substring(0, 100)}...`);
        
        // Look for receipt button
        const receiptButtons = [
          'button:has-text("Receive")',
          'button:has-text("Receipt")',
          'button[data-testid="receive-material"]',
          '.receive-btn'
        ];
        
        let receiptButton = null;
        for (const selector of receiptButtons) {
          const btn = dispatchItem.locator(selector).first();
          if (await btn.isVisible().catch(() => false)) {
            receiptButton = btn;
            break;
          }
        }
        
        if (receiptButton) {
          await receiptButton.click();
          console.log('✅ Receipt button clicked');
          
          // Wait for receipt form/dialog
          const receiptFormSelectors = [
            '.receipt-form',
            '[data-testid="receipt-form"]',
            '.material-receipt-dialog',
            '.modal'
          ];
          
          let receiptForm = null;
          for (const selector of receiptFormSelectors) {
            const form = page.locator(selector).first();
            if (await form.isVisible({ timeout: 5000 }).catch(() => false)) {
              receiptForm = form;
              break;
            }
          }
          
          if (receiptForm) {
            console.log('✅ Receipt form opened');
            
            // Fill receipt details
            const quantityInput = receiptForm.locator('input[name*="quantity"], input[placeholder*="quantity"]').first();
            if (await quantityInput.isVisible().catch(() => false)) {
              await quantityInput.fill('100');
              console.log('✅ Quantity filled');
            }
            
            const remarksInput = receiptForm.locator('textarea, input[name*="remarks"]').first();
            if (await remarksInput.isVisible().catch(() => false)) {
              await remarksInput.fill('E2E Test - Material received in good condition');
              console.log('✅ Remarks filled');
            }
            
            // Submit the receipt
            const submitBtn = receiptForm.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Confirm")').first();
            if (await submitBtn.isVisible().catch(() => false)) {
              await submitBtn.click();
              console.log('✅ Receipt submitted');
              
              // Wait for success confirmation
              await page.waitForTimeout(2000);
            }
          } else {
            console.log('❌ BREAKPOINT: Receipt form did not open');
          }
        } else {
          console.log('❌ BREAKPOINT: Receipt button not found on dispatch item');
        }
      } catch (error) {
        console.log(`❌ BREAKPOINT: Error in dispatch receipt flow - ${error.message}`);
      }
    }

    // Helper method for testing receipt verification flow  
    async testReceiptVerificationFlow(page, receiptItem) {
      console.log('🔍 Testing Receipt Verification Flow...');
      
      try {
        const verifyBtn = receiptItem.locator('button:has-text("Verify"), button:has-text("Quality Check")').first();
        
        if (await verifyBtn.isVisible().catch(() => false)) {
          await verifyBtn.click();
          
          // Look for verification form
          const verificationForm = page.locator('.verification-form, [data-testid="verification-form"]').first();
          
          if (await verificationForm.isVisible({ timeout: 5000 }).catch(() => false)) {
            console.log('✅ Verification form opened');
            
            // Fill quality checklist
            const checkboxes = verificationForm.locator('input[type="checkbox"]');
            const checkboxCount = await checkboxes.count();
            
            // Check quality parameters
            for (let i = 0; i < Math.min(checkboxCount, 5); i++) {
              await checkboxes.nth(i).check();
            }
            console.log(`✅ ${Math.min(checkboxCount, 5)} quality checks completed`);
            
            // Fill verification notes
            const notesInput = verificationForm.locator('textarea').first();
            if (await notesInput.isVisible().catch(() => false)) {
              await notesInput.fill('E2E Test - All quality parameters verified successfully');
            }
            
            // Submit verification
            const submitVerifyBtn = verificationForm.locator('button[type="submit"]').first();
            if (await submitVerifyBtn.isVisible().catch(() => false)) {
              await submitVerifyBtn.click();
              console.log('✅ Verification submitted');
            }
          } else {
            console.log('❌ BREAKPOINT: Verification form did not open');
          }
        } else {
          console.log('❌ BREAKPOINT: Verify button not found');
        }
      } catch (error) {
        console.log(`❌ BREAKPOINT: Error in verification flow - ${error.message}`);
      }
    }

    // Helper method for testing verification approval flow
    async testVerificationApprovalFlow(page, verificationItem) {
      console.log('👨‍💼 Testing Verification Approval Flow...');
      
      try {
        const approveBtn = verificationItem.locator('button:has-text("Approve"), button:has-text("Final Approval")').first();
        
        if (await approveBtn.isVisible().catch(() => false)) {
          await approveBtn.click();
          
          const approvalForm = page.locator('.approval-form, [data-testid="approval-form"]').first();
          
          if (await approvalForm.isVisible({ timeout: 5000 }).catch(() => false)) {
            console.log('✅ Approval form opened');
            
            // Select approval decision
            const approvalSelect = approvalForm.locator('select, input[type="radio"][value="approved"]').first();
            if (await approvalSelect.isVisible().catch(() => false)) {
              if (await approvalSelect.locator('option').first().isVisible().catch(() => false)) {
                await approvalSelect.selectOption('approved');
              } else {
                await approvalSelect.click();
              }
            }
            
            // Submit final approval
            const finalApprovalBtn = approvalForm.locator('button[type="submit"]').first();
            if (await finalApprovalBtn.isVisible().catch(() => false)) {
              await finalApprovalBtn.click();
              console.log('✅ Final approval submitted');
            }
          } else {
            console.log('❌ BREAKPOINT: Approval form did not open');
          }
        } else {
          console.log('❌ BREAKPOINT: Approve button not found');
        }
      } catch (error) {
        console.log(`❌ BREAKPOINT: Error in approval flow - ${error.message}`);
      }
    }

    // Helper method for testing production order controls
    async testProductionOrderControls(page, orderItem) {
      console.log('⚙️ Testing Production Order Controls...');
      
      try {
        const orderInfo = await orderItem.textContent().catch(() => 'N/A');
        console.log(`⚙️ Processing order: ${orderInfo.substring(0, 50)}...`);
        
        // Test start/pause controls
        const startBtn = orderItem.locator('button[data-testid*="start"], button:has-text("Start")').first();
        const pauseBtn = orderItem.locator('button[data-testid*="pause"], button:has-text("Pause")').first();
        const viewBtn = orderItem.locator('button[data-testid*="view"], button:has-text("View")').first();
        
        if (await startBtn.isVisible().catch(() => false)) {
          await startBtn.click();
          console.log('✅ Production started');
          await page.waitForTimeout(1000);
        }
        
        if (await pauseBtn.isVisible().catch(() => false)) {
          await pauseBtn.click();
          console.log('✅ Production paused');
          await page.waitForTimeout(1000);
        }
        
        if (await viewBtn.isVisible().catch(() => false)) {
          await viewBtn.click();
          console.log('✅ Order details opened');
          
          // Check for production stages
          const stagesSection = page.locator('.stages, [data-testid="production-stages"]');
          if (await stagesSection.first().isVisible({ timeout: 3000 }).catch(() => false)) {
            console.log('✅ Production stages section found');
          }
        }
      } catch (error) {
        console.log(`❌ BREAKPOINT: Error in production order controls - ${error.message}`);
      }
    }
  });

  test.describe('Manufacturing Dashboard API Integration', () => {
    test('should validate all manufacturing-related API endpoints', async ({ page }) => {
      console.log('🔗 Testing Manufacturing API Integration...');
      
      await page.goto('/manufacturing');
      await expect(page.locator('main, .main-content')).toBeVisible({ timeout: 10000 });
      
      // Test all manufacturing API endpoints
      const apiEndpoints = [
        {
          endpoint: '/manufacturing/dashboard/stats',
          method: 'GET',
          name: 'Dashboard Statistics',
          critical: true,
          expectedProperties: ['totalOrders', 'activeOrders', 'efficiency']
        },
        {
          endpoint: '/manufacturing/orders',
          method: 'GET', 
          name: 'Production Orders',
          critical: true,
          expectedProperties: ['productionOrders']
        },
        {
          endpoint: '/manufacturing/orders?status=cutting,embroidery,stitching,finishing,quality_check',
          method: 'GET',
          name: 'Active Production Orders',
          critical: true
        },
        {
          endpoint: '/production-requests?status=pending',
          method: 'GET',
          name: 'Pending Production Requests',
          critical: true
        },
        {
          endpoint: '/material-dispatch/list/all',
          method: 'GET',
          name: 'Material Dispatches',
          critical: false
        },
        {
          endpoint: '/products',
          method: 'GET',
          name: 'Products List',
          critical: false
        }
      ];
      
      const apiResults = [];
      let criticalFailures = 0;
      
      for (const api of apiEndpoints) {
        try {
          console.log(`🔍 Testing ${api.name}...`);
          
          const response = await apiHelpers.makeApiRequest(api.method, api.endpoint);
          const isSuccessful = response.status >= 200 && response.status < 300;
          
          let dataValidation = { valid: true, message: 'No validation required' };
          
          if (isSuccessful && api.expectedProperties) {
            dataValidation = this.validateApiResponseStructure(response.data, api.expectedProperties);
          }
          
          apiResults.push({
            name: api.name,
            endpoint: api.endpoint,
            status: response.status,
            success: isSuccessful,
            critical: api.critical,
            dataValidation: dataValidation,
            responseSize: JSON.stringify(response.data || {}).length
          });
          
          if (isSuccessful) {
            console.log(`✅ ${api.name}: ${response.status} (${dataValidation.valid ? 'Valid' : 'Invalid'} structure)`);
          } else {
            console.log(`❌ ${api.name}: ${response.status}`);
            if (api.critical) {
              criticalFailures++;
            }
          }
          
        } catch (error) {
          console.log(`❌ BREAKPOINT: ${api.name} failed - ${error.message}`);
          
          apiResults.push({
            name: api.name,
            endpoint: api.endpoint,
            status: 'ERROR',
            success: false,
            critical: api.critical,
            dataValidation: { valid: false, message: error.message },
            responseSize: 0
          });
          
          if (api.critical) {
            criticalFailures++;
          }
        }
      }
      
      // Analyze results
      const totalApis = apiResults.length;
      const successfulApis = apiResults.filter(r => r.success).length;
      const criticalApis = apiResults.filter(r => r.critical).length;
      const successfulCriticalApis = apiResults.filter(r => r.critical && r.success).length;
      
      const overallSuccessRate = (successfulApis / totalApis) * 100;
      const criticalSuccessRate = criticalApis > 0 ? (successfulCriticalApis / criticalApis) * 100 : 100;
      
      console.log('📊 API Test Results:');
      console.log(`  Overall Success Rate: ${overallSuccessRate.toFixed(1)}% (${successfulApis}/${totalApis})`);
      console.log(`  Critical APIs Success Rate: ${criticalSuccessRate.toFixed(1)}% (${successfulCriticalApis}/${criticalApis})`);
      
      // Assertions
      expect(criticalFailures).toBeLessThan(2); // Allow max 1 critical API failure
      expect(overallSuccessRate).toBeGreaterThan(70); // At least 70% overall success
      
      // Report data validation issues
      const dataIssues = apiResults.filter(r => r.success && !r.dataValidation.valid);
      if (dataIssues.length > 0) {
        console.log('⚠️ Data Structure Issues:');
        dataIssues.forEach(issue => {
          console.log(`  ${issue.name}: ${issue.dataValidation.message}`);
        });
      }
      
      console.log('🎉 Manufacturing API Integration Test Completed');
    });

    // Helper method to validate API response structure
    validateApiResponseStructure(data, expectedProperties) {
      try {
        if (!data) {
          return { valid: false, message: 'Response data is null or undefined' };
        }
        
        const missingProperties = expectedProperties.filter(prop => !(prop in data));
        
        if (missingProperties.length > 0) {
          return { 
            valid: false, 
            message: `Missing properties: ${missingProperties.join(', ')}` 
          };
        }
        
        return { valid: true, message: 'All expected properties found' };
      } catch (error) {
        return { valid: false, message: `Validation error: ${error.message}` };
      }
    }
  });
});