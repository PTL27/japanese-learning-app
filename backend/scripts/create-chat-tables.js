const { runQuery, initDatabase } = require('../database/database');

async function createChatTables() {
  await initDatabase();
  console.log('🚀 Creating chat system tables...');
  
  try {
    // Create conversations table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL DEFAULT 'direct' CHECK(type IN ('direct', 'group')),
        name TEXT,
        created_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
      )
    `);
    
    // Create conversation_participants table for many-to-many relationship
    await runQuery(`
      CREATE TABLE IF NOT EXISTS conversation_participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1,
        FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(conversation_id, user_id)
      )
    `);
    
    // Create messages table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL,
        sender_id INTEGER NOT NULL,
        message_text TEXT NOT NULL,
        message_type TEXT DEFAULT 'text' CHECK(message_type IN ('text', 'image', 'file', 'system')),
        reply_to_message_id INTEGER,
        is_edited BOOLEAN DEFAULT 0,
        is_deleted BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (reply_to_message_id) REFERENCES messages (id) ON DELETE SET NULL
      )
    `);
    
    // Create message_read_status table to track who read which messages
    await runQuery(`
      CREATE TABLE IF NOT EXISTS message_read_status (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (message_id) REFERENCES messages (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(message_id, user_id)
      )
    `);
    
    // Create indexes for better performance
    await runQuery(`CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by)`);
    await runQuery(`CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC)`);
    
    await runQuery(`CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id)`);
    await runQuery(`CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id)`);
    
    await runQuery(`CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)`);
    await runQuery(`CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id)`);
    await runQuery(`CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC)`);
    
    await runQuery(`CREATE INDEX IF NOT EXISTS idx_message_read_status_message_id ON message_read_status(message_id)`);
    await runQuery(`CREATE INDEX IF NOT EXISTS idx_message_read_status_user_id ON message_read_status(user_id)`);
    
    console.log('✅ Chat tables and indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating chat tables:', error);
  }
}

createChatTables();