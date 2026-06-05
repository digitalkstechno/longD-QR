const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, notificationController.getNotifications);
router.post('/mark-all-read', protect, notificationController.markAllAsRead);
router.patch('/:id/read', protect, notificationController.markAsRead);
router.delete('/:id', protect, notificationController.deleteNotification);

module.exports = router;
