const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const { authorizeAdmin } = require('../middleware/auth');

// Support stats query for admin reports dashboard
router.get('/stats', authorizeAdmin, billController.getStats);

module.exports = router;
