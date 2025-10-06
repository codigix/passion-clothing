const express = require('express');
const router = express.Router();
const { Notification, User, SalesOrder, sequelize } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');

// Get notifications for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type, unread_only } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {
      [Op.or]: [
        { recipient_user_id: req.user.id },
        { recipient_department: req.user.department }
      ]
    };

    if (status) {
      whereClause.status = status;
    }

    if (type) {
      whereClause.type = type;
    }

    if (unread_only === 'true') {
      whereClause.status = { [Op.ne]: 'read' };
    }

    const notifications = await Notification.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: SalesOrder, as: 'relatedOrder', attributes: ['id', 'order_number'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      notifications: notifications.rows,
      pagination: {
        total: notifications.count,
        page: parseInt(page),
        pages: Math.ceil(notifications.count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if user can access this notification
    if (notification.recipient_user_id !== req.user.id &&
        notification.recipient_department !== req.user.department) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await notification.update({
      status: 'read',
      read_at: new Date()
    });

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    await Notification.update(
      { status: 'read', read_at: new Date() },
      {
        where: {
          [Op.or]: [
            { recipient_user_id: req.user.id },
            { recipient_department: req.user.department }
          ],
          status: { [Op.ne]: 'read' }
        }
      }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
});

// Create notification (internal use)
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const {
      type,
      title,
      message,
      priority = 'medium',
      recipient_user_id,
      recipient_department,
      related_order_id,
      related_entity_id,
      related_entity_type,
      action_url,
      metadata,
      expires_at
    } = req.body;

    if (!recipient_user_id && !recipient_department) {
      return res.status(400).json({ message: 'Notifications must target a user or department' });
    }

    const notification = await Notification.create({
      type,
      title,
      message,
      priority,
      recipient_user_id: recipient_user_id || null,
      recipient_department: recipient_department || null,
      related_order_id,
      related_entity_id,
      related_entity_type,
      action_url,
      metadata,
      expires_at,
      created_by: req.user.id,
      sent_at: new Date()
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Failed to create notification' });
  }
});

// Get notification stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await Notification.findAll({
      where: {
        [Op.or]: [
          { recipient_user_id: req.user.id },
          { recipient_department: req.user.department }
        ]
      },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count']
      ],
      group: ['status']
    });

    const statsObj = {};
    stats.forEach(stat => {
      statsObj[stat.status] = parseInt(stat.dataValues.count, 10);
    });

    res.json({
      total: Object.values(statsObj).reduce((a, b) => a + b, 0),
      unread: (statsObj.sent || 0) + (statsObj.delivered || 0),
      read: statsObj.read || 0,
      archived: statsObj.archived || 0
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ message: 'Failed to fetch notification stats' });
  }
});

// Auto-archive expired notifications (cleanup job)
router.post('/cleanup', authenticateToken, async (req, res) => {
  try {
    const expiredCount = await Notification.update(
      { status: 'archived' },
      {
        where: {
          expires_at: { [Op.lt]: new Date() },
          status: { [Op.ne]: 'archived' }
        }
      }
    );

    res.json({ message: `Archived ${expiredCount[0]} expired notifications` });
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
    res.status(500).json({ message: 'Failed to cleanup notifications' });
  }
});

module.exports = router;