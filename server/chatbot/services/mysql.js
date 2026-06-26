const { Op } = require('sequelize');
const db = require('../../config/database');

/**
 * Fetch client requirement statistics
 */
async function getClientRequirementsStats() {
  try {
    const total = await db.ClientRequirement.count();
    
    // Group by status
    const reqs = await db.ClientRequirement.findAll({
      attributes: ['status', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']],
      group: ['status']
    });

    const stats = {
      total,
      Draft: 0,
      Review: 0,
      Approved: 0,
      "Quotation Generated": 0,
      "Converted to SO": 0
    };

    reqs.forEach(r => {
      const status = r.getDataValue('status');
      const count = parseInt(r.getDataValue('count') || 0, 10);
      if (status in stats) {
        stats[status] = count;
      } else {
        stats[status] = count;
      }
    });

    // Get recent requirements
    const recent = await db.ClientRequirement.findAll({
      order: [['id', 'DESC']],
      limit: 3
    });

    return { stats, recent };
  } catch (error) {
    console.error('❌ Failed to fetch requirement stats from DB:', error.message);
    throw error;
  }
}

/**
 * Fetch low stock alerts from inventory
 */
async function getLowStockAlerts() {
  try {
    // Look up items where available_stock is less than or equal to reorder_level
    const lowStock = await db.Inventory.findAll({
      where: {
        reorder_level: { [Op.gt]: 0 },
        available_stock: { [Op.lte]: db.sequelize.col('reorder_level') }
      },
      limit: 5
    });

    return lowStock.map(item => ({
      name: item.product_name,
      code: item.product_code,
      availableQuantity: parseFloat(item.available_stock || 0),
      minQuantity: parseFloat(item.reorder_level || 0),
      unit: item.unit_of_measurement
    }));
  } catch (error) {
    console.error('❌ Failed to fetch low stock alerts from DB:', error.message);
    throw error;
  }
}

/**
 * Fetch production tracking stats
 */
async function getProductionStatus() {
  try {
    const total = await db.ProductionOrder.count();
    const active = await db.ProductionOrder.findAll({
      attributes: ['status', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']],
      group: ['status']
    });

    const statusCounts = {};
    active.forEach(item => {
      statusCounts[item.getDataValue('status')] = parseInt(item.getDataValue('count') || 0, 10);
    });

    const recentJobs = await db.ProductionOrder.findAll({
      order: [['id', 'DESC']],
      limit: 3,
      include: [
        { model: db.Product, as: 'product', attributes: ['name'] }
      ]
    });

    return {
      total,
      statusCounts,
      recentJobs: recentJobs.map(job => ({
        id: job.id,
        productionNumber: job.production_number || `WO-${job.id}`,
        productName: job.product?.name || job.product_name || 'Unnamed Product',
        quantity: job.quantity,
        status: job.status
      }))
    };
  } catch (error) {
    console.error('❌ Failed to fetch production status from DB:', error.message);
    throw error;
  }
}

/**
 * Direct DB insertion helper to create a Client Requirement
 */
async function createClientRequirementDirect(data) {
  const transaction = await db.sequelize.transaction();
  try {
    // Generate requirement number
    const lastReq = await db.ClientRequirement.findOne({
      order: [['id', 'DESC']],
      transaction
    });
    
    let seq = 1;
    if (lastReq && lastReq.requirement_number) {
      const parts = lastReq.requirement_number.split('-');
      const lastSeq = parseInt(parts[1], 10);
      if (!isNaN(lastSeq)) {
        seq = lastSeq + 1;
      }
    }
    const reqNo = `CR-${seq.toString().padStart(3, '0')}`;

    // Create the requirement
    const requirement = await db.ClientRequirement.create({
      requirement_number: reqNo,
      customer_name: data.customerName || 'ABC Industries',
      project_name: data.projectName || `${data.customerName || 'ABC'} Inquiry`,
      product_name: data.productName || 'Uniform T-Shirt',
      product_category: data.category || 'Garment',
      quantity: parseInt(data.quantity || 100, 10),
      unit: 'Nos',
      status: 'Draft',
      priority: 'Normal',
      description: data.description || 'Created via Passion AI Assistant',
      contact_person: data.contactPerson || 'Purchasing Department',
      required_date: data.requiredDate ? new Date(data.requiredDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 2 weeks default
    }, { transaction });

    await transaction.commit();
    return requirement;
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Failed to create requirement in DB:', error.message);
    throw error;
  }
}

module.exports = {
  getClientRequirementsStats,
  getLowStockAlerts,
  getProductionStatus,
  createClientRequirementDirect
};
