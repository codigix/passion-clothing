// Page Object Models for E2E tests

export class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"], input[name="email"]');
    this.passwordInput = page.locator('input[type="password"], input[name="password"]');
    this.loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
    this.errorMessage = page.locator('[data-testid="error-message"], .error, .alert-error');
  }

  async navigate() {
    await this.page.goto('/login');
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async waitForLogin() {
    await this.page.waitForURL('**/dashboard**', { timeout: 10000 });
  }
}

export class AdminDashboardPage {
  constructor(page) {
    this.page = page;
    
    // Navigation and layout
    this.sidebar = page.locator('[data-testid="sidebar"], .sidebar, nav');
    this.header = page.locator('[data-testid="header"], .header, header');
    this.mainContent = page.locator('[data-testid="main-content"], .main-content, main');
    
    // Dashboard stats cards
    this.statsCards = page.locator('[data-testid="stat-card"], .stat-card');
    this.totalUsersCard = page.locator('text=Total Users').locator('..');
    this.activeUsersCard = page.locator('text=Active Users').locator('..');
    this.totalRolesCard = page.locator('text=Total Roles').locator('..');
    
    // Tabs and sections
    this.overviewTab = page.locator('text=Overview, button:has-text("Overview")');
    this.usersTab = page.locator('text=Users, button:has-text("Users")');
    this.rolesTab = page.locator('text=Roles, button:has-text("Roles")');
    this.systemTab = page.locator('text=System, button:has-text("System")');
    
    // User management
    this.addUserButton = page.locator('button:has-text("Add User"), [data-testid="add-user-btn"]');
    this.userTable = page.locator('[data-testid="users-table"], .users-table, table');
    this.userRows = page.locator('tbody tr');
    
    // Role management  
    this.addRoleButton = page.locator('button:has-text("Add Role"), [data-testid="add-role-btn"]');
    this.roleTable = page.locator('[data-testid="roles-table"], .roles-table');
    this.roleRows = page.locator('tbody tr');
    
    // Dialogs and modals
    this.userDialog = page.locator('[data-testid="user-dialog"], .user-dialog');
    this.roleDialog = page.locator('[data-testid="role-dialog"], .role-dialog');
    
    // Department overview
    this.departmentCards = page.locator('[data-testid="dept-card"], .dept-card');
    this.salesDeptCard = page.locator('text=Sales').locator('..');
    this.inventoryDeptCard = page.locator('text=Inventory').locator('..');
    
    // Recent activities
    this.activitiesList = page.locator('[data-testid="activities-list"], .activities-list');
    this.activityItems = page.locator('.activity-item, [data-testid="activity-item"]');
  }

  async navigate() {
    await this.page.goto('/admin/dashboard');
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.statsCards.first().waitFor({ state: 'visible', timeout: 10000 });
  }

  async clickUsersTab() {
    await this.usersTab.click();
  }

  async clickRolesTab() {
    await this.rolesTab.click();
  }

  async clickAddUser() {
    await this.addUserButton.click();
  }

  async clickAddRole() {
    await this.addRoleButton.click();
  }

  async getStatCardValue(cardTitle) {
    const card = this.page.locator(`text=${cardTitle}`).locator('..');
    return await card.locator('.text-lg, .stat-value').textContent();
  }

  async getDepartmentCardCount(deptName) {
    const card = this.page.locator(`text=${deptName}`).locator('..');
    return await card.locator('.count, .stat-number').textContent();
  }
}

export class UserDialogPage {
  constructor(page) {
    this.page = page;
    this.dialog = page.locator('[data-testid="user-dialog"], .user-dialog');
    this.nameInput = page.locator('input[name="name"], input[placeholder*="Name"]');
    this.emailInput = page.locator('input[name="email"], input[placeholder*="Email"]');
    this.phoneInput = page.locator('input[name="phone"], input[placeholder*="Phone"]');
    this.departmentSelect = page.locator('select[name="department"], select:has(option:text("Sales"))');
    this.roleSelect = page.locator('select[name="role"], select:has(option:text("Manager"))');
    this.statusSelect = page.locator('select[name="status"], select:has(option:text("Active"))');
    this.sendWelcomeCheckbox = page.locator('input[name="sendWelcome"], input[type="checkbox"]');
    this.cancelButton = page.locator('button:has-text("Cancel")');
    this.createButton = page.locator('button:has-text("Create User"), button:has-text("Create")');
    this.errorMessage = page.locator('.text-red-600, .error-message');
  }

  async fillUserForm(userData) {
    await this.nameInput.fill(userData.name);
    await this.emailInput.fill(userData.email);
    await this.phoneInput.fill(userData.phone);
    await this.departmentSelect.selectOption(userData.department);
    await this.roleSelect.selectOption(userData.role);
    await this.statusSelect.selectOption(userData.status || 'active');
  }

  async createUser() {
    await this.createButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async waitForClose() {
    await this.dialog.waitFor({ state: 'detached', timeout: 10000 });
  }
}

export class RoleDialogPage {
  constructor(page) {
    this.page = page;
    this.dialog = page.locator('[data-testid="role-dialog"], .role-dialog');
    this.nameInput = page.locator('input[name="name"]');
    this.displayNameInput = page.locator('input[name="display_name"]');
    this.descriptionInput = page.locator('input[name="description"], textarea[name="description"]');
    this.departmentSelect = page.locator('select[name="department"]');
    this.levelSelect = page.locator('select[name="level"]');
    this.cancelButton = page.locator('button:has-text("Cancel")');
    this.createButton = page.locator('button:has-text("Create Role"), button:has-text("Create")');
    this.errorMessage = page.locator('.text-red-600, .error-message');
  }

  async fillRoleForm(roleData) {
    await this.nameInput.fill(roleData.name);
    await this.displayNameInput.fill(roleData.display_name);
    await this.descriptionInput.fill(roleData.description);
    await this.departmentSelect.selectOption(roleData.department);
    await this.levelSelect.selectOption(roleData.level.toString());
  }

  async createRole() {
    await this.createButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }
}

export class NavigationPage {
  constructor(page) {
    this.page = page;
    this.sidebar = page.locator('[data-testid="sidebar"], .sidebar, nav');
    this.dashboardLink = page.locator('a[href*="dashboard"], text=Dashboard');
    this.salesLink = page.locator('a[href*="sales"], text=Sales');
    this.procurementLink = page.locator('a[href*="procurement"], text=Procurement');
    this.inventoryLink = page.locator('a[href*="inventory"], text=Inventory');
    this.manufacturingLink = page.locator('a[href*="manufacturing"], text=Manufacturing');
    this.shipmentLink = page.locator('a[href*="shipment"], text=Shipment');
    this.financeLink = page.locator('a[href*="finance"], text=Finance');
    this.adminLink = page.locator('a[href*="admin"], text=Admin');
    this.mrnRequestsLink = page.locator('a[href*="material-requests"], text=Material Requests');
    this.profileDropdown = page.locator('[data-testid="profile-dropdown"], .profile-dropdown');
    this.logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")');
  }

  async navigateToSales() {
    await this.salesLink.click();
  }

  async navigateToProcurement() {
    await this.procurementLink.click();
  }

  async navigateToInventory() {
    await this.inventoryLink.click();
  }

  async navigateToManufacturing() {
    await this.manufacturingLink.click();
  }

  async navigateToMrnRequests() {
    await this.mrnRequestsLink.click();
  }

  async navigateToAdmin() {
    await this.adminLink.click();
  }

  async logout() {
    await this.profileDropdown.click();
    await this.logoutButton.click();
  }
}

export class ApiHelpers {
  // Generic API helper leveraging browser context storage for tokens
  constructor(page) {
    this.page = page;
  }

  async makeApiRequest(method, endpoint, data = null, headers = {}) {
    return await this.page.evaluate(async ({ method, endpoint, data, headers }) => {
      const baseURL = 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...headers
        }
      };

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(`${baseURL}${endpoint}`, config);
      const contentType = response.headers.get('content-type');
      const responseBody = contentType && contentType.includes('application/json')
        ? await response.json()
        : await response.text();

      return {
        status: response.status,
        data: responseBody
      };
    }, { method, endpoint, data, headers });
  }

  async createTestUser(userData) {
    return await this.makeApiRequest('POST', '/users', userData);
  }

  async createTestRole(roleData) {
    return await this.makeApiRequest('POST', '/admin/roles', roleData);
  }

  async getDashboardStats() {
    return await this.makeApiRequest('GET', '/admin/dashboard-stats');
  }

  async createMrnRequest(payload) {
    return await this.makeApiRequest('POST', '/project-material-request/create', payload);
  }

  async getMrnRequest(mrnId) {
    return await this.makeApiRequest('GET', `/project-material-request/${mrnId}`);
  }

  async getMrnRequests() {
    return await this.makeApiRequest('GET', '/project-material-request');
  }

  async getDispatchByMrn(mrnId) {
    return await this.makeApiRequest('GET', `/material-dispatch/${mrnId}`);
  }

  async getDispatchList() {
    return await this.makeApiRequest('GET', '/material-dispatch/list/all');
  }

  async createMaterialDispatch(payload) {
    return await this.makeApiRequest('POST', '/material-dispatch/create', payload);
  }

  async getReceiptByDispatch(dispatchId) {
    return await this.makeApiRequest('GET', `/material-receipt/${dispatchId}`);
  }

  async createMaterialReceipt(payload) {
    return await this.makeApiRequest('POST', '/material-receipt/create', payload);
  }

  async cleanupMrnTestData({ mrnIds = [], dispatchIds = [], receiptIds = [] } = {}) {
    for (const receiptId of receiptIds) {
      await this.makeApiRequest('DELETE', `/material-receipt/${receiptId}`);
    }
    for (const dispatchId of dispatchIds) {
      await this.makeApiRequest('DELETE', `/material-dispatch/${dispatchId}`);
    }
    for (const mrnId of mrnIds) {
      await this.makeApiRequest('DELETE', `/project-material-request/${mrnId}`);
    }
  }

  async cleanupTestData(userIds = [], roleIds = []) {
    for (const userId of userIds) {
      await this.makeApiRequest('DELETE', `/users/${userId}`);
    }
    for (const roleId of roleIds) {
      await this.makeApiRequest('DELETE', `/admin/roles/${roleId}`);
    }
  }
}