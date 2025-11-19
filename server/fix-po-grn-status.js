const { Sequelize } = require('sequelize');
const db = require('./config/database');

(async () => {
  try {
    console.log('Fixing PO status for GRN requests...\n');

    // Find all POs with pending GRN approvals but wrong status
    const approvals = await db.sequelize.query(
      `SELECT DISTINCT entity_id FROM approvals 
       WHERE entity_type = 'grn_creation' AND status = 'pending'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    console.log(`Found ${approvals.length} pending GRN requests`);

    for (const approval of approvals) {
      const poId = approval.entity_id;
      
      // Get current PO
      const [po] = await db.sequelize.query(
        'SELECT id, po_number, status FROM purchase_orders WHERE id = ?',
        { 
          replacements: [poId],
          type: Sequelize.QueryTypes.SELECT 
        }
      );

      if (po && po.status !== 'grn_requested') {
        console.log(`\nUpdating PO #${poId} (${po.po_number})`);
        console.log(`  Current status: ${po.status}`);
        
        // Update PO status
        await db.sequelize.query(
          'UPDATE purchase_orders SET status = ? WHERE id = ?',
          { 
            replacements: ['grn_requested', poId]
          }
        );
        
        console.log(`  New status: grn_requested ✓`);
      }
    }

    console.log('\n✅ All POs updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();