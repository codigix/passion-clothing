// Centralized QR Code Update Utility
const { SalesOrder, ProductionOrder, ProductionStage, Customer, BillOfMaterials } = require('../config/database');

async function updateOrderQRCode(salesOrderId, status) {
  const salesOrder = await SalesOrder.findByPk(salesOrderId, {
    include: [
      { model: Customer, as: 'customer' },
      { model: ProductionOrder, as: 'productionOrders', include: [{ model: ProductionStage, as: 'stages' }] },
      { model: BillOfMaterials, as: 'billOfMaterials' }
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
      produced_quantity: salesOrder.productionOrders[0].produced_quantity,
      approved_quantity: salesOrder.productionOrders[0].approved_quantity,
      rejected_quantity: salesOrder.productionOrders[0].rejected_quantity,
      completed_stages: salesOrder.productionOrders[0].stages?.filter(s => s.status === 'completed').length,
      total_stages: salesOrder.productionOrders[0].stages?.length,
      stages: salesOrder.productionOrders[0].stages?.map(stage => ({
        name: stage.stage_name,
        status: stage.status,
        quantity_processed: stage.quantity_processed,
        quantity_approved: stage.quantity_approved,
        quantity_rejected: stage.quantity_rejected,
        start_time: stage.actual_start_time,
        end_time: stage.actual_end_time,
        materials_used: stage.materials_used
      }))
    } : null,
    materials: salesOrder.billOfMaterials?.[0]?.materials || [],
    garment_specifications: salesOrder.garment_specifications,
    total_quantity: salesOrder.total_quantity,
    last_updated: new Date()
  };

  await salesOrder.update({
    qr_code: JSON.stringify(qrData)
  });

  return qrData;
}

async function getQRCodeData(qrString) {
  try {
    const qrData = JSON.parse(qrString);
    return qrData;
  } catch (error) {
    console.error('Error parsing QR code data:', error);
    return null;
  }
}

module.exports = {
  updateOrderQRCode,
  getQRCodeData
};