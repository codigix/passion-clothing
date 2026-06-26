const { sequelize } = require('../config/database');

async function main() {
  try {
    const [cols] = await sequelize.query("SHOW COLUMNS FROM client_requirements");
    console.log("Existing columns:");
    cols.forEach(c => console.log(" -", c.Field, "->", c.Type));
    
    const colNames = cols.map(c => c.Field);
    
    const toAdd = [
      { name: 'dynamic_fields', type: 'JSON NULL' },
      { name: 'mfg_requirements', type: 'JSON NULL' },
      { name: 'variant_rows', type: 'JSON NULL' },
    ];
    
    for (const col of toAdd) {
      if (!colNames.includes(col.name)) {
        console.log(`\nAdding column: ${col.name}`);
        await sequelize.query(`ALTER TABLE client_requirements ADD COLUMN ${col.name} ${col.type}`);
        console.log(`  ✅ Added ${col.name}`);
      } else {
        console.log(`  ℹ️  Column ${col.name} already exists`);
      }
    }
    
    console.log("\n✅ Migration complete!");
  } catch (e) {
    console.error("Error:", e.message);
  }
  process.exit(0);
}

main();
