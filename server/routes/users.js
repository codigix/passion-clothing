const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../config/database');
const { authenticateToken, checkDepartment } = require('../middleware/auth');
const router = express.Router();

// Get all users
router.get('/', authenticateToken, checkDepartment('admin'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      department,
      status,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (department) where.department = department;
    if (status) where.status = status;

    if (search) {
      where[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.like]: `%${search}%` } },
        { email: { [require('sequelize').Op.like]: `%${search}%` } },
        { employee_id: { [require('sequelize').Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      users: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // Users can view their own profile, admin can view any
    const requestedUserId = parseInt(req.params.id);
    const currentUserId = req.user.id;
    const currentUserDept = req.user.department;

    if (requestedUserId !== currentUserId && currentUserDept !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this user' });
    }

    const user = await User.findByPk(requestedUserId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Create new user
router.post('/', authenticateToken, checkDepartment('admin'), async (req, res) => {
  try {
    const {
      employee_id,
      name,
      email,
      password,
      phone,
      department,
      address,
      date_of_joining,
      salary,
      emergency_contact
    } = req.body;

    // Validate required fields
    if (!employee_id || !name || !email || !password || !department) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check if email or employee_id already exists
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { email },
          { employee_id }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email or Employee ID already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      employee_id,
      name,
      email,
      password: hashedPassword,
      phone,
      department,
      address,
      date_of_joining,
      salary,
      emergency_contact,
      created_by: req.user.id
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        employee_id: user.employee_id,
        name: user.name,
        email: user.email,
        department: user.department
      }
    });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const currentUserId = req.user.id;
    const currentUserDept = req.user.department;

    // Users can update their own profile, admin can update any
    if (userId !== currentUserId && currentUserDept !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const {
      name,
      phone,
      address,
      emergency_contact,
      department,
      salary,
      status
    } = req.body;

    const updateData = {};

    // Fields any user can update for themselves
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (emergency_contact) updateData.emergency_contact = emergency_contact;

    // Fields only admin can update
    if (currentUserDept === 'admin') {
      if (department) updateData.department = department;
      if (salary !== undefined) updateData.salary = salary;
      if (status) updateData.status = status;
    }

    await user.update(updateData);

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Delete/Deactivate user
router.delete('/:id', authenticateToken, checkDepartment('admin'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Instead of deleting, deactivate the user
    await user.update({ status: 'inactive' });

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({ message: 'Failed to deactivate user' });
  }
});

// Reset user password
router.put('/:id/reset-password', authenticateToken, checkDepartment('admin'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await user.update({ password: hashedPassword });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

// Get user statistics
router.get('/stats/dashboard', authenticateToken, checkDepartment('admin'), async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { status: 'active' } });
    const inactiveUsers = await User.count({ where: { status: 'inactive' } });

    const usersByDepartment = await User.findAll({
      attributes: [
        'department',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['department']
    });

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers,
      usersByDepartment: usersByDepartment.map(dept => ({
        department: dept.department,
        count: parseInt(dept.dataValues.count)
      }))
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ message: 'Failed to fetch user statistics' });
  }
});

module.exports = router;