const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'japanese_learning.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Testing submission logic directly...');

// Check all quiz sessions
db.all(`
  SELECT id, user_id, quiz_number, score_percentage, correct_answers, 
         incorrect_answers, completed_at, created_at
  FROM quiz_sessions 
  ORDER BY created_at DESC
  LIMIT 10
`, (err, sessions) => {
  if (err) {
    console.error('❌ Error:', err);
    return;
  }
  
  console.log('\n📊 Recent quiz sessions:');
  sessions.forEach(session => {
    console.log(`Session ${session.id}: User ${session.user_id}, Quiz ${session.quiz_number}, Score: ${session.score_percentage}%, Completed: ${session.completed_at || 'NULL'}`);
  });
  
  // Check for zero-score completed sessions
  db.all(`
    SELECT id, user_id, quiz_number, score_percentage, correct_answers, 
           incorrect_answers, completed_at
    FROM quiz_sessions 
    WHERE completed_at IS NOT NULL 
    AND score_percentage = 0
    AND (correct_answers + incorrect_answers) = 0
  `, (err, zeroScoreSessions) => {
    if (err) {
      console.error('❌ Error:', err);
      return;
    }
    
    console.log('\n🚨 Zero-score completed sessions (these should not exist):');
    if (zeroScoreSessions.length === 0) {
      console.log('✅ No problematic zero-score sessions found');
    } else {
      zeroScoreSessions.forEach(session => {
        console.log(`❌ Session ${session.id}: User ${session.user_id}, Quiz ${session.quiz_number}, Score: ${session.score_percentage}%, Completed: ${session.completed_at}`);
      });
    }
    
    db.close();
  });
});