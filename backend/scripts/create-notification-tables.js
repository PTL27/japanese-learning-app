const { runQuery, initDatabase } = require('../database/database');

async function createNotificationTables() {
  await initDatabase();
  console.log('🚀 Creating notification system tables...');
  
  try {
    // Create notifications table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('friend_request', 'friend_accepted', 'message', 'weekly_challenge', 'achievement', 'system')),
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        data JSON,
        is_read BOOLEAN DEFAULT 0,
        action_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        read_at DATETIME,
        expires_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);
    
    // Create notification_settings table for user preferences
    await runQuery(`
      CREATE TABLE IF NOT EXISTS notification_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        friend_requests BOOLEAN DEFAULT 1,
        messages BOOLEAN DEFAULT 1,
        weekly_challenges BOOLEAN DEFAULT 1,
        achievements BOOLEAN DEFAULT 1,
        system_notifications BOOLEAN DEFAULT 1,
        email_notifications BOOLEAN DEFAULT 0,
        push_notifications BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(user_id)
      )
    `);
    
    // Create push_subscriptions table for web push notifications
    await runQuery(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        endpoint TEXT NOT NULL,
        p256dh_key TEXT NOT NULL,
        auth_key TEXT NOT NULL,
        user_agent TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_used DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(user_id, endpoint)
      )
    `);
    
    // Create indexes for better performance
    await runQuery(`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`);
    await runQuery(`CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type)`);
    await runQuery(`CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)`);
    await runQuery(`CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC)`);
    await runQuery(`CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at)`);
    
    await runQuery(`CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id)`);
    
    await runQuery(`CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id)`);
    await runQuery(`CREATE INDEX IF NOT EXISTS idx_push_subscriptions_is_active ON push_subscriptions(is_active)`);
    
    console.log('✅ Notification tables and indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating notification tables:', error);
  }
}

createNotificationTables();