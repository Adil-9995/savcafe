const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authorizeAdmin } = require('../middleware/auth');

router.get('/', categoryController.getCategories);
router.post('/', authorizeAdmin, categoryController.addCategory);
router.put('/:id', authorizeAdmin, categoryController.updateCategory);
router.delete('/:id', authorizeAdmin, categoryController.deleteCategory);

module.exports = router;
