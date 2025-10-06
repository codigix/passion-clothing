const { Sequelize } = require('sequelize');
require('dotenv').config();

const isTestEnv = process.env.NODE_ENV === 'test';

const baseDefineConfig = {
  timestamps: true,
  underscored: true,
  freezeTableName: true,
  indexes: []
};

let sequelize;

if (isTestEnv) {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    define: baseDefineConfig
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'pashion_erp',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'root',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: baseDefineConfig
    }
  );
}

// Import all models
const User = require('../models/User')(sequelize);
const Role = require('../models/Role')(sequelize);
const Permission = require('../models/Permission')(sequelize);
const SalesOrder = require('../models/SalesOrder')(sequelize);
const PurchaseOrder = require('../models/PurchaseOrder')(sequelize);
const Challan = require('../models/Challan')(sequelize);
const Inventory = require('../models/Inventory')(sequelize);
const ProductionOrder = require('../models/ProductionOrder')(sequelize);
const ProductionStage = require('../models/ProductionStage')(sequelize);
const Rejection = require('../models/Rejection')(sequelize);
const Shipment = require('../models/Shipment')(sequelize);
const StoreStock = require('../models/StoreStock')(sequelize);
const Invoice = require('../models/Invoice')(sequelize);
const Payment = require('../models/Payment')(sequelize);
const Vendor = require('../models/Vendor')(sequelize);
const Customer = require('../models/Customer')(sequelize);
const Product = require('../models/Product')(sequelize);
const ProductLifecycle = require('../models/ProductLifecycle')(sequelize);
const ProductLifecycleHistory = require('../models/ProductLifecycleHistory')(sequelize);
const Sample = require('../models/Sample')(sequelize);
const Attendance = require('../models/Attendance')(sequelize);
const CourierPartner = require('../models/CourierPartner')(sequelize);
const ShipmentTracking = require('../models/ShipmentTracking')(sequelize);
const BillOfMaterials = require('../models/BillOfMaterials')(sequelize);
const GoodsReceiptNote = require('../models/GoodsReceiptNote')(sequelize);
const Notification = require('../models/Notification')(sequelize);
const SalesOrderHistory = require('../models/SalesOrderHistory')(sequelize);
const Approval = require('../models/Approval')(sequelize);
const InventoryMovement = require('../models/InventoryMovement')(sequelize);
const MaterialAllocation = require('../models/MaterialAllocation')(sequelize);
const VendorReturn = require('../models/VendorReturn')(sequelize);

// Define associations
const defineAssociations = () => {
  // User, Role, and Permission associations
  User.belongsToMany(Role, { through: 'user_roles', foreignKey: 'user_id', as: 'roles' });
  Role.belongsToMany(User, { through: 'user_roles', foreignKey: 'role_id', as: 'users' });
  
  Role.belongsToMany(Permission, { through: 'role_permissions', foreignKey: 'role_id', as: 'permissions' });
  Permission.belongsToMany(Role, { through: 'role_permissions', foreignKey: 'permission_id', as: 'roles' });

  // Sales Order associations
  SalesOrder.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
  SalesOrder.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
  SalesOrder.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });
  SalesOrder.belongsTo(User, { foreignKey: 'approval_requested_by', as: 'approvalRequester' });
  SalesOrder.belongsTo(User, { foreignKey: 'ready_for_procurement_by', as: 'procurementReadyMarker' });
  SalesOrder.hasMany(ProductionOrder, { foreignKey: 'sales_order_id', as: 'productionOrders' });
  SalesOrder.hasMany(Challan, { foreignKey: 'order_id', as: 'challans' });
  SalesOrder.hasMany(BillOfMaterials, { foreignKey: 'sales_order_id', as: 'billOfMaterials' });
  SalesOrder.hasMany(SalesOrderHistory, { foreignKey: 'sales_order_id', as: 'history' });

  // Sales Order History associations
  SalesOrderHistory.belongsTo(SalesOrder, { foreignKey: 'sales_order_id', as: 'salesOrder' });
  SalesOrderHistory.belongsTo(User, { foreignKey: 'performed_by', as: 'performedBy' });

  // Purchase Order associations
  PurchaseOrder.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendor' });
  PurchaseOrder.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
  PurchaseOrder.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
  PurchaseOrder.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });
  PurchaseOrder.belongsTo(SalesOrder, { foreignKey: 'linked_sales_order_id', as: 'salesOrder' });
  PurchaseOrder.hasMany(Challan, { foreignKey: 'order_id', as: 'challans' });
  PurchaseOrder.belongsTo(BillOfMaterials, { foreignKey: 'bom_id', as: 'billOfMaterials' });
  PurchaseOrder.hasMany(GoodsReceiptNote, { foreignKey: 'purchase_order_id', as: 'grns' });

  SalesOrder.hasOne(PurchaseOrder, { foreignKey: 'linked_sales_order_id', as: 'linkedPurchaseOrder' });

  // Vendor associations
  Vendor.hasMany(PurchaseOrder, { foreignKey: 'vendor_id', as: 'purchaseOrders' });
  Vendor.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

  // Goods Receipt Note associations
  GoodsReceiptNote.belongsTo(PurchaseOrder, { foreignKey: 'purchase_order_id', as: 'purchaseOrder' });
  GoodsReceiptNote.belongsTo(BillOfMaterials, { foreignKey: 'bill_of_materials_id', as: 'billOfMaterials' });
  GoodsReceiptNote.belongsTo(SalesOrder, { foreignKey: 'sales_order_id', as: 'salesOrder' });
  GoodsReceiptNote.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
  GoodsReceiptNote.belongsTo(User, { foreignKey: 'quality_inspector', as: 'inspector' });
  GoodsReceiptNote.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });
  GoodsReceiptNote.belongsTo(User, { foreignKey: 'verified_by', as: 'verifier' });
  GoodsReceiptNote.belongsTo(User, { foreignKey: 'discrepancy_approved_by', as: 'discrepancyApprover' });
  GoodsReceiptNote.belongsTo(User, { foreignKey: 'vendor_revert_requested_by', as: 'vendorRevertRequester' });

  // Production Order associations
  ProductionOrder.belongsTo(SalesOrder, { foreignKey: 'sales_order_id', as: 'salesOrder' });
  ProductionOrder.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  ProductionOrder.hasMany(ProductionStage, { foreignKey: 'production_order_id', as: 'stages' });
  ProductionOrder.hasMany(Rejection, { foreignKey: 'production_order_id', as: 'rejections' });
  ProductionOrder.hasMany(Challan, { foreignKey: 'order_id', as: 'challans' });

  // Production Stage associations
  ProductionStage.belongsTo(ProductionOrder, { foreignKey: 'production_order_id', as: 'productionOrder' });
  ProductionStage.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignedUser' });

  // Rejection associations
  Rejection.belongsTo(ProductionOrder, { foreignKey: 'production_order_id', as: 'productionOrder' });
  Rejection.belongsTo(User, { foreignKey: 'reported_by', as: 'reporter' });

  // Challan associations
  Challan.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
  Challan.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });
  Challan.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendor' });
  Challan.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

  // Inventory associations
  Inventory.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  Inventory.belongsTo(PurchaseOrder, { foreignKey: 'purchase_order_id', as: 'purchaseOrder' });
  Inventory.hasMany(Challan, { foreignKey: 'inventory_id', as: 'challans' });
  Inventory.hasMany(InventoryMovement, { foreignKey: 'inventory_id', as: 'movements' });

  // Inventory Movement associations
  InventoryMovement.belongsTo(Inventory, { foreignKey: 'inventory_id', as: 'inventory' });
  InventoryMovement.belongsTo(PurchaseOrder, { foreignKey: 'purchase_order_id', as: 'purchaseOrder' });
  InventoryMovement.belongsTo(SalesOrder, { foreignKey: 'sales_order_id', as: 'salesOrder' });
  InventoryMovement.belongsTo(ProductionOrder, { foreignKey: 'production_order_id', as: 'productionOrder' });
  InventoryMovement.belongsTo(User, { foreignKey: 'performed_by', as: 'performer' });

  // Material Allocation associations (Inventory → Manufacturing tracking)
  MaterialAllocation.belongsTo(ProductionOrder, { foreignKey: 'production_order_id', as: 'productionOrder' });
  MaterialAllocation.belongsTo(Inventory, { foreignKey: 'inventory_id', as: 'inventory' });
  MaterialAllocation.belongsTo(User, { foreignKey: 'allocated_by', as: 'allocator' });
  MaterialAllocation.belongsTo(User, { foreignKey: 'returned_by', as: 'returner' });
  MaterialAllocation.belongsTo(ProductionStage, { foreignKey: 'current_stage_id', as: 'currentStage' });
  
  ProductionOrder.hasMany(MaterialAllocation, { foreignKey: 'production_order_id', as: 'materialAllocations' });
  Inventory.hasMany(MaterialAllocation, { foreignKey: 'inventory_id', as: 'allocations' });
  ProductionStage.hasMany(MaterialAllocation, { foreignKey: 'current_stage_id', as: 'allocatedMaterials' });

  // Purchase Order to Inventory
  PurchaseOrder.hasMany(Inventory, { foreignKey: 'purchase_order_id', as: 'inventoryItems' });
  PurchaseOrder.hasMany(InventoryMovement, { foreignKey: 'purchase_order_id', as: 'inventoryMovements' });

  // Shipment associations
  Shipment.belongsTo(SalesOrder, { foreignKey: 'sales_order_id', as: 'salesOrder' });
  Shipment.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
  Shipment.belongsTo(CourierPartner, { foreignKey: 'courier_partner_id', as: 'courierPartner' });
  Shipment.hasMany(ShipmentTracking, { foreignKey: 'shipment_id', as: 'trackingUpdates' });

  // Courier Partner associations
  CourierPartner.hasMany(Shipment, { foreignKey: 'courier_partner_id', as: 'shipments' });

  // Notification associations
  Notification.belongsTo(User, { foreignKey: 'recipient_user_id', as: 'recipient' });
  Notification.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
  Notification.belongsTo(User, { foreignKey: 'actor_id', as: 'actor' });
  Notification.belongsTo(SalesOrder, { foreignKey: 'related_order_id', as: 'relatedOrder' });

  // Approval associations
  Approval.belongsTo(User, { foreignKey: 'assigned_to_user_id', as: 'assignedUser' });
  Approval.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer' });
  Approval.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

  Approval.addHook('beforeValidate', (approval) => {
    if (!approval.entity_type) {
      throw new Error('Approval.entity_type is required');
    }
  });

  // Shipment Tracking associations
  ShipmentTracking.belongsTo(Shipment, { foreignKey: 'shipment_id', as: 'shipment' });
  ShipmentTracking.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

  // Store Stock associations
  StoreStock.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  StoreStock.hasMany(Challan, { foreignKey: 'store_stock_id', as: 'challans' });

  // Invoice associations
  Invoice.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendor' });
  Invoice.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
  Invoice.belongsTo(Challan, { foreignKey: 'challan_id', as: 'challan' });
  Invoice.hasMany(Payment, { foreignKey: 'invoice_id', as: 'payments' });

  // Payment associations
  Payment.belongsTo(Invoice, { foreignKey: 'invoice_id', as: 'invoice' });
  Payment.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

  // Product Lifecycle associations
  ProductLifecycle.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  ProductLifecycle.belongsTo(ProductionOrder, { foreignKey: 'production_order_id', as: 'productionOrder' });
  ProductLifecycle.belongsTo(SalesOrder, { foreignKey: 'sales_order_id', as: 'salesOrder' });
  ProductLifecycle.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
  ProductLifecycle.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
  ProductLifecycle.belongsTo(User, { foreignKey: 'last_updated_by', as: 'lastUpdater' });
  ProductLifecycle.hasMany(ProductLifecycleHistory, { foreignKey: 'product_lifecycle_id', as: 'history' });

  // Product Lifecycle History associations
  ProductLifecycleHistory.belongsTo(ProductLifecycle, { foreignKey: 'product_lifecycle_id', as: 'lifecycle' });
  ProductLifecycleHistory.belongsTo(User, { foreignKey: 'operator_id', as: 'operator' });
  ProductLifecycleHistory.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

  // Sample associations
  Sample.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
  Sample.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  Sample.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
  Sample.hasMany(Challan, { foreignKey: 'sample_id', as: 'challans' });

  // Attendance associations
  Attendance.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Vendor Return associations
  VendorReturn.belongsTo(PurchaseOrder, { foreignKey: 'purchase_order_id', as: 'purchaseOrder' });
  VendorReturn.belongsTo(GoodsReceiptNote, { foreignKey: 'grn_id', as: 'grn' });
  VendorReturn.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendor' });
  VendorReturn.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
  VendorReturn.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });
  
  PurchaseOrder.hasMany(VendorReturn, { foreignKey: 'purchase_order_id', as: 'vendorReturns' });
  GoodsReceiptNote.hasMany(VendorReturn, { foreignKey: 'grn_id', as: 'vendorReturns' });
  Vendor.hasMany(VendorReturn, { foreignKey: 'vendor_id', as: 'returns' });
};

defineAssociations();

const db = {
  sequelize,
  Sequelize,
  User,
  Role,
  Permission,
  SalesOrder,
  PurchaseOrder,
  BillOfMaterials,
  Challan,
  Inventory,
  ProductionOrder,
  ProductionStage,
  Rejection,
  Shipment,
  StoreStock,
  Invoice,
  Payment,
  Vendor,
  Customer,
  Product,
  ProductLifecycle,
  ProductLifecycleHistory,
  Sample,
  Attendance,
  CourierPartner,
  ShipmentTracking,
  GoodsReceiptNote,
  Notification,
  SalesOrderHistory,
  Approval,
  InventoryMovement,
  MaterialAllocation,
  VendorReturn
};

module.exports = db;