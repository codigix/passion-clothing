const express = require('express');
const { CourierPartner, Shipment, User, SalesOrder, Customer } = require('../config/database');
const { authenticateToken, checkDepartment } = require('../middleware/auth');
const { Op } = require('sequelize');
const router = express.Router();

// Get all courier partners
router.get('/', authenticateToken, checkDepartment(['shipment', 'admin']), async (req, res) => {
  try {
    const { is_active, search } = req.query;
    const where = {};

    if (is_active !== undefined) where.is_active = is_active === 'true';
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { code: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const courierPartners = await CourierPartner.findAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Shipment,
          as: 'shipments',
          attributes: ['id', 'status'],
          required: false
        }
      ],
      order: [['name', 'ASC']]
    });

    // Calculate active shipments and performance metrics for each partner
    const partnersWithStats = courierPartners.map(partner => {
      const shipments = partner.shipments || [];
      const activeShipments = shipments.filter(s => 
        ['preparing', 'packed', 'ready_to_ship', 'shipped', 'in_transit', 'out_for_delivery'].includes(s.status)
      ).length;

      return {
        ...partner.toJSON(),
        activeShipments,
        totalShipments: shipments.length
      };
    });

    res.json({ courierPartners: partnersWithStats });
  } catch (error) {
    console.error('Courier partners fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch courier partners' });
  }
});

// Get single courier partner
router.get('/:id', authenticateToken, checkDepartment(['shipment', 'admin']), async (req, res) => {
  try {
    const courierPartner = await CourierPartner.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Shipment,
          as: 'shipments',
          include: [
            {
              model: SalesOrder,
              as: 'salesOrder',
              include: [{ model: Customer, as: 'customer' }]
            }
          ]
        }
      ]
    });

    if (!courierPartner) {
      return res.status(404).json({ message: 'Courier partner not found' });
    }

    res.json({ courierPartner });
  } catch (error) {
    console.error('Courier partner fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch courier partner' });
  }
});

// Create courier partner
router.post('/', authenticateToken, checkDepartment(['shipment', 'admin']),  async (req, res) => {
  try {
    const {
      name,
      code,
      contact_person,
      phone,
      email,
      address,
      website,
      service_areas,
      services_offered,
      pricing_structure,
      api_endpoint,
      api_key,
      tracking_url_template,
      contract_start_date,
      contract_end_date,
      payment_terms,
      notes
    } = req.body;

    const courierPartner = await CourierPartner.create({
      name,
      code,
      contact_person,
      phone,
      email,
      address,
      website,
      service_areas,
      services_offered,
      pricing_structure,
      api_endpoint,
      api_key,
      tracking_url_template,
      contract_start_date,
      contract_end_date,
      payment_terms,
      notes,
      created_by: req.user.id
    });

    res.status(201).json({ 
      message: 'Courier partner created successfully',
      courierPartner 
    });
  } catch (error) {
    console.error('Courier partner creation error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ message: 'Courier partner name or code already exists' });
    } else {
      res.status(500).json({ message: 'Failed to create courier partner' });
    }
  }
});

// Update courier partner
router.put('/:id', authenticateToken, checkDepartment(['shipment', 'admin']), async (req, res) => {
  try {
    const courierPartner = await CourierPartner.findByPk(req.params.id);
    
    if (!courierPartner) {
      return res.status(404).json({ message: 'Courier partner not found' });
    }

    const {
      name,
      code,
      contact_person,
      phone,
      email,
      address,
      website,
      service_areas,
      services_offered,
      pricing_structure,
      api_endpoint,
      api_key,
      tracking_url_template,
      rating,
      on_time_delivery_rate,
      average_delivery_time,
      is_active,
      contract_start_date,
      contract_end_date,
      payment_terms,
      notes
    } = req.body;

    await courierPartner.update({
      name,
      code,
      contact_person,
      phone,
      email,
      address,
      website,
      service_areas,
      services_offered,
      pricing_structure,
      api_endpoint,
      api_key,
      tracking_url_template,
      rating,
      on_time_delivery_rate,
      average_delivery_time,
      is_active,
      contract_start_date,
      contract_end_date,
      payment_terms,
      notes
    });

    res.json({ 
      message: 'Courier partner updated successfully',
      courierPartner 
    });
  } catch (error) {
    console.error('Courier partner update error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ message: 'Courier partner name or code already exists' });
    } else {
      res.status(500).json({ message: 'Failed to update courier partner' });
    }
  }
});

// Delete courier partner
router.delete('/:id', authenticateToken, checkDepartment(['shipment', 'admin']), async (req, res) => {
  try {
    const courierPartner = await CourierPartner.findByPk(req.params.id);
    
    if (!courierPartner) {
      return res.status(404).json({ message: 'Courier partner not found' });
    }

    // Check if courier partner has active shipments
    const activeShipments = await Shipment.count({
      where: {
        courier_partner_id: courierPartner.id,
        status: {
          [Op.in]: ['preparing', 'packed', 'ready_to_ship', 'shipped', 'in_transit', 'out_for_delivery']
        }
      }
    });

    if (activeShipments > 0) {
      return res.status(400).json({ 
        message: `Cannot delete courier partner with ${activeShipments} active shipments. Please complete or reassign shipments first.` 
      });
    }

    await courierPartner.destroy();

    res.json({ message: 'Courier partner deleted successfully' });
  } catch (error) {
    console.error('Courier partner deletion error:', error);
    res.status(500).json({ message: 'Failed to delete courier partner' });
  }
});

// Update courier partner performance metrics
router.post('/:id/performance', authenticateToken, checkDepartment(['shipment', 'admin']), async (req, res) => {
  try {
    const { rating, on_time_delivery_rate, average_delivery_time } = req.body;
    const courierPartner = await CourierPartner.findByPk(req.params.id);
    
    if (!courierPartner) {
      return res.status(404).json({ message: 'Courier partner not found' });
    }

    await courierPartner.update({
      rating,
      on_time_delivery_rate,
      average_delivery_time
    });

    res.json({ message: 'Performance metrics updated successfully' });
  } catch (error) {
    console.error('Performance update error:', error);
    res.status(500).json({ message: 'Failed to update performance metrics' });
  }
});

// Get courier partner performance analytics
router.get('/:id/analytics', authenticateToken, checkDepartment(['shipment', 'admin']), async (req, res) => {
  try {
    const courierPartner = await CourierPartner.findByPk(req.params.id);
    
    if (!courierPartner) {
      return res.status(404).json({ message: 'Courier partner not found' });
    }

    // Get shipments for this courier partner
    const shipments = await Shipment.findAll({
      where: { courier_partner_id: courierPartner.id },
      attributes: [
        'status',
        'shipment_date',
        'expected_delivery_date',
        'actual_delivery_date',
        'shipping_cost'
      ]
    });

    // Calculate analytics
    const totalShipments = shipments.length;
    const deliveredShipments = shipments.filter(s => s.status === 'delivered');
    const onTimeDeliveries = deliveredShipments.filter(s => 
      s.actual_delivery_date && new Date(s.actual_delivery_date) <= new Date(s.expected_delivery_date)
    );

    const onTimeRate = deliveredShipments.length > 0 
      ? ((onTimeDeliveries.length / deliveredShipments.length) * 100).toFixed(1)
      : 0;

    // Calculate average delivery time
    let totalDeliveryDays = 0;
    deliveredShipments.forEach(shipment => {
      if (shipment.actual_delivery_date) {
        const shipDate = new Date(shipment.shipment_date);
        const deliveryDate = new Date(shipment.actual_delivery_date);
        const diffTime = Math.abs(deliveryDate - shipDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        totalDeliveryDays += diffDays;
      }
    });

    const avgDeliveryTime = deliveredShipments.length > 0 
      ? (totalDeliveryDays / deliveredShipments.length).toFixed(1)
      : 0;

    // Status breakdown
    const statusBreakdown = shipments.reduce((acc, shipment) => {
      acc[shipment.status] = (acc[shipment.status] || 0) + 1;
      return acc;
    }, {});

    // Total shipping cost
    const totalShippingCost = shipments.reduce((sum, s) => sum + parseFloat(s.shipping_cost || 0), 0);

    res.json({
      analytics: {
        totalShipments,
        deliveredShipments: deliveredShipments.length,
        onTimeDeliveryRate: parseFloat(onTimeRate),
        averageDeliveryTime: parseFloat(avgDeliveryTime),
        statusBreakdown,
        totalShippingCost: totalShippingCost.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

// Get performance data for all courier partners
router.get('/performance', authenticateToken, checkDepartment(['shipment', 'admin']), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const where = {};
    
    if (start_date && end_date) {
      where.shipment_date = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    const courierPartners = await CourierPartner.findAll({
      where: { is_active: true },
      include: [{
        model: Shipment,
        as: 'shipments',
        where,
        required: false,
        attributes: ['status', 'shipment_date', 'actual_delivery_date', 'expected_delivery_date']
      }]
    });

    const performanceData = courierPartners.map(courier => {
      const shipments = courier.shipments || [];
      const totalShipments = shipments.length;
      const deliveredShipments = shipments.filter(s => s.status === 'delivered');
      
      const onTimeDeliveries = deliveredShipments.filter(s => 
        s.actual_delivery_date && new Date(s.actual_delivery_date) <= new Date(s.expected_delivery_date)
      );

      const deliveryRate = totalShipments > 0 ? 
        ((deliveredShipments.length / totalShipments) * 100).toFixed(1) : 0;

      // Calculate average delivery time
      let totalDeliveryDays = 0;
      deliveredShipments.forEach(shipment => {
        if (shipment.actual_delivery_date) {
          const shipDate = new Date(shipment.shipment_date);
          const deliveryDate = new Date(shipment.actual_delivery_date);
          const diffTime = Math.abs(deliveryDate - shipDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          totalDeliveryDays += diffDays;
        }
      });

      const avgDeliveryTime = deliveredShipments.length > 0 ? 
        (totalDeliveryDays / deliveredShipments.length).toFixed(1) : 0;

      return {
        name: courier.company_name,
        totalShipments,
        deliveredShipments: deliveredShipments.length,
        deliveryRate: parseFloat(deliveryRate),
        avgDeliveryTime: parseFloat(avgDeliveryTime),
        onTimeRate: deliveredShipments.length > 0 ? 
          ((onTimeDeliveries.length / deliveredShipments.length) * 100).toFixed(1) : 0
      };
    });

    res.json({ data: performanceData });
  } catch (error) {
    console.error('Performance data error:', error);
    res.status(500).json({ message: 'Failed to fetch performance data' });
  }
});

module.exports = router;