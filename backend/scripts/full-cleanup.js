const { runQuery, allQuery, getQuery, initDatabase } = require('../database/database');

async function fullCleanup() {
  console.log('🧹 Starting FULL cleanup of quiz data...');
  
  // Initialize database first
  await initDatabase();
  
  try {
    // Step 1: Get all quiz sessions for all users
    const allSessions = await allQuery(
      'SELECT * FROM quiz_sessions ORDER BY user_id, quiz_number, created_at'
    );
    
    console.log(`Found ${allSessions.length} total sessions across all users`);
    
    // Step 2: Group by user_id and quiz_number
    const sessionsByUserAndQuiz = {};
    allSessions.forEach(session => {
      const key = `${session.user_id}_${session.quiz_number}`;
      if (!sessionsByUserAndQuiz[key]) {
        sessionsByUserAndQuiz[key] = [];
      }
      sessionsByUserAndQuiz[key].push(session);
    });
    
    let deletedSessions = 0;
    let deletedQuestions = 0;
    
    // Step 3: For each user+quiz combination, keep only the LATEST session
    for (const key in sessionsByUserAndQuiz) {
      const sessions = sessionsByUserAndQuiz[key];
      if (sessions.length > 1) {
        // Sort by created_at descending (newest first)
        sessions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        const keepSession = sessions[0];
        const deleteSessions = sessions.slice(1);
        
        console.log(`User ${sessions[0].user_id} Quiz ${sessions[0].quiz_number}: Keeping session ${keepSession.id}, deleting ${deleteSessions.length} older sessions`);
        
        // Delete older sessions and their questions
        for (const session of deleteSessions) {
          // Count questions before deleting
          const questionCount = await allQuery(
            'SELECT COUNT(*) as count FROM quiz_questions WHERE session_id = ?',
            [session.id]
          );
          
          // Delete questions first
          await runQuery(
            'DELETE FROM quiz_questions WHERE session_id = ?',
            [session.id]
          );
          
          // Delete session
          await runQuery(
            'DELETE FROM quiz_sessions WHERE id = ?',
            [session.id]
          );
          
          deletedSessions++;
          deletedQuestions += questionCount[0].count;
          console.log(`  ✅ Deleted session ${session.id} (${questionCount[0].count} questions)`);
        }
      }
    }
    
    console.log(`\n🎉 Cleanup completed!`);
    console.log(`📊 Deleted: ${deletedSessions} sessions, ${deletedQuestions} questions`);
    
    // Step 4: Show final stats for user 4 (admin)
    const finalSessions = await allQuery(
      'SELECT quiz_number, id, created_at, score_percentage FROM quiz_sessions WHERE user_id = ? ORDER BY quiz_number',
      [4]
    );
    
    console.log(`\n📈 Final sessions for admin user:`);
    finalSessions.forEach(session => {
      console.log(`  Quiz ${session.quiz_number}: Session ${session.id} - Score: ${session.score_percentage}% (${session.created_at})`);
    });
    
    console.log(`\nTotal unique quizzes for admin: ${finalSessions.length}`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Run cleanup
fullCleanup();