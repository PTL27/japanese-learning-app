const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'japanese_learning.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Debugging session 40 with 0 score...');

// Get detailed info about session 40
db.get(`
  SELECT * FROM quiz_sessions WHERE id = 40
`, (err, session) => {
  if (err) {
    console.error('❌ Error:', err);
    return;
  }
  
  if (!session) {
    console.log('❌ Session 40 not found');
    db.close();
    return;
  }
  
  console.log('\n📊 Session 40 details:');
  console.log(JSON.stringify(session, null, 2));
  
  // Get questions for this session
  db.all(`
    SELECT qq.*, v.japanese, v.hiragana, v.meaning as correct_meaning
    FROM quiz_questions qq
    LEFT JOIN vocabulary v ON qq.vocabulary_id = v.id
    WHERE qq.session_id = 40
  `, (err, questions) => {
    if (err) {
      console.error('❌ Error getting questions:', err);
      return;
    }
    
    console.log(`\n📝 Found ${questions.length} questions for session 40:`);
    questions.forEach((q, i) => {
      console.log(`Question ${i + 1}: ${q.japanese} (${q.hiragana})`);
      console.log(`  Correct: ${q.correct_option} (${q.correct_meaning})`);
      console.log(`  User answered: ${q.user_answer || 'NOT ANSWERED'}`);
      console.log(`  Is correct: ${q.is_correct === 1 ? 'YES' : q.is_correct === 0 ? 'NO' : 'NULL'}`);
      console.log(`  Answered at: ${q.answered_at || 'NULL'}`);
      console.log('---');
    });
    
    // Check if there are unanswered questions
    const answeredCount = questions.filter(q => q.user_answer).length;
    const correctCount = questions.filter(q => q.is_correct === 1).length;
    
    console.log(`\n📈 Summary:`);
    console.log(`  Total questions: ${questions.length}`);
    console.log(`  Answered: ${answeredCount}`);
    console.log(`  Correct: ${correctCount}`);
    console.log(`  Expected score: ${(correctCount / questions.length * 100).toFixed(1)}%`);
    console.log(`  Actual score: ${session.score_percentage}%`);
    
    // Compare with session 39 (the 100% one)
    db.get(`SELECT * FROM quiz_sessions WHERE id = 39`, (err, session39) => {
      if (err) {
        console.error('❌ Error getting session 39:', err);
        return;
      }
      
      console.log(`\n🔍 Comparison with session 39:`);
      console.log(`  Session 39 score: ${session39.score_percentage}%`);
      console.log(`  Session 39 correct: ${session39.correct_answers}`);
      console.log(`  Session 39 incorrect: ${session39.incorrect_answers}`);
      console.log(`  Session 39 completed_at: ${session39.completed_at}`);
      
      db.close();
    });
  });
});