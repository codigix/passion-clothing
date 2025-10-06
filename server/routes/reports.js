const express = require('express');
const { Challan, SalesOrder, ProductionOrder, Rejection, Invoice, Payment } = require('../config/database');
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

module.exports = router;