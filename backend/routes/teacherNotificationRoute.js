const express = require('express');
const router = express.Router();
const teacherNotificationController = require('../controllers/teacherNotificationController');
const { protect } = require('../middlewares/authMiddleware');

// Protected teacher notification routes
router.get('/teacher', protect, teacherNotificationController.getTeacherNotifications);
router.get('/teacher/unread-count', protect, teacherNotificationController.getUnreadCount);
router.patch('/:notificationId/read', protect, teacherNotificationController.markAsRead);
router.patch('/teacher/read-all', protect, teacherNotificationController.markAllAsRead);
router.delete('/:notificationId', protect, teacherNotificationController.deleteNotification);
router.post('/create', protect, teacherNotificationController.createNotification);

module.exports = router;