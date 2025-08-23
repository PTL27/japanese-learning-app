const { initDatabase, allQuery } = require('../database/database');

async function checkChallenges() {
  try {
    await initDatabase();
    
    const challenges = await allQuery(`
      SELECT jlpt_level, week_start_date, is_active, LENGTH(questions_data) as data_size 
      FROM weekly_challenges 
      ORDER BY jlpt_level
    `);
    
    console.log('📊 Weekly Challenges in database:');
    challenges.forEach(c => {
      console.log(`  ${c.jlpt_level}: ${c.week_start_date} (active: ${c.is_active}, ${Math.floor(c.data_size/1000)}KB)`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkChallenges();