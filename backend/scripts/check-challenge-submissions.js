const { initDatabase, allQuery } = require('../database/database');

async function checkChallengeSubmissions() {
  try {
    await initDatabase();
    
    console.log('📊 Checking challenge submissions...');
    
    // Get all submissions
    const submissions = await allQuery(`
      SELECT 
        cs.id,
        cs.user_id,
        u.name as user_name,
        cs.challenge_id,
        wc.jlpt_level,
        wc.week_start_date,
        cs.score,
        cs.completion_time,
        cs.submitted_at
      FROM challenge_submissions cs
      JOIN users u ON cs.user_id = u.id
      JOIN weekly_challenges wc ON cs.challenge_id = wc.id
      ORDER BY cs.submitted_at DESC
    `);
    
    console.log(`\n🎯 Found ${submissions.length} submissions:`);
    submissions.forEach((sub, idx) => {
      console.log(`${idx + 1}. ${sub.user_name} - ${sub.jlpt_level} - Score: ${sub.score} - Time: ${sub.completion_time}s - Week: ${sub.week_start_date}`);
    });
    
    // Check current week challenges
    const today = new Date().toISOString().split('T')[0];
    console.log(`\n📅 Today's date: ${today}`);
    
    const currentChallenges = await allQuery(`
      SELECT id, jlpt_level, week_start_date 
      FROM weekly_challenges 
      WHERE week_start_date = ?
    `, [today]);
    
    console.log(`\n🎯 Current challenges (${today}):`);
    currentChallenges.forEach(ch => {
      console.log(`  - ${ch.jlpt_level}: ID ${ch.id}`);
    });
    
    // Check if there are submissions for today's challenges
    for (const challenge of currentChallenges) {
      const challengeSubmissions = await allQuery(`
        SELECT cs.user_id, u.name, cs.score, cs.completion_time
        FROM challenge_submissions cs
        JOIN users u ON cs.user_id = u.id
        WHERE cs.challenge_id = ?
        ORDER BY cs.score DESC, cs.completion_time ASC
      `, [challenge.id]);
      
      console.log(`\n🏆 ${challenge.jlpt_level} Leaderboard (Challenge ID: ${challenge.id}):`);
      if (challengeSubmissions.length === 0) {
        console.log('  No submissions yet');
      } else {
        challengeSubmissions.forEach((sub, idx) => {
          console.log(`  ${idx + 1}. ${sub.name} - Score: ${sub.score}/20 - Time: ${sub.completion_time}s`);
        });
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkChallengeSubmissions();