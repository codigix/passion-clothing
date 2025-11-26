const express = require('express');
const { Invoice, Payment, Vendor, Customer, FinancialRecord, User, SalesOrder, PurchaseOrder } = require('../config/database');
const { authenticateToken, checkDepartment } = require('../middleware/auth');
const NotificationService = require('../utils/notificationService');
const { Op } = require('sequelize');
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

// Get specific invoice by ID
router.get('/invoices/:id', authenticateToken, checkDepartment(['finance', 'admin']), async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        { model: Vendor, as: 'vendor' },
        { model: Customer, as: 'customer' },
        { model: Payment, as: 'payments' },
        { model: SalesOrder, as: 'salesOrder' },
        { model: PurchaseOrder, as: 'purchaseOrder', include: [{ model: Vendor, as: 'vendor' }] }
      ]
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json({ invoice });
  } catch (error) {
    console.error('Invoice fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch invoice' });
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

// Get KPIs for dashboard
router.get('/dashboard/kpis', authenticateToken, checkDepartment(['finance', 'admin']), async (req, res) => {
  try {
    const totalRevenue = await Invoice.sum('total_amount', { 
      where: { invoice_type: 'sales', payment_status: 'paid' } 
    }) || 0;
    
    const totalExpenses = await Invoice.sum('total_amount', { 
      where: { invoice_type: 'purchase' } 
    }) || 0;
    
    const netProfit = totalRevenue - totalExpenses;
    
    const cashFlow = await Payment.sum('amount', {
      where: { status: 'completed' }
    }) || 0;

    const kpis = [
      {
        id: 'revenue',
        title: 'Total Revenue',
        value: parseFloat(totalRevenue),
        trend: 0,
        subtitle: 'Total sales invoices',
        icon: 'TrendingUp',
        color: 'emerald'
      },
      {
        id: 'expenses',
        title: 'Total Expenses',
        value: parseFloat(totalExpenses),
        trend: 0,
        subtitle: 'Total purchases',
        icon: 'TrendingDown',
        color: 'rose'
      },
      {
        id: 'profit',
        title: 'Net Profit',
        value: parseFloat(netProfit),
        trend: 0,
        subtitle: 'Revenue - Expenses',
        icon: 'DollarSign',
        color: 'primary'
      },
      {
        id: 'cash',
        title: 'Cash Flow',
        value: parseFloat(cashFlow),
        trend: 0,
        subtitle: 'Completed payments',
        icon: 'Wallet',
        color: 'sky'
      }
    ];

    res.json({ kpis });
  } catch (error) {
    console.error('Dashboard KPIs error:', error);
    res.status(500).json({ message: 'Failed to fetch KPIs' });
  }
});

// Get dashboard invoices summary
router.get('/dashboard/invoice-summary', authenticateToken, checkDepartment(['finance', 'admin']), async (req, res) => {
  try {
    const totalCount = await Invoice.count({ where: { invoice_type: 'sales' } });
    const overdueCount = await Invoice.count({ 
      where: { 
        invoice_type: 'sales',
        status: 'overdue'
      } 
    });
    const pendingCount = await Invoice.count({ 
      where: { 
        invoice_type: 'sales',
        payment_status: 'unpaid'
      } 
    });
    const paidCount = await Invoice.count({ 
      where: { 
        invoice_type: 'sales',
        payment_status: 'paid'
      } 
    });

    const summary = [
      { id: 'total', label: 'Total Invoices', value: totalCount, trend: 0, color: 'blue' },
      { id: 'overdue', label: 'Overdue', value: overdueCount, trend: 0, color: 'rose' },
      { id: 'pending', label: 'Pending', value: pendingCount, trend: 0, color: 'amber' },
      { id: 'paid', label: 'Paid', value: paidCount, trend: 0, color: 'emerald' }
    ];

    res.json({ summary });
  } catch (error) {
    console.error('Invoice summary error:', error);
    res.status(500).json({ message: 'Failed to fetch invoice summary' });
  }
});

// Get recent invoices for dashboard
router.get('/dashboard/recent-invoices', authenticateToken, checkDepartment(['finance', 'admin']), async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      include: [
        { model: Customer, as: 'customer' },
        { model: Vendor, as: 'vendor' },
        { model: SalesOrder, as: 'salesOrder' }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    const formattedInvoices = invoices.map(inv => ({
      id: inv.id,
      invoiceNo: inv.invoice_number,
      type: inv.invoice_type,
      customerVendor: inv.invoice_type === 'sales' ? inv.customer?.name : inv.vendor?.name,
      amount: parseFloat(inv.total_amount),
      dueDate: inv.due_date ? inv.due_date.toISOString().split('T')[0] : null,
      status: inv.status,
      paymentStatus: inv.payment_status
    }));

    res.json({ invoices: formattedInvoices });
  } catch (error) {
    console.error('Recent invoices error:', error);
    res.status(500).json({ message: 'Failed to fetch recent invoices' });
  }
});

// Get recent payments for dashboard
router.get('/dashboard/recent-payments', authenticateToken, checkDepartment(['finance', 'admin']), async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [{ model: Invoice, as: 'invoice' }],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    const formattedPayments = payments.map(pay => ({
      id: pay.id,
      paymentNo: `PAY-${pay.id}`,
      invoiceNo: pay.invoice?.invoice_number,
      type: pay.payment_type,
      party: pay.party_name,
      amount: parseFloat(pay.amount),
      paymentMode: pay.payment_method,
      paymentDate: pay.payment_date ? pay.payment_date.toISOString().split('T')[0] : null,
      status: pay.status,
      reference: pay.reference_number
    }));

    res.json({ payments: formattedPayments });
  } catch (error) {
    console.error('Recent payments error:', error);
    res.status(500).json({ message: 'Failed to fetch recent payments' });
  }
});

// Get invoices sent to accounting (from sales)
router.get('/invoices-to-process', authenticateToken, checkDepartment(['finance', 'admin']), async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      where: {
        invoice_type: 'sales',
        status: 'generated'
      },
      include: [
        { model: Customer, as: 'customer' },
        { model: SalesOrder, as: 'salesOrder' },
        { model: PurchaseOrder, as: 'purchaseOrder', include: [{ model: Vendor, as: 'vendor' }] },
        { model: Vendor, as: 'vendor' },
        { model: Payment, as: 'payments' }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ invoices });
  } catch (error) {
    console.error('Fetch invoices to process error:', error);
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
});

// Get financial records
router.get('/financial-records', authenticateToken, checkDepartment(['finance', 'admin']), async (req, res) => {
  try {
    const { invoice_id, status } = req.query;
    const where = {};

    if (invoice_id) where.invoice_id = invoice_id;
    if (status) where.status = status;

    const records = await FinancialRecord.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    res.json({ records });
  } catch (error) {
    console.error('Fetch financial records error:', error.message);
    res.status(500).json({ message: 'Failed to fetch financial records', error: error.message });
  }
});

// Create financial record for invoice
router.post('/financial-records', authenticateToken, checkDepartment(['finance', 'admin']), async (req, res) => {
  try {
    const {
      invoice_id,
      record_type,
      account_head,
      description,
      amount,
      project_id,
      project_name,
      department,
      notes
    } = req.body;

    if (!invoice_id || !amount || !record_type) {
      return res.status(400).json({
        message: 'Missing required fields: invoice_id, amount, record_type'
      });
    }

    // Generate unique record number
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const lastRecord = await FinancialRecord.findOne({
      where: {
        record_number: {
          [Op.like]: `FR-${dateStr}-%`
        }
      },
      order: [['created_at', 'DESC']]
    });

    let sequence = 1;
    if (lastRecord) {
      const lastSequence = parseInt(lastRecord.record_number.split('-')[2], 10);
      sequence = Number.isNaN(lastSequence) ? 1 : lastSequence + 1;
    }

    const recordNumber = `FR-${dateStr}-${sequence.toString().padStart(5, '0')}`;

    const financialRecord = await FinancialRecord.create({
      invoice_id,
      record_number: recordNumber,
      record_type,
      account_head: account_head || 'Sales Income',
      description: description || `Record for invoice #${invoice_id}`,
      amount,
      project_id,
      project_name,
      department: department || 'Sales',
      status: 'recorded',
      notes,
      recorded_by_id: req.user.id,
      recorded_by_name: req.user.username,
      recorded_at: new Date()
    });

    // Update invoice status
    await Invoice.update(
      { status: 'recorded' },
      { where: { id: invoice_id } }
    );

    res.json({
      message: 'Financial record created successfully',
      record: financialRecord
    });
  } catch (error) {
    console.error('Create financial record error:', error);
    res.status(500).json({
      message: 'Failed to create financial record',
      error: error.message
    });
  }
});

// Approve financial record
router.post('/financial-records/:id/approve', authenticateToken, checkDepartment(['finance', 'admin']), async (req, res) => {
  try {
    const { notes } = req.body;

    const record = await FinancialRecord.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({ message: 'Financial record not found' });
    }

    await record.update({
      status: 'approved',
      approved_by_id: req.user.id,
      approved_by_name: req.user.username,
      approved_at: new Date(),
      notes: notes || record.notes
    });

    res.json({
      message: 'Financial record approved successfully',
      record
    });
  } catch (error) {
    console.error('Approve financial record error:', error);
    res.status(500).json({
      message: 'Failed to approve financial record',
      error: error.message
    });
  }
});

// Delete financial record
router.delete('/financial-records/:id', authenticateToken, checkDepartment(['finance', 'admin']), async (req, res) => {
  try {
    const record = await FinancialRecord.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({ message: 'Financial record not found' });
    }

    await record.destroy();

    res.json({ message: 'Financial record deleted successfully' });
  } catch (error) {
    console.error('Delete financial record error:', error);
    res.status(500).json({
      message: 'Failed to delete financial record',
      error: error.message
    });
  }
});

// Delete invoice
router.delete('/invoices/:id', authenticateToken, checkDepartment(['finance', 'admin']), async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    await invoice.destroy();

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({
      message: 'Failed to delete invoice',
      error: error.message
    });
  }
});

// Delete payment
router.delete('/payments/:id', authenticateToken, checkDepartment(['finance', 'admin']), async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    await payment.destroy();

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({
      message: 'Failed to delete payment',
      error: error.message
    });
  }
});

// Get outstanding receivables summary
router.get('/dashboard/outstanding-receivables', authenticateToken, checkDepartment(['finance', 'admin']), async (req, res) => {
  try {
    const unpaidInvoices = await Invoice.findAll({
      where: {
        invoice_type: 'sales',
        payment_status: ['unpaid', 'partially_paid']
      },
      attributes: ['id', 'total_amount', 'payment_status']
    });

    const totalReceivables = unpaidInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);
    const overdueInvoices = await Invoice.count({
      where: {
        invoice_type: 'sales',
        payment_status: ['unpaid', 'partially_paid'],
        due_date: { [Op.lt]: new Date() }
      }
    });

    const pendingInvoices = await Invoice.count({
      where: {
        invoice_type: 'sales',
        payment_status: 'unpaid'
      }
    });

    const data = [
      { id: 'overdue', label: 'Overdue', value: overdueInvoices, trend: 2.1 },
      { id: 'pending', label: 'Pending', value: pendingInvoices, trend: -1.5 },
      { id: 'total', label: 'Total Amount', value: totalReceivables, trend: 0 }
    ];

    res.json({ data });
  } catch (error) {
    console.error('Outstanding receivables error:', error);
    res.status(500).json({ message: 'Failed to fetch outstanding receivables' });
  }
});

// Get outstanding payables summary
router.get('/dashboard/outstanding-payables', authenticateToken, checkDepartment(['finance', 'admin']), async (req, res) => {
  try {
    const unpaidInvoices = await Invoice.findAll({
      where: {
        invoice_type: 'purchase',
        payment_status: ['unpaid', 'partially_paid']
      },
      attributes: ['id', 'total_amount', 'payment_status']
    });

    const totalPayables = unpaidInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);
    
    const budgetAlerts = [
      { id: 1, title: 'Payroll Budget', percentage: 75, status: 'warning' },
      { id: 2, title: 'Material Budget', percentage: 62, status: 'success' },
      { id: 3, title: 'Operations Budget', percentage: 88, status: 'danger' }
    ];

    res.json({ totalPayables, budgetAlerts });
  } catch (error) {
    console.error('Outstanding payables error:', error);
    res.status(500).json({ message: 'Failed to fetch outstanding payables' });
  }
});

// Get expense breakdown
router.get('/dashboard/expense-breakdown', authenticateToken, checkDepartment(['finance', 'admin']), async (req, res) => {
  try {
    const purchaseInvoices = await Invoice.findAll({
      where: { invoice_type: 'purchase' },
      attributes: ['items', 'total_amount'],
      raw: true
    });

    const expenses = [
      { id: 1, category: 'Raw Materials', amount: 1250000, percentage: 43 },
      { id: 2, category: 'Labor & Benefits', amount: 780000, percentage: 27 },
      { id: 3, category: 'Operations', amount: 420000, percentage: 14 },
      { id: 4, category: 'Logistics', amount: 265000, percentage: 9 },
      { id: 5, category: 'Marketing', amount: 135000, percentage: 5 }
    ];

    res.json({ expenses });
  } catch (error) {
    console.error('Expense breakdown error:', error);
    res.status(500).json({ message: 'Failed to fetch expense breakdown' });
  }
});

// Get cash flow events
router.get('/dashboard/cash-flow', authenticateToken, checkDepartment(['finance', 'admin']), async (req, res) => {
  try {
    const payments = await Payment.findAll({
      order: [['payment_date', 'DESC']],
      limit: 10,
      attributes: ['id', 'amount', 'payment_date', 'notes', 'status']
    });

    const cashFlowEvents = payments.map((p, idx) => ({
      id: idx + 1,
      description: p.notes || 'Payment transaction',
      amount: parseFloat(p.amount),
      category: parseFloat(p.amount) > 0 ? 'operating' : 'operating',
      date: p.payment_date ? p.payment_date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      reference: `PAY-${p.id}`
    }));

    res.json({ cashFlowEvents });
  } catch (error) {
    console.error('Cash flow error:', error);
    res.status(500).json({ message: 'Failed to fetch cash flow events' });
  }
});

// Get financial highlights
router.get('/dashboard/financial-highlights', authenticateToken, checkDepartment(['finance', 'admin']), async (req, res) => {
  try {
    const paidInvoices = await Invoice.sum('total_amount', {
      where: { payment_status: 'paid' }
    }) || 0;

    const totalInvoices = await Invoice.sum('total_amount', {
      where: { invoice_type: 'sales' }
    }) || 0;

    const collectionRate = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0;
    
    const totalExpenses = await Invoice.sum('total_amount', {
      where: { invoice_type: 'purchase' }
    }) || 0;

    const revenue = paidInvoices;
    const grossMargin = revenue > 0 ? Math.round(((revenue - totalExpenses) / revenue) * 100) : 0;

    const highlights = [
      {
        id: 'conversion',
        label: 'Invoice Collection Rate',
        value: `${collectionRate}%`,
        change: 4.3,
        direction: 'up',
        description: 'Receivables collected within payment terms'
      },
      {
        id: 'cost',
        label: 'Expense Variance',
        value: '-6.5%',
        change: 1.2,
        direction: 'down',
        description: 'Under budget for the current month'
      },
      {
        id: 'margin',
        label: 'Gross Margin',
        value: `${grossMargin}%`,
        change: 2.1,
        direction: 'up',
        description: 'Improved due to better pricing'
      },
      {
        id: 'pipeline',
        label: 'Upcoming Receivables',
        value: `₹${(paidInvoices / 100000).toFixed(1)}L`,
        change: 3.8,
        direction: 'up',
        description: 'Invoices due within the next 30 days'
      }
    ];

    res.json({ highlights });
  } catch (error) {
    console.error('Financial highlights error:', error);
    res.status(500).json({ message: 'Failed to fetch financial highlights' });
  }
});

// Get compliance checklist
router.get('/dashboard/compliance', authenticateToken, checkDepartment(['finance', 'admin']), async (req, res) => {
  try {
    const complianceChecklist = [
      {
        id: 1,
        title: 'GST Monthly Filing',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending',
        owner: 'Priya Singh'
      },
      {
        id: 2,
        title: 'TDS Payment',
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'completed',
        owner: 'Rahul Sharma'
      },
      {
        id: 3,
        title: 'Vendor Agreement Renewal',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'in_progress',
        owner: 'Amit Kumar'
      }
    ];

    res.json({ complianceChecklist });
  } catch (error) {
    console.error('Compliance checklist error:', error);
    res.status(500).json({ message: 'Failed to fetch compliance checklist' });
  }
});

module.exports = router;
