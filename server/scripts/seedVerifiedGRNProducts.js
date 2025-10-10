const { sequelize, User, PurchaseOrder, GoodsReceiptNote, Inventory, InventoryMovement, Product } = require('../config/database');

async function seedVerifiedGRNProducts() {
  try {
    console.log('🌱 Starting verified GRN products seeding...\n');

    // Get any user for seeding
    let adminUser = await User.findOne({ where: { email: 'admin@pashion.com' } });
    if (!adminUser) {
      adminUser = await User.findOne({ where: { department: 'Admin' } });
    }
    if (!adminUser) {
      adminUser = await User.findOne(); // Just get any user
    }
    if (!adminUser) {
      console.error('❌ No user found. Please create a user first.');
      process.exit(1);
    }
    console.log(`✅ Using admin user: ${adminUser.email} (ID: ${adminUser.id})\n`);

    // Create a sample Purchase Order
    const po = await PurchaseOrder.create({
      po_number: `PO-${Date.now()}-SEED`,
      vendor_name: 'Premium Fabrics Ltd.',
      customer_name: 'St. Mary\'s School',
      project_name: 'School Uniforms 2025',
      order_date: new Date(),
      expected_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      items: [
        {
          material_name: 'Cotton Fabric - Navy Blue',
          quantity: 500,
          unit: 'meter',
          unit_price: 85.00,
          total_price: 42500.00,
          specifications: { gsm: 180, width: '60 inches', color: 'Navy Blue' }
        },
        {
          material_name: 'Polyester Thread - White',
          quantity: 100,
          unit: 'piece',
          unit_price: 25.00,
          total_price: 2500.00,
          specifications: { type: 'Spun Polyester', strength: '40/2' }
        },
        {
          material_name: 'Brass Buttons - Gold',
          quantity: 1000,
          unit: 'piece',
          unit_price: 5.00,
          total_price: 5000.00,
          specifications: { size: '15mm', finish: 'Polished Gold' }
        },
        {
          material_name: 'YKK Zipper - Black',
          quantity: 200,
          unit: 'piece',
          unit_price: 12.00,
          total_price: 2400.00,
          specifications: { length: '20cm', type: 'Metal', color: 'Black' }
        },
        {
          material_name: 'Elastic Band - White',
          quantity: 300,
          unit: 'meter',
          unit_price: 8.00,
          total_price: 2400.00,
          specifications: { width: '2 inches', type: 'Knitted Elastic' }
        }
      ],
      total_amount: 54800.00,
      status: 'approved',
      materials_source: 'manual',
      created_by: adminUser.id
    });
    console.log(`✅ Created Purchase Order: ${po.po_number} (ID: ${po.id})\n`);

    // Create GRN with all items received
    const grn = await GoodsReceiptNote.create({
      grn_number: `GRN-${Date.now()}-SEED`,
      purchase_order_id: po.id,
      received_date: new Date(),
      supplier_name: 'Premium Fabrics Ltd.',
      supplier_invoice_number: `INV-${Date.now()}`,
      inward_challan_number: `CHAL-${Date.now()}`,
      items_received: [
        {
          material_id: 1,
          material_name: 'Cotton Fabric - Navy Blue',
          ordered_quantity: 500,
          invoiced_quantity: 500,
          received_quantity: 500,
          unit: 'meter',
          unit_price: 85.00,
          total_price: 42500.00,
          quality_status: 'approved',
          remarks: 'Excellent quality, color matching perfect',
          variance_type: 'none'
        },
        {
          material_id: 2,
          material_name: 'Polyester Thread - White',
          ordered_quantity: 100,
          invoiced_quantity: 100,
          received_quantity: 100,
          unit: 'piece',
          unit_price: 25.00,
          total_price: 2500.00,
          quality_status: 'approved',
          remarks: 'Good strength, packaging intact',
          variance_type: 'none'
        },
        {
          material_id: 3,
          material_name: 'Brass Buttons - Gold',
          ordered_quantity: 1000,
          invoiced_quantity: 1000,
          received_quantity: 1000,
          unit: 'piece',
          unit_price: 5.00,
          total_price: 5000.00,
          quality_status: 'approved',
          remarks: 'All buttons polished and uniform',
          variance_type: 'none'
        },
        {
          material_id: 4,
          material_name: 'YKK Zipper - Black',
          ordered_quantity: 200,
          invoiced_quantity: 200,
          received_quantity: 200,
          unit: 'piece',
          unit_price: 12.00,
          total_price: 2400.00,
          quality_status: 'approved',
          remarks: 'Genuine YKK product, quality verified',
          variance_type: 'none'
        },
        {
          material_id: 5,
          material_name: 'Elastic Band - White',
          ordered_quantity: 300,
          invoiced_quantity: 300,
          received_quantity: 300,
          unit: 'meter',
          unit_price: 8.00,
          total_price: 2400.00,
          quality_status: 'approved',
          remarks: 'Good elasticity, width as specified',
          variance_type: 'none'
        }
      ],
      total_received_value: 54800.00,
      status: 'approved',
      verification_status: 'verified',
      verified_by: adminUser.id,
      verification_date: new Date(),
      verification_notes: 'All items received in perfect condition. Quantities match. Quality approved.',
      inventory_added: true,
      inventory_added_date: new Date(),
      created_by: adminUser.id,
      approved_by: adminUser.id,
      approval_date: new Date(),
      inspection_notes: 'Quality inspection completed successfully.',
      quality_inspector: adminUser.id
    });
    console.log(`✅ Created GRN: ${grn.grn_number} (ID: ${grn.id})`);
    console.log(`   Status: ${grn.status} | Verification: ${grn.verification_status}\n`);

    // Add all items to inventory with complete data
    const inventoryItems = [];
    const movementRecords = [];

    for (const [index, item] of grn.items_received.entries()) {
      // Generate barcode
      const barcode = `BAR-${Date.now()}-${index + 1}`;
      
      const inventoryItem = await Inventory.create({
        product_name: item.material_name,
        product_code: `PROD-${Date.now()}-${index + 1}`,
        description: `${item.material_name} - Received via ${grn.grn_number}`,
        category: getCategoryByName(item.material_name),
        product_type: 'raw_material',
        unit_of_measurement: item.unit,
        purchase_order_id: po.id,
        location: 'Main Warehouse - Section A',
        batch_number: `BATCH-${Date.now()}-${index + 1}`,
        current_stock: parseFloat(item.received_quantity),
        initial_quantity: parseFloat(item.received_quantity),
        consumed_quantity: 0,
        reserved_stock: 0,
        available_stock: parseFloat(item.received_quantity),
        minimum_level: getMinimumLevel(item.material_name),
        reorder_level: getReorderLevel(item.material_name),
        unit_cost: parseFloat(item.unit_price),
        total_value: parseFloat(item.total_price),
        cost_price: parseFloat(item.unit_price),
        last_purchase_date: new Date(),
        quality_status: 'approved',
        condition: 'new',
        barcode: barcode,
        stock_type: 'general_extra',
        po_item_index: index,
        notes: item.remarks,
        specifications: getSpecifications(item.material_name),
        is_active: true,
        movement_type: 'inward',
        last_movement_date: new Date(),
        created_by: adminUser.id,
        color: getColor(item.material_name),
        material: getMaterial(item.material_name),
        brand: getBrand(item.material_name)
      });

      inventoryItems.push(inventoryItem);
      console.log(`✅ Added to Inventory: ${inventoryItem.product_name}`);
      console.log(`   Stock: ${inventoryItem.current_stock} ${inventoryItem.unit_of_measurement}`);
      console.log(`   Barcode: ${inventoryItem.barcode}`);
      console.log(`   Location: ${inventoryItem.location}`);
      console.log(`   Value: ₹${inventoryItem.total_value}\n`);

      // Create inventory movement record
      const movement = await InventoryMovement.create({
        inventory_id: inventoryItem.id,
        movement_type: 'inward',
        quantity: parseFloat(item.received_quantity),
        previous_quantity: 0,
        new_quantity: parseFloat(item.received_quantity),
        location_to: 'Main Warehouse - Section A',
        reference_number: grn.grn_number,
        purchase_order_id: po.id,
        unit_cost: parseFloat(item.unit_price),
        total_cost: parseFloat(item.total_price),
        notes: `Initial stock received via GRN ${grn.grn_number}`,
        performed_by: adminUser.id,
        movement_date: new Date()
      });

      movementRecords.push(movement);
    }

    console.log(`\n📦 Summary:`);
    console.log(`   Purchase Order: ${po.po_number} (₹${po.total_amount})`);
    console.log(`   GRN: ${grn.grn_number}`);
    console.log(`   Inventory Items Added: ${inventoryItems.length}`);
    console.log(`   Movement Records Created: ${movementRecords.length}`);
    console.log(`   Total Stock Value: ₹${inventoryItems.reduce((sum, item) => sum + parseFloat(item.total_value), 0)}`);
    console.log(`\n✅ Seed data created successfully!\n`);

    // Display inventory summary
    console.log('📊 Inventory Summary:');
    console.log('─'.repeat(100));
    console.log(
      'Product Name'.padEnd(35),
      'Stock'.padEnd(15),
      'Unit Cost'.padEnd(12),
      'Value'.padEnd(15),
      'Barcode'
    );
    console.log('─'.repeat(100));
    inventoryItems.forEach(item => {
      console.log(
        item.product_name.padEnd(35),
        `${item.current_stock} ${item.unit_of_measurement}`.padEnd(15),
        `₹${item.unit_cost}`.padEnd(12),
        `₹${item.total_value}`.padEnd(15),
        item.barcode
      );
    });
    console.log('─'.repeat(100));

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Helper functions
function getCategoryByName(name) {
  if (name.includes('Fabric') || name.includes('Cotton') || name.includes('Polyester')) return 'fabric';
  if (name.includes('Thread')) return 'thread';
  if (name.includes('Button')) return 'button';
  if (name.includes('Zipper')) return 'zipper';
  if (name.includes('Elastic')) return 'elastic';
  return 'raw_material';
}

function getMinimumLevel(name) {
  if (name.includes('Fabric')) return 100;
  if (name.includes('Thread')) return 20;
  if (name.includes('Button')) return 200;
  if (name.includes('Zipper')) return 50;
  if (name.includes('Elastic')) return 50;
  return 10;
}

function getReorderLevel(name) {
  if (name.includes('Fabric')) return 200;
  if (name.includes('Thread')) return 50;
  if (name.includes('Button')) return 500;
  if (name.includes('Zipper')) return 100;
  if (name.includes('Elastic')) return 100;
  return 20;
}

function getSpecifications(name) {
  if (name.includes('Cotton Fabric')) {
    return { gsm: 180, width: '60 inches', color: 'Navy Blue', composition: '100% Cotton' };
  }
  if (name.includes('Thread')) {
    return { type: 'Spun Polyester', strength: '40/2', color: 'White' };
  }
  if (name.includes('Button')) {
    return { size: '15mm', material: 'Brass', finish: 'Polished Gold' };
  }
  if (name.includes('Zipper')) {
    return { length: '20cm', type: 'Metal', brand: 'YKK', color: 'Black' };
  }
  if (name.includes('Elastic')) {
    return { width: '2 inches', type: 'Knitted Elastic', color: 'White' };
  }
  return {};
}

function getColor(name) {
  if (name.includes('Navy Blue')) return 'Navy Blue';
  if (name.includes('White')) return 'White';
  if (name.includes('Gold')) return 'Gold';
  if (name.includes('Black')) return 'Black';
  return null;
}

function getMaterial(name) {
  if (name.includes('Cotton')) return 'Cotton';
  if (name.includes('Polyester')) return 'Polyester';
  if (name.includes('Brass')) return 'Brass';
  return null;
}

function getBrand(name) {
  if (name.includes('YKK')) return 'YKK';
  return 'Generic';
}

// Run the seed function
seedVerifiedGRNProducts();