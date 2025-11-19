require('dotenv').config();
const db = require('./config/database');

(async () => {
  try {
    const pos = await db.PurchaseOrder.findAll({
      attributes: ['id', 'po_number', 'status', 'created_at'],
      limit: 10,
      order: [['id', 'DESC']]
    });
    console.log('Recent POs:');
    pos.forEach(po => {
      console.log(`ID: ${po.id}, PO: ${po.po_number}, Status: ${po.status}`);
    });
    
    const po = await db.PurchaseOrder.findByPk(4, {
      attributes: ['id', 'po_number', 'status', 'grn_requested']
    });
    if (po) {
      console.log('\nPO Details (ID: 4):');
      console.log(JSON.stringify(po, null, 2));
    }
    
    await db.sequelize.close();
  } catch (e) {
    console.error('Error:', e.message);
    await db.sequelize.close();
  }
})();
