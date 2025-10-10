const express = require('express');
const router = express.Router();
const { VendorReturn, PurchaseOrder, GoodsReceiptNote, Vendor, User, Notification } = require('../config/database');
const { authenticateToken, checkDepartment } = require('../middleware/auth');

// Get all vendor returns
router.get('/', authenticateToken, checkDepartment(['procurement', 'inventory', 'admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, vendor_id, return_type } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (vendor_id) whereClause.vendor_id = vendor_id;
    if (return_type) whereClause.return_type = return_type;

    const { count, rows: returns } = await VendorReturn.findAndCountAll({
      where: whereClause,
      include: [
        { 
          model: PurchaseOrder, 
          as: 'purchaseOrder',
          attributes: ['id', 'po_number', 'po_date', 'final_amount']
        },
        { 
          model: GoodsReceiptNote, 
          as: 'grn',
          attributes: ['id', 'grn_number', 'received_date'],
          required: false
        },
        { 
          model: Vendor, 
          as: 'vendor',
          attributes: ['id', 'name', 'email', 'phone']
        },
        { model: User, as: 'creator', attributes: ['id', 'email', 'name'] },
        { model: User, as: 'approver', attributes: ['id', 'email', 'name'], required: false }
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      returns,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching vendor returns:', error);
    res.status(500).json({ message: 'Failed to fetch vendor returns', error: error.message });
  }
});

// Get single vendor return
router.get('/:id', authenticateToken, checkDepartment(['procurement', 'inventory', 'admin']), async (req, res) => {
  try {
    const vendorReturn = await VendorReturn.findByPk(req.params.id, {
      include: [
        { 
          model: PurchaseOrder, 
          as: 'purchaseOrder',
          include: [{ model: Vendor, as: 'vendor' }]
        },
        { 
          model: GoodsReceiptNote, 
          as: 'grn',
          required: false
        },
        { model: Vendor, as: 'vendor' },
        { model: User, as: 'creator', attributes: ['id', 'email', 'name'] },
        { model: User, as: 'approver', attributes: ['id', 'email', 'name'], required: false }
      ]
    });

    if (!vendorReturn) {
      return res.status(404).json({ message: 'Vendor return not found' });
    }

    res.json(vendorReturn);
  } catch (error) {
    console.error('Error fetching vendor return:', error);
    res.status(500).json({ message: 'Failed to fetch vendor return', error: error.message });
  }
});

// Update vendor return status (e.g., vendor acknowledged)
router.patch('/:id/status', authenticateToken, checkDepartment(['procurement', 'admin']), async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();
  
  try {
    const { status, vendor_response, resolution_type, resolution_amount, resolution_notes } = req.body;

    const vendorReturn = await VendorReturn.findByPk(req.params.id, {
      include: [
        { model: PurchaseOrder, as: 'purchaseOrder' },
        { model: Vendor, as: 'vendor' }
      ],
      transaction
    });

    if (!vendorReturn) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Vendor return not found' });
    }

    const updateData = { status };
    
    if (vendor_response) {
      updateData.vendor_response = vendor_response;
      updateData.vendor_response_date = new Date();
    }

    if (status === 'resolved') {
      updateData.resolution_type = resolution_type;
      updateData.resolution_amount = resolution_amount || vendorReturn.total_shortage_value;
      updateData.resolution_date = new Date();
      updateData.resolution_notes = resolution_notes || '';
    }

    await vendorReturn.update(updateData, { transaction });

    // Create notification
    await Notification.create({
      user_id: null,
      type: 'vendor_return_updated',
      title: `Vendor Return ${status.toUpperCase()}`,
      message: `Vendor return ${vendorReturn.return_number} for ${vendorReturn.vendor.name} has been ${status}.`,
      data: { return_id: vendorReturn.id, po_id: vendorReturn.purchase_order_id },
      read: false
    }, { transaction });

    await transaction.commit();

    res.json({
      message: 'Vendor return updated successfully',
      vendor_return: vendorReturn
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating vendor return:', error);
    res.status(500).json({ message: 'Failed to update vendor return', error: error.message });
  }
});

// Manually create vendor return (for quality issues, wrong items, etc.)
router.post('/', authenticateToken, checkDepartment(['procurement', 'inventory', 'admin']), async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();
  
  try {
    const {
      purchase_order_id,
      grn_id,
      return_type,
      items,
      remarks,
      attachments
    } = req.body;

    const po = await PurchaseOrder.findByPk(purchase_order_id, {
      include: [{ model: Vendor, as: 'vendor' }],
      transaction
    });

    if (!po) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Purchase Order not found' });
    }

    // Generate return number
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const lastReturn = await VendorReturn.findOne({
      where: {
        return_number: {
          [require('sequelize').Op.like]: `VR-${dateStr}-%`
        }
      },
      order: [['created_at', 'DESC']],
      transaction
    });

    let sequence = 1;
    if (lastReturn) {
      const lastSequence = parseInt(lastReturn.return_number.split('-')[2]);
      sequence = lastSequence + 1;
    }
    const returnNumber = `VR-${dateStr}-${sequence.toString().padStart(5, '0')}`;

    // Calculate total value
    const totalValue = items.reduce((sum, item) => 
      sum + ((item.shortage_qty || item.return_qty || 0) * (item.rate || 0)), 0
    );

    const vendorReturn = await VendorReturn.create({
      return_number: returnNumber,
      purchase_order_id,
      grn_id: grn_id || null,
      vendor_id: po.vendor_id,
      return_type,
      return_date: new Date(),
      items,
      total_shortage_value: totalValue,
      status: 'pending',
      created_by: req.user.id,
      remarks: remarks || '',
      attachments: attachments || []
    }, { transaction });

    // Create notification
    await Notification.create({
      user_id: null,
      type: 'vendor_return_created',
      title: 'New Vendor Return Created',
      message: `Vendor return ${returnNumber} created for ${po.vendor.name}. Reason: ${return_type}. Total value: ₹${totalValue.toFixed(2)}`,
      data: { return_id: vendorReturn.id, po_id: po.id },
      read: false
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      message: 'Vendor return created successfully',
      vendor_return: vendorReturn
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating vendor return:', error);
    res.status(500).json({ message: 'Failed to create vendor return', error: error.message });
  }
});

module.exports = router;