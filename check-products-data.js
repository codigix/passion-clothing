const { sequelize, Product } = require('./server/config/database');

async function checkProducts() {
  try {
    console.log('Checking products table...\n');
    
    const products = await Product.findAll({
      limit: 10,
      order: [['id', 'DESC']]
    });
    
    console.log(`Total products found: ${products.length}\n`);
    
    if (products.length > 0) {
      console.log('Sample products:');
      products.forEach(p => {
        console.log(`  ID: ${p.id} | Code: ${p.product_code} | Name: ${p.name}`);
      });
    } else {
      console.log('⚠️  No products found in database!');
      console.log('The product dropdown will be empty.');
    }
    
    // Check if there's any product with unusual ID
    console.log('\n\nChecking for products with non-numeric looking data...');
    const allProducts = await Product.findAll({
      attributes: ['id', 'product_code', 'name']
    });
    
    allProducts.forEach(p => {
      if (p.product_code && p.product_code.includes('OTH-CUST')) {
        console.log(`  Found product with OTH-CUST code: ID=${p.id}, Code=${p.product_code}, Name=${p.name}`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkProducts();