// Test data fixtures for E2E tests

export const testUsers = {
  admin: {
    email: 'admin@passion-inventory.com',
    password: 'admin123',
    name: 'Admin User',
    employee_id: 'EMP001',
    role: 'superadmin',
    department: 'admin'
  },
  salesManager: {
    email: 'sales.manager@passion-inventory.com',
    password: 'sales123',
    name: 'Sales Manager',
    employee_id: 'EMP002',
    role: 'sales_manager',
    department: 'sales'
  },
  procurementOfficer: {
    email: 'procurement@passion-inventory.com',
    password: 'procurement123',
    name: 'Procurement Officer',
    employee_id: 'EMP003',
    role: 'procurement_officer',
    department: 'procurement'
  },
  productionSupervisor: {
    email: 'production@passion-inventory.com',
    password: 'production123',
    name: 'Production Supervisor',
    employee_id: 'EMP004',
    role: 'production_supervisor',
    department: 'manufacturing'
  },
  financeManager: {
    email: 'finance@passion-inventory.com',
    password: 'finance123',
    name: 'Finance Manager',
    employee_id: 'EMP005',
    role: 'finance_manager',
    department: 'finance'
  }
};

export const testRoles = {
  superadmin: {
    name: 'superadmin',
    display_name: 'Super Administrator',
    description: 'Full system access',
    department: 'admin',
    level: 1
  },
  sales_manager: {
    name: 'sales_manager',
    display_name: 'Sales Manager',
    description: 'Sales department management',
    department: 'sales',
    level: 2
  },
  procurement_officer: {
    name: 'procurement_officer',
    display_name: 'Procurement Officer',
    description: 'Purchase and procurement management',
    department: 'procurement',
    level: 3
  }
};

export const testProducts = {
  fabric: {
    name: 'Cotton Fabric Premium',
    code: 'FAB001',
    category: 'Raw Material',
    unit: 'meters',
    price: 150.00,
    description: 'High quality cotton fabric for garment manufacturing'
  },
  garment: {
    name: 'Casual T-Shirt',
    code: 'GAR001',
    category: 'Finished Product',
    unit: 'pieces',
    price: 450.00,
    description: 'Premium quality casual t-shirt'
  }
};

export const testOrders = {
  salesOrder: {
    customer_name: 'ABC Fashion Store',
    customer_email: 'orders@abcfashion.com',
    customer_phone: '+1234567890',
    products: [
      {
        product_id: 1,
        quantity: 100,
        rate: 450.00,
        amount: 45000.00
      }
    ],
    total_amount: 45000.00,
    delivery_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
  },
  purchaseOrder: {
    supplier_name: 'Textile Suppliers Ltd',
    supplier_email: 'sales@textilesuppliers.com',
    supplier_phone: '+9876543210',
    products: [
      {
        product_id: 1,
        quantity: 500,
        rate: 150.00,
        amount: 75000.00
      }
    ],
    total_amount: 75000.00,
    expected_delivery: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 15 days from now
  }
};

export const departments = [
  'sales',
  'procurement', 
  'manufacturing',
  'inventory',
  'shipment',
  'finance',
  'admin',
  'store',
  'samples',
  'challans',
  'outsourcing'
];

export const apiEndpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    profile: '/auth/profile'
  },
  users: {
    list: '/users',
    create: '/users',
    update: '/users/:id',
    delete: '/users/:id',
    profile: '/users/profile'
  },
  admin: {
    dashboardStats: '/admin/dashboard-stats',
    departmentOverview: '/admin/department-overview',
    stockOverview: '/admin/stock-overview',
    recentActivities: '/admin/recent-activities',
    auditLogs: '/admin/audit-logs',
    roles: '/admin/roles'
  },
  sales: {
    orders: '/sales/orders',
    customers: '/sales/customers',
    dashboard: '/sales/dashboard'
  },
  procurement: {
    orders: '/procurement/purchase-orders',
    suppliers: '/procurement/suppliers',
    dashboard: '/procurement/dashboard'
  },
  inventory: {
    products: '/inventory/products',
    stock: '/inventory/stock',
    movements: '/inventory/movements'
  }
};