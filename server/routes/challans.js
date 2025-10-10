const express = require('express');
const { Challan, User, Vendor, Customer, Product, SalesOrder, PurchaseOrder } = require('../config/database');
const { authenticateToken, checkDepartment } = require('../middleware/auth');
const NotificationService = require('../utils/notificationService');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Generate challan number
const generateChallanNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  const lastChallan = await Challan.findOne({
    where: {
      challan_number: {
        [require('sequelize').Op.like]: `CHN-${dateStr}-%`
      }
    },
    order: [['created_at', 'DESC']]
  });

  let sequence = 1;
  if (lastChallan) {
    const lastSequence = parseInt(lastChallan.challan_number.split('-')[2]);
    sequence = lastSequence + 1;
  }

  return `CHN-${dateStr}-${sequence.toString().padStart(4, '0')}`;
};

// Generate QR code
const generateQRCode = async (data) => {
  try {
    return await QRCode.toDataURL(JSON.stringify(data));
  } catch (error) {
    console.error('QR Code generation error:', error);
    return null;
  }
};

// Get all challans with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      status,
      department,
      vendor_id,
      customer_id,
      date_from,
      date_to,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (type) where.type = type;
    if (status) where.status = status;
    if (department) where.department = department;
    if (vendor_id) where.vendor_id = vendor_id;
    if (customer_id) where.customer_id = customer_id;

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at[require('sequelize').Op.gte] = new Date(date_from);
      if (date_to) where.created_at[require('sequelize').Op.lte] = new Date(date_to + ' 23:59:59');
    }

    if (search) {
      where[require('sequelize').Op.or] = [
        { challan_number: { [require('sequelize').Op.like]: `%${search}%` } },
        { notes: { [require('sequelize').Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Challan.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'employee_id'] },
        { model: User, as: 'approver', attributes: ['id', 'name', 'employee_id'] },
        { model: Vendor, as: 'vendor', attributes: ['id', 'name', 'vendor_code'] },
        { model: Customer, as: 'customer', attributes: ['id', 'name', 'customer_code'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      challans: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Challans fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch challans' });
  }
});

// Get challan by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const challan = await Challan.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'employee_id'] },
        { model: User, as: 'approver', attributes: ['id', 'name', 'employee_id'] },
        { model: Vendor, as: 'vendor' },
        { model: Customer, as: 'customer' }
      ]
    });

    if (!challan) {
      return res.status(404).json({ message: 'Challan not found' });
    }

    res.json({ challan });
  } catch (error) {
    console.error('Challan fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch challan' });
  }
});

// Create new challan
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      type,
      sub_type,
      order_id,
      order_type,
      vendor_id,
      customer_id,
      items,
      notes,
      expected_date,
      location_from,
      location_to,
      transport_details,
      priority = 'medium'
    } = req.body;

    // Validate required fields
    if (!type || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Type and items are required' });
    }

    // Calculate totals
    const total_quantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const total_amount = items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.rate || 0)), 0);

    // Generate challan number and QR code
    const challan_number = await generateChallanNumber();
    const qr_data = {
      challan_number,
      type,
      total_quantity,
      total_amount,
      created_at: new Date()
    };
    const qr_code = await generateQRCode(qr_data);

    const challan = await Challan.create({
      challan_number,
      type,
      sub_type,
      order_id,
      order_type,
      vendor_id,
      customer_id,
      items,
      total_quantity,
      total_amount,
      notes,
      expected_date,
      location_from,
      location_to,
      transport_details,
      priority,
      qr_code,
      barcode: challan_number, // Using challan number as barcode for simplicity
      department: req.user.department,
      created_by: req.user.id,
      status: 'draft'
    });

    // Send notification
    await NotificationService.notifyChallanAction('created', challan, req.user.id);

    res.status(201).json({
      message: 'Challan created successfully',
      challan: {
        id: challan.id,
        challan_number: challan.challan_number,
        type: challan.type,
        status: challan.status,
        total_quantity: challan.total_quantity,
        total_amount: challan.total_amount
      }
    });
  } catch (error) {
    console.error('Challan creation error:', error);
    res.status(500).json({ message: 'Failed to create challan' });
  }
});

// Update challan
router.put('/:id', authenticateToken, checkDepartment('admin'), async (req, res) => {
  try {
    const challan = await Challan.findByPk(req.params.id);
    
    if (!challan) {
      return res.status(404).json({ message: 'Challan not found' });
    }

    // Only allow updates if challan is in draft or pending status
    if (!['draft', 'pending'].includes(challan.status)) {
      return res.status(400).json({ message: 'Cannot update challan in current status' });
    }

    const {
      items,
      notes,
      expected_date,
      location_from,
      location_to,
      transport_details,
      priority
    } = req.body;

    const updateData = {};
    
    if (items) {
      updateData.items = items;
      updateData.total_quantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      updateData.total_amount = items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.rate || 0)), 0);
    }

    if (notes !== undefined) updateData.notes = notes;
    if (expected_date) updateData.expected_date = expected_date;
    if (location_from) updateData.location_from = location_from;
    if (location_to) updateData.location_to = location_to;
    if (transport_details) updateData.transport_details = transport_details;
    if (priority) updateData.priority = priority;

    await challan.update(updateData);

    res.json({ message: 'Challan updated successfully' });
  } catch (error) {
    console.error('Challan update error:', error);
    res.status(500).json({ message: 'Failed to update challan' });
  }
});

// Approve challan
router.put('/:id/approve', authenticateToken, checkDepartment('admin'), async (req, res) => {
  try {
    const challan = await Challan.findByPk(req.params.id);
    
    if (!challan) {
      return res.status(404).json({ message: 'Challan not found' });
    }

    if (challan.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending challans can be approved' });
    }

    await challan.update({
      status: 'approved',
      approved_by: req.user.id,
      approved_at: new Date()
    });

    // Send notification
    await NotificationService.notifyChallanAction('approved', challan, req.user.id);

    res.json({ message: 'Challan approved successfully' });
  } catch (error) {
    console.error('Challan approval error:', error);
    res.status(500).json({ message: 'Failed to approve challan' });
  }
});

// Reject challan
router.put('/:id/reject', authenticateToken, checkDepartment('admin'), async (req, res) => {
  try {
    const { rejection_reason } = req.body;
    
    if (!rejection_reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const challan = await Challan.findByPk(req.params.id);
    
    if (!challan) {
      return res.status(404).json({ message: 'Challan not found' });
    }

    if (challan.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending challans can be rejected' });
    }

    await challan.update({
      status: 'rejected',
      rejection_reason,
      approved_by: req.user.id,
      approved_at: new Date()
    });

    // Send notification
    await NotificationService.notifyChallanAction('rejected', challan, req.user.id);

    res.json({ message: 'Challan rejected successfully' });
  } catch (error) {
    console.error('Challan rejection error:', error);
    res.status(500).json({ message: 'Failed to reject challan' });
  }
});

// Submit challan for approval
router.put('/:id/submit', authenticateToken, async (req, res) => {
  try {
    const challan = await Challan.findByPk(req.params.id);
    
    if (!challan) {
      return res.status(404).json({ message: 'Challan not found' });
    }

    if (challan.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft challans can be submitted' });
    }

    // Check if user owns the challan or has permission
    if (challan.created_by !== req.user.id && req.user.role.level < 3) {
      return res.status(403).json({ message: 'Not authorized to submit this challan' });
    }

    await challan.update({ status: 'pending' });

    // Send notification
    await NotificationService.notifyChallanAction('submitted', challan, req.user.id);

    res.json({ message: 'Challan submitted for approval' });
  } catch (error) {
    console.error('Challan submission error:', error);
    res.status(500).json({ message: 'Failed to submit challan' });
  }
});

// Generate PDF
router.get('/:id/pdf', authenticateToken, async (req, res) => {
  try {
    const challan = await Challan.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['name', 'employee_id'] },
        { model: Vendor, as: 'vendor' },
        { model: Customer, as: 'customer' }
      ]
    });

    if (!challan) {
      return res.status(404).json({ message: 'Challan not found' });
    }

    // Create PDF
    const doc = new PDFDocument();
    const filename = `challan-${challan.challan_number}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    doc.pipe(res);

    // PDF Header
    doc.fontSize(20).text('PASHION CLOTHING FACTORY', 50, 50);
    doc.fontSize(16).text('CHALLAN', 50, 80);
    
    // Challan Details
    doc.fontSize(12);
    doc.text(`Challan No: ${challan.challan_number}`, 50, 120);
    doc.text(`Date: ${new Date(challan.created_at).toLocaleDateString()}`, 300, 120);
    doc.text(`Type: ${challan.type.toUpperCase()}`, 50, 140);
    doc.text(`Status: ${challan.status.toUpperCase()}`, 300, 140);
    
    if (challan.vendor) {
      doc.text(`Vendor: ${challan.vendor.name}`, 50, 160);
    }
    if (challan.customer) {
      doc.text(`Customer: ${challan.customer.name}`, 50, 160);
    }

    // Items table
    let yPosition = 200;
    doc.text('Items:', 50, yPosition);
    yPosition += 20;
    
    doc.text('Description', 50, yPosition);
    doc.text('Quantity', 200, yPosition);
    doc.text('Rate', 300, yPosition);
    doc.text('Amount', 400, yPosition);
    yPosition += 20;

    challan.items.forEach(item => {
      doc.text(item.description || item.product_name || 'Item', 50, yPosition);
      doc.text(item.quantity.toString(), 200, yPosition);
      doc.text((item.rate || 0).toFixed(2), 300, yPosition);
      doc.text(((item.quantity || 0) * (item.rate || 0)).toFixed(2), 400, yPosition);
      yPosition += 20;
    });

    // Totals
    yPosition += 20;
    doc.text(`Total Quantity: ${challan.total_quantity}`, 300, yPosition);
    yPosition += 20;
    doc.text(`Total Amount: ₹${challan.total_amount.toFixed(2)}`, 300, yPosition);

    // QR Code (if available)
    if (challan.qr_code) {
      // Add QR code to PDF (simplified - in production, you'd convert base64 to image)
      doc.text('QR Code: Available', 50, yPosition + 40);
    }

    // Footer
    doc.text(`Created by: ${challan.creator.name}`, 50, yPosition + 80);
    doc.text(`Employee ID: ${challan.creator.employee_id}`, 50, yPosition + 100);

    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
});

// Get challan statistics
router.get('/stats/dashboard', authenticateToken, async (req, res) => {
  try {
    const { department } = req.query;
    const where = {};
    
    if (department && req.user.role.level < 4) {
      where.department = department;
    }

    const stats = await Challan.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        [require('sequelize').fn('SUM', require('sequelize').col('total_amount')), 'total_amount']
      ],
      where,
      group: ['status']
    });

    const totalChallans = await Challan.count({ where });
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayChallans = await Challan.count({
      where: {
        ...where,
        created_at: {
          [require('sequelize').Op.between]: [todayStart, todayEnd]
        }
      }
    });

    res.json({
      stats: stats.map(stat => ({
        status: stat.status,
        count: parseInt(stat.dataValues.count),
        total_amount: parseFloat(stat.dataValues.total_amount || 0)
      })),
      totalChallans,
      todayChallans
    });
  } catch (error) {
    console.error('Challan stats error:', error);
    res.status(500).json({ message: 'Failed to fetch challan statistics' });
  }
});

module.exports = router;