const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authorizeAdmin } = require('../middleware/auth');

router.get('/', productController.getProducts);
router.post('/', authorizeAdmin, productController.addProduct);
router.put('/:id', authorizeAdmin, productController.updateProduct);
router.delete('/:id', authorizeAdmin, productController.deleteProduct);
router.patch('/:id/status', authorizeAdmin, productController.toggleStatus);

module.exports = router;
