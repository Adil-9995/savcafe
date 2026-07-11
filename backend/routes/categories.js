const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoryController');
const {
  authenticateToken,
  authorizeAdmin
} = require('../middleware/auth');

// Get all categories (Authenticated users)
router.get('/', authenticateToken, categoryController.getCategories);

// Add category (Admin / Shop Owner / Manager)
router.post('/', authorizeAdmin, categoryController.addCategory);

// Update category
router.put('/:id', authorizeAdmin, categoryController.updateCategory);

// Delete category
router.delete('/:id', authorizeAdmin, categoryController.deleteCategory);

module.exports = router;
