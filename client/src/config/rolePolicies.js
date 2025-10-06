export const SELF_REGISTER_ALLOWED_DEPARTMENTS = [
  'sales',
  'inventory',
  'manufacturing',
  'procurement',
  'outsourcing',
  'shipment',
  'store',
  'finance',
  'admin',
  'samples',
];

export const SELF_REGISTER_ALLOWED_ROLE_LEVELS = [1, 3, 5];

export const DEPARTMENT_DISPLAY_MAP = {
  sales: 'Sales',
  inventory: 'Inventory',
  manufacturing: 'Manufacturing',
  procurement: 'Procurement',
  outsourcing: 'Outsourcing',
  shipment: 'Shipment',
  store: 'Store',
  finance: 'Finance',
  admin: 'Administration',
  samples: 'Samples',
};

export const getDepartmentRestrictionMessage = (department) =>
  `Registration for ${DEPARTMENT_DISPLAY_MAP[department] ?? department} requires administrator approval.`;