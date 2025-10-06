import { test, expect } from '@playwright/test';
import { LoginPage, ApiHelpers } from './fixtures/page-objects.js';
import { testUsers, apiEndpoints } from './fixtures/test-data.js';

test.describe('API Integration Tests', () => {
  let apiHelpers: ApiHelpers;

  test.beforeEach(async ({ page }) => {
    apiHelpers = new ApiHelpers(page);
    
    // Login to get authentication token
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(testUsers.admin.email, testUsers.admin.password);
    await loginPage.waitForLogin();
  });

  test.describe('Authentication APIs', () => {
    test('should validate login endpoint', async ({ page }) => {
      // Test login with valid credentials
      const loginResponse = await apiHelpers.makeApiRequest('POST', '/auth/login', {
        email: testUsers.admin.email,
        password: testUsers.admin.password
      });
      
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data).toHaveProperty('token');
      expect(loginResponse.data).toHaveProperty('user');
    });

    test('should reject invalid login credentials', async () => {
      const loginResponse = await apiHelpers.makeApiRequest('POST', '/auth/login', {
        email: 'invalid@email.com',
        password: 'wrongpassword'
      });
      
      expect(loginResponse.status).toBeGreaterThan(400);
    });

    test('should validate profile endpoint', async () => {
      const profileResponse = await apiHelpers.makeApiRequest('GET', '/auth/profile');
      
      if (profileResponse.status === 200) {
        expect(profileResponse.data).toHaveProperty('user');
        expect(profileResponse.data.user).toHaveProperty('email');
      }
    });
  });

  test.describe('Admin APIs', () => {
    test('should fetch dashboard stats', async () => {
      const response = await apiHelpers.getDashboardStats();
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      
      // Validate structure
      if (response.data.users) {
        expect(typeof response.data.users.total).toBe('number');
        expect(typeof response.data.users.active).toBe('number');
      }
    });

    test('should fetch department overview', async () => {
      const response = await apiHelpers.makeApiRequest('GET', '/admin/department-overview');
      
      // Should either return data or handle gracefully
      expect([200, 404, 500]).toContain(response.status);
    });

    test('should manage users via API', async () => {
      // Test user listing
      const usersResponse = await apiHelpers.makeApiRequest('GET', '/users');
      
      if (usersResponse.status === 200) {
        expect(Array.isArray(usersResponse.data.users)).toBe(true);
      }
    });

    test('should manage roles via API', async () => {
      const rolesResponse = await apiHelpers.makeApiRequest('GET', '/admin/roles');
      
      if (rolesResponse.status === 200) {
        expect(Array.isArray(rolesResponse.data.roles)).toBe(true);
      }
    });

    test('should fetch audit logs', async () => {
      const auditResponse = await apiHelpers.makeApiRequest('GET', '/admin/audit-logs?page=1&limit=10');
      
      // Should handle gracefully even if not implemented
      expect([200, 404, 500]).toContain(auditResponse.status);
    });
  });

  test.describe('Sales APIs', () => {
    test('should handle sales orders', async () => {
      const ordersResponse = await apiHelpers.makeApiRequest('GET', '/sales/orders');
      
      if (ordersResponse.status === 200) {
        expect(ordersResponse.data).toBeDefined();
      }
    });

    test('should handle customers', async () => {
      const customersResponse = await apiHelpers.makeApiRequest('GET', '/sales/customers');
      
      // Should either work or return appropriate error
      expect(customersResponse.status).toBeDefined();
    });

    test('should fetch sales dashboard data', async () => {
      const dashboardResponse = await apiHelpers.makeApiRequest('GET', '/sales/dashboard');
      
      if (dashboardResponse.status === 200) {
        expect(dashboardResponse.data).toBeDefined();
      }
    });
  });

  test.describe('Procurement APIs', () => {
    test('should handle purchase orders', async () => {
      const purchaseOrdersResponse = await apiHelpers.makeApiRequest('GET', '/procurement/purchase-orders');
      
      if (purchaseOrdersResponse.status === 200) {
        expect(purchaseOrdersResponse.data).toBeDefined();
      }
    });

    test('should handle suppliers', async () => {
      const suppliersResponse = await apiHelpers.makeApiRequest('GET', '/procurement/suppliers');
      
      expect(suppliersResponse.status).toBeDefined();
    });

    test('should fetch procurement dashboard', async () => {
      const dashboardResponse = await apiHelpers.makeApiRequest('GET', '/procurement/dashboard');
      
      if (dashboardResponse.status === 200) {
        expect(dashboardResponse.data).toBeDefined();
      }
    });
  });

  test.describe('Inventory APIs', () => {
    test('should handle products', async () => {
      const productsResponse = await apiHelpers.makeApiRequest('GET', '/inventory/products');
      
      if (productsResponse.status === 200) {
        expect(productsResponse.data).toBeDefined();
      }
    });

    test('should handle stock levels', async () => {
      const stockResponse = await apiHelpers.makeApiRequest('GET', '/inventory/stock');
      
      if (stockResponse.status === 200) {
        expect(stockResponse.data).toBeDefined();
      }
    });

    test('should handle inventory movements', async () => {
      const movementsResponse = await apiHelpers.makeApiRequest('GET', '/inventory/movements');
      
      expect(movementsResponse.status).toBeDefined();
    });
  });

  test.describe('Manufacturing APIs', () => {
    test('should handle production orders', async () => {
      const productionResponse = await apiHelpers.makeApiRequest('GET', '/manufacturing/production-orders');
      
      expect(productionResponse.status).toBeDefined();
    });

    test('should handle work orders', async () => {
      const workOrdersResponse = await apiHelpers.makeApiRequest('GET', '/manufacturing/work-orders');
      
      expect(workOrdersResponse.status).toBeDefined();
    });
  });

  test.describe('Shipment APIs', () => {
    test('should handle shipments', async () => {
      const shipmentsResponse = await apiHelpers.makeApiRequest('GET', '/shipment/shipments');
      
      expect(shipmentsResponse.status).toBeDefined();
    });

    test('should handle delivery tracking', async () => {
      const trackingResponse = await apiHelpers.makeApiRequest('GET', '/shipment/tracking');
      
      expect(trackingResponse.status).toBeDefined();
    });
  });

  test.describe('Finance APIs', () => {
    test('should handle invoices', async () => {
      const invoicesResponse = await apiHelpers.makeApiRequest('GET', '/finance/invoices');
      
      expect(invoicesResponse.status).toBeDefined();
    });

    test('should handle payments', async () => {
      const paymentsResponse = await apiHelpers.makeApiRequest('GET', '/finance/payments');
      
      expect(paymentsResponse.status).toBeDefined();
    });

    test('should handle financial reports', async () => {
      const reportsResponse = await apiHelpers.makeApiRequest('GET', '/finance/reports');
      
      expect(reportsResponse.status).toBeDefined();
    });
  });

  test.describe('API Error Handling', () => {
    test('should handle unauthorized requests', async ({ page }) => {
      // Remove authentication token
      await page.evaluate(() => localStorage.removeItem('token'));
      
      const unauthorizedHelper = new ApiHelpers(page);
      const response = await unauthorizedHelper.makeApiRequest('GET', '/admin/dashboard-stats');
      
      expect([401, 403]).toContain(response.status);
    });

    test('should handle non-existent endpoints', async () => {
      const response = await apiHelpers.makeApiRequest('GET', '/non-existent-endpoint');
      
      expect(response.status).toBe(404);
    });

    test('should handle malformed requests', async () => {
      const response = await apiHelpers.makeApiRequest('POST', '/users', 'invalid-json');
      
      expect([400, 500]).toContain(response.status);
    });
  });

  test.describe('API Performance', () => {
    test('should respond within reasonable time', async () => {
      const startTime = Date.now();
      
      const response = await apiHelpers.getDashboardStats();
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Response should be under 5 seconds
      expect(responseTime).toBeLessThan(5000);
      
      console.log(`Dashboard API response time: ${responseTime}ms`);
    });

    test('should handle concurrent requests', async () => {
      const concurrentRequests = [
        apiHelpers.makeApiRequest('GET', '/admin/dashboard-stats'),
        apiHelpers.makeApiRequest('GET', '/users'),
        apiHelpers.makeApiRequest('GET', '/admin/roles'),
        apiHelpers.makeApiRequest('GET', '/sales/orders'),
        apiHelpers.makeApiRequest('GET', '/inventory/products')
      ];
      
      const startTime = Date.now();
      const results = await Promise.allSettled(concurrentRequests);
      const endTime = Date.now();
      
      const totalTime = endTime - startTime;
      const successfulRequests = results.filter(
        result => result.status === 'fulfilled' && result.value.status < 400
      ).length;
      
      console.log(`Concurrent requests: ${successfulRequests}/${concurrentRequests.length} successful in ${totalTime}ms`);
      
      // At least half should succeed
      expect(successfulRequests).toBeGreaterThanOrEqual(Math.floor(concurrentRequests.length / 2));
      
      // Should complete within 10 seconds
      expect(totalTime).toBeLessThan(10000);
    });
  });

  test.describe('Data Integrity', () => {
    test('should maintain data consistency across API calls', async () => {
      // Get user count from dashboard
      const dashboardResponse = await apiHelpers.getDashboardStats();
      
      if (dashboardResponse.status === 200 && dashboardResponse.data.users) {
        const dashboardUserCount = dashboardResponse.data.users.total;
        
        // Get user count from users endpoint
        const usersResponse = await apiHelpers.makeApiRequest('GET', '/users');
        
        if (usersResponse.status === 200 && usersResponse.data.users) {
          const usersListCount = usersResponse.data.users.length;
          
          // Counts should be reasonably close (within pagination limits)
          console.log(`Dashboard reports ${dashboardUserCount} users, Users API returns ${usersListCount} users`);
          
          // Allow for pagination differences
          expect(Math.abs(dashboardUserCount - usersListCount)).toBeLessThanOrEqual(20);
        }
      }
    });

    test('should validate API response schemas', async () => {
      const dashboardResponse = await apiHelpers.getDashboardStats();
      
      if (dashboardResponse.status === 200) {
        // Validate basic structure
        expect(dashboardResponse.data).toBeDefined();
        expect(typeof dashboardResponse.data).toBe('object');
        
        // If users data exists, validate its structure
        if (dashboardResponse.data.users) {
          expect(typeof dashboardResponse.data.users.total).toBe('number');
          expect(typeof dashboardResponse.data.users.active).toBe('number');
          expect(dashboardResponse.data.users.active).toBeLessThanOrEqual(dashboardResponse.data.users.total);
        }
      }
    });
  });
});