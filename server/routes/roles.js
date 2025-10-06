const express = require('express');
const { Op } = require('sequelize');
const { Role, Permission } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all roles (public endpoint for registration)
router.get('/', async (req, res) => {
  try {
    const roles = await Role.findAll({
      where: {
        status: 'active',
        [Op.or]: [
          { name: { [Op.like]: '%_user' } },
          { name: { [Op.like]: '%_manager' } }
        ]
      },
      attributes: ['id', 'name', 'display_name', 'department', 'level'],
      order: [['department', 'ASC'], ['level', 'ASC']]
    });

    res.json({ roles });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Failed to fetch roles' });
  }
});

// Get role details with permissions (authenticated)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id, {
      include: [{
        model: Permission,
        as: 'permissions',
        attributes: ['id', 'name', 'display_name', 'module', 'action', 'resource']
      }]
    });

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json({ role });
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ message: 'Failed to fetch role' });
  }
});

module.exports = router;