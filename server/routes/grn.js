const express = require('express');
const router = express.Router();
const { GoodsReceiptNote, PurchaseOrder, BillOfMaterials, SalesOrder, Inventory, InventoryMovement, Product, User, Vendor, Customer, Notification, VendorReturn } = require('../config/database');
const { authenticateToken, checkDepartment } = require('../middleware/auth');

// Get all GRNs
router.get('/', authenticateToken, checkDepartment(['procurement', 'inventory', 'admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, verification_status, po_id } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (verification_status) whereClause.verification_status = verification_status;
    if (po_id) whereClause.purchase_order_id = po_id;

    const { count, rows: grns } = await GoodsReceiptNote.findAndCountAll({
      where: whereClause,
      include: [
        { 
          model: PurchaseOrder, 
          as: 'purchaseOrder', 
          include: [
            { model: Vendor, as: 'vendor' },
            { model: Customer, as: 'customer' }
          ] 
        },
        { model: BillOfMaterials, as: 'billOfMaterials', required: false },
        { 
          model: SalesOrder, 
          as: 'salesOrder', 
          required: false,
          include: [{ model: Customer, as: 'customer' }] 
        },
        { model: User, as: 'creator', attributes: ['id', 'username', 'name'] },
        { model: User, as: 'inspector', attributes: ['id', 'username', 'name'], required: false },
        { model: User, as: 'approver', attributes: ['id', 'username', 'name'], required: false }
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      grns,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching GRNs:', error);
    res.status(500).json({ message: 'Failed to fetch GRNs', error: error.message });
  }
});

// Get single GRN
router.get('/:id', authenticateToken, checkDepartment(['procurement', 'inventory', 'admin']), async (req, res) => {
  try {
    const grn = await GoodsReceiptNote.findByPk(req.params.id, {
      include: [
        { 
          model: PurchaseOrder, 
          as: 'purchaseOrder', 
          include: [
            { model: Vendor, as: 'vendor' },
            { model: Customer, as: 'customer' }
          ] 
        },
        { model: BillOfMaterials, as: 'billOfMaterials', required: false },
        { 
          model: SalesOrder, 
          as: 'salesOrder', 
          required: false,
          include: [{ model: Customer, as: 'customer' }] 
        },
        { model: User, as: 'creator', attributes: ['id', 'username', 'name'] },
        { model: User, as: 'inspector', attributes: ['id', 'username', 'name'], required: false },
        { model: User, as: 'approver', attributes: ['id', 'username', 'name'], required: false }
      ]
    });

    if (!grn) {
      return res.status(404).json({ message: 'GRN not found' });
    }

    res.json(grn);
  } catch (error) {
    console.error('Error fetching GRN:', error);
    res.status(500).json({ message: 'Failed to fetch GRN', error: error.message });
  }
});

// Get PO data for GRN creation form
router.get('/create/:poId', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  try {
    const { poId } = req.params;

    const po = await PurchaseOrder.findByPk(poId, {
      include: [
        { model: Vendor, as: 'vendor' },
        { model: Customer, as: 'customer', required: false },
        { model: SalesOrder, as: 'salesOrder', required: false },
        { model: BillOfMaterials, as: 'billOfMaterials', required: false }
      ]
    });

    if (!po) {
      return res.status(404).json({ message: 'Purchase Order not found' });
    }

    // Check if PO status allows GRN creation
    if (po.status !== 'grn_approved' && po.status !== 'sent') {
      return res.status(400).json({
        message: 'GRN creation not allowed for this PO. Status must be approved or GRN approved.'
      });
    }

    // Check if GRN already exists
    const existingGRN = await GoodsReceiptNote.findOne({
      where: { purchase_order_id: poId }
    });

    if (existingGRN) {
      return res.status(400).json({
        message: 'GRN already exists for this Purchase Order',
        grn_id: existingGRN.id
      });
    }

    // Format PO data for GRN form
    const grnData = {
      po_id: po.id,
      po_number: po.po_number,
      project_name: po.project_name,
      customer: po.customer ? {
        id: po.customer.id,
        name: po.customer.name
      } : null,
      vendor: {
        id: po.vendor.id,
        name: po.vendor.name
      },
      order_date: po.order_date,
      expected_delivery_date: po.expected_delivery_date,
      items: (po.items || []).map((item, index) => ({
        item_index: index,
        product_id: item.product_id,
        product_name: item.product_name,
        product_code: item.product_code,
        ordered_qty: item.quantity,
        unit: item.unit,
        rate: item.rate,
        amount: item.amount,
        received_qty: 0, // To be filled
        weight: 0, // To be filled
        remarks: '' // To be filled
      }))
    };

    res.json(grnData);
  } catch (error) {
    console.error('Error fetching PO for GRN creation:', error);
    res.status(500).json({ message: 'Failed to fetch PO data', error: error.message });
  }
});

// Create GRN from Purchase Order
router.post('/from-po/:poId', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();
  
  try {
    const { poId } = req.params;
    const {
      received_date,
      inward_challan_number,
      supplier_invoice_number,
      items_received, // Array: [{ item_index, ordered_qty, invoiced_qty, received_qty, weight, remarks }]
      remarks,
      attachments
    } = req.body;

    // Get PO with vendor details
    const po = await PurchaseOrder.findByPk(poId, {
      include: [
        { model: Vendor, as: 'vendor' },
        { model: Customer, as: 'customer' },
        { model: SalesOrder, as: 'salesOrder' }
      ]
    });

    if (!po) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Purchase Order not found' });
    }

    // Generate GRN number: GRN-YYYYMMDD-XXXXX
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const lastGRN = await GoodsReceiptNote.findOne({
      where: {
        grn_number: {
          [require('sequelize').Op.like]: `GRN-${dateStr}-%`
        }
      },
      order: [['created_at', 'DESC']],
      transaction
    });

    let sequence = 1;
    if (lastGRN) {
      const lastSequence = parseInt(lastGRN.grn_number.split('-')[2]);
      sequence = lastSequence + 1;
    }
    const grnNumber = `GRN-${dateStr}-${sequence.toString().padStart(5, '0')}`;

    // Map items from PO with received quantities
    const poItems = po.items || [];
    const mappedItems = items_received.map(receivedItem => {
      const poItem = poItems[receivedItem.item_index];
      const orderedQty = parseFloat(poItem.quantity);
      const invoicedQty = receivedItem.invoiced_qty ? parseFloat(receivedItem.invoiced_qty) : orderedQty;
      const receivedQty = parseFloat(receivedItem.received_qty);
      
      // Detect discrepancies
      const hasShortage = receivedQty < Math.min(orderedQty, invoicedQty);
      const hasOverage = receivedQty > Math.max(orderedQty, invoicedQty);
      const invoiceVsOrderMismatch = invoicedQty !== orderedQty;
      
      return {
        material_name: poItem.type === 'fabric' ? poItem.fabric_name : poItem.item_name,
        color: poItem.color || '',
        hsn: poItem.hsn || '',
        gsm: poItem.gsm || '',
        width: poItem.width || '',
        description: poItem.description || '',
        uom: poItem.uom || 'Meters',
        ordered_quantity: orderedQty,
        invoiced_quantity: invoicedQty,
        received_quantity: receivedQty,
        shortage_quantity: hasShortage ? (Math.min(orderedQty, invoicedQty) - receivedQty) : 0,
        overage_quantity: hasOverage ? (receivedQty - Math.max(orderedQty, invoicedQty)) : 0,
        weight: receivedItem.weight ? parseFloat(receivedItem.weight) : null,
        rate: parseFloat(poItem.rate) || 0,
        total: receivedQty * (parseFloat(poItem.rate) || 0),
        quality_status: 'pending_inspection',
        discrepancy_flag: hasShortage || hasOverage || invoiceVsOrderMismatch,
        remarks: receivedItem.remarks || ''
      };
    });

    // Calculate total received value
    const totalReceivedValue = mappedItems.reduce((sum, item) => sum + item.total, 0);

    // Create GRN
    const grn = await GoodsReceiptNote.create({
      grn_number: grnNumber,
      purchase_order_id: po.id,
      bill_of_materials_id: null, // Optional
      sales_order_id: po.linked_sales_order_id || null, // Optional
      received_date: received_date || new Date(),
      supplier_name: po.vendor.name,
      supplier_invoice_number: supplier_invoice_number || null,
      inward_challan_number: inward_challan_number || null,
      items_received: mappedItems,
      total_received_value: totalReceivedValue,
      status: 'received',
      verification_status: 'pending',
      remarks: remarks || '',
      attachments: attachments || [],
      created_by: req.user.id,
      inventory_added: false
    }, { transaction });

    // Update PO status
    await po.update({
      status: 'received', // Material received, pending verification
      received_date: received_date || new Date()
    }, { transaction });

    // Check for shortages and create vendor return request if needed
    const shortageItems = mappedItems.filter(item => item.shortage_quantity > 0);
    let vendorReturn = null;
    
    if (shortageItems.length > 0) {
      // Generate return number: VR-YYYYMMDD-XXXXX
      const returnDateStr = today.toISOString().split('T')[0].replace(/-/g, '');
      const lastReturn = await VendorReturn.findOne({
        where: {
          return_number: {
            [require('sequelize').Op.like]: `VR-${returnDateStr}-%`
          }
        },
        order: [['created_at', 'DESC']],
        transaction
      });

      let returnSequence = 1;
      if (lastReturn) {
        const lastReturnSequence = parseInt(lastReturn.return_number.split('-')[2]);
        returnSequence = lastReturnSequence + 1;
      }
      const returnNumber = `VR-${returnDateStr}-${returnSequence.toString().padStart(5, '0')}`;

      // Calculate total shortage value
      const totalShortageValue = shortageItems.reduce((sum, item) => 
        sum + (item.shortage_quantity * item.rate), 0
      );

      // Create vendor return request
      vendorReturn = await VendorReturn.create({
        return_number: returnNumber,
        purchase_order_id: po.id,
        grn_id: grn.id,
        vendor_id: po.vendor_id,
        return_type: 'shortage',
        return_date: new Date(),
        items: shortageItems.map(item => ({
          material_name: item.material_name,
          color: item.color,
          uom: item.uom,
          ordered_qty: item.ordered_quantity,
          invoiced_qty: item.invoiced_quantity,
          received_qty: item.received_quantity,
          shortage_qty: item.shortage_quantity,
          rate: item.rate,
          shortage_value: item.shortage_quantity * item.rate,
          reason: 'Quantity mismatch - shortage detected during GRN',
          remarks: item.remarks
        })),
        total_shortage_value: totalShortageValue,
        status: 'pending',
        created_by: req.user.id,
        remarks: `Auto-generated from GRN ${grnNumber}. Shortage detected in ${shortageItems.length} item(s).`
      }, { transaction });

      // Create notification for procurement team about shortage
      await Notification.create({
        user_id: null,
        type: 'vendor_shortage',
        title: 'Vendor Shortage Detected',
        message: `Shortage detected in GRN ${grnNumber} for PO ${po.po_number}. Vendor return request ${returnNumber} created. Total shortage value: ₹${totalShortageValue.toFixed(2)}`,
        data: { grn_id: grn.id, po_id: po.id, return_id: vendorReturn.id },
        read: false
      }, { transaction });
    }

    // Create notification for verification team
    await Notification.create({
      user_id: null, // Send to inventory/QC department
      type: 'grn_verification',
      title: 'New GRN Pending Verification',
      message: `GRN ${grnNumber} created for PO ${po.po_number}. Please verify received materials.${shortageItems.length > 0 ? ' ⚠️ Shortages detected!' : ''}`,
      data: { grn_id: grn.id, po_id: po.id },
      read: false
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      message: shortageItems.length > 0 
        ? `GRN created with ${shortageItems.length} shortage(s). Vendor return request auto-generated.`
        : 'GRN created successfully. Pending verification.',
      grn,
      vendor_return: vendorReturn,
      has_shortages: shortageItems.length > 0,
      shortage_count: shortageItems.length,
      next_step: 'verification'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating GRN from PO:', error);
    res.status(500).json({ message: 'Failed to create GRN', error: error.message });
  }
});

// Verify GRN (Quality Check)
router.post('/:id/verify', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();
  
  try {
    const {
      verification_status, // 'verified' or 'discrepancy'
      verification_notes,
      discrepancy_details // { qty_mismatch: bool, weight_mismatch: bool, quality_issue: bool, details: string }
    } = req.body;

    const grn = await GoodsReceiptNote.findByPk(req.params.id, {
      include: [{ model: PurchaseOrder, as: 'purchaseOrder' }],
      transaction
    });

    if (!grn) {
      await transaction.rollback();
      return res.status(404).json({ message: 'GRN not found' });
    }

    if (grn.verification_status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({ message: `GRN already ${grn.verification_status}` });
    }

    // Update GRN with verification details
    await grn.update({
      verification_status,
      verified_by: req.user.id,
      verification_date: new Date(),
      verification_notes: verification_notes || '',
      discrepancy_details: verification_status === 'discrepancy' ? discrepancy_details : null,
      status: verification_status === 'verified' ? 'inspected' : 'received'
    }, { transaction });

    let nextStep = '';
    let notificationMessage = '';

    if (verification_status === 'verified') {
      // No issues - ready to add to inventory
      nextStep = 'add_to_inventory';
      notificationMessage = `GRN ${grn.grn_number} verified successfully. Ready to add to inventory.`;
    } else {
      // Has discrepancies - needs approval
      nextStep = 'discrepancy_approval';
      notificationMessage = `GRN ${grn.grn_number} has discrepancies. Requires manager approval.`;
    }

    // Create notification
    await Notification.create({
      user_id: null, // Send to procurement/inventory managers
      type: nextStep === 'add_to_inventory' ? 'grn_verified' : 'grn_discrepancy',
      title: verification_status === 'verified' ? 'GRN Verified' : 'GRN Discrepancy Found',
      message: notificationMessage,
      data: { grn_id: grn.id, po_id: grn.purchase_order_id },
      read: false
    }, { transaction });

    await transaction.commit();

    res.json({
      message: 'GRN verification completed',
      grn,
      next_step: nextStep
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error verifying GRN:', error);
    res.status(500).json({ message: 'Failed to verify GRN', error: error.message });
  }
});

// Approve Discrepancy
router.post('/:id/approve-discrepancy', authenticateToken, checkDepartment(['procurement', 'admin']), async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();
  
  try {
    const { approval_notes, decision } = req.body; // decision: 'approve' or 'reject'

    const grn = await GoodsReceiptNote.findByPk(req.params.id, {
      include: [{ model: PurchaseOrder, as: 'purchaseOrder' }],
      transaction
    });

    if (!grn) {
      await transaction.rollback();
      return res.status(404).json({ message: 'GRN not found' });
    }

    if (grn.verification_status !== 'discrepancy') {
      await transaction.rollback();
      return res.status(400).json({ message: 'GRN does not have discrepancy status' });
    }

    const newStatus = decision === 'approve' ? 'approved' : 'rejected';

    await grn.update({
      verification_status: newStatus,
      discrepancy_approved_by: req.user.id,
      discrepancy_approval_date: new Date(),
      discrepancy_approval_notes: approval_notes || '',
      status: newStatus
    }, { transaction });

    // Create notification
    await Notification.create({
      user_id: null,
      type: 'grn_discrepancy_resolved',
      title: `GRN Discrepancy ${decision === 'approve' ? 'Approved' : 'Rejected'}`,
      message: `GRN ${grn.grn_number} discrepancy has been ${decision}d. ${decision === 'approve' ? 'Ready to add to inventory.' : 'Rejected by manager.'}`,
      data: { grn_id: grn.id, po_id: grn.purchase_order_id },
      read: false
    }, { transaction });

    await transaction.commit();

    res.json({
      message: `Discrepancy ${decision}d successfully`,
      grn,
      next_step: decision === 'approve' ? 'add_to_inventory' : 'completed'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error approving discrepancy:', error);
    res.status(500).json({ message: 'Failed to approve discrepancy', error: error.message });
  }
});

// Add GRN to Inventory (Final Step)
router.post('/:id/add-to-inventory', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();
  
  try {
    const { location = 'Main Warehouse' } = req.body;

    const grn = await GoodsReceiptNote.findByPk(req.params.id, {
      include: [
        { model: PurchaseOrder, as: 'purchaseOrder' },
        { model: SalesOrder, as: 'salesOrder' }
      ],
      transaction
    });

    if (!grn) {
      await transaction.rollback();
      return res.status(404).json({ message: 'GRN not found' });
    }

    // Check if verification is complete
    if (!['verified', 'approved'].includes(grn.verification_status)) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: `Cannot add to inventory. GRN verification status is '${grn.verification_status}'. Must be verified or approved.` 
      });
    }

    if (grn.inventory_added) {
      await transaction.rollback();
      return res.status(400).json({ message: 'GRN already added to inventory' });
    }

    const createdInventoryItems = [];
    const createdMovements = [];
    const items = grn.items_received || [];

    // Process each item
    for (const item of items) {
      if (!item.received_quantity || parseFloat(item.received_quantity) <= 0) {
        continue;
      }

      // Try to find or create product
      let product = null;
      const productName = item.material_name;
      
      if (productName) {
        product = await Product.findOne({
          where: { name: productName },
          transaction
        });

        if (!product) {
          product = await Product.create({
            name: productName,
            description: item.description || '',
            category: item.color ? 'Fabric' : 'Accessory',
            sku: `PRD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            unit_price: item.rate || 0,
            cost_price: item.rate || 0,
            stock_quantity: 0,
            reorder_level: 10,
            status: 'active'
          }, { transaction });
        }
      }

      // Generate barcode: INV-YYYYMMDD-XXXXX
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
      const lastInv = await Inventory.findOne({
        where: {
          barcode: {
            [require('sequelize').Op.like]: `INV-${dateStr}-%`
          }
        },
        order: [['created_at', 'DESC']],
        transaction
      });

      let invSequence = 1;
      if (lastInv && lastInv.barcode) {
        const lastSeq = parseInt(lastInv.barcode.split('-')[2]);
        invSequence = lastSeq + 1;
      }
      const barcode = `INV-${dateStr}-${invSequence.toString().padStart(5, '0')}`;

      // Create inventory entry
      const inventoryItem = await Inventory.create({
        product_id: product ? product.id : null,
        name: productName || 'Unknown Material',
        description: item.description || '',
        category: item.color ? 'Fabric' : 'Accessory',
        quantity: item.received_quantity,
        unit: item.uom || 'Meters',
        unit_price: item.rate || 0,
        total_value: item.total || 0,
        location: location,
        barcode: barcode,
        qr_code: JSON.stringify({
          barcode,
          name: productName,
          grn: grn.grn_number,
          po: grn.purchaseOrder.po_number,
          quantity: item.received_quantity,
          date: new Date().toISOString()
        }),
        status: 'available',
        source: 'purchase_order',
        purchase_order_id: grn.purchase_order_id,
        sales_order_id: grn.sales_order_id,
        // Fabric-specific fields
        color: item.color || null,
        gsm: item.gsm || null,
        width: item.width || null,
        hsn_code: item.hsn || null
      }, { transaction });

      createdInventoryItems.push(inventoryItem);

      // Create inventory movement record
      const movement = await InventoryMovement.create({
        inventory_id: inventoryItem.id,
        product_id: product ? product.id : null,
        type: 'inward',
        quantity: item.received_quantity,
        unit: item.uom || 'Meters',
        from_location: grn.supplier_name,
        to_location: location,
        reference_type: 'grn',
        reference_id: grn.id,
        reference_number: grn.grn_number,
        performed_by: req.user.id,
        notes: `Added from GRN: ${grn.grn_number}, PO: ${grn.purchaseOrder.po_number}`,
        balance_after: item.received_quantity
      }, { transaction });

      createdMovements.push(movement);
    }

    // Update GRN
    await grn.update({
      inventory_added: true,
      inventory_added_date: new Date(),
      status: 'approved' // Final status
    }, { transaction });

    // Update PO status
    await grn.purchaseOrder.update({
      status: 'completed',
      inventory_updated: true
    }, { transaction });

    // Create notification
    await Notification.create({
      user_id: null,
      type: 'inventory_updated',
      title: 'Materials Added to Inventory',
      message: `${createdInventoryItems.length} items from GRN ${grn.grn_number} added to inventory successfully.`,
      data: { 
        grn_id: grn.id, 
        po_id: grn.purchase_order_id,
        inventory_count: createdInventoryItems.length 
      },
      read: false
    }, { transaction });

    await transaction.commit();

    res.json({
      message: 'GRN successfully added to inventory',
      grn,
      inventory_items: createdInventoryItems,
      movements: createdMovements
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error adding GRN to inventory:', error);
    res.status(500).json({ message: 'Failed to add GRN to inventory', error: error.message });
  }
});

// Old endpoints - kept for backward compatibility but marked as deprecated
router.post('/', authenticateToken, checkDepartment(['procurement', 'admin']), async (req, res) => {
  res.status(400).json({ 
    message: 'Deprecated: Use POST /grn/from-po/:poId instead',
    new_endpoint: '/api/grn/from-po/:poId'
  });
});

router.put('/:id/inspect', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  res.status(400).json({ 
    message: 'Deprecated: Use POST /grn/:id/verify instead',
    new_endpoint: '/api/grn/:id/verify'
  });
});

router.put('/:id/approve', authenticateToken, checkDepartment(['procurement', 'admin']), async (req, res) => {
  res.status(400).json({ 
    message: 'Deprecated: Use POST /grn/:id/add-to-inventory instead',
    new_endpoint: '/api/grn/:id/add-to-inventory'
  });
});

// Update draft GRN with actual received quantities (for auto-created GRNs)
router.put('/:id/update-received', authenticateToken, checkDepartment(['inventory', 'admin']), async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();

  try {
    const {
      received_date,
      inward_challan_number,
      supplier_invoice_number,
      items_received, // Array: [{ item_index, ordered_qty, invoiced_qty, received_qty, weight, remarks }]
      remarks,
      attachments
    } = req.body;

    const grn = await GoodsReceiptNote.findByPk(req.params.id, {
      include: [{ model: PurchaseOrder, as: 'purchaseOrder' }],
      transaction
    });

    if (!grn) {
      await transaction.rollback();
      return res.status(404).json({ message: 'GRN not found' });
    }

    if (grn.status !== 'draft') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Only draft GRNs can be updated with received quantities' });
    }

    // Map items from request to GRN format with actual received quantities
    const poItems = grn.purchaseOrder.items || [];
    const mappedItems = items_received.map(receivedItem => {
      const poItem = poItems[receivedItem.item_index];
      const orderedQty = parseFloat(poItem.quantity);
      const invoicedQty = receivedItem.invoiced_qty ? parseFloat(receivedItem.invoiced_qty) : orderedQty;
      const receivedQty = parseFloat(receivedItem.received_qty);

      // Detect discrepancies
      const hasShortage = receivedQty < Math.min(orderedQty, invoicedQty);
      const hasOverage = receivedQty > Math.max(orderedQty, invoicedQty);
      const invoiceVsOrderMismatch = invoicedQty !== orderedQty;

      return {
        material_name: poItem.type === 'fabric' ? poItem.fabric_name : poItem.item_name,
        color: poItem.color || '',
        hsn: poItem.hsn || '',
        gsm: poItem.gsm || '',
        width: poItem.width || '',
        description: poItem.description || '',
        uom: poItem.uom || 'Meters',
        ordered_quantity: orderedQty,
        invoiced_quantity: invoicedQty,
        received_quantity: receivedQty,
        shortage_quantity: hasShortage ? (Math.min(orderedQty, invoicedQty) - receivedQty) : 0,
        overage_quantity: hasOverage ? (receivedQty - Math.max(orderedQty, invoicedQty)) : 0,
        weight: receivedItem.weight ? parseFloat(receivedItem.weight) : null,
        rate: parseFloat(poItem.rate) || 0,
        total: receivedQty * (parseFloat(poItem.rate) || 0),
        quality_status: 'pending_inspection',
        discrepancy_flag: hasShortage || hasOverage || invoiceVsOrderMismatch,
        remarks: receivedItem.remarks || ''
      };
    });

    // Calculate total received value
    const totalReceivedValue = mappedItems.reduce((sum, item) => sum + item.total, 0);

    // Update GRN
    await grn.update({
      received_date: received_date || new Date(),
      supplier_invoice_number: supplier_invoice_number || null,
      inward_challan_number: inward_challan_number || null,
      items_received: mappedItems,
      total_received_value: totalReceivedValue,
      status: 'received', // Now ready for verification
      remarks: remarks || grn.remarks,
      attachments: attachments || grn.attachments
    }, { transaction });

    // Update PO status
    await grn.purchaseOrder.update({
      status: 'received',
      received_date: received_date || new Date()
    }, { transaction });

    // Check for shortages and create vendor return request if needed
    const shortageItems = mappedItems.filter(item => item.shortage_quantity > 0);
    let vendorReturn = null;

    if (shortageItems.length > 0) {
      // Generate return number: VR-YYYYMMDD-XXXXX
      const today = new Date();
      const returnDateStr = today.toISOString().split('T')[0].replace(/-/g, '');
      const lastReturn = await VendorReturn.findOne({
        where: {
          return_number: {
            [require('sequelize').Op.like]: `VR-${returnDateStr}-%`
          }
        },
        order: [['created_at', 'DESC']],
        transaction
      });

      let returnSequence = 1;
      if (lastReturn) {
        const lastReturnSequence = parseInt(lastReturn.return_number.split('-')[2]);
        returnSequence = lastReturnSequence + 1;
      }
      const returnNumber = `VR-${returnDateStr}-${returnSequence.toString().padStart(5, '0')}`;

      // Calculate total shortage value
      const totalShortageValue = shortageItems.reduce((sum, item) =>
        sum + (item.shortage_quantity * item.rate), 0
      );

      // Create vendor return request
      vendorReturn = await VendorReturn.create({
        return_number: returnNumber,
        purchase_order_id: grn.purchase_order_id,
        grn_id: grn.id,
        vendor_id: grn.purchaseOrder.vendor_id,
        return_type: 'shortage',
        return_date: new Date(),
        items: shortageItems.map(item => ({
          material_name: item.material_name,
          color: item.color,
          uom: item.uom,
          ordered_qty: item.ordered_quantity,
          invoiced_qty: item.invoiced_quantity,
          received_qty: item.received_quantity,
          shortage_qty: item.shortage_quantity,
          rate: item.rate,
          shortage_value: item.shortage_quantity * item.rate,
          reason: 'Quantity mismatch - shortage detected during GRN',
          remarks: item.remarks
        })),
        total_shortage_value: totalShortageValue,
        status: 'pending',
        created_by: req.user.id,
        remarks: `Auto-generated from GRN ${grn.grn_number}. Shortage detected in ${shortageItems.length} item(s).`
      }, { transaction });

      // Create notification for procurement team about shortage
      await Notification.create({
        user_id: null,
        type: 'vendor_shortage',
        title: 'Vendor Shortage Detected',
        message: `Shortage detected in GRN ${grn.grn_number} for PO ${grn.purchaseOrder.po_number}. Vendor return request ${returnNumber} created. Total shortage value: ₹${totalShortageValue.toFixed(2)}`,
        data: { grn_id: grn.id, po_id: grn.purchase_order_id, return_id: vendorReturn.id },
        read: false
      }, { transaction });
    }

    // Create notification for verification team
    await Notification.create({
      user_id: null, // Send to inventory/QC department
      type: 'grn_verification',
      title: 'GRN Ready for Verification',
      message: `GRN ${grn.grn_number} updated with received quantities. Please verify materials.${shortageItems.length > 0 ? ' ⚠️ Shortages detected!' : ''}`,
      data: { grn_id: grn.id, po_id: grn.purchase_order_id },
      read: false
    }, { transaction });

    await transaction.commit();

    res.json({
      message: shortageItems.length > 0
        ? `GRN updated with ${shortageItems.length} shortage(s). Vendor return request auto-generated. Ready for verification.`
        : 'GRN updated successfully. Ready for verification.',
      grn,
      vendor_return: vendorReturn,
      has_shortages: shortageItems.length > 0,
      shortage_count: shortageItems.length,
      next_step: 'verification'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating GRN received quantities:', error);
    res.status(500).json({ message: 'Failed to update GRN', error: error.message });
  }
});

// Delete GRN (Admin only)
router.delete('/:id', authenticateToken, checkDepartment(['admin']), async (req, res) => {
  try {
    const grn = await GoodsReceiptNote.findByPk(req.params.id);
    if (!grn) {
      return res.status(404).json({ message: 'GRN not found' });
    }

    if (grn.inventory_added) {
      return res.status(400).json({ message: 'Cannot delete GRN that has been added to inventory' });
    }

    await grn.destroy();
    res.json({ message: 'GRN deleted successfully' });
  } catch (error) {
    console.error('Error deleting GRN:', error);
    res.status(500).json({ message: 'Failed to delete GRN', error: error.message });
  }
});

module.exports = router;