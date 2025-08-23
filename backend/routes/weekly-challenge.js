const express = require('express');
const router = express.Router();
const { getQuery, allQuery, runQuery } = require('../database/database');
const { authenticateToken } = require('../middleware/auth');
const cronService = require('../services/cronService');

// Helper function to get current Monday
const getCurrentMonday = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
};

// Get current week's challenge
router.get('/current/:level', authenticateToken, async (req, res) => {
  try {
    const { level } = req.params;
    const currentMonday = getCurrentMonday();
    
    const challenge = await getQuery(`
      SELECT id, week_start_date, jlpt_level, questions_data, is_active
      FROM weekly_challenges 
      WHERE week_start_date = ? AND jlpt_level = ? AND is_active = 1
    `, [currentMonday, level.toUpperCase()]);
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'No active challenge found for this week'
      });
    }
    
    // Parse questions data
    const questions = JSON.parse(challenge.questions_data);
    
    res.json({
      success: true,
      data: {
        challenge_id: challenge.id,
        week_start_date: challenge.week_start_date,
        jlpt_level: challenge.jlpt_level,
        questions,
        total_questions: questions.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching weekly challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weekly challenge'
    });
  }
});

// Submit challenge answers
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { challenge_id, answers, completion_time } = req.body;
    const user_id = req.user.id;
    
    if (!challenge_id || !answers || completion_time === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Check if user already submitted for this challenge
    const existingSubmission = await getQuery(`
      SELECT id FROM challenge_submissions 
      WHERE user_id = ? AND challenge_id = ?
    `, [user_id, challenge_id]);
    
    if (existingSubmission) {
      return res.status(409).json({
        success: false,
        message: 'Bạn đã nộp bài cho thử thách tuần này rồi'
      });
    }
    
    // Get challenge questions to check answers
    const challenge = await getQuery(`
      SELECT questions_data FROM weekly_challenges WHERE id = ?
    `, [challenge_id]);
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }
    
    const questions = JSON.parse(challenge.questions_data);
    let score = 0;
    
    // Calculate score
    questions.forEach((question) => {
      const userAnswer = answers[question.id];
      if (userAnswer && userAnswer === question.correct) {
        score++;
      }
    });
    
    // Insert submission
    await runQuery(`
      INSERT INTO challenge_submissions (user_id, challenge_id, answers, score, completion_time)
      VALUES (?, ?, ?, ?, ?)
    `, [user_id, challenge_id, JSON.stringify(answers), score, completion_time]);
    
    // Get user's rank after submission
    const rankResult = await getQuery(`
      SELECT rank_position FROM (
        SELECT user_id, 
               ROW_NUMBER() OVER (ORDER BY score DESC, completion_time ASC) as rank_position
        FROM challenge_submissions
        WHERE challenge_id = ?
      ) ranked
      WHERE user_id = ?
    `, [challenge_id, user_id]);
    
    const rank_position = rankResult ? rankResult.rank_position : 1;
    
    res.json({
      success: true,
      data: {
        score,
        total_questions: questions.length,
        correct_answers: score,
        incorrect_answers: questions.length - score,
        completion_time,
        rank_position
      }
    });
    
  } catch (error) {
    console.error('Error submitting challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit challenge'
    });
  }
});

// Get weekly leaderboard
router.get('/leaderboard/:level', async (req, res) => {
  try {
    const { level } = req.params;
    const { week } = req.query; // Optional week param, defaults to current
    
    const targetWeek = week || getCurrentMonday();
    console.log(`🏆 Fetching leaderboard for ${level} - week: ${targetWeek}`);
    
    // Get challenge for the week
    const challenge = await getQuery(`
      SELECT id FROM weekly_challenges 
      WHERE week_start_date = ? AND jlpt_level = ?
    `, [targetWeek, level.toUpperCase()]);
    
    if (!challenge) {
      return res.json({
        success: true,
        data: {
          leaderboard: [],
          week: targetWeek,
          level: level.toUpperCase()
        }
      });
    }
    
    // Get leaderboard data
    const leaderboard = await allQuery(`
      SELECT 
        cs.user_id,
        u.name as user_name,
        cs.score,
        cs.completion_time,
        cs.submitted_at,
        ROW_NUMBER() OVER (ORDER BY cs.score DESC, cs.completion_time ASC) as rank_position
      FROM challenge_submissions cs
      INNER JOIN users u ON cs.user_id = u.id
      WHERE cs.challenge_id = ?
      ORDER BY cs.score DESC, cs.completion_time ASC
      LIMIT 100
    `, [challenge.id]);
    
    res.json({
      success: true,
      data: {
        leaderboard,
        week: targetWeek,
        level: level.toUpperCase(),
        total_participants: leaderboard.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching leaderboard:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user's submission status
router.get('/status/:level', authenticateToken, async (req, res) => {
  try {
    const { level } = req.params;
    const user_id = req.user.id;
    const currentMonday = getCurrentMonday();
    
    // Get current challenge
    const challenge = await getQuery(`
      SELECT id FROM weekly_challenges 
      WHERE week_start_date = ? AND jlpt_level = ? AND is_active = 1
    `, [currentMonday, level.toUpperCase()]);
    
    if (!challenge) {
      return res.json({
        success: true,
        data: {
          has_submitted: false,
          challenge_available: false
        }
      });
    }
    
    // Check if user submitted
    const submission = await getQuery(`
      SELECT score, completion_time, submitted_at 
      FROM challenge_submissions 
      WHERE user_id = ? AND challenge_id = ?
    `, [user_id, challenge.id]);
    
    // Get user's rank if submitted
    let rank = null;
    if (submission) {
      const rankData = await getQuery(`
        SELECT COUNT(*) + 1 as rank_position
        FROM challenge_submissions cs
        WHERE cs.challenge_id = ? 
        AND (cs.score > ? OR (cs.score = ? AND cs.completion_time < ?))
      `, [challenge.id, submission.score, submission.score, submission.completion_time]);
      rank = rankData.rank_position;
    }
    
    res.json({
      success: true,
      data: {
        challenge_available: true,
        has_submitted: !!submission,
        submission: submission ? {
          ...submission,
          rank
        } : null,
        week: currentMonday
      }
    });
    
  } catch (error) {
    console.error('Error fetching challenge status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenge status'
    });
  }
});

// Admin endpoint to generate new weekly challenges (called by cron job)
router.post('/generate-week', async (req, res) => {
  try {
    // This would be called by a cron job every Monday at 00:00
    const { week_start_date } = req.body;
    const targetMonday = week_start_date || getCurrentMonday();
    
    const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
    
    for (const level of levels) {
      // In real implementation, this would randomly select 20 questions from vocabulary
      const sampleQuestions = Array.from({length: 20}, (_, i) => ({
        id: i + 1,
        question: `Weekly Challenge ${level} Question ${i + 1} - Week ${targetMonday}`,
        options: {
          A: `Option A`,
          B: `Option B`, 
          C: `Option C`,
          D: `Option D`
        },
        correct: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
        vocab_id: Math.floor(Math.random() * 1000) + 1
      }));
      
      await runQuery(`
        INSERT OR REPLACE INTO weekly_challenges (week_start_date, jlpt_level, questions_data)
        VALUES (?, ?, ?)
      `, [targetMonday, level, JSON.stringify(sampleQuestions)]);
    }
    
    res.json({
      success: true,
      message: `Generated challenges for week ${targetMonday}`
    });
    
  } catch (error) {
    console.error('Error generating weekly challenges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate weekly challenges'
    });
  }
});

// Get cron job status
router.get('/cron/status', async (req, res) => {
  try {
    const status = cronService.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting cron status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cron status'
    });
  }
});

// Manual trigger for weekly challenge rotation (for testing)
router.post('/cron/trigger-rotation', async (req, res) => {
  try {
    console.log('🔧 Manual trigger requested for weekly challenge rotation');
    const result = await cronService.triggerWeeklyChallengeRotation();
    
    res.json({
      success: true,
      data: result,
      message: 'Weekly challenge rotation triggered successfully'
    });
  } catch (error) {
    console.error('Error triggering weekly challenge rotation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger weekly challenge rotation',
      error: error.message
    });
  }
});

module.exports = router;