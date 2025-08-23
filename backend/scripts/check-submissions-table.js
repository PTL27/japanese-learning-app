const { initDatabase, allQuery } = require('../database/database');

async function checkSubmissionsTable() {
  try {
    await initDatabase();
    
    const tables = await allQuery(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name LIKE 'challenge%'
    `);
    
    console.log('📊 Challenge tables:', tables.map(t => t.name));
    
    // Check if challenge_submissions table exists
    const hasSubmissionsTable = tables.some(t => t.name === 'challenge_submissions');
    
    if (hasSubmissionsTable) {
      console.log('✅ challenge_submissions table exists');
      
      // Check table structure
      const structure = await allQuery(`PRAGMA table_info(challenge_submissions)`);
      console.log('📋 Table structure:');
      structure.forEach(col => {
        console.log(`  - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
      });
      
    } else {
      console.log('❌ challenge_submissions table does not exist');
      console.log('🔧 Creating challenge_submissions table...');
      
      await allQuery(`
        CREATE TABLE IF NOT EXISTS challenge_submissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          challenge_id INTEGER NOT NULL,
          answers TEXT NOT NULL,
          score INTEGER NOT NULL,
          completion_time INTEGER NOT NULL,
          submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (challenge_id) REFERENCES weekly_challenges (id),
          UNIQUE(user_id, challenge_id)
        )
      `);
      
      console.log('✅ challenge_submissions table created');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSubmissionsTable();