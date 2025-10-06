const express = require('express');
const { Sample, Customer, Product } = require('../config/database');
const { authenticateToken, checkDepartment } = require('../middleware/auth');
const router = express.Router();

// Get samples
router.get('/', authenticateToken, checkDepartment(['samples', 'admin', 'sales']), async (req, res) => {
  try {
    const { sample_type, status, customer_id } = req.query;
    const where = {};

    if (sample_type) where.sample_type = sample_type;
    if (status) where.status = status;
    if (customer_id) where.customer_id = customer_id;

    const samples = await Sample.findAll({
      where,
      include: [
        { model: Customer, as: 'customer' },
        { model: Product, as: 'product' }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ samples });
  } catch (error) {
    console.error('Samples fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch samples' });
  }
});

// Get samples dashboard stats
router.get('/dashboard/stats', authenticateToken, checkDepartment(['samples', 'admin', 'sales']), async (req, res) => {
  try {
    const totalSamples = await Sample.count();
    const pendingSamples = await Sample.count({ where: { status: 'pending' } });
    const approvedSamples = await Sample.count({ where: { status: 'approved' } });
    res.json({ totalSamples, pendingSamples, approvedSamples });
  } catch (error) {
    console.error('Samples dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch samples statistics' });
  }
});

module.exports = router;