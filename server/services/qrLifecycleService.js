const { v4: uuidv4 } = require('uuid');
const {
  sequelize,
  SalesOrder,
  ProductLifecycle,
  ProductLifecycleHistory,
  Customer,
  ProductionOrder,
  ProductionStage,
  BillOfMaterials
} = require('../config/database');

/**
 * QR Lifecycle Service
 * Central place to generate, refresh, and hydrate lifecycle QR metadata across
 * orders and individual lifecycle records.
 */
class QRLifecycleService {
  /**
   * Generate lifecycle QR for an order if not already active.
   * Creates token, payload cache, and seeds associated ProductLifecycle rows.
   */
  static async ensureOrderLifecycleQR(orderId, options = {}) {
    const externalTransaction = options.transaction;
    const transaction = externalTransaction || await sequelize.transaction();

    try {
      const findOptions = {
        include: [
          { model: Customer, as: 'customer', attributes: ['id', 'name', 'customer_code'] },
          { model: ProductionOrder, as: 'productionOrders', include: [{ model: ProductionStage, as: 'stages' }] },
          { model: BillOfMaterials, as: 'billOfMaterials' }
        ],
        transaction
      };

      if (transaction.LOCK && transaction.LOCK.UPDATE) {
        findOptions.lock = transaction.LOCK.UPDATE;
      }

      const order = await SalesOrder.findByPk(orderId, findOptions);

      if (!order) {
        throw new Error('Sales order not found');
      }

      const lifecyclePayload = this.#buildOrderPayload(order);

      const updates = {
        has_lifecycle_qr: true,
        lifecycle_qr_status: 'active',
        lifecycle_qr_generated_at: new Date(),
        qr_code: JSON.stringify({
          ...(order.qr_code ? JSON.parse(order.qr_code) : {}),
          lifecycle: lifecyclePayload
        })
      };

      if (!order.lifecycle_qr_token || options.forceRegenerate) {
        updates.lifecycle_qr_token = uuidv4();
      }

      await order.update(updates, { transaction });

      if (!externalTransaction) {
        await transaction.commit();
      }

      return {
        orderId: order.id,
        lifecycle_qr_token: updates.lifecycle_qr_token || order.lifecycle_qr_token,
        lifecycle_qr_status: updates.lifecycle_qr_status,
        lifecycle_qr_payload: lifecyclePayload
      };
    } catch (error) {
      if (!externalTransaction && (!transaction.finished || transaction.finished !== 'rollback')) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  /**
   * Refresh cached payload + scan metrics on sales order during lifecycle events.
   */
  static async updateOrderLifecycleQR(orderId, context = {}) {
    const externalTransaction = context.transaction;
    const transaction = externalTransaction || await sequelize.transaction();

    try {
      const findOptions = {
        include: [
          { model: Customer, as: 'customer', attributes: ['id', 'name', 'customer_code'] },
          { model: ProductionOrder, as: 'productionOrders', include: [{ model: ProductionStage, as: 'stages' }] },
          { model: BillOfMaterials, as: 'billOfMaterials' }
        ],
        transaction
      };

      if (transaction.LOCK && transaction.LOCK.UPDATE) {
        findOptions.lock = transaction.LOCK.UPDATE;
      }

      const order = await SalesOrder.findByPk(orderId, findOptions);

      if (!order) {
        throw new Error('Sales order not found');
      }

      if (!order.has_lifecycle_qr) {
        await this.ensureOrderLifecycleQR(orderId, {
          transaction,
          forceRegenerate: context.forceRegenerate
        });
      }

      const lifecyclePayload = this.#buildOrderPayload(order, context);

      await order.update({
        lifecycle_qr_status: context.status || order.lifecycle_qr_status || 'active',
        lifecycle_qr_last_scanned_at: context.scannedAt || order.lifecycle_qr_last_scanned_at,
        lifecycle_qr_scan_count: context.incrementScan
          ? (order.lifecycle_qr_scan_count || 0) + 1
          : order.lifecycle_qr_scan_count,
        qr_code: JSON.stringify({
          ...(order.qr_code ? JSON.parse(order.qr_code) : {}),
          lifecycle: lifecyclePayload
        })
      }, { transaction });

      if (!externalTransaction) {
        await transaction.commit();
      }

      return lifecyclePayload;
    } catch (error) {
      if (!externalTransaction && (!transaction.finished || transaction.finished !== 'rollback')) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  /**
   * Attach/generate lifecycle QR metadata for specific lifecycle row.
   */
  static async syncLifecycleRecord(lifecycleId, context = {}) {
    const externalTransaction = context.transaction;
    const transaction = externalTransaction || await sequelize.transaction();

    try {
      const lifecycle = await ProductLifecycle.findByPk(lifecycleId, {
        include: [{ model: SalesOrder, as: 'salesOrder' }],
        transaction
      });

      if (!lifecycle) {
        throw new Error('Product lifecycle record not found');
      }

      const updates = {
        qr_status: context.status || lifecycle.qr_status || 'active',
        qr_generated_at: new Date(),
        qr_payload: this.#buildLifecyclePayload(lifecycle, context)
      };

      if (!lifecycle.qr_token || context.forceRegenerate) {
        updates.qr_token = uuidv4();
      }

      await lifecycle.update(updates, { transaction });

      if (lifecycle.salesOrder) {
        await this.updateOrderLifecycleQR(lifecycle.salesOrder.id, {
          ...context,
          transaction
        });
      }

      if (!externalTransaction) {
        await transaction.commit();
      }

      return {
        lifecycleId: lifecycle.id,
        qr_token: updates.qr_token || lifecycle.qr_token,
        qr_payload: updates.qr_payload
      };
    } catch (error) {
      if (!externalTransaction && (!transaction.finished || transaction.finished !== 'rollback')) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  /**
   * Create lifecycle transition history with QR scan metadata.
   */
  static async recordLifecycleEvent({
    lifecycleId,
    stageFrom,
    stageTo,
    statusFrom,
    statusTo,
    operatorId,
    scanData = {},
    metadata = {},
    transaction: externalTransaction
  }) {
    const transaction = externalTransaction || await sequelize.transaction();

    try {
      const lifecycle = await ProductLifecycle.findByPk(lifecycleId, { transaction });

      if (!lifecycle) {
        throw new Error('Lifecycle record not found');
      }

      const historyEntry = await ProductLifecycleHistory.create({
        product_lifecycle_id: lifecycle.id,
        barcode: lifecycle.barcode,
        stage_from: stageFrom,
        stage_to: stageTo,
        status_from: statusFrom,
        status_to: statusTo,
        transition_time: new Date(),
        operator_id: operatorId,
        location: metadata.location,
        machine_id: metadata.machineId,
        quantity_processed: metadata.quantityProcessed,
        quantity_approved: metadata.quantityApproved,
        quantity_rejected: metadata.quantityRejected,
        notes: metadata.notes,
        cost_incurred: metadata.costIncurred,
        materials_consumed: metadata.materialsConsumed,
        scan_data: {
          ...scanData,
          timestamp: scanData.timestamp || new Date()
        },
        created_by: operatorId
      }, { transaction });

      await lifecycle.update({
        current_stage: stageTo || lifecycle.current_stage,
        current_status: statusTo || lifecycle.current_status,
        qr_last_scanned_at: scanData.timestamp || new Date(),
        qr_scan_count: (lifecycle.qr_scan_count || 0) + 1
      }, { transaction });

      if (lifecycle.sales_order_id) {
        await this.updateOrderLifecycleQR(lifecycle.sales_order_id, {
          status: statusTo,
          current_stage: stageTo,
          scannedAt: scanData.timestamp,
          incrementScan: true,
          transaction
        });
      }

      if (!externalTransaction) {
        await transaction.commit();
      }

      return historyEntry;
    } catch (error) {
      if (!externalTransaction && (!transaction.finished || transaction.finished !== 'rollback')) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  /**
   * Fetch full lifecycle context for a QR token.
   */
  static async resolveByToken(token) {
    const lifecycle = await ProductLifecycle.findOne({
      where: { qr_token: token },
      include: [
        { model: SalesOrder, as: 'salesOrder', attributes: ['id', 'order_number', 'status'] },
        { model: ProductionOrder, as: 'productionOrder', attributes: ['id', 'production_number'] }
      ]
    });

    if (!lifecycle) {
      return null;
    }

    return {
      lifecycle,
      qr_payload: lifecycle.qr_payload,
      history: await ProductLifecycleHistory.findAll({
        where: { product_lifecycle_id: lifecycle.id },
        order: [['transition_time', 'DESC']]
      })
    };
  }

  /**
   * Assemble rich payload describing order + production context.
   */
  static #buildOrderPayload(order, context = {}) {
    const basePayload = {
      order_id: order.id,
      order_number: order.order_number,
      status: context.status || order.status,
      delivery_date: order.delivery_date,
      customer: order.customer ? {
        id: order.customer.id,
        name: order.customer.name,
        code: order.customer.customer_code
      } : null,
      total_quantity: order.total_quantity,
      updated_at: new Date().toISOString(),
      lifecycle_qr_token: order.lifecycle_qr_token,
      current_stage: context.current_stage,
      production_progress: this.#buildProductionProgress(order.productionOrders)
    };

    return {
      ...basePayload,
      ...(context.extra || {})
    };
  }

  static #buildProductionProgress(productionOrders = []) {
    if (!productionOrders || productionOrders.length === 0) return null;

    const order = productionOrders[0];
    return {
      production_order_id: order.id,
      production_number: order.production_number,
      status: order.status,
      total_quantity: order.quantity,
      produced_quantity: order.produced_quantity,
      approved_quantity: order.approved_quantity,
      rejected_quantity: order.rejected_quantity,
      stages: (order.stages || []).map(stage => ({
        id: stage.id,
        name: stage.stage_name,
        status: stage.status,
        quantity_processed: stage.quantity_processed,
        quantity_approved: stage.quantity_approved,
        quantity_rejected: stage.quantity_rejected,
        started_at: stage.actual_start_time,
        completed_at: stage.actual_end_time
      }))
    };
  }

  static #buildLifecyclePayload(lifecycle, context = {}) {
    return {
      lifecycle_id: lifecycle.id,
      barcode: lifecycle.barcode,
      product_id: lifecycle.product_id,
      sales_order_id: lifecycle.sales_order_id,
      current_stage: context.current_stage || lifecycle.current_stage,
      current_status: context.status || lifecycle.current_status,
      updated_at: new Date().toISOString(),
      extra: context.extra || {}
    };
  }
}

module.exports = QRLifecycleService;