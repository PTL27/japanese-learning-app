const { runQuery, initDatabase } = require('../database/database');

async function createFriendshipsTable() {
  await initDatabase();
  try {
    await runQuery(`
      CREATE TABLE IF NOT EXISTS friendships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requester_id INTEGER NOT NULL,
        addressee_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined', 'blocked')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (requester_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (addressee_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(requester_id, addressee_id)
      )
    `);
    
    await runQuery(`
      CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id)
    `);
    
    await runQuery(`
      CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id)
    `);
    
    await runQuery(`
      CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status)
    `);
    
    console.log('✅ Friendships table and indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating friendships table:', error);
  }
}

createFriendshipsTable();