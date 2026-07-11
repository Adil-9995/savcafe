const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const backupController = require('../controllers/backupController');
const { authorizeAdmin } = require('../middleware/auth');

router.post('/clear', authorizeAdmin, billController.clearData);
router.get('/backups', authorizeAdmin, backupController.listBackups);
router.post('/backups', authorizeAdmin, backupController.createBackup);
router.post('/backups/restore', authorizeAdmin, backupController.restoreBackup);
router.delete('/backups/:backupName', authorizeAdmin, backupController.deleteBackup);

module.exports = router;
