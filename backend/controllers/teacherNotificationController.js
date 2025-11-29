const TeacherNotification = require('../models/webapp-models/teacherNotificationModel');
const Teacher = require('../models/webapp-models/teacherModel');
const User = require('../models/webapp-models/userModel');

// Get teacher notifications
exports.getTeacherNotifications = async (req, res) => {
  try {
    // Check if user is authenticated and is a teacher
    if (!req.user || !req.user._id || req.user.role !== 'teacher') {
      console.log('No authenticated teacher found');
      return res.status(401).json({ message: 'Teacher not authenticated' });
    }

    const teacherId = req.user._id; // Get from authenticated teacher
    const { page = 1, limit = 100, unreadOnly = false } = req.query;

    console.log('Fetching notifications for teacher:', teacherId); // Debug log

    const query = { teacherId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await TeacherNotification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TeacherNotification.countDocuments(query);
    const unreadCount = await TeacherNotification.countDocuments({ 
      teacherId, 
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
    console.error('Error in getTeacherNotifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await TeacherNotification.findOneAndUpdate(
      { _id: notificationId, teacherId: req.user._id }, // Ensure teacher owns the notification
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

// Mark all notifications as read for authenticated teacher
exports.markAllAsRead = async (req, res) => {
  try {
    const teacherId = req.user._id;
    
    await TeacherNotification.updateMany(
      { teacherId, isRead: false },
      { isRead: true }
    );

    const unreadCount = await TeacherNotification.countDocuments({ 
      teacherId, 
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
    
    const notification = await TeacherNotification.findOneAndDelete({ 
      _id: notificationId, 
      teacherId: req.user._id 
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get unread count for authenticated teacher
exports.getUnreadCount = async (req, res) => {
  try {
    const teacherId = req.user._id;
    
    const unreadCount = await TeacherNotification.countDocuments({ 
      teacherId, 
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
    const { teacherId, title, message, type = 'system_announcement', metadata = {} } = req.body;
    
    const notification = new TeacherNotification({
      teacherId,
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

// Create assessment submission notification for teacher
exports.createAssessmentSubmissionNotification = async (teacherId, assessmentData) => {
  try {
    const notification = new TeacherNotification({
      teacherId,
      title: 'New Assessment Submission',
      message: `${assessmentData.studentName} has submitted ${assessmentData.assessmentName}`,
      type: 'assessment_submitted',
      metadata: {
        studentName: assessmentData.studentName,
        studentId: assessmentData.studentId,
        assessmentName: assessmentData.assessmentName,
        assessmentId: assessmentData.assessmentId,
        submittedAt: assessmentData.submittedAt,
        subject: assessmentData.subject,
        gradeLevel: assessmentData.gradeLevel
      }
    });

    await notification.save();
    console.log(`Created assessment submission notification for teacher ${teacherId}`);
    
    return notification;
  } catch (error) {
    console.error('Error creating assessment submission notification:', error);
    throw error;
  }
};

// Create student question notification for teacher
exports.createStudentQuestionNotification = async (teacherId, questionData) => {
  try {
    const notification = new TeacherNotification({
      teacherId,
      title: 'Student Question',
      message: `${questionData.studentName} has a question about ${questionData.topic}`,
      type: 'student_question',
      metadata: {
        studentName: questionData.studentName,
        studentId: questionData.studentId,
        topic: questionData.topic,
        question: questionData.question,
        questionId: questionData.questionId,
        subject: questionData.subject,
        urgency: questionData.urgency || 'normal'
      }
    });

    await notification.save();
    console.log(`Created student question notification for teacher ${teacherId}`);
    
    return notification;
  } catch (error) {
    console.error('Error creating student question notification:', error);
    throw error;
  }
};

// Create student progress notification for teacher
exports.createStudentProgressNotification = async (teacherId, progressData) => {
  try {
    const notification = new TeacherNotification({
      teacherId,
      title: 'Student Progress Update',
      message: `${progressData.studentName} has shown ${progressData.trend} progress in ${progressData.subject}`,
      type: 'student_progress',
      metadata: {
        studentName: progressData.studentName,
        studentId: progressData.studentId,
        subject: progressData.subject,
        trend: progressData.trend, // 'improved', 'declined', 'consistent'
        score: progressData.score,
        previousScore: progressData.previousScore,
        assessmentName: progressData.assessmentName,
        improvement: progressData.improvement
      }
    });

    await notification.save();
    console.log(`Created student progress notification for teacher ${teacherId}`);
    
    return notification;
  } catch (error) {
    console.error('Error creating student progress notification:', error);
    throw error;
  }
};

// Create system announcement for all teachers
exports.createSystemAnnouncementForTeachers = async (announcementData) => {
  try {
    const teachers = await Teacher.find().select('_id');

    if (teachers.length === 0) {
      console.log('No teachers found');
      return;
    }

    const notifications = teachers.map(teacher => ({
      teacherId: teacher._id,
      title: announcementData.title,
      message: announcementData.message,
      type: 'system_announcement',
      metadata: {
        announcementId: announcementData.announcementId,
        priority: announcementData.priority || 'normal',
        category: announcementData.category || 'general'
      }
    }));

    await TeacherNotification.insertMany(notifications);
    console.log(`Created ${notifications.length} system announcements for teachers`);
    
  } catch (error) {
    console.error('Error creating system announcements for teachers:', error);
    throw error;
  }
};