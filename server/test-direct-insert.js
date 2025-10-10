const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

async function testDirectInsert() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'passion_erp'
  });

  try {
    console.log('\n=== TESTING DIRECT INSERT ===\n');

    // Test 1: Insert with 'pending' status (database default)
    console.log('Test 1: Inserting with status = "pending"...');
    try {
      await connection.query(`
        INSERT INTO project_material_requests 
        (request_number, project_name, requesting_department, materials_requested, total_items, total_value, status, priority, created_by, created_at, updated_at)
        VALUES 
        ('TEST-001', 'Test Project 1', 'manufacturing', '[]', 0, 0, 'pending', 'medium', 1, NOW(), NOW())
      `);
      console.log('✅ SUCCESS with "pending"\n');
      await connection.query('DELETE FROM project_material_requests WHERE request_number = "TEST-001"');
    } catch (err) {
      console.error('❌ FAILED:', err.message, '\n');
    }

    // Test 2: Insert with 'pending_inventory_review' status
    console.log('Test 2: Inserting with status = "pending_inventory_review"...');
    try {
      await connection.query(`
        INSERT INTO project_material_requests 
        (request_number, project_name, requesting_department, materials_requested, total_items, total_value, status, priority, created_by, created_at, updated_at)
        VALUES 
        ('TEST-002', 'Test Project 2', 'manufacturing', '[]', 0, 0, 'pending_inventory_review', 'medium', 1, NOW(), NOW())
      `);
      console.log('✅ SUCCESS with "pending_inventory_review"\n');
      await connection.query('DELETE FROM project_material_requests WHERE request_number = "TEST-002"');
    } catch (err) {
      console.error('❌ FAILED:', err.message, '\n');
    }

    // Test 3: Insert WITHOUT status (let database default handle it)
    console.log('Test 3: Inserting WITHOUT status field (database default)...');
    try {
      await connection.query(`
        INSERT INTO project_material_requests 
        (request_number, project_name, requesting_department, materials_requested, total_items, total_value, priority, created_by, created_at, updated_at)
        VALUES 
        ('TEST-003', 'Test Project 3', 'manufacturing', '[]', 0, 0, 'medium', 1, NOW(), NOW())
      `);
      console.log('✅ SUCCESS without status field\n');
      
      // Check what status was set
      const [rows] = await connection.query('SELECT status FROM project_material_requests WHERE request_number = "TEST-003"');
      console.log('Default status set to:', rows[0].status, '\n');
      
      await connection.query('DELETE FROM project_material_requests WHERE request_number = "TEST-003"');
    } catch (err) {
      console.error('❌ FAILED:', err.message, '\n');
    }

    // Test 4: Check if there's a trigger or something weird
    console.log('Test 4: Checking for triggers on table...');
    const [triggers] = await connection.query(`
      SELECT TRIGGER_NAME, EVENT_MANIPULATION, ACTION_TIMING, ACTION_STATEMENT
      FROM INFORMATION_SCHEMA.TRIGGERS
      WHERE EVENT_OBJECT_TABLE = 'project_material_requests'
      AND TRIGGER_SCHEMA = ?
    `, [process.env.DB_NAME || 'passion_erp']);
    
    if (triggers.length > 0) {
      console.log('⚠️  TRIGGERS FOUND:');
      triggers.forEach(t => {
        console.log(`  - ${t.TRIGGER_NAME} (${t.ACTION_TIMING} ${t.EVENT_MANIPULATION})`);
        console.log(`    Statement: ${t.ACTION_STATEMENT.substring(0, 200)}...`);
      });
    } else {
      console.log('✅ No triggers found\n');
    }

    // Test 5: Get the EXACT enum definition
    console.log('\nTest 5: Getting EXACT ENUM values from database...');
    const [columns] = await connection.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'project_material_requests' AND COLUMN_NAME = 'status'
    `, [process.env.DB_NAME || 'passion_erp']);
    
    console.log('Status ENUM definition:', columns[0].COLUMN_TYPE);
    
    // Extract and display each value
    const enumMatch = columns[0].COLUMN_TYPE.match(/enum\((.*)\)/i);
    if (enumMatch) {
      const values = enumMatch[1].split(',').map(v => v.trim());
      console.log('\nEach ENUM value (with quotes):');
      values.forEach((v, i) => {
        console.log(`  ${i + 1}. ${v} (length: ${v.length})`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

testDirectInsert();