/**
 * Production Complete & Shipment Creation Endpoint
 * Path: POST /manufacturing/orders/:orderId/complete-and-ship
 * 
 * This endpoint handles the complete workflow when production is finished:
 * 1. Validate production order is eligible for completion
 * 2. Check all stages are completed
 * 3. Handle material reconciliation (return leftovers to inventory)
 * 4. Create shipment record
 * 5. Update production order status to 'completed'
 * 6. Send notifications
 */

const express = require('express');
const { sequelize } = require('../config/database');
const { ProductionOrder, ProductionStage, Shipment, SalesOrder, Inventory, InventoryMovement } = require('../models');
const { authenticateToken, checkDepartment } = require('../middleware/auth');
const { NotificationService } = require('../services/NotificationService');
const { generateShipmentNumber } = require('../utils/numberGenerator');

// Add this route to manufacturing.js
router.post(
  '/orders/:orderId/complete-and-ship',
  authenticateToken,
  checkDepartment(['manufacturing', 'admin']),
  async (req, res) => {
    let transaction;
    try {
      transaction = await sequelize.transaction();

      const orderId = req.params.orderId;
      const { material_reconciliation = {}, shipment_details = {} } = req.body;

      // ============================================================
      // STEP 1: Fetch Production Order
      // ============================================================
      const productionOrder = await ProductionOrder.findByPk(orderId, {
        include: [
          { model: ProductionStage, as: 'stages' },
          { model: SalesOrder, as: 'salesOrder' }
        ],
        transaction
      });

      if (!productionOrder) {
        return res.status(404).json({
          success: false,
          message: 'Production order not found'
        });
      }

      // ============================================================
      // STEP 2: Validate Production Status
      // ============================================================
      if (productionOrder.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Production order already completed'
        });
      }

      if (productionOrder.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Cannot complete a cancelled production order'
        });
      }

      // ============================================================
      // STEP 3: Check All Stages are Completed
      // ============================================================
      const allStagesCompleted = productionOrder.stages && 
        productionOrder.stages.length > 0 &&
        productionOrder.stages.every(stage => stage.status === 'completed');

      if (!allStagesCompleted) {
        const completedStages = productionOrder.stages?.filter(s => s.status === 'completed').length || 0;
        const totalStages = productionOrder.stages?.length || 0;
        
        return res.status(400).json({
          success: false,
          message: `Cannot complete production. Only ${completedStages}/${totalStages} stages are completed`,
          stages_progress: {
            completed: completedStages,
            total: totalStages
          }
        });
      }

      // ============================================================
      // STEP 4: Check Approved Quantity
      // ============================================================
      if (productionOrder.approved_quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'No approved quantity. Cannot create shipment without approved items',
          approved_quantity: productionOrder.approved_quantity
        });
      }

      // ============================================================
      // STEP 5: Handle Material Reconciliation
      // ============================================================
      let inventoryMovements = [];

      if (material_reconciliation.return_to_inventory && 
          material_reconciliation.leftover_materials && 
          material_reconciliation.leftover_materials.length > 0) {
        
        for (const material of material_reconciliation.leftover_materials) {
          if (!material.return_to_stock) continue;

          // Find inventory item
          const inventoryItem = await Inventory.findByPk(material.inventory_id, {
            transaction
          });

          if (!inventoryItem) {
            console.warn(`Inventory item ${material.inventory_id} not found, skipping`);
            continue;
          }

          // Update inventory quantity
          const previousQuantity = inventoryItem.quantity_available || 0;
          inventoryItem.quantity_available = (previousQuantity || 0) + (material.quantity_leftover || 0);
          
          await inventoryItem.save({ transaction });

          // Create inventory movement record
          const movement = await InventoryMovement.create({
            inventory_id: material.inventory_id,
            production_order_id: orderId,
            movement_type: 'return_from_production',
            quantity: material.quantity_leftover,
            reference_type: 'production_order',
            reference_id: orderId,
            notes: `Leftover material returned from production order ${productionOrder.production_number}`,
            created_by: req.user.id
          }, { transaction });

          inventoryMovements.push(movement);
        }
      }

      // ============================================================
      // STEP 6: Update Production Order Status
      // ============================================================
      productionOrder.status = 'completed';
      productionOrder.completed_at = new Date();
      productionOrder.material_reconciliation_data = material_reconciliation;
      
      await productionOrder.save({ transaction });

      // ============================================================
      // STEP 7: Create Shipment
      // ============================================================
      const shipmentNumber = generateShipmentNumber();
      
      // Prepare shipment items from production order
      const shipmentItems = [{
        production_order_id: orderId,
        product_id: productionOrder.product_id,
        product_name: productionOrder.product?.name || 'Unknown',
        quantity: productionOrder.approved_quantity,
        unit_price: productionOrder.salesOrder?.unit_price || 0,
        total_price: (productionOrder.approved_quantity * (productionOrder.salesOrder?.unit_price || 0))
      }];

      // Calculate expected delivery date (default: 5 days from now)
      const expectedDeliveryDate = shipment_details.expected_delivery_date 
        ? new Date(shipment_details.expected_delivery_date)
        : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

      const shipment = await Shipment.create({
        shipment_number: shipmentNumber,
        sales_order_id: productionOrder.sales_order_id,
        production_order_id: orderId,
        items: shipmentItems,
        total_quantity: productionOrder.approved_quantity,
        shipping_address: shipment_details.shipping_address || 
                         productionOrder.salesOrder?.shipping_address || 
                         'To be provided',
        status: 'preparing', // Start with preparing status
        shipment_date: new Date(),
        expected_delivery_date: expectedDeliveryDate,
        special_instructions: shipment_details.special_instructions || 
                             material_reconciliation.notes || '',
        created_by: req.user.id
      }, { transaction });

      // ============================================================
      // STEP 8: Update Sales Order Status (Optional)
      // ============================================================
      if (productionOrder.salesOrder) {
        productionOrder.salesOrder.status = 'in_shipment';
        await productionOrder.salesOrder.save({ transaction });
      }

      // ============================================================
      // STEP 9: Send Notifications
      // ============================================================
      try {
        // Notify Manufacturing Department
        await NotificationService.create({
          user_id: null,
          department: 'manufacturing',
          title: 'Production Complete',
          message: `Production order ${productionOrder.production_number} has been completed and is ready for shipment`,
          type: 'production_completed',
          priority: 'high',
          related_id: orderId,
          related_type: 'production_order'
        });

        // Notify Shipment Department
        await NotificationService.create({
          user_id: null,
          department: 'shipment',
          title: 'New Shipment Ready',
          message: `Shipment ${shipmentNumber} is ready for dispatch. Quantity: ${productionOrder.approved_quantity} units`,
          type: 'shipment_created',
          priority: 'high',
          related_id: shipment.id,
          related_type: 'shipment'
        });

        // Notify Sales Department
        await NotificationService.create({
          user_id: null,
          department: 'sales',
          title: 'Order Ready for Shipment',
          message: `Sales order linked to production ${productionOrder.production_number} is ready for shipment`,
          type: 'order_ready_shipment',
          priority: 'medium',
          related_id: productionOrder.sales_order_id,
          related_type: 'sales_order'
        });

        // Notify Inventory (if materials returned)
        if (inventoryMovements.length > 0) {
          await NotificationService.create({
            user_id: null,
            department: 'inventory',
            title: 'Materials Returned',
            message: `${inventoryMovements.length} inventory items returned from production ${productionOrder.production_number}`,
            type: 'inventory_returned',
            priority: 'medium',
            related_id: orderId,
            related_type: 'production_order'
          });
        }
      } catch (notifError) {
        console.error('Error sending notifications:', notifError);
        // Don't fail the transaction for notification errors
      }

      // ============================================================
      // STEP 10: Commit Transaction
      // ============================================================
      await transaction.commit();

      // ============================================================
      // STEP 11: Return Success Response
      // ============================================================
      res.json({
        success: true,
        message: 'Production completed and shipment created successfully',
        production_order: {
          id: productionOrder.id,
          production_number: productionOrder.production_number,
          status: productionOrder.status,
          completed_at: productionOrder.completed_at,
          approved_quantity: productionOrder.approved_quantity
        },
        shipment: {
          id: shipment.id,
          shipment_number: shipment.shipment_number,
          status: shipment.status,
          total_quantity: shipment.total_quantity,
          expected_delivery_date: shipment.expected_delivery_date
        },
        material_reconciliation: {
          items_returned: inventoryMovements.length,
          total_quantity_returned: material_reconciliation.leftover_materials
            ?.reduce((sum, m) => sum + (m.return_to_stock ? m.quantity_leftover : 0), 0) || 0
        },
        notifications_sent: true
      });

    } catch (error) {
      // ============================================================
      // ROLLBACK ON ERROR
      // ============================================================
      if (transaction) {
        await transaction.rollback();
      }

      console.error('Error completing production:', error);

      res.status(500).json({
        success: false,
        message: 'Error completing production',
        error: error.message
      });
    }
  }
);

// ============================================================
// Helper Endpoint: Get Material Reconciliation Data
// ============================================================
router.get(
  '/orders/:orderId/materials/reconciliation',
  authenticateToken,
  checkDepartment(['manufacturing', 'admin']),
  async (req, res) => {
    try {
      const orderId = req.params.orderId;

      // Fetch production order with materials
      const productionOrder = await ProductionOrder.findByPk(orderId, {
        include: [
          { model: ProductionStage, as: 'stages' },
          { model: MaterialDispatch, as: 'materialDispatches' },
          { model: MaterialConsumption, as: 'materials' }
        ]
      });

      if (!productionOrder) {
        return res.status(404).json({
          success: false,
          message: 'Production order not found'
        });
      }

      // Calculate material usage from production stages
      const materialsUsed = await MaterialConsumption.findAll({
        where: { production_order_id: orderId }
      });

      // Fetch corresponding inventory items
      const materialDetails = await Promise.all(
        materialsUsed.map(async (material) => {
          const inventory = await Inventory.findByPk(material.inventory_id);
          return {
            id: material.id,
            inventory_id: material.inventory_id,
            material_name: inventory?.product_name || 'Unknown Material',
            category: inventory?.category || '',
            quantity_used: material.quantity_used || 0,
            quantity_leftover: (material.quantity_allocated || 0) - (material.quantity_used || 0),
            unit: inventory?.unit_of_measurement || 'pcs'
          };
        })
      );

      res.json({
        success: true,
        production_order: {
          id: productionOrder.id,
          production_number: productionOrder.production_number,
          quantity: productionOrder.quantity,
          approved_quantity: productionOrder.approved_quantity,
          status: productionOrder.status
        },
        materials: materialDetails.filter(m => m.quantity_leftover > 0),
        summary: {
          total_materials: materialDetails.length,
          materials_with_leftovers: materialDetails.filter(m => m.quantity_leftover > 0).length,
          total_leftover_quantity: materialDetails.reduce((sum, m) => sum + m.quantity_leftover, 0)
        }
      });

    } catch (error) {
      console.error('Error fetching material reconciliation:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching material reconciliation',
        error: error.message
      });
    }
  }
);

// Export the routes to add to manufacturing.js
module.exports = {
  completeAndShipEndpoint: `POST /manufacturing/orders/:orderId/complete-and-ship`,
  getMaterialReconciliationEndpoint: `GET /manufacturing/orders/:orderId/materials/reconciliation`
};