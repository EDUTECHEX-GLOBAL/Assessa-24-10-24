const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware'); // Make sure path is correct

// Protected student notification routes (no studentId in URL)
router.get('/student', protect, notificationController.getStudentNotifications);
router.get('/student/unread-count', protect, notificationController.getUnreadCount);
router.get("/top-performers", protect, notificationController.getTopPerformers);
router.patch('/:notificationId/read', protect, notificationController.markAsRead);
router.patch('/student/read-all', protect, notificationController.markAllAsRead);
router.delete('/:notificationId', protect, notificationController.deleteNotification);
router.post('/create', protect, notificationController.createNotification);

module.exports = router;