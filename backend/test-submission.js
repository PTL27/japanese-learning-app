const { allQuery, runQuery } = require('./database/database');

async function testSubmissionLogic() {
  console.log('🔍 Testing submission logic...');
  
  try {
    // Check all quiz sessions
    const allSessions = await allQuery(`
      SELECT id, user_id, quiz_number, score_percentage, correct_answers, 
             incorrect_answers, completed_at, created_at
      FROM quiz_sessions 
      ORDER BY created_at DESC
      LIMIT 20
    `);
    
    console.log('\n📊 Recent quiz sessions:');
    allSessions.forEach(session => {
      console.log(`Session ${session.id}: User ${session.user_id}, Quiz ${session.quiz_number}, Score: ${session.score_percentage}%, Completed: ${session.completed_at || 'NULL'}`);
    });
    
    // Check for duplicate sessions
    const duplicates = await allQuery(`
      SELECT user_id, quiz_number, jlpt_level, COUNT(*) as count
      FROM quiz_sessions 
      WHERE completed_at IS NOT NULL
      GROUP BY user_id, quiz_number, jlpt_level
      HAVING count > 1
    `);
    
    console.log('\n🔍 Duplicate sessions (user can retake but should be intentional):');
    if (duplicates.length === 0) {
      console.log('✅ No suspicious duplicates found');
    } else {
      duplicates.forEach(dup => {
        console.log(`⚠️ User ${dup.user_id} has ${dup.count} completed sessions for ${dup.jlpt_level} Quiz ${dup.quiz_number}`);
      });
    }
    
    // Check for sessions with 0 score but completed
    const zeroScoreSessions = await allQuery(`
      SELECT id, user_id, quiz_number, score_percentage, correct_answers, 
             incorrect_answers, completed_at
      FROM quiz_sessions 
      WHERE completed_at IS NOT NULL 
      AND score_percentage = 0
      AND (correct_answers + incorrect_answers) = 0
    `);
    
    console.log('\n🚨 Zero-score completed sessions (these should not exist):');
    if (zeroScoreSessions.length === 0) {
      console.log('✅ No problematic zero-score sessions found');
    } else {
      zeroScoreSessions.forEach(session => {
        console.log(`❌ Session ${session.id}: User ${session.user_id}, Quiz ${session.quiz_number}, Score: ${session.score_percentage}%, Completed: ${session.completed_at}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error testing submission logic:', error);
  }
}

testSubmissionLogic();