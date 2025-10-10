const express = require('express');
const { Invoice, Payment, Vendor, Customer } = require('../config/database');
const { authenticateToken, checkDepartment } = require('../middleware/auth');
const NotificationService = require('../utils/notificationService');
const router = express.Router();

// Get invoices
router.get('/invoices', authenticateToken, checkDepartment(['finance', 'admin']), async (req, res) => {
  try {
    const { invoice_type, status, payment_status } = req.query;
    const where = {};

    if (invoice_type) where.invoice_type = invoice_type;
    if (status) where.status = status;
    if (payment_status) where.payment_status = payment_status;

    const invoices = await Invoice.findAll({
      where,
      include: [
        { model: Vendor, as: 'vendor' },
        { model: Customer, as: 'customer' },
        { model: Payment, as: 'payments' }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ invoices });
  } catch (error) {
    console.error('Invoices fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
});

// Get payments
router.get('/payments', authenticateToken, checkDepartment(['finance', 'admin']), async (req, res) => {
  try {
    const { payment_method, status } = req.query;
    const where = {};

    if (payment_method) where.payment_method = payment_method;
    if (status) where.status = status;

    const payments = await Payment.findAll({
      where,
      include: [{ model: Invoice, as: 'invoice' }],
      order: [['created_at', 'DESC']]
    });

    res.json({ payments });
  } catch (error) {
    console.error('Payments fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

// Get finance dashboard stats
router.get('/dashboard/stats', authenticateToken, checkDepartment(['finance', 'admin']), async (req, res) => {
  try {
    const totalInvoices = await Invoice.count();
    const totalPayments = await Payment.count();
    const totalRevenue = await Invoice.sum('total_amount', { where: { payment_status: 'paid' } });
    const outstanding = await Invoice.sum('total_amount', { where: { payment_status: 'unpaid' } });
    res.json({ totalInvoices, totalPayments, totalRevenue, outstanding });
  } catch (error) {
    console.error('Finance dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch finance statistics' });
  }
});

module.exports = router;