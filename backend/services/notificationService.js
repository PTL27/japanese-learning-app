const { getQuery, runQuery, allQuery } = require('../database/database');
const socketService = require('./socketService');

class NotificationService {
  constructor() {
    this.notificationTypes = {
      FRIEND_REQUEST: 'friend_request',
      FRIEND_ACCEPTED: 'friend_accepted', 
      MESSAGE: 'message',
      WEEKLY_CHALLENGE: 'weekly_challenge',
      ACHIEVEMENT: 'achievement',
      SYSTEM: 'system'
    };
  }

  // Create a new notification
  async createNotification({
    userId,
    type,
    title,
    message,
    data = null,
    actionUrl = null,
    expiresAt = null
  }) {
    try {
      // Check user's notification settings
      const settings = await this.getUserNotificationSettings(userId);
      if (!this.shouldSendNotification(type, settings)) {
        console.log(`🔕 Notification blocked by user settings: ${type} for user ${userId}`);
        return null;
      }

      // Insert notification
      const result = await runQuery(`
        INSERT INTO notifications (user_id, type, title, message, data, action_url, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        userId,
        type,
        title,
        message,
        data ? JSON.stringify(data) : null,
        actionUrl,
        expiresAt
      ]);

      const notificationId = result.id;

      // Get full notification data
      const notification = await getQuery(`
        SELECT * FROM notifications WHERE id = ?
      `, [notificationId]);

      if (notification.data) {
        notification.data = JSON.parse(notification.data);
      }

      // Emit real-time notification via Socket.io
      socketService.emitToUser(userId, 'new_notification', notification);

      console.log(`🔔 Notification created: ${type} for user ${userId}`);
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get user's notification settings or create default ones
  async getUserNotificationSettings(userId) {
    try {
      let settings = await getQuery(`
        SELECT * FROM notification_settings WHERE user_id = ?
      `, [userId]);

      if (!settings) {
        // Create default settings
        await runQuery(`
          INSERT INTO notification_settings (user_id) VALUES (?)
        `, [userId]);
        
        settings = await getQuery(`
          SELECT * FROM notification_settings WHERE user_id = ?
        `, [userId]);
      }

      return settings;
    } catch (error) {
      console.error('Error getting notification settings:', error);
      throw error;
    }
  }

  // Check if notification should be sent based on user settings
  shouldSendNotification(type, settings) {
    switch (type) {
      case this.notificationTypes.FRIEND_REQUEST:
        return settings.friend_requests === 1;
      case this.notificationTypes.MESSAGE:
        return settings.messages === 1;
      case this.notificationTypes.WEEKLY_CHALLENGE:
        return settings.weekly_challenges === 1;
      case this.notificationTypes.ACHIEVEMENT:
        return settings.achievements === 1;
      case this.notificationTypes.SYSTEM:
        return settings.system_notifications === 1;
      default:
        return true;
    }
  }

  // Friend request notification
  async notifyFriendRequest(receiverId, senderId, senderName) {
    return await this.createNotification({
      userId: receiverId,
      type: this.notificationTypes.FRIEND_REQUEST,
      title: 'Lời mời kết bạn mới',
      message: `${senderName} đã gửi lời mời kết bạn cho bạn`,
      data: { senderId, senderName },
      actionUrl: '/friends?tab=requests'
    });
  }

  // Friend accepted notification  
  async notifyFriendAccepted(userId, accepterName) {
    return await this.createNotification({
      userId: userId,
      type: this.notificationTypes.FRIEND_ACCEPTED,
      title: 'Lời mời kết bạn đã được chấp nhận',
      message: `${accepterName} đã chấp nhận lời mời kết bạn của bạn`,
      data: { accepterName },
      actionUrl: '/friends'
    });
  }

  // New message notification
  async notifyNewMessage(receiverId, senderId, senderName, conversationId, messagePreview) {
    return await this.createNotification({
      userId: receiverId,
      type: this.notificationTypes.MESSAGE,
      title: `Tin nhắn từ ${senderName}`,
      message: messagePreview.length > 50 ? 
        messagePreview.substring(0, 50) + '...' : 
        messagePreview,
      data: { senderId, senderName, conversationId },
      actionUrl: `/chat?conversation=${conversationId}`
    });
  }

  // Weekly challenge notification
  async notifyWeeklyChallenge(userId, challengeTitle, level) {
    return await this.createNotification({
      userId: userId,
      type: this.notificationTypes.WEEKLY_CHALLENGE,
      title: 'Weekly Challenge mới!',
      message: `Thử thách ${level} mới đã sẵn sàng: ${challengeTitle}`,
      data: { challengeTitle, level },
      actionUrl: '/weekly-challenge'
    });
  }

  // Achievement notification
  async notifyAchievement(userId, achievementTitle, description) {
    return await this.createNotification({
      userId: userId,
      type: this.notificationTypes.ACHIEVEMENT,
      title: '🎉 Thành tích mới!',
      message: `Bạn đã đạt được: ${achievementTitle}`,
      data: { achievementTitle, description },
      actionUrl: '/profile'
    });
  }

  // System notification
  async notifySystem(userId, title, message, actionUrl = null) {
    return await this.createNotification({
      userId: userId,
      type: this.notificationTypes.SYSTEM,
      title: title,
      message: message,
      actionUrl: actionUrl
    });
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      await runQuery(`
        UPDATE notifications 
        SET is_read = 1, read_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND user_id = ?
      `, [notificationId, userId]);

      // Emit update to user
      socketService.emitToUser(userId, 'notification_read', { notificationId });
      
      console.log(`📖 Notification ${notificationId} marked as read for user ${userId}`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for user
  async markAllAsRead(userId) {
    try {
      await runQuery(`
        UPDATE notifications 
        SET is_read = 1, read_at = CURRENT_TIMESTAMP 
        WHERE user_id = ? AND is_read = 0
      `, [userId]);

      // Emit update to user
      socketService.emitToUser(userId, 'all_notifications_read', {});
      
      console.log(`📖 All notifications marked as read for user ${userId}`);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Get notifications for user
  async getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
    try {
      const offset = (page - 1) * limit;
      let whereClause = 'user_id = ?';
      let params = [userId];

      if (unreadOnly) {
        whereClause += ' AND is_read = 0';
      }

      const notifications = await allQuery(`
        SELECT * FROM notifications 
        WHERE ${whereClause}
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `, [...params, limit, offset]);

      // Parse JSON data
      const processedNotifications = notifications.map(notif => ({
        ...notif,
        data: notif.data ? JSON.parse(notif.data) : null,
        is_read: notif.is_read === 1
      }));

      return processedNotifications;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  // Get unread count for user
  async getUnreadCount(userId) {
    try {
      const result = await getQuery(`
        SELECT COUNT(*) as count 
        FROM notifications 
        WHERE user_id = ? AND is_read = 0
      `, [userId]);

      return result.count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  // Update notification settings
  async updateNotificationSettings(userId, settings) {
    try {
      await runQuery(`
        UPDATE notification_settings 
        SET 
          friend_requests = ?,
          messages = ?,
          weekly_challenges = ?,
          achievements = ?,
          system_notifications = ?,
          email_notifications = ?,
          push_notifications = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `, [
        settings.friend_requests ? 1 : 0,
        settings.messages ? 1 : 0,
        settings.weekly_challenges ? 1 : 0,
        settings.achievements ? 1 : 0,
        settings.system_notifications ? 1 : 0,
        settings.email_notifications ? 1 : 0,
        settings.push_notifications ? 1 : 0,
        userId
      ]);

      console.log(`⚙️ Notification settings updated for user ${userId}`);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }

  // Delete old notifications (cleanup job)
  async cleanupExpiredNotifications() {
    try {
      const result = await runQuery(`
        DELETE FROM notifications 
        WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP
      `);

      if (result.changes > 0) {
        console.log(`🧹 Cleaned up ${result.changes} expired notifications`);
      }
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
    }
  }

  // Delete old read notifications (keep recent ones)
  async cleanupOldReadNotifications(daysToKeep = 30) {
    try {
      const result = await runQuery(`
        DELETE FROM notifications 
        WHERE is_read = 1 
        AND read_at < datetime('now', '-${daysToKeep} days')
      `);

      if (result.changes > 0) {
        console.log(`🧹 Cleaned up ${result.changes} old read notifications`);
      }
    } catch (error) {
      console.error('Error cleaning up old read notifications:', error);
    }
  }

  // Bulk notify all users (for system announcements)
  async notifyAllUsers(title, message, actionUrl = null) {
    try {
      const users = await allQuery('SELECT id FROM users WHERE is_active = 1');
      
      for (const user of users) {
        await this.notifySystem(user.id, title, message, actionUrl);
      }

      console.log(`📢 System notification sent to ${users.length} users`);
    } catch (error) {
      console.error('Error sending bulk notification:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();