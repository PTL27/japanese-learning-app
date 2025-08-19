const { initDatabase, getQuery, allQuery, closeDatabase } = require('./database/database');
const jwt = require('jsonwebtoken');

const testStatsAPI = async () => {
  try {
    await initDatabase();
    
    // Get user 3 (who has the 100% scores)
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [3]);
    console.log('Test user:', user);
    
    if (!user) {
      console.log('No user found with id 3');
      return;
    }
    
    // Simulate the stats API logic
    const userId = user.id;
    const jlpt_level = 'N5';
    
    console.log('📊 Loading stats for user:', userId, 'level:', jlpt_level);

    // Get all completed quizzes for this user and JLPT level (only sessions with actual scores)
    const sessions = await allQuery(`
      SELECT * FROM quiz_sessions 
      WHERE user_id = ? AND jlpt_level = ? AND score_percentage IS NOT NULL
      ORDER BY quiz_number, created_at
    `, [userId, jlpt_level]);
    
    console.log('📊 Raw sessions from DB:', sessions);
    console.log('📊 Sessions count:', sessions.length);
    
    if (sessions.length === 0) {
      console.log('No sessions found!');
      return;
    }

    // Group sessions by quiz_number to calculate stats per quiz
    const quizGroups = {};
    sessions.forEach(session => {
      const quizNum = session.quiz_number;
      if (!quizGroups[quizNum]) {
        quizGroups[quizNum] = [];
      }
      quizGroups[quizNum].push(session);
    });

    console.log('📊 Quiz groups:', Object.keys(quizGroups));
    
    // Calculate unique quiz completion count (only count each quiz number once)
    const uniqueQuizzesCompleted = Object.keys(quizGroups).length;

    // Calculate overall statistics from completed sessions only
    const completedSessions = sessions.filter(s => s.score_percentage !== null);
    const averageScore = completedSessions.length > 0 ? 
      completedSessions.reduce((sum, s) => sum + s.score_percentage, 0) / completedSessions.length : 0;
    const bestScore = completedSessions.length > 0 ? 
      Math.max(...completedSessions.map(s => s.score_percentage)) : 0;

    console.log('📊 Computed stats:', {
      uniqueQuizzesCompleted,
      averageScore,
      bestScore
    });
    
    await closeDatabase();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testStatsAPI();