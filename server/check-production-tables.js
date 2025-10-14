const { sequelize } = require('./config/database');

async function checkTables() {
  try {
    const [results] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'passion_erp' 
      AND TABLE_NAME IN ('production_stages', 'stage_operations', 'material_consumption', 'production_completion')
    `);
    
    console.log('\n📋 Production-related tables:');
    results.forEach(row => {
      console.log(`  ✓ ${row.TABLE_NAME}`);
    });

    // Check columns in production_stages
    const [stageColumns] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'passion_erp' 
      AND TABLE_NAME = 'production_stages'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('\n📋 production_stages columns:');
    stageColumns.forEach(row => {
      console.log(`  - ${row.COLUMN_NAME}`);
    });

    // Check if stage_operations exists
    const [opTables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'passion_erp' 
      AND TABLE_NAME = 'stage_operations'
    `);
    
    if (opTables.length > 0) {
      console.log('\n✓ stage_operations table exists');
      const [opColumns] = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'passion_erp' 
        AND TABLE_NAME = 'stage_operations'
        ORDER BY ORDINAL_POSITION
      `);
      console.log('Columns:');
      opColumns.forEach(row => {
        console.log(`  - ${row.COLUMN_NAME}`);
      });
    } else {
      console.log('\n✗ stage_operations table does not exist');
    }

    // Check material_consumption
    const [mcTables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'passion_erp' 
      AND TABLE_NAME = 'material_consumption'
    `);
    
    if (mcTables.length > 0) {
      console.log('\n✓ material_consumption table exists');
      const [mcColumns] = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'passion_erp' 
        AND TABLE_NAME = 'material_consumption'
        ORDER BY ORDINAL_POSITION
      `);
      console.log('Columns:');
      mcColumns.forEach(row => {
        console.log(`  - ${row.COLUMN_NAME}`);
      });
    } else {
      console.log('\n✗ material_consumption table does not exist');
    }

    // Check production_completion
    const [pcTables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'passion_erp' 
      AND TABLE_NAME = 'production_completion'
    `);
    
    if (pcTables.length > 0) {
      console.log('\n✓ production_completion table exists');
    } else {
      console.log('\n✗ production_completion table does not exist');
    }

    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTables();