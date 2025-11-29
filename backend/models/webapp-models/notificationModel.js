const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Userwebapp',
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
    enum: ['assessment_assigned', 'assessment_available', 'assessment_result', 'assessment_submitted', 'study_plan_updated', 'system_announcement', 'ai_recommendation'],
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
notificationSchema.index({ studentId: 1, createdAt: -1 });
notificationSchema.index({ studentId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);