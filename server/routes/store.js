const express = require('express');
const { StoreStock, Product } = require('../config/database');
const { authenticateToken, checkDepartment } = require('../middleware/auth');
const router = express.Router();

// Get store stock
router.get('/stock', authenticateToken, checkDepartment(['store', 'admin']), async (req, res) => {
  try {
    const { store_location, status } = req.query;
    const where = {};

    if (store_location) where.store_location = store_location;
    if (status) where.status = status;

    const stock = await StoreStock.findAll({
      where,
      include: [{ model: Product, as: 'product' }],
      order: [['updated_at', 'DESC']]
    });

    res.json({ stock });
  } catch (error) {
    console.error('Store stock fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch store stock' });
  }
});

// Get store dashboard stats
router.get('/dashboard/stats', authenticateToken, checkDepartment(['store', 'admin']), async (req, res) => {
  try {
    const totalProducts = await StoreStock.count();
    const totalStores = await StoreStock.count({ distinct: true, col: 'store_location' });
    const totalStock = await StoreStock.sum('current_stock') || 0;
    const totalSales = await StoreStock.sum('sales_revenue') || 0;
    const totalReturns = await StoreStock.sum('returned_quantity') || 0;
    const totalProfit = await StoreStock.sum('profit_amount') || 0;
    const totalSold = await StoreStock.sum('sold_quantity') || 0;
    const profitMargin = totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(2) : 0;
    const stockTurnover = totalStock > 0 ? (totalSold / totalStock).toFixed(1) : 0;
    const lastUpdated = await StoreStock.max('updated_at');
    res.json({ totalProducts, totalStores, totalStock, totalSales, totalReturns, profitMargin, stockTurnover, lastUpdated });
  } catch (error) {
    console.error('Store dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch store statistics' });
  }
});

module.exports = router;