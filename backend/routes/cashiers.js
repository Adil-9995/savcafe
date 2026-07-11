const express = require('express');
const router = express.Router();
const cashierController = require('../controllers/cashierController');
const { authorizeAdmin } = require('../middleware/auth');

router.get('/', authorizeAdmin, cashierController.getCashiers);
router.post('/', authorizeAdmin, cashierController.addCashier);
router.put('/:id', authorizeAdmin, cashierController.updateCashier);
router.delete('/:id', authorizeAdmin, cashierController.deleteCashier);
router.post('/:id/reset-password', authorizeAdmin, cashierController.resetPassword);

module.exports = router;
