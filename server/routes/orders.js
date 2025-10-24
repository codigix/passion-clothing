const express = require('express');
const { SalesOrder, PurchaseOrder, ProductionOrder, Shipment } = require('../config/database');
const { authenticateToken, checkDepartment } = require('../middleware/auth');
const { updateOrderQRCode } = require('../utils/qrCodeUtils');

const router = express.Router();

/**
 * Generic order status update endpoint
 * Determines order type and updates status accordingly
 * PUT /api/orders/:id/status
 */
router.put('/:id/status', authenticateToken, async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { status, department, action, notes } = req.body;

    if (!status) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Status is required' });
    }

    // Try to find the order in different tables
    let order = await SalesOrder.findByPk(id, { transaction });
    let orderType = 'sales_order';

    if (!order) {
      order = await PurchaseOrder.findByPk(id, { transaction });
      orderType = 'purchase_order';
    }

    if (!order) {
      order = await ProductionOrder.findByPk(id, { transaction });
      orderType = 'production_order';
    }

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order status
    await order.update(
      { 
        status,
        last_updated_by: req.user.id,
        last_updated_at: new Date()
      },
      { transaction }
    );

    // Update QR code if it's a sales order
    if (orderType === 'sales_order') {
      await updateOrderQRCode(order.id, status, transaction);
    }

    // Create lifecycle history entry if it's a sales order
    if (orderType === 'sales_order' && order.lifecycle_history) {
      try {
        let history = JSON.parse(order.lifecycle_history);
        if (!Array.isArray(history)) history = [];
        
        history.push({
          status,
          timestamp: new Date().toISOString(),
          department,
          action,
          notes,
          updated_by: req.user.id
        });

        await order.update(
          { lifecycle_history: JSON.stringify(history) },
          { transaction }
        );
      } catch (error) {
        console.error('Error updating lifecycle history:', error);
      }
    }

    await transaction.commit();

    res.json({
      success: true,
      message: `${orderType} status updated successfully`,
      order: {
        id: order.id,
        status: order.status,
        type: orderType
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      message: 'Failed to update order status',
      error: error.message 
    });
  }
});

/**
 * Generic order QR code update endpoint
 * PUT /api/orders/:id/qr-code
 */
router.put('/:id/qr-code', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, department, timestamp } = req.body;

    // Try to find the order in different tables
    let order = await SalesOrder.findByPk(id);
    let orderType = 'sales_order';

    if (!order) {
      order = await PurchaseOrder.findByPk(id);
      orderType = 'purchase_order';
    }

    if (!order) {
      order = await ProductionOrder.findByPk(id);
      orderType = 'production_order';
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update QR code for sales orders
    if (orderType === 'sales_order' && status) {
      await updateOrderQRCode(order.id, status);
    }

    res.json({
      success: true,
      message: 'QR code updated successfully',
      order: {
        id: order.id,
        status: order.status,
        type: orderType
      }
    });
  } catch (error) {
    console.error('Error updating QR code:', error);
    res.status(500).json({ 
      message: 'Failed to update QR code',
      error: error.message 
    });
  }
});

module.exports = router;