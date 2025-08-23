const { initDatabase, runQuery } = require('../database/database');

async function recreateQuizSessions() {
  try {
    await initDatabase();
    
    console.log('🔧 Recreating quiz_sessions table...');
    
    // Drop existing table
    await runQuery('DROP TABLE IF EXISTS quiz_sessions');
    console.log('✅ Dropped existing quiz_sessions table');
    
    // Recreate table with clean schema
    const createQuizSessionsTable = `
      CREATE TABLE quiz_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        quiz_type TEXT NOT NULL DEFAULT 'vocabulary',
        jlpt_level TEXT NOT NULL DEFAULT 'N5' CHECK(jlpt_level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
        quiz_number INTEGER NOT NULL CHECK(quiz_number BETWEEN 1 AND 10),
        total_questions INTEGER NOT NULL DEFAULT 10,
        correct_answers INTEGER NOT NULL DEFAULT 0,
        incorrect_answers INTEGER NOT NULL DEFAULT 0,
        score_percentage REAL NOT NULL DEFAULT 0,
        time_spent INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME DEFAULT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(user_id, jlpt_level, quiz_number)
      )
    `;
    
    await runQuery(createQuizSessionsTable);
    console.log('✅ Created new quiz_sessions table with clean schema');
    
    // Also recreate quiz_questions table
    await runQuery('DROP TABLE IF EXISTS quiz_questions');
    console.log('✅ Dropped existing quiz_questions table');
    
    const createQuizQuestionsTable = `
      CREATE TABLE quiz_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        vocabulary_id INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        correct_option TEXT NOT NULL CHECK(correct_option IN ('A', 'B', 'C', 'D')),
        user_answer TEXT CHECK(user_answer IN ('A', 'B', 'C', 'D')),
        is_correct BOOLEAN DEFAULT FALSE,
        answered_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES quiz_sessions (id) ON DELETE CASCADE,
        FOREIGN KEY (vocabulary_id) REFERENCES vocabulary (id)
      )
    `;
    
    await runQuery(createQuizQuestionsTable);
    console.log('✅ Created new quiz_questions table');
    
    console.log('🎉 Quiz tables recreated successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error recreating quiz tables:', error);
    process.exit(1);
  }
}

recreateQuizSessions();