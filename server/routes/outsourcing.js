const express = require('express');
const { Challan, Vendor, ProductionStage } = require('../config/database');
const { authenticateToken, checkDepartment } = require('../middleware/auth');
const router = express.Router();

// Get outsourcing challans
router.get('/challans', authenticateToken, checkDepartment(['outsourcing', 'admin']), async (req, res) => {
  try {
    const { status, vendor_id } = req.query;
    const where = { 
      sub_type: 'outsourcing',
      department: 'outsourcing'
    };

    if (status) where.status = status;
    if (vendor_id) where.vendor_id = vendor_id;

    const challans = await Challan.findAll({
      where,
      include: [{ model: Vendor, as: 'vendor' }],
      order: [['created_at', 'DESC']]
    });

    res.json({ challans });
  } catch (error) {
    console.error('Outsourcing challans error:', error);
    res.status(500).json({ message: 'Failed to fetch outsourcing challans' });
  }
});

// Get outsourcing dashboard stats
router.get('/dashboard/stats', authenticateToken, checkDepartment(['outsourcing', 'admin']), async (req, res) => {
  try {
    const totalChallans = await Challan.count({ where: { sub_type: 'outsourcing', department: 'outsourcing' } });
    const openChallans = await Challan.count({ where: { sub_type: 'outsourcing', department: 'outsourcing', status: { [require('sequelize').Op.not]: 'completed' } } });
    res.json({ totalChallans, openChallans });
  } catch (error) {
    console.error('Outsourcing dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch outsourcing statistics' });
  }
});

module.exports = router;