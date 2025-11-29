import { useState, useRef, useEffect } from 'react';
import { FaBell, FaTimes } from 'react-icons/fa';
import axios from 'axios';

export default function TeacherNotificationBell({ setSelectedSection, teacherToken }) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Get axios config with auth headers
  const getAuthConfig = () => {
    return teacherToken ? {
      headers: {
        'Authorization': `Bearer ${teacherToken}`
      }
    } : {};
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      console.log('Fetching teacher unread count...');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/notifications/teacher/unread-count`,
        getAuthConfig()
      );
      
      console.log('Teacher unread count response:', response.data);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching teacher unread count:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    }
  };

  // Fetch recent notifications for dropdown
  const fetchRecentNotifications = async () => {
    try {
      setLoading(true);
      console.log('Fetching teacher notifications...');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/notifications/teacher?limit=5&unreadOnly=true`,
        getAuthConfig()
      );
      
      console.log('Teacher notifications response:', response.data);
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching teacher notifications:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      setNotifications([]);
    } finally {
      setLoading(false);
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
      
      // Refresh the data
      await fetchRecentNotifications();
      await fetchUnreadCount();
      
    } catch (error) {
      console.error('Error marking teacher notification as read:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/notifications/teacher/read-all`,
        {},
        getAuthConfig()
      );
      
      // Refresh the data
      await fetchRecentNotifications();
      await fetchUnreadCount();
      
    } catch (error) {
      console.error('Error marking all teacher notifications as read:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load data when component mounts and set up polling
  useEffect(() => {
    console.log('Teacher notification component mounted, fetching data...');
    fetchUnreadCount();
    fetchRecentNotifications();

    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(() => {
      fetchUnreadCount();
      if (isOpen) {
        fetchRecentNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Refresh notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      console.log('Teacher dropdown opened, refreshing notifications...');
      fetchRecentNotifications();
    }
  }, [isOpen]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'assessment_submitted':
        return '📝';
      case 'assessment_graded':
        return '📊';
      case 'student_question':
        return '❓';
      case 'system_announcement':
        return '📢';
      case 'student_progress':
        return '📈';
      case 'class_announcement':
        return '🏫';
      default:
        return '🔔';
    }
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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
        title="Notifications"
      >
        <FaBell className="text-2xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Notifications */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] transform transition-all duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Teacher Notifications</h3>
              <p className="text-sm text-gray-600">
                {unreadCount} unread {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium ml-2"
                  >
                    Mark all as read
                  </button>
                )}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto p-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="flex space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaBell className="text-xl text-gray-400" />
                </div>
                <p>No new notifications</p>
                <p className="text-sm mt-2">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      !notification.isRead 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-white border-gray-100'
                    } hover:shadow-md`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {getTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                          {notification.message}
                        </p>
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* View All Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
              onClick={() => {
                setIsOpen(false);
                if (setSelectedSection) {
                  setSelectedSection("notifications");
                }
              }}
              className="block w-full text-center text-sm text-blue-600 hover:text-blue-800 font-semibold py-2 rounded-lg hover:bg-blue-100 transition-colors"
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}