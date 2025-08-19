const { runQuery, allQuery, getQuery, initDatabase } = require('../database/database');

async function cleanupDuplicateQuizzes() {
  console.log('🧹 Starting cleanup of duplicate quiz sessions...');
  
  // Initialize database first
  await initDatabase();
  
  try {
    // Find all quiz sessions for user 4 (admin@test.com)
    const sessions = await allQuery(
      'SELECT * FROM quiz_sessions WHERE user_id = ? ORDER BY quiz_number, created_at',
      [4]
    );
    
    console.log(`Found ${sessions.length} total sessions`);
    
    // Group by quiz_number and keep only the latest one for each
    const sessionsByQuiz = {};
    sessions.forEach(session => {
      if (!sessionsByQuiz[session.quiz_number]) {
        sessionsByQuiz[session.quiz_number] = [];
      }
      sessionsByQuiz[session.quiz_number].push(session);
    });
    
    let deletedCount = 0;
    
    // For each quiz number, keep only the latest session
    for (const quizNumber in sessionsByQuiz) {
      const quizSessions = sessionsByQuiz[quizNumber];
      if (quizSessions.length > 1) {
        // Sort by created_at and keep the latest
        quizSessions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const toKeep = quizSessions[0];
        const toDelete = quizSessions.slice(1);
        
        console.log(`Quiz ${quizNumber}: Keeping session ${toKeep.id}, deleting ${toDelete.length} duplicates`);
        
        // Delete duplicate sessions and their questions
        for (const session of toDelete) {
          // Delete quiz questions first
          await runQuery(
            'DELETE FROM quiz_questions WHERE session_id = ?',
            [session.id]
          );
          
          // Delete quiz session
          await runQuery(
            'DELETE FROM quiz_sessions WHERE id = ?',
            [session.id]
          );
          
          deletedCount++;
          console.log(`  ✅ Deleted session ${session.id} and its questions`);
        }
      }
    }
    
    console.log(`🎉 Cleanup completed! Deleted ${deletedCount} duplicate sessions`);
    
    // Show final stats
    const finalSessions = await allQuery(
      'SELECT quiz_number, id, created_at FROM quiz_sessions WHERE user_id = ? ORDER BY quiz_number',
      [4]
    );
    
    console.log('\n📊 Final sessions:');
    finalSessions.forEach(session => {
      console.log(`  Quiz ${session.quiz_number}: Session ID ${session.id} (${session.created_at})`);
    });
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Run cleanup
cleanupDuplicateQuizzes();