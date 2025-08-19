const { initDatabase, allQuery, closeDatabase } = require('./database/database');

const checkDatabase = async () => {
  try {
    await initDatabase();
    
    console.log('=== Recent Quiz Sessions ===');
    const sessions = await allQuery(`
      SELECT id, user_id, quiz_number, score_percentage, correct_answers, 
             total_questions, time_spent, created_at 
      FROM quiz_sessions 
      ORDER BY created_at DESC LIMIT 10
    `);
    
    console.log('Sessions found:', sessions.length);
    sessions.forEach(session => {
      console.log(`Session ${session.id}: Quiz ${session.quiz_number}, Score: ${session.score_percentage}%, User: ${session.user_id}, Date: ${session.created_at}`);
    });
    
    console.log('\n=== Sessions with non-zero scores ===');
    const nonZeroSessions = await allQuery(`
      SELECT id, user_id, quiz_number, score_percentage, correct_answers, 
             total_questions, time_spent, created_at 
      FROM quiz_sessions 
      WHERE score_percentage > 0
      ORDER BY created_at DESC
    `);
    
    console.log('Non-zero sessions found:', nonZeroSessions.length);
    nonZeroSessions.forEach(session => {
      console.log(`Session ${session.id}: Quiz ${session.quiz_number}, Score: ${session.score_percentage}%, User: ${session.user_id}`);
    });
    
    console.log('\n=== Sessions with NULL scores ===');
    const nullSessions = await allQuery(`
      SELECT id, user_id, quiz_number, score_percentage, correct_answers, 
             total_questions, time_spent, created_at 
      FROM quiz_sessions 
      WHERE score_percentage IS NULL
      ORDER BY created_at DESC
    `);
    
    console.log('NULL score sessions found:', nullSessions.length);
    
    await closeDatabase();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkDatabase();