'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Add product-related fields to inventory table
      await queryInterface.addColumn('inventory', 'product_code', {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Unique product code'
      }, { transaction });

      await queryInterface.addColumn('inventory', 'product_name', {
        type: Sequelize.STRING(150),
        allowNull: false,
        defaultValue: 'Unnamed Product'
      }, { transaction });

      await queryInterface.addColumn('inventory', 'description', {
        type: Sequelize.TEXT,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('inventory', 'category', {
        type: Sequelize.ENUM(
          'fabric', 'thread', 'button', 'zipper', 'elastic', 'lace',
          'uniform', 'shirt', 'trouser', 'skirt', 'blazer', 'tie',
          'belt', 'shoes', 'socks', 'accessories', 'raw_material', 'finished_goods'
        ),
        allowNull: true,
        defaultValue: 'raw_material'
      }, { transaction });

      await queryInterface.addColumn('inventory', 'sub_category', {
        type: Sequelize.STRING(100),
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('inventory', 'product_type', {
        type: Sequelize.ENUM('raw_material', 'semi_finished', 'finished_goods', 'accessory'),
        allowNull: true,
        defaultValue: 'raw_material'
      }, { transaction });

      await queryInterface.addColumn('inventory', 'unit_of_measurement', {
        type: Sequelize.ENUM('piece', 'meter', 'yard', 'kg', 'gram', 'liter', 'dozen', 'set'),
        allowNull: true,
        defaultValue: 'piece'
      }, { transaction });

      await queryInterface.addColumn('inventory', 'hsn_code', {
        type: Sequelize.STRING(10),
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('inventory', 'brand', {
        type: Sequelize.STRING(100),
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('inventory', 'color', {
        type: Sequelize.STRING(50),
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('inventory', 'size', {
        type: Sequelize.STRING(20),
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('inventory', 'material', {
        type: Sequelize.STRING(100),
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('inventory', 'specifications', {
        type: Sequelize.JSON,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('inventory', 'images', {
        type: Sequelize.JSON,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('inventory', 'cost_price', {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      }, { transaction });

      await queryInterface.addColumn('inventory', 'selling_price', {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      }, { transaction });

      await queryInterface.addColumn('inventory', 'mrp', {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      }, { transaction });

      await queryInterface.addColumn('inventory', 'tax_percentage', {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0.00
      }, { transaction });

      await queryInterface.addColumn('inventory', 'weight', {
        type: Sequelize.DECIMAL(8, 3),
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('inventory', 'dimensions', {
        type: Sequelize.JSON,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('inventory', 'is_serialized', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }, { transaction });

      await queryInterface.addColumn('inventory', 'is_batch_tracked', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }, { transaction });

      await queryInterface.addColumn('inventory', 'quality_parameters', {
        type: Sequelize.JSON,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('inventory', 'sales_order_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'sales_orders',
          key: 'id'
        },
        comment: 'Link to Sales Order (project)'
      }, { transaction });

      // Migrate existing product data to inventory
      const products = await queryInterface.sequelize.query(
        'SELECT * FROM products WHERE status = "active"',
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      for (const product of products) {
        // Check if inventory already exists for this product
        const existingInventory = await queryInterface.sequelize.query(
          'SELECT id FROM inventory WHERE product_id = :productId LIMIT 1',
          {
            type: Sequelize.QueryTypes.SELECT,
            replacements: { productId: product.id },
            transaction
          }
        );

        if (existingInventory.length > 0) {
          // Update existing inventory with product details
          await queryInterface.sequelize.query(
            `UPDATE inventory SET
              product_code = :product_code,
              product_name = :name,
              description = :description,
              category = :category,
              sub_category = :sub_category,
              product_type = :product_type,
              unit_of_measurement = :unit_of_measurement,
              hsn_code = :hsn_code,
              brand = :brand,
              color = :color,
              size = :size,
              material = :material,
              specifications = :specifications,
              images = :images,
              cost_price = :cost_price,
              selling_price = :selling_price,
              mrp = :mrp,
              tax_percentage = :tax_percentage,
              weight = :weight,
              dimensions = :dimensions,
              is_serialized = :is_serialized,
              is_batch_tracked = :is_batch_tracked,
              quality_parameters = :quality_parameters
            WHERE product_id = :product_id`,
            {
              type: Sequelize.QueryTypes.UPDATE,
              replacements: {
                product_code: product.product_code,
                name: product.name,
                description: product.description,
                category: product.category,
                sub_category: product.sub_category,
                product_type: product.product_type,
                unit_of_measurement: product.unit_of_measurement,
                hsn_code: product.hsn_code,
                brand: product.brand,
                color: product.color,
                size: product.size,
                material: product.material,
                specifications: product.specifications,
                images: product.images,
                cost_price: product.cost_price,
                selling_price: product.selling_price,
                mrp: product.mrp,
                tax_percentage: product.tax_percentage,
                weight: product.weight,
                dimensions: product.dimensions,
                is_serialized: product.is_serialized,
                is_batch_tracked: product.is_batch_tracked,
                quality_parameters: product.quality_parameters,
                product_id: product.id
              },
              transaction
            }
          );
        } else {
          // Create new inventory entry for products without inventory
          const barcode = `INV${Date.now()}${Math.floor(Math.random() * 1000)}`;
          await queryInterface.sequelize.query(
            `INSERT INTO inventory (
              product_id, product_code, product_name, description, category, sub_category,
              product_type, unit_of_measurement, hsn_code, brand, color, size, material,
              specifications, images, cost_price, selling_price, mrp, tax_percentage,
              weight, dimensions, is_serialized, is_batch_tracked, quality_parameters,
              barcode, location, current_stock, available_stock, stock_type, created_by,
              created_at, updated_at, is_active
            ) VALUES (
              :product_id, :product_code, :name, :description, :category, :sub_category,
              :product_type, :unit_of_measurement, :hsn_code, :brand, :color, :size, :material,
              :specifications, :images, :cost_price, :selling_price, :mrp, :tax_percentage,
              :weight, :dimensions, :is_serialized, :is_batch_tracked, :quality_parameters,
              :barcode, 'Main Warehouse', 0, 0, 'general_extra', :created_by,
              NOW(), NOW(), 1
            )`,
            {
              type: Sequelize.QueryTypes.INSERT,
              replacements: {
                product_id: product.id,
                product_code: product.product_code,
                name: product.name,
                description: product.description,
                category: product.category,
                sub_category: product.sub_category,
                product_type: product.product_type,
                unit_of_measurement: product.unit_of_measurement,
                hsn_code: product.hsn_code,
                brand: product.brand,
                color: product.color,
                size: product.size,
                material: product.material,
                specifications: product.specifications,
                images: product.images,
                cost_price: product.cost_price,
                selling_price: product.selling_price,
                mrp: product.mrp,
                tax_percentage: product.tax_percentage,
                weight: product.weight,
                dimensions: product.dimensions,
                is_serialized: product.is_serialized,
                is_batch_tracked: product.is_batch_tracked,
                quality_parameters: product.quality_parameters,
                barcode: barcode,
                created_by: product.created_by
              },
              transaction
            }
          );
        }
      }

      // Add indexes for new fields
      await queryInterface.addIndex('inventory', ['product_code'], {
        name: 'inventory_product_code_idx',
        transaction
      });

      await queryInterface.addIndex('inventory', ['product_name'], {
        name: 'inventory_product_name_idx',
        transaction
      });

      await queryInterface.addIndex('inventory', ['category'], {
        name: 'inventory_category_idx',
        transaction
      });

      await queryInterface.addIndex('inventory', ['sales_order_id'], {
        name: 'inventory_sales_order_id_idx',
        transaction
      });

      await transaction.commit();
      console.log('✅ Successfully merged Products into Inventory');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Remove added columns
      const columnsToRemove = [
        'product_code', 'product_name', 'description', 'category', 'sub_category',
        'product_type', 'unit_of_measurement', 'hsn_code', 'brand', 'color', 'size',
        'material', 'specifications', 'images', 'cost_price', 'selling_price', 'mrp',
        'tax_percentage', 'weight', 'dimensions', 'is_serialized', 'is_batch_tracked',
        'quality_parameters', 'sales_order_id'
      ];

      for (const column of columnsToRemove) {
        await queryInterface.removeColumn('inventory', column, { transaction });
      }

      // Remove indexes
      await queryInterface.removeIndex('inventory', 'inventory_product_code_idx', { transaction });
      await queryInterface.removeIndex('inventory', 'inventory_product_name_idx', { transaction });
      await queryInterface.removeIndex('inventory', 'inventory_category_idx', { transaction });
      await queryInterface.removeIndex('inventory', 'inventory_sales_order_id_idx', { transaction });

      await transaction.commit();
      console.log('✅ Successfully rolled back Products merge');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};