const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const {
  authenticateToken,
  authorizeAdmin
} = require('../middleware/auth');

// Get all products (Authenticated users)
router.get('/', authenticateToken, productController.getProducts);

// Add product (Admin/Owner/Manager only)
router.post('/', authorizeAdmin, productController.addProduct);

// Update product
router.put('/:id', authorizeAdmin, productController.updateProduct);

// Delete product
router.delete('/:id', authorizeAdmin, productController.deleteProduct);

// Change product status
router.patch('/:id/status', authorizeAdmin, productController.toggleStatus);

module.exports = router;
