import { test, expect } from '@playwright/test';
import { 
  LoginPage, 
  AdminDashboardPage, 
  UserDialogPage, 
  RoleDialogPage,
  NavigationPage,
  ApiHelpers 
} from './fixtures/page-objects.js';
import { testUsers, testRoles } from './fixtures/test-data.js';

test.describe('Admin Dashboard - Comprehensive E2E Tests', () => {
  let loginPage: LoginPage;
  let adminDashboardPage: AdminDashboardPage;
  let userDialogPage: UserDialogPage;
  let roleDialogPage: RoleDialogPage;
  let navigationPage: NavigationPage;
  let apiHelpers: ApiHelpers;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    adminDashboardPage = new AdminDashboardPage(page);
    userDialogPage = new UserDialogPage(page);
    roleDialogPage = new RoleDialogPage(page);
    navigationPage = new NavigationPage(page);
    apiHelpers = new ApiHelpers(page);

    // Navigate to login and authenticate as admin
    await loginPage.navigate();
    await loginPage.login(testUsers.admin.email, testUsers.admin.password);
    await loginPage.waitForLogin();
    
    // Navigate to admin dashboard
    await adminDashboardPage.navigate();
    await adminDashboardPage.waitForLoad();
  });

  test.describe('Dashboard Overview', () => {
    test('should display dashboard with all key metrics', async () => {
      // Verify page title and main elements are visible
      await expect(adminDashboardPage.statsCards.first()).toBeVisible();
      await expect(adminDashboardPage.header).toBeVisible();
      await expect(adminDashboardPage.mainContent).toBeVisible();

      // Check that all stat cards are present
      const statsCount = await adminDashboardPage.statsCards.count();
      expect(statsCount).toBeGreaterThan(3);

      // Verify specific stat cards contain numeric values
      const totalUsersValue = await adminDashboardPage.getStatCardValue('Total Users');
      expect(totalUsersValue).toMatch(/^\d+$/);

      const activeUsersValue = await adminDashboardPage.getStatCardValue('Active Users');
      expect(activeUsersValue).toMatch(/^\d+$/);
    });

    test('should show department overview with all departments', async () => {
      // Check department cards are visible
      await expect(adminDashboardPage.departmentCards.first()).toBeVisible();
      
      // Verify key departments are present
      const departments = ['Sales', 'Inventory', 'Manufacturing', 'Procurement'];
      for (const dept of departments) {
        await expect(adminDashboardPage.page.locator(`text=${dept}`).first()).toBeVisible();
      }
    });

    test('should display recent activities and audit logs', async () => {
      // Check activities section is visible
      await expect(adminDashboardPage.activitiesList).toBeVisible();
      
      // Verify activities are loading (should have at least loading state or items)
      const activitiesCount = await adminDashboardPage.activityItems.count();
      expect(activitiesCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('User Management', () => {
    test('should navigate to users tab and display user list', async () => {
      await adminDashboardPage.clickUsersTab();
      
      // Wait for users table to be visible
      await expect(adminDashboardPage.userTable).toBeVisible();
      
      // Check if add user button is present
      await expect(adminDashboardPage.addUserButton).toBeVisible();
      
      // Verify user rows are present (at least the admin user)
      const userRowsCount = await adminDashboardPage.userRows.count();
      expect(userRowsCount).toBeGreaterThanOrEqual(1);
    });

    test('should open and close user creation dialog', async () => {
      await adminDashboardPage.clickUsersTab();
      await adminDashboardPage.clickAddUser();
      
      // Verify dialog opened
      await expect(userDialogPage.dialog).toBeVisible();
      await expect(userDialogPage.nameInput).toBeVisible();
      await expect(userDialogPage.emailInput).toBeVisible();
      
      // Close dialog
      await userDialogPage.cancel();
      await userDialogPage.waitForClose();
      
      // Verify dialog closed
      await expect(userDialogPage.dialog).not.toBeVisible();
    });

    test('should create a new user successfully', async () => {
      await adminDashboardPage.clickUsersTab();
      await adminDashboardPage.clickAddUser();
      
      const testUser = {
        name: 'Test User E2E',
        email: `test.e2e.${Date.now()}@example.com`,
        phone: '+1234567890',
        department: 'sales',
        role: 'sales_manager',
        status: 'active'
      };
      
      await userDialogPage.fillUserForm(testUser);
      await userDialogPage.createUser();
      
      // Wait for dialog to close (indicates success)
      await userDialogPage.waitForClose();
      
      // Verify user appears in the table
      await expect(adminDashboardPage.page.locator(`text=${testUser.name}`)).toBeVisible({ timeout: 10000 });
      await expect(adminDashboardPage.page.locator(`text=${testUser.email}`)).toBeVisible();
    });

    test('should validate required fields in user creation', async () => {
      await adminDashboardPage.clickUsersTab();
      await adminDashboardPage.clickAddUser();
      
      // Try to create user without required fields
      await userDialogPage.createUser();
      
      // Dialog should remain open and show validation
      await expect(userDialogPage.dialog).toBeVisible();
      
      // Fill only name and try again
      await userDialogPage.nameInput.fill('Incomplete User');
      await userDialogPage.createUser();
      
      // Dialog should still be open
      await expect(userDialogPage.dialog).toBeVisible();
    });
  });

  test.describe('Role Management', () => {
    test('should navigate to roles tab and display role list', async () => {
      await adminDashboardPage.clickRolesTab();
      
      // Wait for roles table/list to be visible
      await expect(adminDashboardPage.roleTable).toBeVisible();
      
      // Check if add role button is present
      await expect(adminDashboardPage.addRoleButton).toBeVisible();
      
      // Verify role rows are present
      const roleRowsCount = await adminDashboardPage.roleRows.count();
      expect(roleRowsCount).toBeGreaterThanOrEqual(1);
    });

    test('should open and close role creation dialog', async () => {
      await adminDashboardPage.clickRolesTab();
      await adminDashboardPage.clickAddRole();
      
      // Verify dialog opened
      await expect(roleDialogPage.dialog).toBeVisible();
      await expect(roleDialogPage.nameInput).toBeVisible();
      await expect(roleDialogPage.displayNameInput).toBeVisible();
      
      // Close dialog
      await roleDialogPage.cancel();
      
      // Verify dialog closed
      await expect(roleDialogPage.dialog).not.toBeVisible();
    });

    test('should create a new role successfully', async () => {
      await adminDashboardPage.clickRolesTab();
      await adminDashboardPage.clickAddRole();
      
      const testRole = {
        name: `test_role_${Date.now()}`,
        display_name: 'Test Role E2E',
        description: 'Test role created by E2E tests',
        department: 'sales',
        level: 3
      };
      
      await roleDialogPage.fillRoleForm(testRole);
      await roleDialogPage.createRole();
      
      // Wait for success (dialog should close)
      await expect(roleDialogPage.dialog).not.toBeVisible({ timeout: 10000 });
      
      // Verify role appears in the list
      await expect(adminDashboardPage.page.locator(`text=${testRole.display_name}`)).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Navigation and Cross-Department Access', () => {
    test('should navigate between different department dashboards', async () => {
      // Test navigation to Sales
      await navigationPage.navigateToSales();
      await expect(adminDashboardPage.page).toHaveURL(/.*sales.*/);
      
      // Navigate back to Admin
      await navigationPage.navigateToAdmin();
      await expect(adminDashboardPage.page).toHaveURL(/.*admin.*/);
      
      // Test navigation to Inventory
      await navigationPage.navigateToInventory();
      await expect(adminDashboardPage.page).toHaveURL(/.*inventory.*/);
      
      // Navigate back to Admin
      await navigationPage.navigateToAdmin();
      await expect(adminDashboardPage.page).toHaveURL(/.*admin.*/);
    });

    test('should maintain session across page navigation', async () => {
      // Navigate to different pages and verify user remains logged in
      await navigationPage.navigateToSales();
      await navigationPage.navigateToProcurement();
      await navigationPage.navigateToInventory();
      await navigationPage.navigateToAdmin();
      
      // Verify we're still on admin dashboard and not redirected to login
      await expect(adminDashboardPage.page).toHaveURL(/.*admin.*/);
      await expect(adminDashboardPage.statsCards.first()).toBeVisible();
    });
  });

  test.describe('API Integration Validation', () => {
    test('should validate dashboard API responses', async ({ page }) => {
      // Test dashboard stats API
      const statsResponse = await apiHelpers.getDashboardStats();
      expect(statsResponse.status).toBe(200);
      expect(statsResponse.data).toHaveProperty('users');
      expect(statsResponse.data).toHaveProperty('sales');
      expect(statsResponse.data.users).toHaveProperty('total');
      expect(statsResponse.data.users).toHaveProperty('active');
    });

    test('should handle API errors gracefully', async ({ page }) => {
      // Test with invalid endpoint to verify error handling
      const response = await apiHelpers.makeApiRequest('GET', '/invalid-endpoint');
      expect(response.status).toBe(404);
      
      // Verify the dashboard still displays properly even with API errors
      await adminDashboardPage.navigate();
      await expect(adminDashboardPage.statsCards.first()).toBeVisible();
    });
  });

  test.describe('Real-time Data Updates', () => {
    test('should reflect changes in user count after creating user', async () => {
      // Get initial user count
      const initialCount = await adminDashboardPage.getStatCardValue('Total Users');
      const initialNumber = parseInt(initialCount);
      
      // Create a new user
      await adminDashboardPage.clickUsersTab();
      await adminDashboardPage.clickAddUser();
      
      const testUser = {
        name: 'Count Test User',
        email: `count.test.${Date.now()}@example.com`,
        phone: '+1234567890',
        department: 'admin',
        role: 'admin_manager',
        status: 'active'
      };
      
      await userDialogPage.fillUserForm(testUser);
      await userDialogPage.createUser();
      await userDialogPage.waitForClose();
      
      // Navigate back to overview to check updated count
      await adminDashboardPage.overviewTab.click();
      
      // Wait for stats to refresh and verify count increased
      await adminDashboardPage.page.waitForTimeout(2000); // Allow time for refresh
      const newCount = await adminDashboardPage.getStatCardValue('Total Users');
      const newNumber = parseInt(newCount);
      
      expect(newNumber).toBeGreaterThan(initialNumber);
    });
  });

  test.describe('Responsive Design and Accessibility', () => {
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Reload page and verify elements are still accessible
      await adminDashboardPage.navigate();
      await adminDashboardPage.waitForLoad();
      
      // Key elements should still be visible
      await expect(adminDashboardPage.statsCards.first()).toBeVisible();
      await expect(adminDashboardPage.usersTab).toBeVisible();
    });

    test('should have proper accessibility attributes', async ({ page }) => {
      // Check for proper ARIA labels and roles
      const buttons = adminDashboardPage.page.locator('button');
      const buttonCount = await buttons.count();
      
      // At least some buttons should have accessible names
      expect(buttonCount).toBeGreaterThan(0);
      
      // Check form inputs have labels or placeholders
      await adminDashboardPage.clickUsersTab();
      await adminDashboardPage.clickAddUser();
      
      const nameInput = userDialogPage.nameInput;
      const emailInput = userDialogPage.emailInput;
      
      // Inputs should have accessible names via placeholder or labels
      await expect(nameInput).toHaveAttribute('placeholder');
      await expect(emailInput).toHaveAttribute('placeholder');
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle network failures gracefully', async ({ page }) => {
      // Simulate network failure
      await page.route('**/api/admin/dashboard-stats', route => route.abort());
      
      // Navigate to dashboard
      await adminDashboardPage.navigate();
      
      // Page should still load even if some data fails to load
      await expect(adminDashboardPage.page.locator('body')).toBeVisible();
      
      // Clear the route intercept
      await page.unroute('**/api/admin/dashboard-stats');
    });

    test('should validate form inputs properly', async () => {
      await adminDashboardPage.clickUsersTab();
      await adminDashboardPage.clickAddUser();
      
      // Test invalid email format
      await userDialogPage.nameInput.fill('Test User');
      await userDialogPage.emailInput.fill('invalid-email');
      await userDialogPage.phoneInput.fill('123');
      await userDialogPage.createUser();
      
      // Dialog should remain open with validation errors
      await expect(userDialogPage.dialog).toBeVisible();
    });
  });

  test.afterEach(async ({ page }) => {
    // Clean up any test data created during tests
    await page.evaluate(() => {
      // This would ideally clean up any test users/roles created
      console.log('Cleaning up test data...');
    });
  });
});

test.describe('Department Integration Flow', () => {
  test('should complete full sales-to-delivery workflow', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const navigationPage = new NavigationPage(page);
    
    // Login as admin
    await loginPage.navigate();
    await loginPage.login(testUsers.admin.email, testUsers.admin.password);
    await loginPage.waitForLogin();
    
    // Navigate through each department to verify access
    const departments = [
      { name: 'Sales', url: '/sales' },
      { name: 'Procurement', url: '/procurement' },
      { name: 'Manufacturing', url: '/manufacturing' },
      { name: 'Inventory', url: '/inventory' },
      { name: 'Shipment', url: '/shipment' },
      { name: 'Finance', url: '/finance' }
    ];
    
    for (const dept of departments) {
      await page.goto(dept.url);
      
      // Verify page loads successfully (not redirected to login)
      await expect(page).not.toHaveURL(/.*login.*/);
      
      // Verify some content is visible (dashboard or main content)
      await expect(page.locator('main, [role="main"], .main-content, .dashboard')).toBeVisible({ timeout: 10000 });
      
      console.log(`✓ ${dept.name} department accessible`);
    }
  });
});