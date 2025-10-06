"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("purchase_orders", "fabric_requirements", {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Detailed fabric requirements: fabric_type, color, hsn_code, gsm_quality, uom, required_quantity, rate_per_unit, total, supplier_name, expected_delivery_date, remarks'
    });

    await queryInterface.addColumn("purchase_orders", "accessories", {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Accessories requirements: accessory_item, description, hsn_code, uom, required_quantity, rate_per_unit, total, supplier_name, expected_delivery_date, remarks'
    });

    await queryInterface.addColumn("purchase_orders", "cost_summary", {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Cost breakdown: fabric_total, accessories_total, sub_total, gst_percentage, gst_amount, freight, grand_total'
    });

    await queryInterface.addColumn("purchase_orders", "attachments", {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Array of attachment files: filename, url, uploaded_at'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("purchase_orders", "fabric_requirements");
    await queryInterface.removeColumn("purchase_orders", "accessories");
    await queryInterface.removeColumn("purchase_orders", "cost_summary");
    await queryInterface.removeColumn("purchase_orders", "attachments");
  }
};