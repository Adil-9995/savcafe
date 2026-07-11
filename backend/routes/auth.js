const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Rate Limiter: Max 100 login requests per 15 minutes per IP address
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { error: 'Too many login attempts from this connection. Please retry in 15 minutes.' }
});

router.post('/login', loginLimiter, authController.login);
router.get('/me', authenticateToken, authController.getCurrentUser);
router.put('/profile', authenticateToken, authController.updateProfile);

module.exports = router;
