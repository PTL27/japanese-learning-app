const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'japanese_learning.db');
const db = new sqlite3.Database(dbPath);

console.log('🧹 Cleaning up problematic session 40...');

// Delete session 40 and its questions
db.run('DELETE FROM quiz_questions WHERE session_id = 40', function(err) {
  if (err) {
    console.error('❌ Error deleting questions:', err);
    return;
  }
  
  console.log(`✅ Deleted ${this.changes} questions for session 40`);
  
  db.run('DELETE FROM quiz_sessions WHERE id = 40', function(err) {
    if (err) {
      console.error('❌ Error deleting session:', err);
      return;
    }
    
    console.log(`✅ Deleted session 40`);
    console.log('🎉 Cleanup completed!');
    
    db.close();
  });
});