

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role, Permission, Attendance } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Registration
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request body:', req.body);
    const { employee_id, name, email, password, phone, department } = req.body;

    if (!employee_id || !name || !email || !password || !department) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Check if employee ID is already taken
    const existingEmployee = await User.findOne({ where: { employee_id } });
    if (existingEmployee) {
      return res.status(409).json({ message: 'User with this employee ID already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      employee_id,
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      department
    });

    res.status(201).json({ message: 'Registration successful', user: { id: user.id, name: user.name, email: user.email, department: user.department } });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user with roles and permissions
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Role,
          as: 'roles',
          include: [
            {
              model: Permission,
              as: 'permissions',
              where: { status: 'active' },
              required: false
            }
          ]
        }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ message: 'Account is inactive' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        department: user.department
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Update last login
    await user.update({ last_login: new Date() });

    // Flatten role and permissions
    let userRole = { level: 1, name: 'user' };
    let userPermissions = [];
    
    if (user.roles && user.roles.length > 0) {
      userRole = user.roles[0];
      user.roles.forEach(role => {
        if (role.permissions) {
          userPermissions.push(...role.permissions);
        }
      });
    }

    // Return user data without password
    const userData = {
      id: user.id,
      employee_id: user.employee_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      profile_image: user.profile_image,
      role: userRole,
      roles: user.roles || [],
      permissions: userPermissions
    };

    res.json({
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a production environment, you might want to blacklist the token
    // For now, we'll just return success
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    const userData = {
      id: user.id,
      employee_id: user.employee_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      profile_image: user.profile_image,
      address: user.address,
      date_of_joining: user.date_of_joining,
      emergency_contact: user.emergency_contact,
      role: user.role || { level: 1, name: 'user' },
      roles: user.roles || [],
      permissions: user.permissions || []
    };

    res.json({ user: userData });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address, emergency_contact } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({
      name: name || user.name,
      phone: phone || user.phone,
      address: address || user.address,
      emergency_contact: emergency_contact || user.emergency_contact
    });

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await user.update({ password: hashedPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// Check-in
router.post('/checkin', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0];
    
    const { location, notes } = req.body;

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      where: {
        user_id: userId,
        date: today
      }
    });

    if (existingAttendance && existingAttendance.check_in_time) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    let attendance;
    if (existingAttendance) {
      // Update existing record
      attendance = await existingAttendance.update({
        check_in_time: currentTime,
        location: location || 'Office',
        notes: notes,
        status: 'present',
        ip_address: req.ip,
        device_info: {
          userAgent: req.get('User-Agent'),
          timestamp: new Date()
        }
      });
    } else {
      // Create new record
      attendance = await Attendance.create({
        user_id: userId,
        date: today,
        check_in_time: currentTime,
        location: location || 'Office',
        notes: notes,
        status: 'present',
        ip_address: req.ip,
        device_info: {
          userAgent: req.get('User-Agent'),
          timestamp: new Date()
        }
      });
    }

    res.json({ 
      message: 'Checked in successfully',
      attendance: {
        date: attendance.date,
        check_in_time: attendance.check_in_time,
        location: attendance.location
      }
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Check-in failed' });
  }
});

// Check-out
router.post('/checkout', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0];
    
    const { notes } = req.body;

    const attendance = await Attendance.findOne({
      where: {
        user_id: userId,
        date: today
      }
    });

    if (!attendance || !attendance.check_in_time) {
      return res.status(400).json({ message: 'No check-in record found for today' });
    }

    if (attendance.check_out_time) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    // Calculate total hours
    const checkInTime = new Date(`${today}T${attendance.check_in_time}`);
    const checkOutTime = new Date(`${today}T${currentTime}`);
    const totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);

    await attendance.update({
      check_out_time: currentTime,
      total_hours: totalHours.toFixed(2),
      productive_hours: (totalHours - (attendance.break_hours || 0)).toFixed(2),
      notes: notes ? `${attendance.notes || ''}\nCheckout: ${notes}` : attendance.notes
    });

    res.json({ 
      message: 'Checked out successfully',
      attendance: {
        date: attendance.date,
        check_in_time: attendance.check_in_time,
        check_out_time: attendance.check_out_time,
        total_hours: attendance.total_hours
      }
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: 'Check-out failed' });
  }
});

// Get today's attendance
router.get('/attendance/today', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findOne({
      where: {
        user_id: userId,
        date: today
      }
    });

    res.json({ attendance });
  } catch (error) {
    console.error('Attendance fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch attendance' });
  }
});

// Verify token (for frontend to check if token is still valid)
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ 
    valid: true, 
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      department: req.user.department
    }
  });
});

module.exports = router;