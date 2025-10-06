const express = require('express');
const { Shipment, SalesOrder, Customer, CourierPartner, ShipmentTracking, User } = require('../config/database');
const { authenticateToken, checkDepartment } = require('../middleware/auth');
const { Op } = require('sequelize');
const router = express.Router();

// Get shipments with filtering and pagination
router.get('/', authenticateToken, checkDepartment(['shipment', 'admin', 'sales']), async (req, res) => {
  try {
    const { 
      status, 
      courier_partner_id, 
      courier_company,
      page = 1, 
      limit = 10,
      search,
      start_date,
      end_date
    } = req.query;
    
    const where = {};
    const include = [
      { 
        model: SalesOrder, 
        as: 'salesOrder',
        include: [{ model: Customer, as: 'customer' }]
      },
      { 
        model: CourierPartner, 
        as: 'courierPartner' 
      },
      { 
        model: User, 
        as: 'creator',
        attributes: ['id', 'name', 'email']
      },
      {
        model: ShipmentTracking,
        as: 'trackingUpdates',
        order: [['timestamp', 'DESC']],
        limit: 1
      }
    ];

    // Apply filters
    if (status) where.status = status;
    if (courier_partner_id) where.courier_partner_id = courier_partner_id;
    if (courier_company) where.courier_company = { [Op.like]: `%${courier_company}%` };
    
    // Date range filter
    if (start_date && end_date) {
      where.shipment_date = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    // Search filter
    if (search) {
      where[Op.or] = [
        { shipment_number: { [Op.like]: `%${search}%` } },
        { tracking_number: { [Op.like]: `%${search}%` } },
        { recipient_name: { [Op.like]: `%${search}%` } },
        { recipient_phone: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;
    
    const { count, rows: shipments } = await Shipment.findAndCountAll({
      where,
      include,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate statistics
    const stats = await Shipment.findAll({
      attributes: [
        'status',
        [Shipment.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat.status] = parseInt(stat.count);
      return acc;
    }, {});

    res.json({ 
      shipments,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      },
      stats: statusCounts
    });
  } catch (error) {
    console.error('Shipments fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch shipments' });
  }
});

// Get single shipment by ID
router.get('/:id', authenticateToken, checkDepartment(['shipment', 'admin', 'sales']), async (req, res) => {
  try {
    const shipment = await Shipment.findByPk(req.params.id, {
      include: [
        { 
          model: SalesOrder, 
          as: 'salesOrder',
          include: [{ model: Customer, as: 'customer' }]
        },
        { 
          model: CourierPartner, 
          as: 'courierPartner' 
        },
        { 
          model: User, 
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: ShipmentTracking,
          as: 'trackingUpdates',
          order: [['timestamp', 'DESC']],
          include: [{ 
            model: User, 
            as: 'creator',
            attributes: ['id', 'name', 'email']
          }]
        }
      ]
    });

    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    res.json({ shipment });
  } catch (error) {
    console.error('Shipment fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch shipment' });
  }
});

// Create new shipment
router.post('/', authenticateToken, checkDepartment(['shipment', 'admin']), async (req, res) => {
  try {
    const {
      sales_order_id,
      expected_delivery_date,
      items,
      total_quantity,
      total_weight,
      total_volume,
      packaging_details,
      shipping_address,
      courier_partner_id,
      courier_company,
      shipping_cost,
      insurance_amount,
      cod_amount,
      shipping_method,
      payment_mode,
      special_instructions,
      recipient_name,
      recipient_phone
    } = req.body;

    // Generate shipment number
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const lastShipment = await Shipment.findOne({
      where: {
        shipment_number: { [Op.like]: `SHP-${dateStr}-%` }
      },
      order: [['shipment_number', 'DESC']]
    });

    let sequence = 1;
    if (lastShipment) {
      const lastSequence = parseInt(lastShipment.shipment_number.split('-')[2]);
      sequence = lastSequence + 1;
    }

    const shipment_number = `SHP-${dateStr}-${sequence.toString().padStart(4, '0')}`;

    const shipment = await Shipment.create({
      shipment_number,
      sales_order_id,
      expected_delivery_date,
      items,
      total_quantity,
      total_weight,
      total_volume,
      packaging_details,
      shipping_address,
      courier_partner_id,
      courier_company,
      shipping_cost: shipping_cost || 0,
      insurance_amount: insurance_amount || 0,
      cod_amount: cod_amount || 0,
      shipping_method: shipping_method || 'standard',
      payment_mode: payment_mode || 'prepaid',
      special_instructions,
      recipient_name,
      recipient_phone,
      created_by: req.user.id
    });

    // Create initial tracking entry
    await ShipmentTracking.create({
      shipment_id: shipment.id,
      status: 'preparing',
      description: 'Shipment created and preparing for dispatch',
      created_by: req.user.id
    });

    res.status(201).json({ 
      message: 'Shipment created successfully',
      shipment: await Shipment.findByPk(shipment.id, {
        include: [
          { model: SalesOrder, as: 'salesOrder' },
          { model: CourierPartner, as: 'courierPartner' }
        ]
      })
    });
  } catch (error) {
    console.error('Shipment creation error:', error);
    res.status(500).json({ message: 'Failed to create shipment' });
  }
});

// Update shipment
router.put('/:id', authenticateToken, checkDepartment(['shipment', 'admin']), async (req, res) => {
  try {
    const shipment = await Shipment.findByPk(req.params.id);
    
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    const {
      expected_delivery_date,
      items,
      total_quantity,
      total_weight,
      total_volume,
      packaging_details,
      shipping_address,
      courier_partner_id,
      courier_company,
      tracking_number,
      shipping_cost,
      insurance_amount,
      cod_amount,
      shipping_method,
      payment_mode,
      special_instructions,
      recipient_name,
      recipient_phone,
      status
    } = req.body;

    const oldStatus = shipment.status;
    
    await shipment.update({
      expected_delivery_date,
      items,
      total_quantity,
      total_weight,
      total_volume,
      packaging_details,
      shipping_address,
      courier_partner_id,
      courier_company,
      tracking_number,
      shipping_cost,
      insurance_amount,
      cod_amount,
      shipping_method,
      payment_mode,
      special_instructions,
      recipient_name,
      recipient_phone,
      status,
      last_status_update: status && status !== oldStatus ? new Date() : shipment.last_status_update
    });

    // Create tracking entry if status changed
    if (status && status !== oldStatus) {
      await ShipmentTracking.create({
        shipment_id: shipment.id,
        status: status,
        description: `Status updated from ${oldStatus} to ${status}`,
        created_by: req.user.id
      });
    }

    res.json({ 
      message: 'Shipment updated successfully',
      shipment: await Shipment.findByPk(shipment.id, {
        include: [
          { model: SalesOrder, as: 'salesOrder' },
          { model: CourierPartner, as: 'courierPartner' }
        ]
      })
    });
  } catch (error) {
    console.error('Shipment update error:', error);
    res.status(500).json({ message: 'Failed to update shipment' });
  }
});

// Delete shipment
router.delete('/:id', authenticateToken, checkDepartment(['shipment', 'admin']), async (req, res) => {
  try {
    const shipment = await Shipment.findByPk(req.params.id);
    
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    // Check if shipment can be deleted (only if not shipped)
    if (['shipped', 'in_transit', 'out_for_delivery', 'delivered'].includes(shipment.status)) {
      return res.status(400).json({ 
        message: 'Cannot delete shipment that has been shipped or delivered' 
      });
    }

    // Delete tracking entries first
    await ShipmentTracking.destroy({
      where: { shipment_id: shipment.id }
    });

    await shipment.destroy();

    res.json({ message: 'Shipment deleted successfully' });
  } catch (error) {
    console.error('Shipment deletion error:', error);
    res.status(500).json({ message: 'Failed to delete shipment' });
  }
});

// Update shipment status
router.post('/:id/status', authenticateToken, checkDepartment(['shipment', 'admin']), async (req, res) => {
  try {
    const { status, location, description, latitude, longitude } = req.body;
    const shipment = await Shipment.findByPk(req.params.id);
    
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    // Update shipment status
    await shipment.update({
      status,
      last_status_update: new Date(),
      actual_delivery_date: status === 'delivered' ? new Date() : shipment.actual_delivery_date
    });

    // Create tracking entry
    await ShipmentTracking.create({
      shipment_id: shipment.id,
      status,
      location,
      description,
      latitude,
      longitude,
      created_by: req.user.id
    });

    res.json({ message: 'Shipment status updated successfully' });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ message: 'Failed to update shipment status' });
  }
});

// Get shipment tracking
router.get('/:id/tracking', authenticateToken, checkDepartment(['shipment', 'admin', 'sales']), async (req, res) => {
  try {
    const tracking = await ShipmentTracking.findAll({
      where: { shipment_id: req.params.id },
      include: [{ 
        model: User, 
        as: 'creator',
        attributes: ['id', 'name', 'email']
      }],
      order: [['timestamp', 'DESC']]
    });

    res.json({ tracking });
  } catch (error) {
    console.error('Tracking fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch tracking information' });
  }
});

// Track by tracking number
router.get('/track/:trackingNumber', async (req, res) => {
  try {
    const shipment = await Shipment.findOne({
      where: { tracking_number: req.params.trackingNumber },
      include: [
        { 
          model: SalesOrder, 
          as: 'salesOrder',
          include: [{ model: Customer, as: 'customer' }]
        },
        { 
          model: CourierPartner, 
          as: 'courierPartner' 
        },
        {
          model: ShipmentTracking,
          as: 'trackingUpdates',
          order: [['timestamp', 'DESC']]
        }
      ]
    });

    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found with this tracking number' });
    }

    res.json({ shipment });
  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({ message: 'Failed to track shipment' });
  }
});

// Get dashboard statistics
router.get('/dashboard/stats', authenticateToken, checkDepartment(['shipment', 'admin', 'sales']), async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Total shipments
    const totalShipments = await Shipment.count();
    
    // Status-wise counts
    const statusCounts = await Shipment.findAll({
      attributes: [
        'status',
        [Shipment.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const stats = statusCounts.reduce((acc, stat) => {
      acc[stat.status] = parseInt(stat.count);
      return acc;
    }, {});

    // On-time delivery rate
    const deliveredShipments = await Shipment.findAll({
      where: { 
        status: 'delivered',
        actual_delivery_date: { [Op.not]: null }
      },
      attributes: ['expected_delivery_date', 'actual_delivery_date']
    });

    let onTimeCount = 0;
    deliveredShipments.forEach(shipment => {
      if (new Date(shipment.actual_delivery_date) <= new Date(shipment.expected_delivery_date)) {
        onTimeCount++;
      }
    });

    const onTimeDeliveryRate = deliveredShipments.length > 0 
      ? ((onTimeCount / deliveredShipments.length) * 100).toFixed(1)
      : 0;

    // Average delivery time
    let totalDeliveryDays = 0;
    deliveredShipments.forEach(shipment => {
      const shipDate = new Date(shipment.shipment_date);
      const deliveryDate = new Date(shipment.actual_delivery_date);
      const diffTime = Math.abs(deliveryDate - shipDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      totalDeliveryDays += diffDays;
    });

    const avgDeliveryTime = deliveredShipments.length > 0 
      ? (totalDeliveryDays / deliveredShipments.length).toFixed(1)
      : 0;

    res.json({
      totalShipments,
      inTransit: stats.in_transit || 0,
      delivered: stats.delivered || 0,
      delayed: stats.delayed || 0,
      onTimeDeliveryRate: parseFloat(onTimeDeliveryRate),
      avgDeliveryTime: parseFloat(avgDeliveryTime),
      statusBreakdown: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
});

// Export shipments data
router.get('/export/data', authenticateToken, checkDepartment(['shipment', 'admin']), async (req, res) => {
  try {
    const { format = 'json', start_date, end_date, status } = req.query;
    
    const where = {};
    if (start_date && end_date) {
      where.shipment_date = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }
    if (status) where.status = status;

    const shipments = await Shipment.findAll({
      where,
      include: [
        { 
          model: SalesOrder, 
          as: 'salesOrder',
          include: [{ model: Customer, as: 'customer' }]
        },
        { 
          model: CourierPartner, 
          as: 'courierPartner' 
        }
      ],
      order: [['created_at', 'DESC']]
    });

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = shipments.map(shipment => ({
        'Shipment Number': shipment.shipment_number,
        'Order Number': shipment.salesOrder?.order_number || '',
        'Customer': shipment.salesOrder?.customer?.name || '',
        'Courier': shipment.courierPartner?.name || shipment.courier_company || '',
        'Tracking Number': shipment.tracking_number || '',
        'Status': shipment.status,
        'Shipment Date': shipment.shipment_date,
        'Expected Delivery': shipment.expected_delivery_date,
        'Actual Delivery': shipment.actual_delivery_date || '',
        'Shipping Cost': shipment.shipping_cost
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=shipments.csv');
      
      // Simple CSV conversion
      const headers = Object.keys(csvData[0] || {});
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
      ].join('\n');
      
      res.send(csvContent);
    } else {
      res.json({ shipments });
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Failed to export shipments data' });
  }
});

// Daily shipments report
router.get('/reports/daily', authenticateToken, checkDepartment(['shipment', 'admin']), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const startDate = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = end_date ? new Date(end_date) : new Date();

    const dailyData = await Shipment.findAll({
      attributes: [
        [Shipment.sequelize.fn('DATE', Shipment.sequelize.col('shipment_date')), 'date'],
        [Shipment.sequelize.fn('COUNT', '*'), 'count']
      ],
      where: {
        shipment_date: {
          [Op.between]: [startDate, endDate]
        }
      },
      group: [Shipment.sequelize.fn('DATE', Shipment.sequelize.col('shipment_date'))],
      order: [[Shipment.sequelize.fn('DATE', Shipment.sequelize.col('shipment_date')), 'ASC']],
      raw: true
    });

    res.json({ data: dailyData });
  } catch (error) {
    console.error('Daily report error:', error);
    res.status(500).json({ message: 'Failed to fetch daily report' });
  }
});

// Status distribution report
router.get('/reports/status-distribution', authenticateToken, checkDepartment(['shipment', 'admin']), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const where = {};
    
    if (start_date && end_date) {
      where.shipment_date = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    const statusData = await Shipment.findAll({
      attributes: [
        'status',
        [Shipment.sequelize.fn('COUNT', '*'), 'count']
      ],
      where,
      group: ['status'],
      raw: true
    });

    const formattedData = statusData.map(item => ({
      name: item.status.replace('_', ' ').toUpperCase(),
      count: parseInt(item.count),
      status: item.status
    }));

    res.json({ data: formattedData });
  } catch (error) {
    console.error('Status distribution error:', error);
    res.status(500).json({ message: 'Failed to fetch status distribution' });
  }
});

// Courier performance report
router.get('/reports/courier-performance', authenticateToken, checkDepartment(['shipment', 'admin']), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const where = {};
    
    if (start_date && end_date) {
      where.shipment_date = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    const courierData = await Shipment.findAll({
      attributes: [
        'courier_company',
        [Shipment.sequelize.fn('COUNT', '*'), 'totalShipments'],
        [Shipment.sequelize.fn('COUNT', Shipment.sequelize.literal("CASE WHEN status = 'delivered' THEN 1 END")), 'deliveredShipments']
      ],
      where: {
        ...where,
        courier_company: { [Op.not]: null }
      },
      group: ['courier_company'],
      raw: true
    });

    const formattedData = courierData.map(item => ({
      name: item.courier_company,
      totalShipments: parseInt(item.totalShipments),
      deliveredShipments: parseInt(item.deliveredShipments || 0),
      deliveryRate: item.totalShipments > 0 ? 
        ((parseInt(item.deliveredShipments || 0) / parseInt(item.totalShipments)) * 100).toFixed(1) : 0,
      avgDeliveryTime: Math.floor(Math.random() * 5) + 2 // Mock data for now
    }));

    res.json({ data: formattedData });
  } catch (error) {
    console.error('Courier performance error:', error);
    res.status(500).json({ message: 'Failed to fetch courier performance' });
  }
});

// Create shipment from sales order ready to ship
router.post('/create-from-order/:salesOrderId', authenticateToken, checkDepartment(['shipment', 'admin']), async (req, res) => {
  try {
    const { courier_company, tracking_number, expected_delivery_date, notes } = req.body;

    const salesOrder = await SalesOrder.findByPk(req.params.salesOrderId, {
      include: [
        { model: Customer, as: 'customer' },
        { model: ProductionOrder, as: 'productionOrders', include: [{ model: ProductionStage, as: 'stages' }] }
      ]
    });

    if (!salesOrder) {
      return res.status(404).json({ message: 'Sales order not found' });
    }

    if (salesOrder.status !== 'ready_to_ship' && salesOrder.status !== 'qc_passed') {
      return res.status(400).json({ message: 'Sales order is not ready for shipment' });
    }

    // Generate shipment number
    const shipmentNumber = `SHP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

    // Create shipment
    const shipment = await Shipment.create({
      shipment_number: shipmentNumber,
      sales_order_id: req.params.salesOrderId,
      shipment_date: new Date(),
      expected_delivery_date: expected_delivery_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      items: salesOrder.items,
      total_quantity: salesOrder.total_quantity,
      total_weight: 0, // Calculate if needed
      total_volume: 0, // Calculate if needed
      courier_company,
      tracking_number,
      status: 'packed',
      packing_date: new Date(),
      notes,
      created_by: req.user.id
    });

    // Update sales order status
    await salesOrder.update({
      status: 'shipped',
      shipped_at: new Date(),
      lifecycle_history: [
        ...(salesOrder.lifecycle_history || []),
        {
          event: 'shipped',
          timestamp: new Date(),
          user: req.user.id,
          details: `Order shipped with shipment ${shipmentNumber}`
        }
      ]
    });

    // Update QR code
    await updateOrderQRCode(salesOrder.id, 'shipped');

    res.status(201).json({
      message: 'Shipment created successfully',
      shipment: await Shipment.findByPk(shipment.id, {
        include: [
          { model: SalesOrder, as: 'salesOrder', include: [{ model: Customer, as: 'customer' }] }
        ]
      })
    });
  } catch (error) {
    console.error('Create shipment error:', error);
    res.status(500).json({ message: 'Failed to create shipment' });
  }
});

// Helper function to update QR code (duplicate from manufacturing, should be centralized)
async function updateOrderQRCode(salesOrderId, status) {
  const salesOrder = await SalesOrder.findByPk(salesOrderId, {
    include: [
      { model: require('../models/Customer'), as: 'customer' },
      { model: ProductionOrder, as: 'productionOrders', include: [{ model: ProductionStage, as: 'stages' }] }
    ]
  });

  if (!salesOrder) return;

  const qrData = {
    order_id: salesOrder.order_number,
    status,
    customer: salesOrder.customer?.name,
    delivery_date: salesOrder.delivery_date,
    current_stage: status,
    lifecycle_history: salesOrder.lifecycle_history,
    production_progress: salesOrder.productionOrders?.[0] ? {
      total_quantity: salesOrder.productionOrders[0].quantity,
      completed_stages: salesOrder.productionOrders[0].stages?.filter(s => s.status === 'completed').length,
      total_stages: salesOrder.productionOrders[0].stages?.length
    } : null,
    last_updated: new Date()
  };

  await salesOrder.update({
    qr_code: JSON.stringify(qrData)
  });
}

module.exports = router;