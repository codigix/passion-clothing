const { Notification, User, Role } = require('../config/database');

// Notification Service
class NotificationService {
  // Send notification to specific user
  static async sendToUser(userId, notificationData) {
    try {
      const user = await User.findByPk(userId);
      if (!user) return null;

      const notification = await Notification.create({
        ...notificationData,
        recipient_user_id: userId,
        sent_at: new Date()
      });

      return notification;
    } catch (error) {
      console.error('Error sending notification to user:', error);
      return null;
    }
  }

  // Send notification to department
  static async sendToDepartment(department, notificationData) {
    try {
      const users = await User.findAll({
        where: { department, status: 'active' },
        include: [{ model: Role, as: 'roles' }]
      });

      const notifications = [];
      for (const user of users) {
        const notification = await Notification.create({
          ...notificationData,
          recipient_department: department,
          recipient_user_id: user.id,
          sent_at: new Date()
        });
        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error('Error sending notification to department:', error);
      return [];
    }
  }

  // Send notification to role
  static async sendToRole(roleId, notificationData) {
    try {
      const users = await User.findAll({
        where: { role_id: roleId, status: 'active' }
      });

      const notifications = [];
      for (const user of users) {
        const notification = await Notification.create({
          ...notificationData,
          recipient_role_id: roleId,
          recipient_user_id: user.id,
          sent_at: new Date()
        });
        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error('Error sending notification to role:', error);
      return [];
    }
  }

  // Send notification to multiple recipients
  static async sendBulk(notificationData, recipients) {
    try {
      const notifications = [];

      for (const recipient of recipients) {
        let notification;
        if (recipient.userId) {
          notification = await this.sendToUser(recipient.userId, notificationData);
        } else if (recipient.department) {
          const deptNotifications = await this.sendToDepartment(recipient.department, notificationData);
          notifications.push(...deptNotifications);
          continue;
        } else if (recipient.roleId) {
          const roleNotifications = await this.sendToRole(recipient.roleId, notificationData);
          notifications.push(...roleNotifications);
          continue;
        }

        if (notification) {
          notifications.push(notification);
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      return [];
    }
  }

  // Order-related notifications
  static async notifyOrderStatusChange(salesOrder, oldStatus, newStatus, userId) {
    const notificationData = {
      type: 'order',
      title: `Order Status Updated: ${salesOrder.order_number}`,
      message: `Order ${salesOrder.order_number} status changed from ${oldStatus} to ${newStatus}`,
      priority: this.getPriorityForStatus(newStatus),
      related_order_id: salesOrder.id,
      action_url: `/sales/orders/${salesOrder.id}`,
      metadata: {
        order_id: salesOrder.order_number,
        old_status: oldStatus,
        new_status: newStatus,
        customer: salesOrder.customer?.name
      },
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };

    // Notify relevant departments based on status
    const recipients = this.getRecipientsForOrderStatus(newStatus);
    return await this.sendBulk(notificationData, recipients);
  }

  // SLA Alert notifications
  static async sendSLAAlert(salesOrder, alertType, daysOverdue = 0) {
    const notificationData = {
      type: 'order',
      title: `SLA Alert: ${salesOrder.order_number}`,
      message: alertType === 'delivery_due'
        ? `Order ${salesOrder.order_number} is due for delivery in ${daysOverdue} days`
        : `Order ${salesOrder.order_number} is ${daysOverdue} days overdue`,
      priority: alertType === 'overdue' ? 'urgent' : 'high',
      related_order_id: salesOrder.id,
      action_url: `/sales/orders/${salesOrder.id}`,
      metadata: {
        order_id: salesOrder.order_number,
        alert_type: alertType,
        days_overdue: daysOverdue,
        customer: salesOrder.customer?.name
      },
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };

    // Notify management and relevant departments
    const recipients = [
      { department: 'admin' },
      { department: 'sales' },
      { department: 'manufacturing' },
      { department: 'shipment' }
    ];

    return await this.sendBulk(notificationData, recipients);
  }

  // Procurement notifications
  static async notifyProcurementAction(action, purchaseOrder, userId) {
    const messages = {
      created: `Purchase Order ${purchaseOrder.po_number} has been created`,
      approved: `Purchase Order ${purchaseOrder.po_number} has been approved`,
      sent: `Purchase Order ${purchaseOrder.po_number} has been sent to vendor`,
      acknowledged: `Purchase Order ${purchaseOrder.po_number} has been acknowledged by vendor`,
      fulfilled: `Purchase Order ${purchaseOrder.po_number} has been fulfilled`
    };

    const notificationData = {
      type: 'procurement',
      title: `Purchase Order ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      message: messages[action] || `Purchase Order ${purchaseOrder.po_number} status updated`,
      priority: 'medium',
      related_entity_id: purchaseOrder.id,
      related_entity_type: 'purchase_order',
      action_url: `/procurement/orders/${purchaseOrder.id}`,
      metadata: {
        po_number: purchaseOrder.po_number,
        action: action,
        vendor: purchaseOrder.vendor?.name
      },
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
    };

    const recipients = [
      { department: 'procurement' },
      { department: 'admin' }
    ];

    return await this.sendBulk(notificationData, recipients);
  }

  // Inventory notifications
  static async notifyInventoryAction(action, data) {
    const messages = {
      grn_created: `GRN ${data.grn_number} has been created for PO ${data.purchaseOrder?.po_number}`,
      stock_received: `Stock received for ${data.material_name || 'materials'}`,
      low_stock: `Low stock alert: ${data.material_name} (${data.quantity} remaining)`,
      stock_allocated: `Stock allocated for production order ${data.productionOrder?.production_number}`
    };

    const notificationData = {
      type: 'inventory',
      title: action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      message: messages[action] || `${action.replace('_', ' ')} notification`,
      priority: action === 'low_stock' ? 'high' : 'medium',
      action_url: data.url || '/inventory',
      metadata: data,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    const recipients = [
      { department: 'inventory' },
      { department: 'procurement' },
      { department: 'manufacturing' }
    ];

    return await this.sendBulk(notificationData, recipients);
  }

  // Manufacturing notifications
  static async notifyManufacturingUpdate(productionOrder, stageName, status, userId) {
    const notificationData = {
      type: 'manufacturing',
      title: `Production Update: ${productionOrder.production_number}`,
      message: `${stageName} stage ${status} for order ${productionOrder.production_number}`,
      priority: status === 'completed' ? 'medium' : 'low',
      related_entity_id: productionOrder.id,
      related_entity_type: 'production_order',
      action_url: `/manufacturing/orders/${productionOrder.id}`,
      metadata: {
        production_number: productionOrder.production_number,
        stage: stageName,
        status: status,
        sales_order: productionOrder.salesOrder?.order_number
      },
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    const recipients = [
      { department: 'manufacturing' },
      { department: 'sales' },
      { department: 'admin' }
    ];

    return await this.sendBulk(notificationData, recipients);
  }

  // Shipment notifications
  static async notifyShipmentUpdate(shipment, status, userId) {
    const notificationData = {
      type: 'shipment',
      title: `Shipment Update: ${shipment.shipment_number}`,
      message: `Shipment ${shipment.shipment_number} status: ${status}`,
      priority: status === 'delivered' ? 'medium' : 'low',
      related_entity_id: shipment.id,
      related_entity_type: 'shipment',
      action_url: `/shipment/tracking/${shipment.id}`,
      metadata: {
        shipment_number: shipment.shipment_number,
        status: status,
        sales_order: shipment.salesOrder?.order_number,
        customer: shipment.salesOrder?.customer?.name
      },
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    const recipients = [
      { department: 'shipment' },
      { department: 'sales' },
      { department: 'admin' }
    ];

    return await this.sendBulk(notificationData, recipients);
  }

  // Helper methods
  static getPriorityForStatus(status) {
    const priorities = {
      'draft': 'low',
      'confirmed': 'medium',
      'bom_generated': 'medium',
      'procurement_created': 'medium',
      'materials_received': 'high',
      'in_production': 'high',
      'cutting_completed': 'medium',
      'printing_completed': 'medium',
      'stitching_completed': 'medium',
      'finishing_completed': 'medium',
      'qc_passed': 'high',
      'ready_to_ship': 'high',
      'shipped': 'high',
      'delivered': 'medium',
      'completed': 'medium'
    };
    return priorities[status] || 'medium';
  }

  static getRecipientsForOrderStatus(status) {
    const statusRecipients = {
      'confirmed': [{ department: 'procurement' }, { department: 'sales' }],
      'bom_generated': [{ department: 'procurement' }, { department: 'admin' }],
      'procurement_created': [{ department: 'procurement' }, { department: 'inventory' }],
      'materials_received': [{ department: 'inventory' }, { department: 'manufacturing' }],
      'in_production': [{ department: 'manufacturing' }, { department: 'sales' }],
      'cutting_completed': [{ department: 'manufacturing' }, { department: 'sales' }],
      'printing_completed': [{ department: 'manufacturing' }, { department: 'sales' }],
      'stitching_completed': [{ department: 'manufacturing' }, { department: 'sales' }],
      'finishing_completed': [{ department: 'manufacturing' }, { department: 'sales' }],
      'qc_passed': [{ department: 'manufacturing' }, { department: 'shipment' }, { department: 'sales' }],
      'ready_to_ship': [{ department: 'shipment' }, { department: 'sales' }],
      'shipped': [{ department: 'shipment' }, { department: 'sales' }, { department: 'finance' }],
      'delivered': [{ department: 'sales' }, { department: 'finance' }],
      'completed': [{ department: 'sales' }, { department: 'finance' }, { department: 'admin' }]
    };
    return statusRecipients[status] || [{ department: 'admin' }];
  }
}

module.exports = NotificationService;