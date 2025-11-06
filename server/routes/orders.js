const express = require("express");
const {
  SalesOrder,
  PurchaseOrder,
  ProductionOrder,
  Shipment,
  SalesOrderHistory,
} = require("../config/database");
const { authenticateToken, checkDepartment } = require("../middleware/auth");
const { updateOrderQRCode } = require("../utils/qrCodeUtils");

const router = express.Router();

/**
 * Generic order status update endpoint
 * Determines order type and updates status accordingly
 * Handles cross-order status updates (e.g., ProductionOrder -> SalesOrder, Shipment updates)
 * PUT /api/orders/:id/status
 */
router.put("/:id/status", authenticateToken, async (req, res) => {
  const transaction =
    await require("../config/database").sequelize.transaction();

  try {
    const { id } = req.params;
    let { status, department, action, notes } = req.body;

    if (!status) {
      await transaction.rollback();
      return res.status(400).json({ message: "Status is required" });
    }

    // Try to find the order in different tables
    let order = await SalesOrder.findByPk(id, { transaction });
    let orderType = "sales_order";

    if (!order) {
      order = await PurchaseOrder.findByPk(id, { transaction });
      orderType = "purchase_order";
    }

    if (!order) {
      order = await ProductionOrder.findByPk(id, { transaction });
      orderType = "production_order";
    }

    if (!order) {
      order = await Shipment.findByPk(id, { transaction });
      orderType = "shipment";
    }

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: "Order not found" });
    }

    // Handle special status mappings for ProductionOrder
    let linkedSalesOrderUpdate = null;
    if (orderType === "production_order" && status === "ready_for_shipment") {
      // Map "ready_for_shipment" to "completed" for ProductionOrder
      status = "completed";

      // Also update linked SalesOrder to "ready_to_ship"
      if (order.sales_order_id) {
        const linkedSalesOrder = await SalesOrder.findByPk(
          order.sales_order_id,
          { transaction }
        );
        if (linkedSalesOrder) {
          linkedSalesOrderUpdate = linkedSalesOrder;
          await linkedSalesOrder.update(
            {
              status: "ready_to_ship",
              last_updated_by: req.user.id,
              last_updated_at: new Date(),
            },
            { transaction }
          );

          // Update lifecycle history for SalesOrder
          try {
            let salesHistory = JSON.parse(
              linkedSalesOrder.lifecycle_history || "[]"
            );
            if (!Array.isArray(salesHistory)) salesHistory = [];

            salesHistory.push({
              status: "ready_to_ship",
              timestamp: new Date().toISOString(),
              department: department || "shipment",
              action: "auto_updated_from_production_order",
              notes: notes || "Automatically updated when production completed",
              updated_by: req.user.id,
            });

            await linkedSalesOrder.update(
              { lifecycle_history: JSON.stringify(salesHistory) },
              { transaction }
            );
          } catch (error) {
            console.error(
              "Error updating SalesOrder lifecycle history:",
              error
            );
          }

          // Update QR code for linked SalesOrder
          try {
            await updateOrderQRCode(
              linkedSalesOrder.id,
              "ready_to_ship",
              transaction
            );
          } catch (error) {
            console.error("Error updating SalesOrder QR code:", error);
          }

          // Create SalesOrderHistory record for linked SalesOrder
          try {
            await SalesOrderHistory.create(
              {
                sales_order_id: linkedSalesOrder.id,
                status_from: linkedSalesOrder.status, // This is the old status before the update above
                status_to: "ready_to_ship",
                note: "Automatically updated from production order completion",
                performed_by: req.user.id,
                performed_at: new Date(),
                metadata: {
                  department: "manufacturing",
                  action: "auto_updated_from_production_order",
                  triggered_by: "production_completion",
                },
              },
              { transaction }
            );
          } catch (error) {
            console.error(
              "Error creating SalesOrderHistory for linked order:",
              error
            );
          }
        }
      }
    }

    // Handle Shipment status updates with tracking
    if (orderType === "shipment") {
      const ShipmentTracking = require("../config/database").ShipmentTracking;
      const oldStatus = order.status;

      // Create tracking entry for status change
      await ShipmentTracking.create(
        {
          shipment_id: order.id,
          status: status,
          description: `Status updated from ${oldStatus} to ${status}`,
          created_by: req.user.id,
        },
        { transaction }
      );

      // Update last_status_update timestamp
      order.last_status_update = new Date();
    }

    // Store old status before updating
    const oldStatus = order.status;

    // Update order status
    await order.update(
      {
        status,
        last_updated_by: req.user.id,
        last_updated_at: new Date(),
      },
      { transaction }
    );

    // Update QR code if it's a sales order
    if (orderType === "sales_order") {
      await updateOrderQRCode(order.id, status, transaction);
    }

    // Create lifecycle history entry if it's a sales order
    if (orderType === "sales_order" && order.lifecycle_history) {
      try {
        let history = JSON.parse(order.lifecycle_history);
        if (!Array.isArray(history)) history = [];

        history.push({
          status,
          timestamp: new Date().toISOString(),
          department,
          action,
          notes,
          updated_by: req.user.id,
        });

        await order.update(
          { lifecycle_history: JSON.stringify(history) },
          { transaction }
        );
      } catch (error) {
        console.error("Error updating lifecycle history:", error);
      }
    }

    // Create SalesOrderHistory record if it's a sales order
    if (orderType === "sales_order") {
      try {
        await SalesOrderHistory.create(
          {
            sales_order_id: order.id,
            status_from: oldStatus,
            status_to: status,
            note: notes || null,
            performed_by: req.user.id,
            performed_at: new Date(),
            metadata: {
              department: department || null,
              action: action || null,
              initiated_by: req.user.id,
            },
          },
          { transaction }
        );
      } catch (error) {
        console.error("Error creating SalesOrderHistory record:", error);
        // Don't fail the whole operation if history creation fails
      }
    }

    await transaction.commit();

    const response = {
      success: true,
      message: `${orderType} status updated successfully`,
      order: {
        id: order.id,
        status: order.status,
        type: orderType,
      },
    };

    // Include linked SalesOrder update info if applicable
    if (linkedSalesOrderUpdate) {
      response.linkedSalesOrder = {
        id: linkedSalesOrderUpdate.id,
        status: "ready_to_ship",
        message: "Linked SalesOrder automatically updated to ready_to_ship",
      };
    }

    res.json(response);
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating order status:", error);
    res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  }
});

/**
 * Generic order QR code update endpoint
 * PUT /api/orders/:id/qr-code
 */
router.put("/:id/qr-code", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, department, timestamp } = req.body;

    // Try to find the order in different tables
    let order = await SalesOrder.findByPk(id);
    let orderType = "sales_order";

    if (!order) {
      order = await PurchaseOrder.findByPk(id);
      orderType = "purchase_order";
    }

    if (!order) {
      order = await ProductionOrder.findByPk(id);
      orderType = "production_order";
    }

    if (!order) {
      order = await Shipment.findByPk(id);
      orderType = "shipment";
    }

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update QR code for sales orders
    if (orderType === "sales_order" && status) {
      await updateOrderQRCode(order.id, status);
    }

    res.json({
      success: true,
      message: "QR code updated successfully",
      order: {
        id: order.id,
        status: order.status,
        type: orderType,
      },
    });
  } catch (error) {
    console.error("Error updating QR code:", error);
    res.status(500).json({
      message: "Failed to update QR code",
      error: error.message,
    });
  }
});

module.exports = router;
