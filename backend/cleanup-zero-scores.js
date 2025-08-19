const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'japanese_learning.db');
const db = new sqlite3.Database(dbPath);

console.log('🧹 Cleaning up problematic zero-score sessions...');

// Find and delete zero-score completed sessions
db.all(`
  SELECT id, user_id, quiz_number, score_percentage, completed_at
  FROM quiz_sessions 
  WHERE completed_at IS NOT NULL 
  AND score_percentage = 0
  AND (correct_answers + incorrect_answers) = 0
`, (err, sessions) => {
  if (err) {
    console.error('❌ Error finding sessions:', err);
    return;
  }
  
  console.log(`\n🔍 Found ${sessions.length} problematic sessions to delete:`);
  sessions.forEach(session => {
    console.log(`  - Session ${session.id}: User ${session.user_id}, Quiz ${session.quiz_number}, Score: ${session.score_percentage}%, Completed: ${session.completed_at}`);
  });
  
  if (sessions.length === 0) {
    console.log('✅ No problematic sessions found');
    db.close();
    return;
  }
  
  const sessionIds = sessions.map(s => s.id);
  const placeholders = sessionIds.map(() => '?').join(',');
  
  // Delete the problematic sessions
  db.run(`DELETE FROM quiz_sessions WHERE id IN (${placeholders})`, sessionIds, function(err) {
    if (err) {
      console.error('❌ Error deleting sessions:', err);
      return;
    }
    
    console.log(`\n✅ Successfully deleted ${this.changes} problematic sessions`);
    
    // Also delete related quiz_questions
    db.run(`DELETE FROM quiz_questions WHERE session_id IN (${placeholders})`, sessionIds, function(err) {
      if (err) {
        console.error('❌ Error deleting questions:', err);
        return;
      }
      
      console.log(`✅ Successfully deleted ${this.changes} related questions`);
      
      console.log('\n🎉 Cleanup completed! Database is now clean.');
      db.close();
    });
  });
});