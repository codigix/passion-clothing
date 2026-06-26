const express = require('express');
const chatbotController = require('../controllers/chatbotController');
const { authenticateToken } = require('../../middleware/auth');

const router = express.Router();

// Protected route to handle chatbot interaction
router.post('/message', authenticateToken, chatbotController.handleMessage);

// Protected route to apply suggested rate to the database
router.post('/apply-rate', authenticateToken, chatbotController.applyRate);

module.exports = router;
