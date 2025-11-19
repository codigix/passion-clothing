const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();

const {
  ProductionOrder,
  ProductionStage,
  MaterialConsumption,
  QualityCheckpoint,
  User,
  MaterialAllocation,
  Inventory,
  InventoryMovement,
  StageReworkHistory,
  MaterialReturn,
  sequelize,
} = require('../config/database');

const { authenticateToken, checkDepartment } = require('../middleware/auth');
const NotificationService = require('../utils/notificationService');

/**
 * ✅ UPDATE PRODUCTION STAGE - Add start/end times, material used, quality approval
 * POST /production-tracking/stages/:stageId/update
 */
router.post(
  '/stages/:stageId/update',
  authenticateToken,
  checkDepartment(['manufacturing', 'admin']),
  async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { stageId } = req.params;
      const userId = req.user.id;
      const {
        actual_start_time,
        actual_end_time,
        material_used,
        quality_checkpoint_result,
        checkpoint_notes,
        quantity_processed,
        quantity_approved,
        quantity_rejected,
      } = req.body;

      // Fetch stage with order details
      const stage = await ProductionStage.findByPk(stageId, {
        include: [
          {
            model: ProductionOrder,
            as: 'productionOrder',
            attributes: ['id', 'sales_order_id', 'planned_end_date', 'status'],
          },
        ],
        transaction,
      });

      if (!stage) {
        return res.status(404).json({ error: 'Stage not found' });
      }

      // Check if stage is frozen
      if (stage.is_frozen) {
        return res.status(409).json({
          error: 'Stage is frozen due to exceeding deadline. Contact supervisor.',
        });
      }

      // Update stage times
      if (actual_start_time) {
        stage.actual_start_time = new Date(actual_start_time);
      }
      if (actual_end_time) {
        stage.actual_end_time = new Date(actual_end_time);
      }

      // Update quantity metrics
      if (quantity_processed !== undefined) {
        stage.quantity_processed = quantity_processed;
      }
      if (quantity_approved !== undefined) {
        stage.quantity_approved = quantity_approved;
      }
      if (quantity_rejected !== undefined) {
        stage.quantity_rejected = quantity_rejected;
      }

      // ✅ Check if stage is LATE (actual_end_time > planned_end_time)
      if (
        actual_end_time &&
        stage.planned_end_time &&
        new Date(actual_end_time) > new Date(stage.planned_end_time)
      ) {
        stage.is_late = true;
        stage.is_frozen = true; // Freeze the order
        stage.late_reason = `Stage completed at ${new Date(
          actual_end_time
        ).toLocaleString()}, planned was ${new Date(
          stage.planned_end_time
        ).toLocaleString()}`;

        // Send notification to supervisor
        try {
          await NotificationService.createNotification({
            title: 'Production Stage Exceeded Deadline',
            message: `Stage "${stage.stage_name}" in order #${stage.productionOrder?.sales_order_id} has exceeded the planned deadline. Order is now frozen pending supervisor review.`,
            type: 'warning',
            priority: 'high',
            department: 'manufacturing',
            related_id: stage.production_order_id,
            related_type: 'production_order',
          });
        } catch (e) {
          console.error('Failed to send late notification:', e);
        }
      }

      // ✅ Record material consumed
      if (material_used && Array.isArray(material_used)) {
        let totalUsed = 0;
        for (const mat of material_used) {
          const { inventory_id, quantity, notes, source } = mat;

          // Create consumption record
          await MaterialConsumption.create(
            {
              production_order_id: stage.production_order_id,
              production_stage_id: stageId,
              material_id: inventory_id,
              inventory_id: inventory_id,
              barcode: `MAT-${inventory_id}`,
              quantity_used: quantity,
              unit: mat.unit || 'pc',
              consumed_by: userId,
              consumed_at: new Date(),
              notes,
            },
            { transaction }
          );

          totalUsed += parseFloat(quantity || 0);

          // If material came from allocated pool, update allocation
          if (source === 'allocated') {
            const allocation = await MaterialAllocation.findOne(
              {
                where: {
                  production_order_id: stage.production_order_id,
                  inventory_id,
                },
              },
              { transaction }
            );

            if (allocation) {
              allocation.consumed_quantity =
                (allocation.consumed_quantity || 0) + quantity;
              allocation.remaining_quantity = Math.max(
                0,
                allocation.allocated_quantity - allocation.consumed_quantity
              );
              await allocation.save({ transaction });
            }
          }
        }

        stage.total_material_used = totalUsed;
      }

      // ✅ Process quality checkpoint approval
      if (quality_checkpoint_result) {
        // Find and update the stage's quality checkpoints
        const checkpoints = await QualityCheckpoint.findAll(
          {
            where: { production_stage_id: stageId },
          },
          { transaction }
        );

        if (checkpoints.length > 0) {
          for (const checkpoint of checkpoints) {
            checkpoint.status = quality_checkpoint_result;
            checkpoint.result = quality_checkpoint_result;
            checkpoint.checked_by = userId;
            checkpoint.checked_at = new Date();
            checkpoint.notes = checkpoint_notes || '';
            await checkpoint.save({ transaction });
          }

          // Mark stage quality as approved if all checkpoints passed
          if (quality_checkpoint_result === 'passed') {
            stage.quality_approved = true;
            stage.approved_at = new Date();
            stage.approved_by = userId;
            stage.status = 'completed';
          } else if (quality_checkpoint_result === 'failed') {
            // Quality check failed - don't complete yet
            stage.quality_approved = false;
          }
        }
      }

      await stage.save({ transaction });
      await transaction.commit();

      res.json({
        message: 'Stage updated successfully',
        stage,
        is_late: stage.is_late,
        is_frozen: stage.is_frozen,
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error updating stage:', error);
      res.status(500).json({
        error: error.message,
        details: error.errors || [],
      });
    }
  }
);

/**
 * ✅ HANDLE REWORK - Record failed iteration and start new one
 * POST /production-tracking/stages/:stageId/rework
 */
router.post(
  '/stages/:stageId/rework',
  authenticateToken,
  checkDepartment(['manufacturing', 'admin']),
  async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { stageId } = req.params;
      const userId = req.user.id;
      const { failure_reason, failed_quantity, additional_cost, notes } = req.body;

      const stage = await ProductionStage.findByPk(stageId, {
        transaction,
      });

      if (!stage) {
        return res.status(404).json({ error: 'Stage not found' });
      }

      // Record this rework in history
      const reworkRecord = await StageReworkHistory.create(
        {
          production_stage_id: stageId,
          iteration_number: stage.rework_iteration,
          failure_reason,
          failed_quantity: failed_quantity || 0,
          additional_cost: additional_cost || 0,
          status: 'failed',
          failed_by: userId,
          notes,
        },
        { transaction }
      );

      // Increment iteration for next attempt
      stage.rework_iteration = (stage.rework_iteration || 1) + 1;
      stage.status = 'in_progress'; // Reset to in_progress
      stage.quality_approved = false;
      stage.actual_end_time = null; // Clear end time for rework

      // Add rework cost
      stage.cost = (stage.cost || 0) + (additional_cost || 0);

      await stage.save({ transaction });
      await transaction.commit();

      res.json({
        message: 'Rework recorded. Stage reset for retry.',
        rework_record: reworkRecord,
        next_iteration: stage.rework_iteration,
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error recording rework:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * ✅ APPROVE STAGE - Verify all requirements met and allow next stage
 * POST /production-tracking/stages/:stageId/approve
 */
router.post(
  '/stages/:stageId/approve',
  authenticateToken,
  checkDepartment(['manufacturing', 'qa', 'admin']),
  async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { stageId } = req.params;
      const userId = req.user.id;
      const { approval_notes } = req.body;

      const stage = await ProductionStage.findByPk(stageId, {
        include: [{ model: ProductionOrder, as: 'productionOrder' }],
        transaction,
      });

      if (!stage) {
        return res.status(404).json({ error: 'Stage not found' });
      }

      if (!stage.quality_approved) {
        return res.status(409).json({
          error: 'Quality checkpoints must be passed before approval',
        });
      }

      stage.status = 'completed';
      stage.approved_at = new Date();
      stage.approved_by = userId;
      await stage.save({ transaction });

      // Auto-start next stage if exists
      const nextStage = await ProductionStage.findOne(
        {
          where: {
            production_order_id: stage.production_order_id,
            stage_order: { [Op.gt]: stage.stage_order },
          },
          order: [['stage_order', 'ASC']],
        },
        { transaction }
      );

      if (nextStage) {
        nextStage.status = 'pending';
        await nextStage.save({ transaction });
      } else {
        // All stages done - mark order as complete
        const order = await ProductionOrder.findByPk(
          stage.production_order_id,
          { transaction }
        );
        if (order) {
          order.status = 'completed';
          await order.save({ transaction });
        }
      }

      await transaction.commit();

      res.json({
        message: 'Stage approved successfully',
        next_stage: nextStage || null,
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error approving stage:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * ✅ UNFREEZE ORDER - Supervisor action to unfreeze a late order
 * POST /production-tracking/orders/:orderId/unfreeze
 */
router.post(
  '/orders/:orderId/unfreeze',
  authenticateToken,
  checkDepartment(['manufacturing', 'admin']),
  async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { orderId } = req.params;
      const { unfreeze_reason } = req.body;

      // Unfreeze all stages in this order
      const stages = await ProductionStage.findAll(
        {
          where: { production_order_id: orderId, is_frozen: true },
        },
        { transaction }
      );

      for (const stage of stages) {
        stage.is_frozen = false;
        stage.delay_reason = unfreeze_reason || '';
        await stage.save({ transaction });
      }

      await transaction.commit();

      res.json({
        message: 'Order unfrozen. Production may continue.',
        unfrozen_stages: stages.length,
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error unfreezing order:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * ✅ REQUEST MATERIAL RETURN - After production complete, request leftover materials back to inventory
 * POST /production-tracking/orders/:orderId/request-material-return
 */
router.post(
  '/orders/:orderId/request-material-return',
  authenticateToken,
  checkDepartment(['manufacturing', 'admin']),
  async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { orderId } = req.params;
      const userId = req.user.id;
      const { materials_to_return } = req.body; // Array of {inventory_id, quantity, unit, reason}

      // Check if order is fully complete
      const order = await ProductionOrder.findByPk(orderId, {
        include: [{ model: ProductionStage, as: 'stages' }],
        transaction,
      });

      if (!order) {
        return res.status(404).json({ error: 'Production order not found' });
      }

      const allStagesComplete =
        order.stages && order.stages.every((s) => s.status === 'completed');
      if (!allStagesComplete) {
        return res.status(409).json({
          error: 'All stages must be completed before requesting material return',
        });
      }

      // Create material return request
      const materialReturn = await MaterialReturn.create(
        {
          production_order_id: orderId,
          total_materials: materials_to_return,
          status: 'pending_approval',
          return_date: new Date(),
        },
        { transaction }
      );

      // Send notification to inventory manager
      try {
        await NotificationService.createNotification({
          title: 'Material Return Request',
          message: `Production order #${order.sales_order_id} has completed production. ${materials_to_return?.length || 0} items are pending return to inventory.`,
          type: 'info',
          priority: 'normal',
          department: 'inventory',
          related_id: orderId,
          related_type: 'production_order',
        });
      } catch (e) {
        console.error('Failed to send material return notification:', e);
      }

      await transaction.commit();

      res.json({
        message: 'Material return request created',
        material_return_id: materialReturn.id,
        status: 'pending_approval',
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error creating material return request:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * ✅ APPROVE MATERIAL RETURN - Inventory manager approves return
 * POST /production-tracking/material-returns/:returnId/approve
 */
router.post(
  '/material-returns/:returnId/approve',
  authenticateToken,
  checkDepartment(['inventory', 'admin']),
  async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { returnId } = req.params;
      const userId = req.user.id;
      const { approval_notes } = req.body;

      const materialReturn = await MaterialReturn.findByPk(returnId, {
        transaction,
      });

      if (!materialReturn) {
        return res.status(404).json({ error: 'Material return request not found' });
      }

      materialReturn.status = 'approved';
      materialReturn.approved_at = new Date();
      materialReturn.approved_by = userId;
      materialReturn.approval_notes = approval_notes;

      await materialReturn.save({ transaction });
      await transaction.commit();

      res.json({
        message: 'Material return approved. Ready to process return.',
        material_return_id: materialReturn.id,
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error approving material return:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * ✅ PROCESS MATERIAL RETURN - Actually receive materials back into inventory
 * POST /production-tracking/material-returns/:returnId/process
 */
router.post(
  '/material-returns/:returnId/process',
  authenticateToken,
  checkDepartment(['inventory', 'admin']),
  async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { returnId } = req.params;
      const userId = req.user.id;

      const materialReturn = await MaterialReturn.findByPk(returnId, {
        transaction,
      });

      if (!materialReturn) {
        return res.status(404).json({ error: 'Material return request not found' });
      }

      if (materialReturn.status !== 'approved') {
        return res.status(409).json({
          error: 'Material return must be approved before processing',
        });
      }

      // Process each material
      const materials = materialReturn.total_materials || [];
      let totalMovement = null;

      for (const material of materials) {
        const { inventory_id, quantity, unit, reason } = material;

        // Update inventory
        const inventoryItem = await Inventory.findByPk(inventory_id, {
          transaction,
        });

        if (inventoryItem) {
          inventoryItem.quantity_in_stock =
            (inventoryItem.quantity_in_stock || 0) + quantity;
          await inventoryItem.save({ transaction });

          // Create inventory movement record
          totalMovement = await InventoryMovement.create(
            {
              inventory_id,
              movement_type: 'production_return',
              quantity_in: quantity,
              quantity_out: 0,
              reference_type: 'production_order',
              reference_id: materialReturn.production_order_id,
              reason: `Material return from production order - ${reason}`,
              performed_by: userId,
              movement_date: new Date(),
            },
            { transaction }
          );
        }
      }

      // Mark return as completed
      materialReturn.status = 'returned';
      materialReturn.returned_at = new Date();
      materialReturn.returned_by = userId;
      materialReturn.inventory_movement_id = totalMovement?.id;

      await materialReturn.save({ transaction });
      await transaction.commit();

      res.json({
        message: 'Materials successfully returned to inventory',
        material_return_id: materialReturn.id,
        items_returned: materials.length,
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error processing material return:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * ✅ REJECT MATERIAL RETURN - Inventory manager rejects return
 * POST /production-tracking/material-returns/:returnId/reject
 */
router.post(
  '/material-returns/:returnId/reject',
  authenticateToken,
  checkDepartment(['inventory', 'admin']),
  async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { returnId } = req.params;
      const userId = req.user.id;
      const { rejection_reason } = req.body;

      const materialReturn = await MaterialReturn.findByPk(returnId, {
        transaction,
      });

      if (!materialReturn) {
        return res.status(404).json({ error: 'Material return request not found' });
      }

      materialReturn.status = 'rejected';
      materialReturn.rejection_reason = rejection_reason;

      await materialReturn.save({ transaction });
      await transaction.commit();

      // Send notification back to manufacturing
      try {
        await NotificationService.createNotification({
          title: 'Material Return Rejected',
          message: `Material return for production order #${materialReturn.production_order_id} has been rejected. Reason: ${rejection_reason}`,
          type: 'warning',
          priority: 'normal',
          department: 'manufacturing',
          related_id: materialReturn.production_order_id,
          related_type: 'production_order',
        });
      } catch (e) {
        console.error('Failed to send rejection notification:', e);
      }

      res.json({
        message: 'Material return rejected',
        material_return_id: materialReturn.id,
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error rejecting material return:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * ✅ GET STAGE DETAILS WITH FULL TRACKING
 * GET /production-tracking/stages/:stageId
 */
router.get(
  '/stages/:stageId',
  authenticateToken,
  checkDepartment(['manufacturing', 'admin']),
  async (req, res) => {
    try {
      const { stageId } = req.params;

      const stage = await ProductionStage.findByPk(stageId, {
        include: [
          {
            model: MaterialConsumption,
            as: 'materialConsumptions',
            attributes: [
              'id',
              'inventory_id',
              'quantity_used',
              'consumed_at',
              'unit',
            ],
          },
          {
            model: QualityCheckpoint,
            as: 'stageQualityCheckpoints',
            attributes: ['id', 'name', 'status', 'result', 'checked_at', 'notes'],
          },
          {
            model: StageReworkHistory,
            as: 'reworkHistory',
            attributes: [
              'id',
              'iteration_number',
              'failure_reason',
              'failed_quantity',
              'additional_cost',
              'status',
              'failed_at',
            ],
          },
        ],
      });

      if (!stage) {
        return res.status(404).json({ error: 'Stage not found' });
      }

      res.json(stage);
    } catch (error) {
      console.error('Error fetching stage details:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * ✅ GET MATERIAL RETURNS FOR PRODUCTION ORDER
 * GET /production-tracking/orders/:orderId/material-returns
 */
router.get(
  '/orders/:orderId/material-returns',
  authenticateToken,
  async (req, res) => {
    try {
      const { orderId } = req.params;

      const returns = await MaterialReturn.findAll({
        where: { production_order_id: orderId },
        order: [['created_at', 'DESC']],
      });

      res.json({ material_returns: returns });
    } catch (error) {
      console.error('Error fetching material returns:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;