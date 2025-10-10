const express = require('express');
const { Challan, SalesOrder, ProductionOrder, Rejection, Invoice, Payment, Customer, Vendor } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Challan register report
router.get('/challan-register', authenticateToken, async (req, res) => {
  try {
    const { date_from, date_to, type, status, department } = req.query;
    const where = {};

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at[require('sequelize').Op.gte] = new Date(date_from);
      if (date_to) where.created_at[require('sequelize').Op.lte] = new Date(date_to + ' 23:59:59');
    }

    if (type) where.type = type;
    if (status) where.status = status;
    if (department) where.department = department;

    const challans = await Challan.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    res.json({ challans });
  } catch (error) {
    console.error('Challan register report error:', error);
    res.status(500).json({ message: 'Failed to generate challan register report' });
  }
});

// Manufacturing efficiency report
router.get('/manufacturing-efficiency', authenticateToken, async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    const where = {};

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at[require('sequelize').Op.gte] = new Date(date_from);
      if (date_to) where.created_at[require('sequelize').Op.lte] = new Date(date_to + ' 23:59:59');
    }

    const productionOrders = await ProductionOrder.findAll({
      where,
      attributes: [
        'id', 'production_number', 'quantity', 'status',
        'planned_start_date', 'planned_end_date',
        'actual_start_date', 'actual_end_date',
        'estimated_hours', 'actual_hours'
      ]
    });

    const rejections = await Rejection.findAll({
      where: date_from || date_to ? {
        created_at: where.created_at
      } : {},
      attributes: [
        'rejection_reason',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        [require('sequelize').fn('SUM', require('sequelize').col('rejected_quantity')), 'total_quantity']
      ],
      group: ['rejection_reason']
    });

    res.json({ 
      productionOrders,
      rejections: rejections.map(r => ({
        reason: r.rejection_reason,
        count: parseInt(r.dataValues.count),
        total_quantity: parseInt(r.dataValues.total_quantity || 0)
      }))
    });
  } catch (error) {
    console.error('Manufacturing efficiency report error:', error);
    res.status(500).json({ message: 'Failed to generate manufacturing efficiency report' });
  }
});

// Finance report
router.get('/finance', authenticateToken, async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    const where = {};

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at[require('sequelize').Op.gte] = new Date(date_from);
      if (date_to) where.created_at[require('sequelize').Op.lte] = new Date(date_to + ' 23:59:59');
    }

    const invoices = await Invoice.findAll({
      where,
      attributes: [
        'invoice_type', 'status', 'payment_status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        [require('sequelize').fn('SUM', require('sequelize').col('total_amount')), 'total_amount'],
        [require('sequelize').fn('SUM', require('sequelize').col('outstanding_amount')), 'outstanding_amount']
      ],
      group: ['invoice_type', 'status', 'payment_status']
    });

    const payments = await Payment.findAll({
      where,
      attributes: [
        'payment_method', 'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'total_amount']
      ],
      group: ['payment_method', 'status']
    });

    res.json({ invoices, payments });
  } catch (error) {
    console.error('Finance report error:', error);
    res.status(500).json({ message: 'Failed to generate finance report' });
  }
});

// Invoices report
router.get('/invoices', authenticateToken, async (req, res) => {
  try {
    const { date_from, date_to, invoice_type, status, payment_status, customer_id, vendor_id, format } = req.query;
    const where = {};

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at[require('sequelize').Op.gte] = new Date(date_from);
      if (date_to) where.created_at[require('sequelize').Op.lte] = new Date(date_to + ' 23:59:59');
    }

    if (invoice_type) where.invoice_type = invoice_type;
    if (status) where.status = status;
    if (payment_status) where.payment_status = payment_status;
    if (customer_id) where.customer_id = customer_id;
    if (vendor_id) where.vendor_id = vendor_id;

    const invoices = await Invoice.findAll({
      where,
      include: [
        { model: Customer, as: 'customer' },
        { model: Vendor, as: 'vendor' },
        { model: Payment, as: 'payments' }
      ],
      order: [['created_at', 'DESC']]
    });

    // Calculate totals
    const totals = {
      totalInvoices: invoices.length,
      totalAmount: invoices.reduce((sum, inv) => sum + (parseFloat(inv.total_amount) || 0), 0),
      totalPaid: invoices.reduce((sum, inv) => sum + (parseFloat(inv.paid_amount) || 0), 0),
      totalOutstanding: invoices.reduce((sum, inv) => sum + (parseFloat(inv.outstanding_amount) || 0), 0)
    };

    // Export to CSV if requested
    if (format === 'csv') {
      const csvData = invoices.map(invoice => ({
        'Invoice Number': invoice.invoice_number,
        'Invoice Date': invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : '',
        'Due Date': invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '',
        'Customer': invoice.customer?.name || '',
        'Vendor': invoice.vendor?.name || '',
        'Total Amount': invoice.total_amount,
        'Paid Amount': invoice.paid_amount,
        'Outstanding Amount': invoice.outstanding_amount,
        'Status': invoice.status,
        'Payment Status': invoice.payment_status,
        'Currency': invoice.currency
      }));

      // Add totals row
      csvData.push({
        'Invoice Number': 'TOTALS',
        'Invoice Date': '',
        'Due Date': '',
        'Customer': '',
        'Vendor': '',
        'Total Amount': totals.totalAmount.toFixed(2),
        'Paid Amount': totals.totalPaid.toFixed(2),
        'Outstanding Amount': totals.totalOutstanding.toFixed(2),
        'Status': '',
        'Payment Status': '',
        'Currency': ''
      });

      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=invoices-report.csv');
      return res.send(csvContent);
    }

    res.json({ invoices, totals });
  } catch (error) {
    console.error('Invoices report error:', error);
    res.status(500).json({ message: 'Failed to generate invoices report' });
  }
});

// Sales Orders report
router.get('/sales-orders', authenticateToken, async (req, res) => {
  try {
    const { date_from, date_to, status, customer_id, project_name, format } = req.query;
    const where = {};

    if (date_from || date_to) {
      where.order_date = {};
      if (date_from) where.order_date[require('sequelize').Op.gte] = new Date(date_from);
      if (date_to) where.order_date[require('sequelize').Op.lte] = new Date(date_to);
    }

    if (status) where.status = status;
    if (customer_id) where.customer_id = customer_id;
    if (project_name) where.project_name = project_name;

    const salesOrders = await SalesOrder.findAll({
      where,
      include: [{ model: Customer, as: 'customer' }],
      order: [['order_date', 'DESC']]
    });

    // Calculate totals
    const totals = {
      totalOrders: salesOrders.length,
      totalAmount: salesOrders.reduce((sum, order) => sum + (parseFloat(order.final_amount) || 0), 0),
      totalAdvancePaid: salesOrders.reduce((sum, order) => sum + (parseFloat(order.advance_paid) || 0), 0),
      totalBalance: salesOrders.reduce((sum, order) => sum + (parseFloat(order.balance_amount) || 0), 0)
    };

    // Export to CSV if requested
    if (format === 'csv') {
      const csvData = salesOrders.map(order => ({
        'Order Number': order.order_number,
        'Order Date': order.order_date ? new Date(order.order_date).toLocaleDateString() : '',
        'Customer': order.customer?.name || '',
        'Project Name': order.project_name || '',
        'Total Amount': order.final_amount,
        'Status': order.status,
        'Delivery Date': order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : '',
        'Advance Paid': order.advance_paid,
        'Balance Amount': order.balance_amount
      }));

      // Add totals row
      csvData.push({
        'Order Number': 'TOTALS',
        'Order Date': '',
        'Customer': '',
        'Project Name': '',
        'Total Amount': totals.totalAmount.toFixed(2),
        'Status': '',
        'Delivery Date': '',
        'Advance Paid': totals.totalAdvancePaid.toFixed(2),
        'Balance Amount': totals.totalBalance.toFixed(2)
      });

      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=sales-orders-report.csv');
      return res.send(csvContent);
    }

    res.json({ salesOrders, totals });
  } catch (error) {
    console.error('Sales orders report error:', error);
    res.status(500).json({ message: 'Failed to generate sales orders report' });
  }
});

// Challans report
router.get('/challans', authenticateToken, async (req, res) => {
  try {
    const { date_from, date_to, type, status, customer_id, vendor_id, format } = req.query;
    const where = {};

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at[require('sequelize').Op.gte] = new Date(date_from);
      if (date_to) where.created_at[require('sequelize').Op.lte] = new Date(date_to + ' 23:59:59');
    }

    if (type) where.type = type;
    if (status) where.status = status;
    if (customer_id) where.customer_id = customer_id;
    if (vendor_id) where.vendor_id = vendor_id;

    const challans = await Challan.findAll({
      where,
      include: [
        { model: Customer, as: 'customer' },
        { model: Vendor, as: 'vendor' }
      ],
      order: [['created_at', 'DESC']]
    });

    // Calculate totals
    const totals = {
      totalChallans: challans.length,
      totalQuantity: challans.reduce((sum, challan) => sum + (parseFloat(challan.total_quantity) || 0), 0),
      totalAmount: challans.reduce((sum, challan) => sum + (parseFloat(challan.total_amount) || 0), 0)
    };

    // Export to CSV if requested
    if (format === 'csv') {
      const csvData = challans.map(challan => ({
        'Challan Number': challan.challan_number,
        'Type': challan.type,
        'Sub Type': challan.sub_type || '',
        'Customer': challan.customer?.name || '',
        'Vendor': challan.vendor?.name || '',
        'Total Quantity': challan.total_quantity,
        'Total Amount': challan.total_amount,
        'Status': challan.status,
        'Created Date': challan.created_at ? new Date(challan.created_at).toLocaleDateString() : '',
        'Expected Date': challan.expected_date ? new Date(challan.expected_date).toLocaleDateString() : ''
      }));

      // Add totals row
      csvData.push({
        'Challan Number': 'TOTALS',
        'Type': '',
        'Sub Type': '',
        'Customer': '',
        'Vendor': '',
        'Total Quantity': totals.totalQuantity.toFixed(2),
        'Total Amount': totals.totalAmount.toFixed(2),
        'Status': '',
        'Created Date': '',
        'Expected Date': ''
      });

      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=challans-report.csv');
      return res.send(csvContent);
    }

    res.json({ challans, totals });
  } catch (error) {
    console.error('Challans report error:', error);
    res.status(500).json({ message: 'Failed to generate challans report' });
  }
});

module.exports = router;