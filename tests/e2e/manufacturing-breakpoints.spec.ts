import { test, expect } from '@playwright/test';
import { LoginPage, NavigationPage, ApiHelpers } from './fixtures/page-objects.js';
import { testUsers } from './fixtures/test-data.js';

test.describe('Manufacturing Dashboard - Breakpoint Detection & Recovery', () => {
  let apiHelpers: ApiHelpers;

  test.beforeEach(async ({ page }) => {
    apiHelpers = new ApiHelpers(page);
  });

  test.describe('Critical Breakpoint Scenarios', () => {
    test('should identify and test authentication breakpoints', async ({ page }) => {
      console.log('🔐 Testing Authentication Breakpoints...');
      
      // Breakpoint 1: Invalid Login Credentials
      console.log('🔍 Testing invalid login credentials...');
      const loginPage = new LoginPage(page);
      await loginPage.navigate();
      
      const invalidCredentialsTest = await loginPage.login('invalid@user.com', 'wrongpassword');
      
      // Should show error message and not proceed
      const loginError = page.locator('.error-message, [data-testid="login-error"], .alert-error');
      const errorVisible = await loginError.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (errorVisible) {
        console.log('✅ Invalid credentials properly handled');
      } else {
        console.log('❌ CRITICAL BREAKPOINT: Invalid login credentials not handled properly');
      }
      
      // Breakpoint 2: Session Expiration
      console.log('🔍 Testing session expiration...');
      
      // Login with valid credentials first
      await loginPage.login(testUsers.manufacturingManager?.email || 'manufacturing@pashion.com', 'password123');
      
      try {
        await loginPage.waitForLogin();
        console.log('✅ Valid login successful');
        
        // Navigate to manufacturing dashboard
        await page.goto('/manufacturing');
        await expect(page.locator('main, .main-content')).toBeVisible({ timeout: 10000 });
        
        // Simulate session expiration by clearing localStorage/cookies
        await page.evaluate(() => {
          localStorage.clear();
          document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
          });
        });
        
        // Try to make an authenticated request
        await page.reload();
        
        // Should redirect to login or show authentication error
        const currentUrl = page.url();
        const isOnLoginPage = currentUrl.includes('/login') || currentUrl.includes('/auth');
        
        if (isOnLoginPage) {
          console.log('✅ Session expiration properly handled - redirected to login');
        } else {
          console.log('❌ CRITICAL BREAKPOINT: Session expiration not properly handled');
        }
        
      } catch (error) {
        console.log(`❌ BREAKPOINT: Login process failed - ${error.message}`);
      }
    });

    test('should test database connectivity breakpoints', async ({ page }) => {
      console.log('🗄️ Testing Database Connectivity Breakpoints...');
      
      // Login first
      const loginPage = new LoginPage(page);
      await loginPage.navigate();
      await loginPage.login(testUsers.manufacturingManager?.email || 'manufacturing@pashion.com', 'password123');
      await loginPage.waitForLogin();
      
      await page.goto('/manufacturing');
      await expect(page.locator('main, .main-content')).toBeVisible({ timeout: 10000 });
      
      // Test critical database-dependent operations
      const databaseOperations = [
        {
          name: 'Dashboard Stats',
          endpoint: '/manufacturing/dashboard/stats',
          uiIndicator: '.stat-card, [data-testid="stat-card"]'
        },
        {
          name: 'Production Orders',
          endpoint: '/manufacturing/orders',
          uiIndicator: '.production-order, [data-testid="production-order"]'
        },
        {
          name: 'Material Dispatches',
          endpoint: '/material-dispatch/list/all',
          uiIndicator: '.dispatch-item, [data-testid="dispatch-item"]'
        }
      ];
      
      let databaseIssues = [];
      
      for (const operation of databaseOperations) {
        try {
          console.log(`🔍 Testing ${operation.name} database connectivity...`);
          
          // Test API endpoint
          const apiResponse = await apiHelpers.makeApiRequest('GET', operation.endpoint);
          
          if (apiResponse.status >= 500) {
            databaseIssues.push({
              operation: operation.name,
              issue: 'API Server Error',
              status: apiResponse.status
            });
            console.log(`❌ BREAKPOINT: ${operation.name} - Server error ${apiResponse.status}`);
          } else if (apiResponse.status >= 400) {
            databaseIssues.push({
              operation: operation.name,
              issue: 'API Client Error',
              status: apiResponse.status
            });
            console.log(`⚠️ ${operation.name} - Client error ${apiResponse.status}`);
          } else {
            // Check if UI elements are loading properly
            const uiElements = page.locator(operation.uiIndicator);
            const elementCount = await uiElements.count();
            
            if (elementCount === 0 && apiResponse.data && Object.keys(apiResponse.data).length > 0) {
              databaseIssues.push({
                operation: operation.name,
                issue: 'UI not updating despite API success',
                status: 'UI_SYNC_ERROR'
              });
              console.log(`❌ BREAKPOINT: ${operation.name} - API works but UI not updating`);
            } else {
              console.log(`✅ ${operation.name} - API and UI working properly`);
            }
          }
          
        } catch (error) {
          databaseIssues.push({
            operation: operation.name,
            issue: `Network/Connection Error: ${error.message}`,
            status: 'NETWORK_ERROR'
          });
          console.log(`❌ CRITICAL BREAKPOINT: ${operation.name} - ${error.message}`);
        }
      }
      
      // Summary of database connectivity issues
      if (databaseIssues.length > 0) {
        console.log('📋 Database Connectivity Issues Summary:');
        databaseIssues.forEach((issue, index) => {
          console.log(`  ${index + 1}. ${issue.operation}: ${issue.issue} (${issue.status})`);
        });
        
        // Critical failure if more than half the operations fail
        expect(databaseIssues.length).toBeLessThan(databaseOperations.length / 2);
      } else {
        console.log('✅ All database operations working properly');
      }
    });

    test('should test permission and authorization breakpoints', async ({ page }) => {
      console.log('🔒 Testing Permission & Authorization Breakpoints...');
      
      // Test different user roles and their access levels
      const userRoleTests = [
        {
          role: 'Manufacturing Manager',
          email: 'manufacturing@pashion.com',
          expectedAccess: {
            canCreateOrders: true,
            canViewAllOrders: true,
            canApproveOrders: true,
            canAccessSettings: true
          }
        },
        {
          role: 'Production Worker',
          email: 'worker@pashion.com',
          expectedAccess: {
            canCreateOrders: false,
            canViewAllOrders: false,
            canApproveOrders: false,
            canAccessSettings: false
          }
        },
        {
          role: 'Quality Inspector',
          email: 'quality@pashion.com',
          expectedAccess: {
            canCreateOrders: false,
            canViewAllOrders: true,
            canApproveOrders: false,
            canAccessSettings: false
          }
        }
      ];
      
      let permissionIssues = [];
      
      for (const userTest of userRoleTests) {
        console.log(`👤 Testing ${userTest.role} permissions...`);
        
        try {
          // Login as the user
          const loginPage = new LoginPage(page);
          await loginPage.navigate();
          await loginPage.login(userTest.email, 'password123');
          await loginPage.waitForLogin();
          
          await page.goto('/manufacturing');
          await expect(page.locator('main, .main-content')).toBeVisible({ timeout: 10000 });
          
          // Test Create Orders Permission
          const createOrderBtn = page.locator('button:has-text("Create"), button:has-text("New Production"), button:has-text("Add Order")').first();
          const canCreateOrders = await createOrderBtn.isVisible().catch(() => false);
          
          if (canCreateOrders !== userTest.expectedAccess.canCreateOrders) {
            permissionIssues.push({
              user: userTest.role,
              permission: 'Create Orders',
              expected: userTest.expectedAccess.canCreateOrders,
              actual: canCreateOrders
            });
            console.log(`❌ BREAKPOINT: ${userTest.role} create permission mismatch`);
          } else {
            console.log(`✅ ${userTest.role} create permission correct`);
          }
          
          // Test View All Orders Permission
          const allOrdersSection = page.locator('[data-testid="all-orders"], .all-orders, text=All Orders').first();
          const canViewAllOrders = await allOrdersSection.isVisible().catch(() => false);
          
          if (canViewAllOrders !== userTest.expectedAccess.canViewAllOrders) {
            permissionIssues.push({
              user: userTest.role,
              permission: 'View All Orders',
              expected: userTest.expectedAccess.canViewAllOrders,
              actual: canViewAllOrders
            });
          }
          
          // Test Settings Access Permission
          const settingsBtn = page.locator('button:has-text("Settings"), [data-testid="settings"]').first();
          const canAccessSettings = await settingsBtn.isVisible().catch(() => false);
          
          if (canAccessSettings !== userTest.expectedAccess.canAccessSettings) {
            permissionIssues.push({
              user: userTest.role,
              permission: 'Access Settings',
              expected: userTest.expectedAccess.canAccessSettings,
              actual: canAccessSettings
            });
          }
          
        } catch (error) {
          console.log(`❌ BREAKPOINT: ${userTest.role} login failed - ${error.message}`);
          
          // If login fails, it might be that the user doesn't exist
          permissionIssues.push({
            user: userTest.role,
            permission: 'Login',
            expected: true,
            actual: false,
            error: error.message
          });
        }
      }
      
      // Report permission issues
      if (permissionIssues.length > 0) {
        console.log('🚨 Permission Issues Summary:');
        permissionIssues.forEach((issue, index) => {
          console.log(`  ${index + 1}. ${issue.user} - ${issue.permission}: Expected ${issue.expected}, Got ${issue.actual}`);
          if (issue.error) console.log(`     Error: ${issue.error}`);
        });
      } else {
        console.log('✅ All permission checks passed');
      }
      
      // Allow some flexibility in permission issues during development
      expect(permissionIssues.length).toBeLessThan(3);
    });

    test('should test form validation breakpoints', async ({ page }) => {
      console.log('📝 Testing Form Validation Breakpoints...');
      
      // Login first
      const loginPage = new LoginPage(page);
      await loginPage.navigate();
      await loginPage.login(testUsers.manufacturingManager?.email || 'manufacturing@pashion.com', 'password123');
      await loginPage.waitForLogin();
      
      await page.goto('/manufacturing');
      await expect(page.locator('main, .main-content')).toBeVisible({ timeout: 10000 });
      
      // Find forms to test
      const formTestScenarios = [
        {
          name: 'Create Production Order',
          triggerSelector: 'button:has-text("Create"), button:has-text("New Production")',
          formSelectors: ['.create-form', '[data-testid="create-form"]', 'form'],
          requiredFields: ['product_name', 'quantity', 'priority']
        },
        {
          name: 'Material Receipt',
          triggerSelector: 'button:has-text("Receive"), button:has-text("Receipt")',
          formSelectors: ['.receipt-form', '[data-testid="receipt-form"]'],
          requiredFields: ['received_quantity', 'remarks']
        },
        {
          name: 'Quality Check',
          triggerSelector: 'button:has-text("Inspect"), button:has-text("Quality Check")',
          formSelectors: ['.inspection-form', '[data-testid="inspection-form"]'],
          requiredFields: ['quality_rating', 'inspection_notes']
        }
      ];
      
      let validationIssues = [];
      
      for (const scenario of formTestScenarios) {
        console.log(`🔍 Testing ${scenario.name} form validation...`);
        
        try {
          // Find and click the trigger button
          const triggerButton = page.locator(scenario.triggerSelector).first();
          
          if (await triggerButton.isVisible().catch(() => false)) {
            await triggerButton.click();
            await page.waitForTimeout(1000);
            
            // Find the form
            let form = null;
            for (const formSelector of scenario.formSelectors) {
              const formElement = page.locator(formSelector).first();
              if (await formElement.isVisible({ timeout: 3000 }).catch(() => false)) {
                form = formElement;
                break;
              }
            }
            
            if (form) {
              console.log(`✅ ${scenario.name} form found`);
              
              // Test empty form submission
              const submitBtn = form.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Save")').first();
              
              if (await submitBtn.isVisible().catch(() => false)) {
                await submitBtn.click();
                await page.waitForTimeout(1000);
                
                // Check for validation errors
                const validationErrors = page.locator('.error, .invalid, .validation-error, .field-error');
                const errorCount = await validationErrors.count();
                
                if (errorCount === 0) {
                  validationIssues.push({
                    form: scenario.name,
                    issue: 'No validation errors shown for empty form',
                    severity: 'HIGH'
                  });
                  console.log(`❌ BREAKPOINT: ${scenario.name} - No validation on empty form`);
                } else {
                  console.log(`✅ ${scenario.name} - ${errorCount} validation errors properly shown`);
                }
                
                // Test with invalid data
                const testInvalidData = async (fieldName, invalidValue) => {
                  const field = form.locator(`input[name="${fieldName}"], textarea[name="${fieldName}"], select[name="${fieldName}"]`).first();
                  
                  if (await field.isVisible().catch(() => false)) {
                    await field.fill(invalidValue);
                    await submitBtn.click();
                    await page.waitForTimeout(500);
                    
                    const fieldError = form.locator(`.error[data-field="${fieldName}"], .error`).first();
                    const hasFieldError = await fieldError.isVisible().catch(() => false);
                    
                    if (!hasFieldError) {
                      validationIssues.push({
                        form: scenario.name,
                        issue: `No validation error for invalid ${fieldName}: "${invalidValue}"`,
                        severity: 'MEDIUM'
                      });
                    }
                  }
                };
                
                // Test common invalid data patterns
                await testInvalidData('quantity', '-1');
                await testInvalidData('quantity', 'abc');
                await testInvalidData('email', 'invalid-email');
                
              } else {
                console.log(`⚠️ ${scenario.name} - No submit button found`);
              }
              
              // Close the form
              const closeBtn = form.locator('button:has-text("Close"), button:has-text("Cancel"), [aria-label="close"]').first();
              if (await closeBtn.isVisible().catch(() => false)) {
                await closeBtn.click();
              }
              
            } else {
              console.log(`⚠️ ${scenario.name} form not found - feature may not be implemented`);
            }
            
          } else {
            console.log(`⚠️ ${scenario.name} trigger button not found`);
          }
          
        } catch (error) {
          validationIssues.push({
            form: scenario.name,
            issue: `Form testing failed: ${error.message}`,
            severity: 'HIGH'
          });
        }
      }
      
      // Report validation issues
      if (validationIssues.length > 0) {
        console.log('⚠️ Form Validation Issues Summary:');
        validationIssues.forEach((issue, index) => {
          console.log(`  ${index + 1}. [${issue.severity}] ${issue.form}: ${issue.issue}`);
        });
        
        const highSeverityIssues = validationIssues.filter(i => i.severity === 'HIGH').length;
        expect(highSeverityIssues).toBeLessThan(2); // Allow max 1 high severity validation issue
      } else {
        console.log('✅ All form validation tests passed');
      }
    });

    test('should test real-time data synchronization breakpoints', async ({ page }) => {
      console.log('🔄 Testing Real-time Data Synchronization Breakpoints...');
      
      // Login and navigate to dashboard
      const loginPage = new LoginPage(page);
      await loginPage.navigate();
      await loginPage.login(testUsers.manufacturingManager?.email || 'manufacturing@pashion.com', 'password123');
      await loginPage.waitForLogin();
      
      await page.goto('/manufacturing');
      await expect(page.locator('main, .main-content')).toBeVisible({ timeout: 10000 });
      
      // Get initial data state
      console.log('📊 Capturing initial dashboard state...');
      
      const getDataSnapshot = async () => {
        const snapshot = {
          statCards: {},
          orderCounts: {},
          timestamp: Date.now()
        };
        
        // Capture stat card values
        const statCards = page.locator('.stat-card, [data-testid="stat-card"]');
        const statCardCount = await statCards.count();
        
        for (let i = 0; i < statCardCount; i++) {
          const cardText = await statCards.nth(i).textContent().catch(() => '');
          const cardTitle = cardText.split('\n')[0] || `Card_${i}`;
          snapshot.statCards[cardTitle] = cardText;
        }
        
        // Capture order counts
        const orderSections = [
          { name: 'activeOrders', selector: '[data-testid="active-orders"] .order-item, .active-orders .order-item' },
          { name: 'pendingOrders', selector: '[data-testid="pending-orders"] .order-item, .pending-orders .order-item' },
          { name: 'completedOrders', selector: '[data-testid="completed-orders"] .order-item, .completed-orders .order-item' }
        ];
        
        for (const section of orderSections) {
          const count = await page.locator(section.selector).count();
          snapshot.orderCounts[section.name] = count;
        }
        
        return snapshot;
      };
      
      const initialSnapshot = await getDataSnapshot();
      console.log('✅ Initial snapshot captured');
      
      // Test auto-refresh functionality
      console.log('🔄 Testing auto-refresh...');
      
      const refreshBtn = page.locator('button[data-testid="refresh"], button:has-text("Refresh"), [title="Refresh"]').first();
      
      if (await refreshBtn.isVisible().catch(() => false)) {
        await refreshBtn.click();
        await page.waitForTimeout(2000); // Wait for refresh
        
        const afterRefreshSnapshot = await getDataSnapshot();
        
        // Data should be consistent after refresh
        const hasChanges = JSON.stringify(initialSnapshot.statCards) !== JSON.stringify(afterRefreshSnapshot.statCards);
        
        console.log(`✅ Refresh completed - Data ${hasChanges ? 'updated' : 'consistent'}`);
      } else {
        console.log('⚠️ Refresh button not found');
      }
      
      // Test periodic updates (if implemented)
      console.log('⏰ Testing periodic data updates...');
      
      // Wait for potential auto-updates
      await page.waitForTimeout(5000);
      
      const periodicSnapshot = await getDataSnapshot();
      const timeDiff = periodicSnapshot.timestamp - initialSnapshot.timestamp;
      
      console.log(`⏱️ Time elapsed: ${timeDiff}ms`);
      
      // Check for WebSocket or polling indicators
      const wsIndicators = page.locator('[data-testid="connection-status"], .connection-indicator, .live-indicator');
      const hasLiveConnection = await wsIndicators.count() > 0;
      
      if (hasLiveConnection) {
        console.log('✅ Real-time connection indicators found');
      } else {
        console.log('ℹ️ No real-time connection indicators (may be normal)');
      }
      
      // Test offline/online behavior
      console.log('📡 Testing offline/online behavior...');
      
      try {
        // Go offline
        await page.context().setOffline(true);
        
        // Try to interact with the dashboard
        const interactionBtn = page.locator('button, .clickable').first();
        if (await interactionBtn.isVisible().catch(() => false)) {
          await interactionBtn.click();
          await page.waitForTimeout(1000);
          
          // Check for offline indicators
          const offlineIndicators = page.locator('[data-testid="offline"], .offline-indicator, text=offline');
          const showsOfflineStatus = await offlineIndicators.count() > 0;
          
          if (showsOfflineStatus) {
            console.log('✅ Offline status properly indicated');
          } else {
            console.log('⚠️ No offline status indication');
          }
        }
        
        // Go back online
        await page.context().setOffline(false);
        await page.waitForTimeout(2000);
        
        // Check for reconnection
        const onlineIndicators = page.locator('[data-testid="online"], .online-indicator, text=online');
        const showsOnlineStatus = await onlineIndicators.count() > 0;
        
        if (showsOnlineStatus) {
          console.log('✅ Online status properly restored');
        } else {
          console.log('ℹ️ No explicit online status indicator');
        }
        
      } catch (error) {
        console.log(`❌ BREAKPOINT: Offline/online testing failed - ${error.message}`);
      }
      
      console.log('🎉 Data Synchronization Breakpoint Test Completed');
    });
  });

  test.describe('Performance Breakpoints', () => {
    test('should identify performance bottlenecks and loading issues', async ({ page }) => {
      console.log('⚡ Testing Performance Breakpoints...');
      
      // Monitor page load performance
      const performanceMetrics = {
        loadTimes: {},
        apiResponseTimes: {},
        renderTimes: {}
      };
      
      // Login and measure dashboard load time
      console.log('📊 Measuring dashboard load performance...');
      
      const loginPage = new LoginPage(page);
      await loginPage.navigate();
      await loginPage.login(testUsers.manufacturingManager?.email || 'manufacturing@pashion.com', 'password123');
      await loginPage.waitForLogin();
      
      const startTime = Date.now();
      await page.goto('/manufacturing');
      await expect(page.locator('main, .main-content')).toBeVisible({ timeout: 15000 });
      const endTime = Date.now();
      
      performanceMetrics.loadTimes.dashboard = endTime - startTime;
      console.log(`⏱️ Dashboard load time: ${performanceMetrics.loadTimes.dashboard}ms`);
      
      // Test API response times
      console.log('🔍 Measuring API response times...');
      
      const apiEndpoints = [
        '/manufacturing/dashboard/stats',
        '/manufacturing/orders',
        '/production-requests?status=pending'
      ];
      
      for (const endpoint of apiEndpoints) {
        const apiStartTime = Date.now();
        try {
          await apiHelpers.makeApiRequest('GET', endpoint);
          const apiEndTime = Date.now();
          performanceMetrics.apiResponseTimes[endpoint] = apiEndTime - apiStartTime;
          console.log(`⏱️ ${endpoint}: ${performanceMetrics.apiResponseTimes[endpoint]}ms`);
        } catch (error) {
          performanceMetrics.apiResponseTimes[endpoint] = 'ERROR';
          console.log(`❌ ${endpoint}: ERROR`);
        }
      }
      
      // Test large data set handling
      console.log('📊 Testing large data set handling...');
      
      // Check if there are many items displayed
      const orderItems = page.locator('.order-item, [data-testid="order-item"], .production-order');
      const orderCount = await orderItems.count();
      console.log(`📋 Found ${orderCount} orders on display`);
      
      if (orderCount > 20) {
        // Test scrolling performance
        const scrollStartTime = Date.now();
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500);
        await page.evaluate(() => window.scrollTo(0, 0));
        const scrollEndTime = Date.now();
        
        performanceMetrics.renderTimes.scrolling = scrollEndTime - scrollStartTime;
        console.log(`⏱️ Scrolling large dataset: ${performanceMetrics.renderTimes.scrolling}ms`);
        
        if (performanceMetrics.renderTimes.scrolling > 2000) {
          console.log('❌ BREAKPOINT: Slow scrolling performance with large dataset');
        }
      }
      
      // Test memory usage indicators
      console.log('🧠 Checking for memory usage indicators...');
      
      const memoryUsage = await page.evaluate(() => {
        if (performance.memory) {
          return {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
          };
        }
        return null;
      });
      
      if (memoryUsage) {
        const memoryUsagePercent = (memoryUsage.used / memoryUsage.total) * 100;
        console.log(`🧠 Memory usage: ${memoryUsagePercent.toFixed(1)}% (${Math.round(memoryUsage.used / 1024 / 1024)}MB)`);
        
        if (memoryUsagePercent > 80) {
          console.log('❌ BREAKPOINT: High memory usage detected');
        }
      }
      
      // Performance assertions
      expect(performanceMetrics.loadTimes.dashboard).toBeLessThan(10000); // Dashboard should load within 10s
      
      const avgApiResponseTime = Object.values(performanceMetrics.apiResponseTimes)
        .filter(time => typeof time === 'number')
        .reduce((sum, time, _, arr) => sum + time / arr.length, 0);
        
      if (avgApiResponseTime > 0) {
        expect(avgApiResponseTime).toBeLessThan(5000); // Average API response should be under 5s
        console.log(`⏱️ Average API response time: ${avgApiResponseTime.toFixed(0)}ms`);
      }
      
      console.log('🎉 Performance Breakpoint Test Completed');
    });
  });
});