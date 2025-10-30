const { ProductionOrder, sequelize } = require('./config/database');

const cleanupDuplicates = async () => {
  try {
    console.log('🧹 Cleaning up duplicate production orders...');

    // Find production number PRD-20251029-0003 (or the latest duplicate)
    const duplicates = await ProductionOrder.findAll({
      where: {
        production_number: 'PRD-20251029-0003'
      },
      order: [['created_at', 'DESC']]
    });

    if (duplicates.length === 0) {
      console.log('✅ No duplicates found');
      process.exit(0);
    }

    console.log(`Found ${duplicates.length} production orders with number PRD-20251029-0003`);

    // Keep the first (earliest) one, delete the rest
    if (duplicates.length > 1) {
      const idsToDelete = duplicates.slice(1).map(d => d.id);
      console.log(`Deleting ${idsToDelete.length} duplicate(s)...`);
      
      await ProductionOrder.destroy({
        where: {
          id: idsToDelete
        }
      });

      console.log('✅ Duplicates removed successfully!');
    } else {
      console.log('✅ Only one order found, no cleanup needed');
    }

    // Show remaining orders for today
    const remaining = await ProductionOrder.findAll({
      where: {
        production_number: {
          [require('sequelize').Op.like]: 'PRD-20251029-%'
        }
      },
      order: [['production_number', 'ASC']],
      attributes: ['id', 'production_number', 'status', 'created_at']
    });

    console.log(`\n📋 Remaining production orders for today:`);
    remaining.forEach(order => {
      console.log(`  - ${order.production_number} (Status: ${order.status})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning up duplicates:', error.message);
    process.exit(1);
  }
};

cleanupDuplicates();