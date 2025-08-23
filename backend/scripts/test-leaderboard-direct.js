const { initDatabase, getQuery, allQuery } = require('../database/database');

// Helper function to get current Monday
const getCurrentMonday = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
};

async function testLeaderboardDirect() {
  try {
    await initDatabase();
    
    const level = 'N5';
    const targetWeek = '2025-08-17'; // Week when submission exists
    
    console.log(`🏆 Testing leaderboard logic for ${level} - week: ${targetWeek}`);
    
    // Step 1: Get challenge for the week
    console.log('\n📋 Step 1: Finding challenge...');
    const challenge = await getQuery(`
      SELECT id FROM weekly_challenges 
      WHERE week_start_date = ? AND jlpt_level = ?
    `, [targetWeek, level.toUpperCase()]);
    
    console.log('Challenge found:', challenge);
    
    if (!challenge) {
      console.log('❌ No challenge found for this week');
      return;
    }
    
    // Step 2: Get leaderboard data
    console.log('\n📋 Step 2: Getting leaderboard data...');
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
    
    console.log(`\n🏆 Leaderboard results (${leaderboard.length} entries):`);
    leaderboard.forEach((entry, idx) => {
      console.log(`${idx + 1}. ${entry.user_name} - Score: ${entry.score} - Time: ${entry.completion_time}s - Rank: ${entry.rank_position}`);
    });
    
    // Step 3: Test current week too
    const currentWeek = getCurrentMonday();
    console.log(`\n📅 Testing current week: ${currentWeek}`);
    
    const currentChallenge = await getQuery(`
      SELECT id FROM weekly_challenges 
      WHERE week_start_date = ? AND jlpt_level = ?
    `, [currentWeek, level.toUpperCase()]);
    
    console.log('Current week challenge:', currentChallenge);
    
    if (currentChallenge) {
      const currentLeaderboard = await allQuery(`
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
      `, [currentChallenge.id]);
      
      console.log(`\n🏆 Current week leaderboard (${currentLeaderboard.length} entries):`);
      if (currentLeaderboard.length === 0) {
        console.log('No submissions for current week yet');
      } else {
        currentLeaderboard.forEach((entry, idx) => {
          console.log(`${idx + 1}. ${entry.user_name} - Score: ${entry.score} - Time: ${entry.completion_time}s`);
        });
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error in direct test:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    process.exit(1);
  }
}

testLeaderboardDirect();