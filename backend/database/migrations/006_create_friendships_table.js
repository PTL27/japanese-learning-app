const { runQuery } = require('../database');

async function up() {
  console.log('🔧 Creating friendships table...');
  
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
  
  console.log('✅ Friendships table created');
  
  // Create indexes for performance
  await runQuery(`
    CREATE INDEX IF NOT EXISTS idx_friendships_requester 
    ON friendships(requester_id, status)
  `);
  
  await runQuery(`
    CREATE INDEX IF NOT EXISTS idx_friendships_addressee 
    ON friendships(addressee_id, status)
  `);
  
  console.log('✅ Friendships indexes created');
}

async function down() {
  console.log('🔧 Dropping friendships table...');
  await runQuery('DROP INDEX IF EXISTS idx_friendships_addressee');
  await runQuery('DROP INDEX IF EXISTS idx_friendships_requester');
  await runQuery('DROP TABLE IF EXISTS friendships');
  console.log('✅ Friendships table dropped');
}

module.exports = { up, down };