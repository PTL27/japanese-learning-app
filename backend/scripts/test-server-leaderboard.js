const express = require('express');
const { initDatabase, getQuery, allQuery } = require('../database/database');

const app = express();

// Helper function to get current Monday
const getCurrentMonday = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
};

// Test leaderboard endpoint
app.get('/test-leaderboard/:level', async (req, res) => {
  try {
    const { level } = req.params;
    const { week } = req.query;
    
    const targetWeek = week || getCurrentMonday();
    console.log(`🏆 Fetching leaderboard for ${level} - week: ${targetWeek}`);
    
    // Get challenge for the week
    const challenge = await getQuery(`
      SELECT id FROM weekly_challenges 
      WHERE week_start_date = ? AND jlpt_level = ?
    `, [targetWeek, level.toUpperCase()]);
    
    console.log('Found challenge:', challenge);
    
    if (!challenge) {
      return res.json({
        success: true,
        data: {
          leaderboard: [],
          week: targetWeek,
          level: level.toUpperCase(),
          message: 'No challenge found for this week'
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
    
    console.log(`Found ${leaderboard.length} leaderboard entries`);
    
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
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      debug: error.message
    });
  }
});

async function startTestServer() {
  try {
    await initDatabase();
    console.log('✅ Database initialized');
    
    app.listen(5003, () => {
      console.log('🚀 Test server running on port 5003');
      console.log('Test URL: http://localhost:5003/test-leaderboard/N5');
      console.log('Test URL with week: http://localhost:5003/test-leaderboard/N5?week=2025-08-17');
    });
  } catch (error) {
    console.error('❌ Failed to start test server:', error);
  }
}

startTestServer();