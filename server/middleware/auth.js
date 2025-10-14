const jwt = require('jsonwebtoken');
const { User, Role, Permission } = require('../config/database');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user with role and permissions
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] },
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
        },
        {
          model: Permission,
          as: 'userPermissions',
          where: { status: 'active' },
          required: false
        }
      ]
    });

    if (!user || user.status !== 'active') {
      return res.status(401).json({ message: 'Invalid or inactive user' });
    }

    // Flatten role and permissions for easier access
    if (user.roles && user.roles.length > 0) {
      user.role = user.roles[0]; // Primary role
      // Flatten permissions from all roles
      const allPermissions = [];
      user.roles.forEach(role => {
        if (role.permissions) {
          allPermissions.push(...role.permissions);
        }
      });
      
      // Add user-specific permissions
      if (user.userPermissions && user.userPermissions.length > 0) {
        allPermissions.push(...user.userPermissions);
      }
      
      // Remove duplicates based on permission id
      const uniquePermissions = Array.from(
        new Map(allPermissions.map(p => [p.id, p])).values()
      );
      
      user.permissions = uniquePermissions;
    } else {
      // Default role if none assigned
      user.role = { level: 1, name: 'user' };
      // Still include user-specific permissions even without a role
      user.permissions = user.userPermissions || [];
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(403).json({ message: 'Invalid token' });
  }
};



// Dummy checkDepartment that always allows
const checkDepartment = () => (req, res, next) => next();
module.exports = {
  authenticateToken,
  checkDepartment
};