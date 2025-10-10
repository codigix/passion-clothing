const { sequelize } = require('./config/database');

async function checkSchema() {
  try {
    const [results] = await sequelize.query(`
      DESCRIBE notifications
    `);
    
    console.log('Notifications table schema:');
    console.log('===========================\n');
    results.forEach(col => {
      console.log(`${col.Field} - ${col.Type} (${col.Null === 'YES' ? 'nullable' : 'not null'})`);
    });

    const hasEntityId = results.some(col => col.Field === 'related_entity_id');
    const hasEntityType = results.some(col => col.Field === 'related_entity_type');

    console.log('\n===========================');
    console.log('related_entity_id exists:', hasEntityId);
    console.log('related_entity_type exists:', hasEntityType);

    if (!hasEntityId || !hasEntityType) {
      console.log('\n⚠️  MISSING COLUMNS - Need to run migration!');
    } else {
      console.log('\n✅ All columns exist!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkSchema();