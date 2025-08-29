const express = require('express');
const router = express.Router();
const { getQuery, allQuery, runQuery } = require('../database/database');
const { authenticateToken } = require('../middleware/auth');
const notificationService = require('../services/notificationService');

// Get user's notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false, type = null } = req.query;
    
    const notifications = await notificationService.getUserNotifications(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true',
      type: type
    });
    
    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: notifications.length
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// Get unread notifications count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await notificationService.getUnreadCount(userId);
    
    res.json({
      success: true,
      count: count
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count'
    });
  }
});

// Mark notification as read
router.put('/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    // Verify notification belongs to user
    const notification = await getQuery(`
      SELECT id FROM notifications 
      WHERE id = ? AND user_id = ?
    `, [notificationId, userId]);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    await notificationService.markAsRead(notificationId, userId);
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    await notificationService.markAllAsRead(userId);
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
});

// Get notification settings
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = await notificationService.getUserNotificationSettings(userId);
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification settings'
    });
  }
});

// Update notification settings
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = req.body;
    
    await notificationService.updateNotificationSettings(userId, settings);
    
    res.json({
      success: true,
      message: 'Notification settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification settings'
    });
  }
});

// Delete notification
router.delete('/:notificationId', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    // Verify notification belongs to user
    const notification = await getQuery(`
      SELECT id FROM notifications 
      WHERE id = ? AND user_id = ?
    `, [notificationId, userId]);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    await runQuery(`DELETE FROM notifications WHERE id = ?`, [notificationId]);
    
    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
});

// Create test notification (for development)
if (process.env.NODE_ENV === 'development') {
  router.post('/test', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { type = 'system', title = 'Test Notification', message = 'This is a test notification' } = req.body;
      
      const notification = await notificationService.createNotification({
        userId,
        type,
        title,
        message,
        data: { test: true }
      });
      
      res.json({
        success: true,
        data: notification,
        message: 'Test notification created'
      });
    } catch (error) {
      console.error('Error creating test notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create test notification'
      });
    }
  });
}

// Mark conversation-related notifications as read
router.put('/conversation/:conversationId/read', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    
    // Mark all message notifications for this conversation as read
    const result = await runQuery(`
      UPDATE notifications 
      SET is_read = 1, read_at = CURRENT_TIMESTAMP 
      WHERE user_id = ? 
        AND type = 'message' 
        AND is_read = 0
        AND json_extract(data, '$.conversationId') = ?
    `, [userId, conversationId]);
    
    // Get updated notifications to emit real-time updates
    if (result.changes > 0) {
      const notificationService = require('../services/notificationService');
      const socketService = require('../services/socketService');
      
      // Emit that notifications were read
      socketService.emitToUser(userId, 'notifications_conversation_read', {
        conversationId,
        count: result.changes
      });
    }
    
    res.json({
      success: true,
      message: `${result.changes} notifications marked as read`,
      count: result.changes
    });
  } catch (error) {
    console.error('Error marking conversation notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read'
    });
  }
});

module.exports = router;