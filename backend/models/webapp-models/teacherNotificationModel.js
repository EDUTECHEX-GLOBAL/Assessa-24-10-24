const mongoose = require('mongoose');

const teacherNotificationSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'assessment_submitted', 
      'assessment_graded', 
      'student_question', 
      'student_progress', 
      'class_announcement', 
      'system_announcement',
      'new_student_enrolled',
      'parent_message',
      'grade_submission',
      'attendance_alert'
    ],
    default: 'system_announcement'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient queries
teacherNotificationSchema.index({ teacherId: 1, createdAt: -1 });
teacherNotificationSchema.index({ teacherId: 1, isRead: 1 });
teacherNotificationSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('TeacherNotification', teacherNotificationSchema);