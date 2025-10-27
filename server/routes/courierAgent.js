const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { CourierAgent, Shipment } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Generate unique agent ID
const generateAgentId = async () => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  let counter = 1;
  let agentId;
  
  while (true) {
    agentId = `COR-${date}-${String(counter).padStart(3, '0')}`;
    const exists = await CourierAgent.findOne({ where: { agent_id: agentId } });
    if (!exists) break;
    counter++;
  }
  
  return agentId;
};

// 1. ADD NEW COURIER AGENT (Admin)
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { agent_name, email, phone, courier_company, region, notes } = req.body;

    // Validate required fields
    if (!agent_name || !email || !phone || !courier_company) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if email already exists
    const existingAgent = await CourierAgent.findOne({ where: { email } });
    if (existingAgent) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Generate agent ID
    const agent_id = await generateAgentId();

    // Generate temporary password
    const tempPassword = Math.random().toString(36).substring(2, 10).toUpperCase() + Math.random().toString(36).substring(2, 5);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Generate verification token
    const verificationToken = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create agent
    const agent = await CourierAgent.create({
      agent_id,
      agent_name,
      email,
      phone,
      courier_company,
      region: region || null,
      password_hash: hashedPassword,
      verification_token: verificationToken,
      is_active: true,
      is_verified: false,
      notes: notes || null
    });

    // Return response with temporary password
    res.status(201).json({
      message: 'Courier agent created successfully',
      agent: {
        agent_id: agent.agent_id,
        agent_name: agent.agent_name,
        email: agent.email,
        courier_company: agent.courier_company
      },
      tempPassword, // Send to admin to share with agent
      verificationLink: `${process.env.FRONTEND_URL}/courier-agent/verify?token=${verificationToken}`
    });
  } catch (error) {
    console.error('Error adding courier agent:', error);
    res.status(500).json({ message: 'Failed to add courier agent', error: error.message });
  }
});

// 2. COURIER AGENT LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Find agent
    const agent = await CourierAgent.findOne({ where: { email } });
    if (!agent) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if active
    if (!agent.is_active) {
      return res.status(403).json({ message: 'Account has been deactivated' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, agent.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await agent.update({ last_login: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: agent.id,
        email: agent.email,
        agent_name: agent.agent_name,
        courier_company: agent.courier_company,
        role: 'courier_agent'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      agent: {
        id: agent.id,
        agent_id: agent.agent_id,
        agent_name: agent.agent_name,
        email: agent.email,
        courier_company: agent.courier_company,
        phone: agent.phone,
        region: agent.region,
        performance_rating: agent.performance_rating,
        total_shipments: agent.total_shipments
      }
    });
  } catch (error) {
    console.error('Error during courier login:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// 3. VERIFY COURIER AGENT EMAIL
router.post('/verify-email', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find agent by email
    const agent = await CourierAgent.findOne({ where: { email: decoded.email } });
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Update password and verification status
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await agent.update({
      password_hash: hashedPassword,
      is_verified: true,
      verification_token: null
    });

    res.json({ message: 'Email verified and password set successfully' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(400).json({ message: 'Verification failed', error: error.message });
  }
});

// 4. GET ALL COURIER AGENTS (Admin - requires auth)
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    const { courier_company, is_active, search } = req.query;
    
    let where = {};
    if (courier_company) where.courier_company = courier_company;
    if (is_active !== undefined) where.is_active = is_active === 'true';
    if (search) {
      const Op = require('sequelize').Op;
      where = {
        ...where,
        [Op.or]: [
          { agent_name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } }
        ]
      };
    }

    const agents = await CourierAgent.findAll({
      where,
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['password_hash', 'verification_token'] }
    });

    res.json({ agents });
  } catch (error) {
    console.error('Error fetching courier agents:', error);
    res.status(500).json({ message: 'Failed to fetch agents', error: error.message });
  }
});

// 4b. GET ALL COURIER AGENTS (Public - for dashboard display)
router.get('/', async (req, res) => {
  try {
    const { courier_company, is_active, search } = req.query;
    
    let where = {};
    if (courier_company) where.courier_company = courier_company;
    if (is_active !== undefined) where.is_active = is_active === 'true';
    if (search) {
      const Op = require('sequelize').Op;
      where = {
        ...where,
        [Op.or]: [
          { agent_name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } }
        ]
      };
    }

    const agents = await CourierAgent.findAll({
      where,
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['password_hash', 'verification_token'] }
    });

    res.json({ agents });
  } catch (error) {
    console.error('Error fetching courier agents:', error);
    res.status(500).json({ message: 'Failed to fetch agents', error: error.message });
  }
});

// 5. GET AGENTS BY COURIER COMPANY (For dropdown in shipment form)
router.get('/by-company/:company', async (req, res) => {
  try {
    const { company } = req.params;
    
    const agents = await CourierAgent.findAll({
      where: {
        courier_company: company,
        is_active: true,
        is_verified: true
      },
      attributes: ['id', 'agent_id', 'agent_name', 'email', 'phone', 'region', 'performance_rating', 'total_shipments'],
      order: [['performance_rating', 'DESC']]
    });

    res.json({ agents });
  } catch (error) {
    console.error('Error fetching agents by company:', error);
    res.status(500).json({ message: 'Failed to fetch agents', error: error.message });
  }
});

// 6. GET SINGLE COURIER AGENT
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const agent = await CourierAgent.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash', 'verification_token'] }
    });

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.json({ agent });
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ message: 'Failed to fetch agent', error: error.message });
  }
});

// 7. UPDATE COURIER AGENT (Admin)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { agent_name, phone, region, is_active, notes } = req.body;
    
    const agent = await CourierAgent.findByPk(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    if (agent_name) agent.agent_name = agent_name;
    if (phone) agent.phone = phone;
    if (region) agent.region = region;
    if (is_active !== undefined) agent.is_active = is_active;
    if (notes !== undefined) agent.notes = notes;

    await agent.save();

    res.json({
      message: 'Agent updated successfully',
      agent: {
        agent_id: agent.agent_id,
        agent_name: agent.agent_name,
        email: agent.email,
        courier_company: agent.courier_company
      }
    });
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ message: 'Failed to update agent', error: error.message });
  }
});

// 8. DELETE/DEACTIVATE COURIER AGENT
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const agent = await CourierAgent.findByPk(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    await agent.update({ is_active: false });

    res.json({ message: 'Agent deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating agent:', error);
    res.status(500).json({ message: 'Failed to deactivate agent', error: error.message });
  }
});

// 9. UPDATE AGENT PERFORMANCE (After shipment completion)
router.put('/:id/update-performance', async (req, res) => {
  try {
    const { is_on_time } = req.body;
    
    const agent = await CourierAgent.findByPk(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Update metrics
    agent.total_shipments += 1;
    if (is_on_time) {
      agent.on_time_deliveries += 1;
    } else {
      agent.failed_deliveries += 1;
    }

    // Calculate new rating
    agent.performance_rating = (agent.on_time_deliveries / agent.total_shipments * 5).toFixed(2);

    await agent.save();

    res.json({
      message: 'Performance updated',
      agent: {
        total_shipments: agent.total_shipments,
        on_time_deliveries: agent.on_time_deliveries,
        performance_rating: agent.performance_rating
      }
    });
  } catch (error) {
    console.error('Error updating performance:', error);
    res.status(500).json({ message: 'Failed to update performance', error: error.message });
  }
});

// 10. RESET COURIER AGENT PASSWORD (Admin resets, sends temp password)
router.post('/:id/reset-password', authenticateToken, async (req, res) => {
  try {
    const agent = await CourierAgent.findByPk(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).substring(2, 10).toUpperCase() + Math.random().toString(36).substring(2, 5);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await agent.update({ password_hash: hashedPassword });

    res.json({
      message: 'Password reset successfully',
      tempPassword,
      note: 'Share this password with the agent'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
});

module.exports = router;