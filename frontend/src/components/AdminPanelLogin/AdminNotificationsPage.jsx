import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaBell, 
  FaCheckDouble, 
  FaTrash, 
  FaArrowLeft, 
  FaCheck,
  FaSearch,
  FaUserPlus,
  FaFileUpload,
  FaClipboardCheck,
  FaExclamationTriangle,
  FaEye,
  FaRegClock
} from 'react-icons/fa';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const mockNotifications = [
    {
      _id: '1',
      type: 'login_request',
      title: 'New Teacher Registration',
      message: 'Raj (raj1027@gmail.com) has requested access as a teacher',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      data: {}
    },
    {
      _id: '2',
      type: 'login_request',
      title: 'New Student Registration',
      message: 'Balu (balu@gmail.com) has requested access as a student',
      isRead: false,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      data: {}
    }
  ];

  const getToken = () => localStorage.getItem('token');

  const isAdminAuthenticated = () => {
    const token = getToken();
    return token && token.split('.').length === 3;
  };

  const fetchAllNotifications = async () => {
    if (!isAdminAuthenticated()) {
      setAuthError(true);
      setNotifications(mockNotifications);
      setUnreadCount(2);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Your API call here
      setNotifications(mockNotifications);
      setUnreadCount(2);
    } catch (error) {
      setNotifications(mockNotifications);
      setUnreadCount(2);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif._id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    setUnreadCount(0);
  };

  const deleteNotification = async (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const getNotificationLink = (notification) => {
    switch (notification.type) {
      case 'login_request': return '/admin-dashboard/approvals';
      case 'assessment_uploaded': 
        return notification.data?.assessmentType === 'sat' 
          ? '/admin-dashboard/sat-generated-assessments' 
          : '/admin-dashboard/standard-generated-assessments';
      default: return '/admin-dashboard';
    }
  };

  const getNotificationConfig = (type) => {
    const config = {
      login_request: { 
        icon: FaUserPlus, 
        color: 'text-pink-600',
        bgColor: 'bg-pink-100',
        borderColor: 'border-pink-200',
        label: 'Registration'
      },
      assessment_uploaded: { 
        icon: FaFileUpload, 
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100',
        borderColor: 'border-emerald-200',
        label: 'Assessment'
      },
      assessment_taken: { 
        icon: FaClipboardCheck, 
        color: 'text-violet-600',
        bgColor: 'bg-violet-100',
        borderColor: 'border-violet-200',
        label: 'Attempt'
      }
    };
    
    return config[type] || { 
      icon: FaBell, 
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
      borderColor: 'border-slate-200',
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

  useEffect(() => {
    if (isAdminAuthenticated()) {
      fetchAllNotifications();
    } else {
      setAuthError(true);
      setLoading(false);
    }
  }, []);

  if (authError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow-sm border border-slate-200 p-8 max-w-md w-full">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBell className="text-lg text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Access Required</h2>
          <p className="text-slate-600 mb-4">Please log in to view notifications</p>
          <button
            onClick={() => navigate('/admin-login')}
            className="bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header - Clean and Aligned */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin-dashboard')}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <FaArrowLeft className="text-sm" />
                <span className="font-medium">Back to Dashboard</span>
              </button>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center space-x-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                <FaCheckDouble className="text-xs" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* Title Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-orange-600 mb-2">Notifications</h1>
            <p className="text-slate-600">Stay updated with system activities</p>
          </div>

          {/* Search and Filter - Compact */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                />
              </div>
              
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {['all', 'unread', 'read'].map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                      filter === filterType 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    {filterType}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List - Clean Layout */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-lg border border-slate-200 p-4 animate-pulse">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBell className="text-xl text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No notifications</h3>
            <p className="text-slate-600">
              {searchTerm || filter !== 'all' 
                ? 'No notifications match your search' 
                : "You're all caught up!"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const config = getNotificationConfig(notification.type);
              const IconComponent = config.icon;
              
              return (
                <div
                  key={notification._id}
                  className={`bg-white rounded-lg border transition-all duration-200 hover:shadow-sm ${
                    !notification.isRead 
                      ? 'border-pink-200 bg-pink-50/50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      {/* Compact Icon */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-8 h-8 rounded-lg ${config.bgColor} border ${config.borderColor} flex items-center justify-center`}>
                          <IconComponent className={`text-sm ${config.color}`} />
                        </div>
                        {!notification.isRead && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full border border-white"></div>
                        )}
                      </div>
                      
                      {/* Content - Properly Aligned */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded ${config.bgColor} ${config.color} border ${config.borderColor}`}>
                              {config.label}
                            </span>
                            {!notification.isRead && (
                              <span className="text-xs text-pink-600 font-medium">• New</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-slate-500">
                            <FaRegClock className="text-xs" />
                            <span>{getTimeAgo(notification.createdAt)}</span>
                          </div>
                        </div>
                        
                        <h3 className={`font-semibold mb-1 text-sm ${
                          !notification.isRead ? 'text-slate-900' : 'text-slate-700'
                        }`}>
                          {notification.title}
                        </h3>
                        
                        <p className="text-slate-600 text-sm mb-3 leading-relaxed">
                          {notification.message}
                        </p>
                        
                        {/* Compact Action Buttons */}
                        <div className="flex items-center space-x-4">
                          <Link
                            to={getNotificationLink(notification)}
                            className="text-slate-700 hover:text-slate-900 text-sm font-medium flex items-center space-x-1 transition-colors"
                            onClick={() => !notification.isRead && markAsRead(notification._id)}
                          >
                            <FaEye className="text-xs" />
                            <span>View Details</span>
                          </Link>
                          
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center space-x-1 transition-colors"
                            >
                              <FaCheck className="text-xs" />
                              <span>Mark read</span>
                            </button>
                          )}
                          
                          <button
                            onClick={() => deleteNotification(notification._id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1 transition-colors"
                          >
                            <FaTrash className="text-xs" />
                            <span>Delete</span>
                          </button>
                        </div>
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