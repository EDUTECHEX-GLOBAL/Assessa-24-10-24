const Notification = require('../models/webapp-models/notificationModel');
const User = require('../models/webapp-models/userModel');

// In notificationController.js - update getStudentNotifications
exports.getStudentNotifications = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      console.log('No authenticated user found');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const studentId = req.user._id; // Get from authenticated user
    const { page = 1, limit = 100, unreadOnly = false } = req.query;

    console.log('Fetching notifications for student:', studentId); // Debug log

    const query = { studentId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      studentId, 
      isRead: false 
    });

    console.log(`Found ${notifications.length} notifications, ${unreadCount} unread`); // Debug log

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      unreadCount
    });
  } catch (error) {
    console.error('Error in getStudentNotifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, studentId: req.user._id }, // Ensure student owns the notification
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark all notifications as read for authenticated student
exports.markAllAsRead = async (req, res) => {
  try {
    const studentId = req.user._id;
    
    await Notification.updateMany(
      { studentId, isRead: false },
      { isRead: true }
    );

    const unreadCount = await Notification.countDocuments({ 
      studentId, 
      isRead: false 
    });

    res.json({ 
      message: 'All notifications marked as read',
      unreadCount 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete notification (with ownership check)
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findOneAndDelete({ 
      _id: notificationId, 
      studentId: req.user._id 
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get unread count for authenticated student
exports.getUnreadCount = async (req, res) => {
  try {
    const studentId = req.user._id;
    
    const unreadCount = await Notification.countDocuments({ 
      studentId, 
      isRead: false 
    });

    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create notification (for testing or admin use)
exports.createNotification = async (req, res) => {
  try {
    const { studentId, title, message, type = 'system_announcement', metadata = {} } = req.body;
    
    const notification = new Notification({
      studentId,
      title,
      message,
      type,
      metadata
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create assessment notification for all students in a grade level
exports.createAssessmentNotification = async (gradeLevel, assessmentData) => {
  try {
    const students = await User.find({ 
      role: 'student', 
      class: gradeLevel 
    }).select('_id');

    if (students.length === 0) {
      console.log(`No students found for grade level: ${gradeLevel}`);
      return;
    }

    const notifications = students.map(student => ({
      studentId: student._id,
      title: assessmentData.title,
      message: assessmentData.message,
      type: 'assessment_assigned',
      metadata: {
        subject: assessmentData.subject,
        dueDate: assessmentData.dueDate,
        assessmentId: assessmentData.assessmentId,
        assessmentType: assessmentData.assessmentType
      }
    }));

    await Notification.insertMany(notifications);
    console.log(`Created ${notifications.length} notifications for grade ${gradeLevel}`);
    
  } catch (error) {
    console.error('Error creating assessment notifications:', error);
    throw error;
  }
};

// ✅ GET Top 3 Performers (Standard + SAT)
const AssessmentSubmission = require("../models/webapp-models/assessmentSubmissionModel");
const SatSubmission = require("../models/webapp-models/satSubmissionModel");
const AssessmentUpload = require("../models/webapp-models/assessmentuploadformModel");
const SatAssessment = require("../models/webapp-models/satAssessmentModel");

exports.getTopPerformers = async (req, res) => {
  try {
    // Fetch Standard Submissions
    const standard = await AssessmentSubmission.find()
      .populate("studentId", "name class")
      .lean();

    // Fetch SAT Submissions
    const sat = await SatSubmission.find()
      .populate("studentId", "name class")
      .lean();

    // Normalize Standard Submissions
    const formattedStandard = standard
      .filter(s => s.studentId) // remove deleted students
      .map(s => ({
        name: s.studentId.name,
        class: s.studentId.class || "N/A",
        percentage: Number((s.percentage || 0).toFixed(2))
      }));

    // Normalize SAT Submissions
    const formattedSat = sat
      .filter(s => s.studentId)
      .map(s => ({
        name: s.studentId.name,
        class: s.studentId.class || "N/A",
        percentage: Number((s.percentage || 0).toFixed(2))
      }));

    // Combine both
    const combined = [...formattedStandard, ...formattedSat];

    // Sort by highest percentage
    combined.sort((a, b) => b.percentage - a.percentage);

    // Pick top 3
    const top3 = combined.slice(0, 3);

    res.status(200).json(top3);

  } catch (error) {
    console.error("Error fetching top performers:", error);
    res.status(500).json({ message: "Failed to fetch top performers" });
  }
};
