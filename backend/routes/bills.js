const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, billController.createBill);
router.get('/', authenticateToken, billController.getBills);
router.get('/:id', authenticateToken, billController.getBillDetails);

module.exports = router;
