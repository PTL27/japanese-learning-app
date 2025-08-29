import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellRing, 
  X, 
  Check, 
  CheckCheck, 
  UserPlus, 
  MessageCircle, 
  Trophy, 
  Settings,
  Filter
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

const NotificationCenter = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [selectedType, setSelectedType] = useState('all'); // all, friend_request, message, achievement, etc.

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    if (socket) {
      // Listen for new notifications
      const handleNewNotification = (notification) => {
        console.log('🔔 New notification received:', notification);
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show browser notification if permission granted
        showBrowserNotification(notification);
      };

      // Listen for notification read events
      const handleNotificationRead = ({ notificationId }) => {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: true, read_at: new Date().toISOString() }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      };

      const handleAllNotificationsRead = () => {
        setNotifications(prev => 
          prev.map(notif => ({
            ...notif,
            is_read: true,
            read_at: new Date().toISOString()
          }))
        );
        setUnreadCount(0);
      };

      const handleConversationNotificationsRead = ({ conversationId, count }) => {
        console.log(`🔕 Marking ${count} conversation notifications as read for conversation ${conversationId}`);
        setNotifications(prev => 
          prev.map(notif => {
            if (notif.type === 'message' && 
                notif.data?.conversationId === conversationId && 
                !notif.is_read) {
              return {
                ...notif,
                is_read: true,
                read_at: new Date().toISOString()
              };
            }
            return notif;
          })
        );
        setUnreadCount(prev => Math.max(0, prev - count));
      };

      // Add event listeners
      socket.on('new_notification', handleNewNotification);
      socket.on('notification_read', handleNotificationRead);
      socket.on('all_notifications_read', handleAllNotificationsRead);
      socket.on('notifications_conversation_read', handleConversationNotificationsRead);

      // Cleanup function
      return () => {
        if (socket) {
          socket.off('new_notification', handleNewNotification);
          socket.off('notification_read', handleNotificationRead);
          socket.off('all_notifications_read', handleAllNotificationsRead);
          socket.off('notifications_conversation_read', handleConversationNotificationsRead);
        }
      };
    }
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      const response = await fetch('http://localhost:5001/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch('http://localhost:5001/api/notifications/unread-count', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('jwt_token');
      await fetch(`http://localhost:5001/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      await fetch('http://localhost:5001/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const showBrowserNotification = (notification) => {
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'friend_request':
      case 'friend_accepted':
        return <UserPlus className="w-5 h-5 text-blue-600" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-green-600" />;
      case 'weekly_challenge':
      case 'achievement':
        return <Trophy className="w-5 h-5 text-yellow-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'friend_request':
      case 'friend_accepted':
        return 'border-l-blue-500';
      case 'message':
        return 'border-l-green-500';
      case 'weekly_challenge':
      case 'achievement':
        return 'border-l-yellow-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const formatTimeAgo = (dateString) => {
    // Convert UTC time to GMT+7 (Vietnam time)
    const date = new Date(dateString);
    const vietnamDate = new Date(date.getTime() + (7 * 60 * 60 * 1000));
    
    const now = new Date();
    const vietnamNow = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    
    const diff = vietnamNow - vietnamDate;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread' && notif.is_read) return false;
    if (filter === 'read' && !notif.is_read) return false;
    if (selectedType !== 'all' && notif.type !== selectedType) return false;
    return true;
  });

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            requestNotificationPermission();
          }
        }}
        className="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-6 h-6" />
        ) : (
          <Bell className="w-6 h-6" />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-20 max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Thông báo</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Đánh dấu tất cả đã đọc
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                  {['all', 'unread', 'read'].map(filterType => (
                    <button
                      key={filterType}
                      onClick={() => setFilter(filterType)}
                      className={`px-3 py-1 text-sm rounded-md font-medium transition-all ${
                        filter === filterType
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {filterType === 'all' ? 'Tất cả' : filterType === 'unread' ? 'Chưa đọc' : 'Đã đọc'}
                    </button>
                  ))}
                </div>
                
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tất cả loại</option>
                  <option value="friend_request">Lời mời kết bạn</option>
                  <option value="message">Tin nhắn</option>
                  <option value="weekly_challenge">Weekly Challenge</option>
                  <option value="achievement">Thành tích</option>
                  <option value="system">Hệ thống</option>
                </select>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2 text-sm">Đang tải...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Không có thông báo</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {filter === 'unread' ? 'Tất cả thông báo đã được đọc' : 'Chưa có thông báo nào'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredNotifications.map(notification => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-all border-l-4 ${
                        getNotificationColor(notification.type)
                      } ${
                        !notification.is_read ? 'bg-blue-50' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className={`text-sm font-medium ${
                                !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </p>
                              <p className={`text-sm mt-1 ${
                                !notification.is_read ? 'text-gray-700' : 'text-gray-500'
                              }`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {formatTimeAgo(notification.created_at)}
                              </p>
                            </div>
                            
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to settings or notification preferences
                  window.location.href = '/profile';
                }}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 w-full"
              >
                <Settings className="w-4 h-4" />
                <span>Cài đặt thông báo</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;