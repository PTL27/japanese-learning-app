const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { runQuery, allQuery, getQuery } = require('../database/database');

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token không được cung cấp'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getQuery(
      'SELECT id, name, email, age, phone, address, japanese_level FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xác thực'
    });
  }
};

// Generate a new quiz for a specific JLPT level and quiz number
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { jlpt_level = 'N5', quiz_number = 1 } = req.body;
    const userId = req.user.id;

    // Validate quiz number (1-10)
    if (quiz_number < 1 || quiz_number > 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Số bài quiz phải từ 1 đến 10' 
      });
    }

    // Check if user wants to retake quiz or not
    const { allow_retake = false } = req.body;
    console.log('🔍 Quiz generation request:', { userId, jlpt_level, quiz_number, allow_retake });
    
    // Always check for active (uncompleted) sessions first to prevent duplicates
    const activeSession = await getQuery(
      'SELECT id FROM quiz_sessions WHERE user_id = ? AND jlpt_level = ? AND quiz_number = ? AND completed_at IS NULL',
      [userId, jlpt_level, quiz_number]
    );

    if (activeSession) {
      console.log('🔄 Found active uncompleted session, returning existing:', activeSession.id);
      // Return the existing active session instead of creating a new one
      const existingQuestions = await allQuery(`
        SELECT qq.*, v.word as japanese, v.reading as hiragana 
        FROM quiz_questions qq
        JOIN vocabulary v ON qq.vocabulary_id = v.id
        WHERE qq.session_id = ?
      `, [activeSession.id]);
      
      const questions = existingQuestions.map(q => ({
        id: q.id,
        question_text: q.question_text,
        options: {
          A: q.option_a,
          B: q.option_b,
          C: q.option_c,
          D: q.option_d
        },
        correct_option: q.correct_option,
        japanese: q.japanese,
        hiragana: q.hiragana
      }));

      return res.json({
        success: true,
        quiz: {
          session_id: activeSession.id,
          jlpt_level,
          quiz_number,
          total_questions: 10,
          time_limit: 600,
          questions
        }
      });
    }
    
    // Check if user already completed this quiz (only if not allowing retake)
    if (!allow_retake) {
      const existingSession = await getQuery(
        'SELECT id FROM quiz_sessions WHERE user_id = ? AND jlpt_level = ? AND quiz_number = ? AND completed_at IS NOT NULL',
        [userId, jlpt_level, quiz_number]
      );

      if (existingSession) {
        console.log('❌ Completed session found, blocking retake:', existingSession.id);
        return res.status(409).json({
          success: false,
          message: `Bạn đã hoàn thành bài quiz ${quiz_number} rồi`,
          session_id: existingSession.id
        });
      }
    } else {
      console.log('✅ Retake allowed, proceeding with quiz generation');
    }

    // Get random 10 vocabulary words from the specified JLPT level
    const vocabularyWords = await allQuery(`
      SELECT id, word as japanese, reading as hiragana, meaning, word_type as category 
      FROM vocabulary 
      WHERE jlpt_level = ? 
      ORDER BY RANDOM() 
      LIMIT 10
    `, [jlpt_level]);

    if (vocabularyWords.length < 10) {
      return res.status(400).json({
        success: false,
        message: `Không đủ từ vựng ${jlpt_level} trong database (cần ít nhất 10 từ)`
      });
    }

    // Create new quiz session
    const sessionResult = await runQuery(`
      INSERT INTO quiz_sessions (user_id, quiz_type, jlpt_level, quiz_number, total_questions)
      VALUES (?, 'vocabulary', ?, ?, 10)
    `, [userId, jlpt_level, quiz_number]);

    const sessionId = sessionResult.id;
    console.log('✅ Created new quiz session:', sessionId);
    
    // Debug: Check session state immediately after creation
    const newSession = await getQuery(`
      SELECT id, completed_at FROM quiz_sessions WHERE id = ?
    `, [sessionId]);
    console.log('🔍 New session state after creation:', newSession);

    // Generate questions for each vocabulary word
    const questions = [];
    
    for (let i = 0; i < vocabularyWords.length; i++) {
      const word = vocabularyWords[i];
      
      // Generate 3 random incorrect options from other vocabulary words
      const incorrectOptions = await allQuery(`
        SELECT meaning 
        FROM vocabulary 
        WHERE jlpt_level = ? AND id != ? 
        ORDER BY RANDOM() 
        LIMIT 3
      `, [jlpt_level, word.id]);

      if (incorrectOptions.length < 3) {
        // Fallback: get from any JLPT level if not enough options
        const fallbackOptions = await allQuery(`
          SELECT meaning 
          FROM vocabulary 
          WHERE id != ? 
          ORDER BY RANDOM() 
          LIMIT ${3 - incorrectOptions.length}
        `, [word.id]);
        incorrectOptions.push(...fallbackOptions);
      }

      // Shuffle options (correct + 3 incorrect)
      const allOptions = [word.meaning, ...incorrectOptions.map(opt => opt.meaning)];
      const shuffledOptions = shuffleArray([...allOptions]);
      
      const correctOption = ['A', 'B', 'C', 'D'][shuffledOptions.indexOf(word.meaning)];

      const questionText = `Từ "${word.japanese}" (${word.hiragana}) có nghĩa là gì?`;

      // Insert question into database
      const questionResult = await runQuery(`
        INSERT INTO quiz_questions (
          session_id, vocabulary_id, question_text, 
          option_a, option_b, option_c, option_d, 
          correct_option
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        sessionId, word.id, questionText,
        shuffledOptions[0], shuffledOptions[1], 
        shuffledOptions[2], shuffledOptions[3],
        correctOption
      ]);

      questions.push({
        id: questionResult.id,
        question_text: questionText,
        options: {
          A: shuffledOptions[0],
          B: shuffledOptions[1],
          C: shuffledOptions[2],
          D: shuffledOptions[3]
        },
        correct_option: correctOption,
        japanese: word.japanese,
        hiragana: word.hiragana
      });
    }

    res.json({
      success: true,
      quiz: {
        session_id: sessionId,
        jlpt_level,
        quiz_number,
        total_questions: 10,
        time_limit: 600, // 10 minutes in seconds
        questions
      }
    });

  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi tạo bài quiz', 
      error: error.message 
    });
  }
});

// Submit quiz answers
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { session_id, answers, time_spent = 0 } = req.body;
    const userId = req.user.id;
    
    console.log('📝 Quiz submission attempt:', { 
      session_id, 
      user_id: userId, 
      answers_count: Object.keys(answers || {}).length,
      time_spent 
    });

    // Validate session belongs to user
    const session = await getQuery(
      'SELECT * FROM quiz_sessions WHERE id = ? AND user_id = ?',
      [session_id, userId]
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiên quiz'
      });
    }

    // Check if session has already been submitted (prevent double submission)
    // A session is considered submitted if completed_at is not null AND it has been scored
    if (session.completed_at && (session.correct_answers + session.incorrect_answers) > 0) {
      console.log('⚠️ Attempted double submission blocked:', { 
        session_id, 
        user_id: userId, 
        existing_score: session.score_percentage,
        completed_at: session.completed_at,
        total_answered: session.correct_answers + session.incorrect_answers
      });
      return res.status(409).json({
        success: false,
        message: 'Bài quiz này đã được nộp rồi'
      });
    }

    // Get all questions for this session
    const questions = await allQuery(
      'SELECT * FROM quiz_questions WHERE session_id = ?',
      [session_id]
    );

    let correctAnswers = 0;
    let incorrectAnswers = 0;

    // Check if user provided any answers
    const answeredQuestions = Object.keys(answers || {}).length;
    if (answeredQuestions === 0) {
      return res.status(400).json({
        success: false,
        message: 'Bạn cần trả lời ít nhất 1 câu hỏi trước khi nộp bài'
      });
    }

    // Process each answer
    for (const question of questions) {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correct_option;
      
      if (userAnswer && isCorrect) {
        correctAnswers++;
      } else if (userAnswer) {
        incorrectAnswers++;
      }
      // Note: questions without answers are not counted as incorrect

      // Update question with user answer (only if user provided an answer)
      if (userAnswer) {
        await runQuery(`
          UPDATE quiz_questions 
          SET user_answer = ?, is_correct = ?, answered_at = datetime('now')
          WHERE id = ?
        `, [userAnswer, isCorrect ? 1 : 0, question.id]);
      }
    }

    const scorePercentage = (correctAnswers / questions.length) * 100;

    // Debug: Check session state before update
    const sessionBeforeUpdate = await getQuery(`
      SELECT id, completed_at FROM quiz_sessions WHERE id = ?
    `, [session_id]);
    console.log('🔍 Session state before update:', sessionBeforeUpdate);

    // Update quiz session with results (with additional safeguard)
    const updateResult = await runQuery(`
      UPDATE quiz_sessions 
      SET correct_answers = ?, incorrect_answers = ?, score_percentage = ?, time_spent = ?, completed_at = datetime('now')
      WHERE id = ? AND completed_at IS NULL
    `, [correctAnswers, incorrectAnswers, scorePercentage, time_spent, session_id]);
    
    console.log('🔍 Update result changes:', updateResult.changes);
    
    // Double-check that the update succeeded
    if (updateResult.changes === 0) {
      console.log('❌ Session update failed - possibly already completed:', { session_id, userId });
      return res.status(409).json({
        success: false,
        message: 'Bài quiz này đã được nộp rồi'
      });
    }
    
    console.log('✅ Quiz session updated successfully:', { 
      session_id, 
      correctAnswers, 
      incorrectAnswers, 
      scorePercentage: Math.round(scorePercentage * 100) / 100 
    });

    // Get detailed results
    const detailedResults = await allQuery(`
      SELECT 
        qq.*,
        v.word as japanese,
        v.reading as hiragana,
        v.meaning as correct_meaning
      FROM quiz_questions qq
      JOIN vocabulary v ON qq.vocabulary_id = v.id
      WHERE qq.session_id = ?
      ORDER BY qq.id
    `, [session_id]);

    // Quiz submission successful - no leaderboard integration needed

    res.json({
      success: true,
      result: {
        session_id,
        total_questions: questions.length,
        correct_answers: correctAnswers,
        incorrect_answers: incorrectAnswers,
        score_percentage: Math.round(scorePercentage * 100) / 100,
        time_spent,
        detailed_results: detailedResults
      }
    });

  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi nộp bài quiz', 
      error: error.message 
    });
  }
});

// Get quiz statistics for a user
router.get('/stats/:jlpt_level', authenticateToken, async (req, res) => {
  try {
    const { jlpt_level } = req.params;
    const userId = req.user.id;
    console.log('📊 Loading stats for user:', userId, 'level:', jlpt_level);

    // Get all completed quizzes for this user and JLPT level (only sessions that have been actually submitted)
    // Only include sessions that have completed_at set (indicating they were properly submitted)
    const sessions = await allQuery(`
      SELECT * FROM quiz_sessions 
      WHERE user_id = ? AND jlpt_level = ? 
      AND completed_at IS NOT NULL
      AND (correct_answers + incorrect_answers) = total_questions
      ORDER BY quiz_number, created_at
    `, [userId, jlpt_level]);
    
    console.log('📊 Sessions count:', sessions.length);
    if (sessions.length > 0) {
      console.log('📊 Sample session:', sessions[0]);
    }

    if (sessions.length === 0) {
      return res.json({
        success: true,
        stats: {
          jlpt_level,
          total_completed: 0,
          average_score: 0,
          best_score: 0,
          improvement_trend: 'stable',
          quiz_progress: []
        }
      });
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

    // Calculate unique quiz completion count (only count each quiz number once)
    const uniqueQuizzesCompleted = Object.keys(quizGroups).length;

    // Calculate overall statistics from completed sessions only
    const completedSessions = sessions.filter(s => (s.correct_answers + s.incorrect_answers) === s.total_questions);
    const averageScore = completedSessions.length > 0 ? 
      completedSessions.reduce((sum, s) => sum + s.score_percentage, 0) / completedSessions.length : 0;
    const bestScore = completedSessions.length > 0 ? 
      Math.max(...completedSessions.map(s => s.score_percentage)) : 0;

    // Calculate improvement trend (compare recent vs earlier sessions)
    let improvementTrend = 'stable';
    console.log('📊 Completed sessions count:', completedSessions.length);
    
    if (completedSessions.length >= 2) {
      // Sort by date to get chronological order
      const sortedSessions = [...completedSessions].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      console.log('📊 Sorted sessions:', sortedSessions.map(s => ({ quiz: s.quiz_number, score: s.score_percentage, date: s.created_at })));
      
      if (completedSessions.length >= 4) {
        // Compare last 2 sessions with first 2 sessions
        const recentSessions = sortedSessions.slice(-2);
        const earlierSessions = sortedSessions.slice(0, 2);
        
        const recentAvg = recentSessions.reduce((sum, s) => sum + s.score_percentage, 0) / recentSessions.length;
        const earlierAvg = earlierSessions.reduce((sum, s) => sum + s.score_percentage, 0) / earlierSessions.length;
        
        console.log('📊 Trend calculation (4+ sessions):', { recentAvg, earlierAvg });
        
        if (recentAvg > earlierAvg + 5) {
          improvementTrend = 'improving';
        } else if (earlierAvg > recentAvg + 5) {
          improvementTrend = 'declining';
        }
      } else {
        // For fewer sessions, just compare the most recent vs the first
        const mostRecent = sortedSessions[sortedSessions.length - 1];
        const earliest = sortedSessions[0];
        
        console.log('📊 Trend calculation (2-3 sessions):', { 
          mostRecentScore: mostRecent.score_percentage, 
          earliestScore: earliest.score_percentage 
        });
        
        if (mostRecent.score_percentage > earliest.score_percentage + 5) {
          improvementTrend = 'improving';
        } else if (earliest.score_percentage > mostRecent.score_percentage + 5) {
          improvementTrend = 'declining';
        }
      }
    }

    // Prepare quiz progress data - one entry per quiz with max/min/avg and last 3 attempts
    const quizProgress = Object.keys(quizGroups).map(quizNum => {
      const quizSessions = quizGroups[quizNum]
        .filter(s => (s.correct_answers + s.incorrect_answers) === s.total_questions)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      const scores = quizSessions.map(s => s.score_percentage);
      
      // Get last 3 attempts (most recent first)
      const last3Attempts = quizSessions
        .slice(-3)
        .reverse()
        .map(session => ({
          score: session.score_percentage,
          date: session.created_at,
          time_spent: session.time_spent || 0
        }));
      
      return {
        quiz_number: parseInt(quizNum),
        max_score: Math.max(...scores),
        min_score: Math.min(...scores),
        avg_score: scores.reduce((sum, score) => sum + score, 0) / scores.length,
        attempt_count: quizSessions.length,
        latest_date: quizSessions[quizSessions.length - 1].created_at,
        last_3_attempts: last3Attempts
      };
    }).sort((a, b) => a.quiz_number - b.quiz_number);

    const result = {
      jlpt_level,
      total_completed: uniqueQuizzesCompleted,
      average_score: Math.round(averageScore * 100) / 100,
      best_score: Math.round(bestScore * 100) / 100,
      improvement_trend: improvementTrend,
      quiz_progress: quizProgress
    };
    
    console.log('📊 Quiz progress structure:', JSON.stringify(quizProgress, null, 2));
    console.log('📊 Sending stats result keys:', Object.keys(result));
    
    res.json({
      success: true,
      stats: result
    });

  } catch (error) {
    console.error('❌ Error getting quiz stats:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi lấy thống kê quiz', 
      error: error.message 
    });
  }
});

// Get available quizzes (1-10) and completion status
router.get('/available/:jlpt_level', authenticateToken, async (req, res) => {
  try {
    const { jlpt_level } = req.params;
    const userId = req.user.id;

    // Get completed quizzes (only those properly submitted, get the best score for each quiz)
    const completedQuizzes = await allQuery(`
      SELECT quiz_number, MAX(score_percentage) as best_score, MAX(created_at) as latest_completed
      FROM quiz_sessions 
      WHERE user_id = ? AND jlpt_level = ? AND completed_at IS NOT NULL
      GROUP BY quiz_number
      ORDER BY quiz_number
    `, [userId, jlpt_level]);

    const completedMap = new Map();
    completedQuizzes.forEach(quiz => {
      completedMap.set(quiz.quiz_number, {
        score: quiz.best_score,
        completed_at: quiz.latest_completed
      });
    });

    // Generate list of 10 quizzes with completion status
    const availableQuizzes = [];
    for (let i = 1; i <= 10; i++) {
      const completed = completedMap.get(i);
      availableQuizzes.push({
        quiz_number: i,
        is_completed: !!completed,
        score: completed ? completed.score : null,
        completed_at: completed ? completed.completed_at : null
      });
    }

    res.json({
      success: true,
      quizzes: availableQuizzes,
      jlpt_level
    });

  } catch (error) {
    console.error('Error getting available quizzes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi lấy danh sách quiz', 
      error: error.message 
    });
  }
});

// Utility function to shuffle array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

module.exports = router;