require('dotenv').config({ path: './server/.env' });
const { Inventory, Product, ProjectMaterialRequest, sequelize } = require('./server/config/database');
const { Op } = require('sequelize');

async function diagnoseMRNRejection() {
  try {
    console.log('🔍 Diagnosing MRN Rejection Issue...\n');

    // Step 1: Check latest MRN request
    console.log('📋 Step 1: Checking latest MRN requests...');
    const latestMRN = await ProjectMaterialRequest.findOne({
      where: {
        request_number: { [Op.like]: 'MRN-%' }
      },
      order: [['created_at', 'DESC']]
    });

    if (latestMRN) {
      console.log(`   Latest MRN: ${latestMRN.request_number}`);
      console.log(`   Status: ${latestMRN.status}`);
      console.log(`   Project: ${latestMRN.project_name}`);
      
      const materials = latestMRN.materials_requested || [];
      console.log(`   Materials Requested: ${materials.length}`);
      
      materials.forEach((mat, idx) => {
        console.log(`   ${idx + 1}. ${mat.material_name || mat.name} - ${mat.quantity_required || mat.quantity} ${mat.unit}`);
      });
      console.log('');
    } else {
      console.log('   ⚠️ No MRN requests found\n');
    }

    // Step 2: Check inventory with Product relationship
    console.log('📦 Step 2: Checking Inventory with Product details...');
    const inventoryWithProduct = await Inventory.findAll({
      include: [{
        model: Product,
        as: 'product',
        required: false
      }],
      attributes: ['id', 'name', 'type', 'quantity', 'current_stock', 'available_stock', 
                  'unit', 'quality_status', 'is_active', 'product_id', 'barcode'],
      limit: 10,
      order: [['created_at', 'DESC']]
    });

    console.log(`   Found ${inventoryWithProduct.length} inventory items`);
    inventoryWithProduct.forEach((item, idx) => {
      console.log(`\n   ${idx + 1}. Inventory Item:`);
      console.log(`      Name: ${item.name}`);
      console.log(`      Type: ${item.type}`);
      console.log(`      Available Stock: ${item.available_stock || item.quantity} ${item.unit}`);
      console.log(`      Current Stock: ${item.current_stock || item.quantity} ${item.unit}`);
      console.log(`      Quality Status: ${item.quality_status || 'NOT SET ❌'}`);
      console.log(`      Is Active: ${item.is_active !== false ? 'true ✅' : 'false ❌'}`);
      console.log(`      Product ID: ${item.product_id || 'NULL ❌'}`);
      
      if (item.product) {
        console.log(`      ✅ Product Linked:`);
        console.log(`         Product Name: ${item.product.name}`);
        console.log(`         Product Code: ${item.product.product_code}`);
      } else {
        console.log(`      ❌ NO PRODUCT LINKED - This is the problem!`);
      }
    });

    // Step 3: Count inventory issues
    console.log('\n\n📊 Step 3: Inventory Issues Summary...');
    
    const totalInventory = await Inventory.count();
    const noProduct = await Inventory.count({ where: { product_id: null } });
    const noQualityStatus = await Inventory.count({ where: { quality_status: null } });
    const notApproved = await Inventory.count({ 
      where: { 
        quality_status: { [Op.ne]: 'approved' } 
      } 
    });
    const notActive = await Inventory.count({ where: { is_active: false } });

    console.log(`   Total Inventory Items: ${totalInventory}`);
    console.log(`   ❌ Items without Product link: ${noProduct}`);
    console.log(`   ❌ Items without quality_status: ${noQualityStatus}`);
    console.log(`   ❌ Items not approved: ${notApproved}`);
    console.log(`   ❌ Items not active: ${notActive}`);

    // Step 4: Show the search query issue
    console.log('\n\n🔍 Step 4: Testing Material Search...');
    if (latestMRN && latestMRN.materials_requested && latestMRN.materials_requested.length > 0) {
      const testMaterial = latestMRN.materials_requested[0];
      const materialName = testMaterial.material_name || testMaterial.name;
      
      console.log(`   Searching for: "${materialName}"`);
      
      const searchResult = await Inventory.findAll({
        where: {
          quality_status: 'approved',
          is_active: true
        },
        include: [{
          model: Product,
          as: 'product',
          where: {
            [Op.or]: [
              { name: { [Op.like]: `%${materialName}%` } },
              { description: { [Op.like]: `%${materialName}%` } },
              { product_code: { [Op.like]: `%${materialName}%` } }
            ]
          },
          required: true
        }],
        attributes: ['id', 'available_stock', 'current_stock']
      });

      console.log(`   ✅ Found ${searchResult.length} matching items with the current logic`);
      
      if (searchResult.length === 0) {
        console.log(`   ❌ NO MATCHES FOUND! This is why MRN is rejected.`);
        console.log(`\n   Checking alternative search (without Product requirement)...`);
        
        const altSearch = await Inventory.findAll({
          where: {
            name: { [Op.like]: `%${materialName}%` }
          },
          attributes: ['id', 'name', 'quantity', 'available_stock', 'product_id', 'quality_status', 'is_active']
        });
        
        console.log(`   Found ${altSearch.length} items by name match:`);
        altSearch.forEach(item => {
          console.log(`      - ${item.name}: ${item.available_stock || item.quantity} units`);
          console.log(`        Product ID: ${item.product_id || 'NULL ❌'}`);
          console.log(`        Quality Status: ${item.quality_status || 'NULL ❌'}`);
          console.log(`        Is Active: ${item.is_active !== false ? 'true' : 'false ❌'}`);
        });
      }
    }

    console.log('\n\n💡 DIAGNOSIS COMPLETE!');
    console.log('\n🔧 FIXES NEEDED:');
    console.log('   1. Link inventory items to Products (set product_id)');
    console.log('   2. Set quality_status = "approved" for inventory items');
    console.log('   3. Ensure is_active = true for inventory items');
    console.log('   4. OR update the search logic to not require Product relationship');

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

diagnoseMRNRejection();