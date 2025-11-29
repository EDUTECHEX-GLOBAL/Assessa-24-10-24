import { useState, useEffect } from 'react';
import { 
  FaBell, 
  FaCheckDouble, 
  FaTrash, 
  FaArrowLeft, 
  FaCheck,
  FaSearch,
  FaRegClock,
  FaBook,
   FaEye,
  FaChartBar,
  FaUserCheck,
  FaRobot,
  FaExclamationTriangle,
  FaClipboardCheck,
  FaFileUpload,
  FaUsers,
  FaGraduationCap,
  FaQuestionCircle
} from 'react-icons/fa';
import axios from 'axios';

export default function TeacherNotificationPage({ onBackHome , teacherToken, setCurrentView }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getAuthConfig = () => {
  const fallback = JSON.parse(localStorage.getItem('teacherInfo') || 'null');
  const token = teacherToken || fallback?.token;
  
  return token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};
};


  // Fetch all notifications for teacher
  const fetchAllNotifications = async () => {
    try {
      setLoading(true);
      console.log('Fetching ALL teacher notifications for page...');

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/notifications/teacher`,
        getAuthConfig()
      );
      
      console.log('ALL teacher notifications response:', response.data);
      
      // Check if notifications is nested or at root level
      const notificationsData = response.data.notifications || response.data;
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      
      // Also fix unreadCount - check both possible locations
      const unreadCountData = response.data.unreadCount || 
                             (Array.isArray(notificationsData) ? 
                              notificationsData.filter(n => !n.isRead).length : 0);
      setUnreadCount(unreadCountData);
      
    } catch (error) {
      console.error('Error fetching ALL teacher notifications:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count separately
  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/notifications/teacher/unread-count`,
        getAuthConfig()
      );
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching teacher unread count:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      console.log('Marking teacher notification as read:', notificationId);
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/notifications/${notificationId}/read`,
        {},
        getAuthConfig()
      );
      
      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      // Refresh unread count
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error marking teacher notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      console.log('Marking all teacher notifications as read');
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/notifications/teacher/read-all`,
        {},
        getAuthConfig()
      );
      
      // Update all notifications to read
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all teacher notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      console.log('Deleting teacher notification:', notificationId);
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/notifications/${notificationId}`,
        getAuthConfig()
      );
      
      // Remove from local state
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      // Refresh unread count
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error deleting teacher notification:', error);
    }
  };


 const handleViewDetails = (notification) => {
  console.log('View details for notification:', notification);

  // Determine assessment type (SAT or Standard)
  const isSAT = 
    notification.metadata?.assessmentType === "SAT" ||
    notification.metadata?.category === "SAT" ||
    notification.metadata?.type === "sat";

  if (isSAT) {
    setCurrentView("progress-sat");
  } else {
    setCurrentView("progress-standard");
  }
};


  const getNotificationConfig = (type) => {
    const config = {
      assessment_submitted: { 
        icon: FaClipboardCheck, 
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-200',
        label: 'Assessment Submitted'
      },
      assessment_graded: { 
        icon: FaChartBar, 
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-200',
        label: 'Assessment Graded'
      },
      student_question: { 
        icon: FaQuestionCircle, 
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-200',
        label: 'Student Question'
      },
      student_progress: { 
        icon: FaUserCheck, 
        color: 'text-teal-600',
        bgColor: 'bg-teal-100',
        borderColor: 'border-teal-200',
        label: 'Student Progress'
      },
      class_announcement: { 
        icon: FaUsers, 
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        borderColor: 'border-orange-200',
        label: 'Class Announcement'
      },
      system_announcement: { 
        icon: FaExclamationTriangle, 
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-200',
        label: 'System Announcement'
      },
      new_student_enrolled: { 
        icon: FaGraduationCap, 
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        borderColor: 'border-indigo-200',
        label: 'New Student'
      }
    };
    
    return config[type] || { 
      icon: FaBell, 
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-200',
      label: 'General'
    };
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.isRead) || 
      (filter === 'read' && notification.isRead);
    
    const matchesSearch = notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Set up polling for real-time updates
  useEffect(() => {
    fetchAllNotifications();
    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchAllNotifications();
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            
            <button
              onClick={onBackHome}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <FaArrowLeft className="text-sm" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center space-x-2 text-sm text-green-600 hover:text-green-700 font-medium bg-green-50 px-3 py-2 rounded-lg transition-colors"
            >
              <FaCheckDouble className="text-xs" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {/* Title Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Teacher Notifications</h1>
          <p className="text-gray-600">Stay updated with classroom activities and student progress</p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {['all', 'unread', 'read'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                    filter === filterType 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {filterType}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse">
                <div className="flex space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBell className="text-xl text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filter !== 'all' 
                ? 'No notifications match your search' 
                : "You're all caught up with your notifications!"
              }
            </h3>
            <p className="text-gray-600">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter' 
                : 'New notifications will appear here'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => {
              const config = getNotificationConfig(notification.type);
              const IconComponent = config.icon;
              
              return (
                <div
                  key={notification._id}
                  className={`p-6 transition-all duration-200 hover:bg-gray-50 ${
                    !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Notification Icon */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-12 h-12 rounded-lg ${config.bgColor} border ${config.borderColor} flex items-center justify-center`}>
                        <IconComponent className={`text-lg ${config.color}`} />
                      </div>
                      {!notification.isRead && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.bgColor} ${config.color} border ${config.borderColor}`}>
                            {config.label}
                          </span>
                          {!notification.isRead && (
                            <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded-full">New</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <FaRegClock className="text-xs" />
                          <span>{getTimeAgo(notification.createdAt)}</span>
                        </div>
                      </div>
                      
                      <h3 className={`font-semibold mb-2 text-lg ${
                        !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-3 leading-relaxed">
                        {notification.message}
                      </p>
                      
                      {/* Additional Info */}
                      {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                        <div className="text-sm text-gray-500 mb-4">
                          {notification.metadata.studentName && (
                            <span className="mr-4">👤 {notification.metadata.studentName}</span>
                          )}
                          {notification.metadata.className && (
                            <span className="mr-4">🏫 {notification.metadata.className}</span>
                          )}
                          {notification.metadata.assessmentName && (
                            <span className="mr-4">📝 {notification.metadata.assessmentName}</span>
                          )}
                          {notification.metadata.score && (
                            <span className="mr-4">🎯 Score: {notification.metadata.score}%</span>
                          )}
                        </div>
                      )}
                      
                                {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {/* Add this View Details button */}
              <button
                onClick={() => handleViewDetails(notification)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-2 transition-colors"
              >
                <FaEye className="text-xs" />
                <span>View Details</span>
              </button>
              
              {!notification.isRead && (
                <button
                  onClick={() => markAsRead(notification._id)}
                  className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-2 transition-colors"
                >
                  <FaCheck className="text-xs" />
                  <span>Mark as read</span>
                </button>
              )}
              
              <button
                onClick={() => deleteNotification(notification._id)}
                className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-2 transition-colors"
              >
                <FaTrash className="text-xs" />
                <span>Delete</span>
              </button>
            </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}