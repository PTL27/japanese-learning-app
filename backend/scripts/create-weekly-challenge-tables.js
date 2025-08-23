const { initDatabase, runQuery } = require('../database/database');

async function createWeeklyChallengeSystem() {
  try {
    await initDatabase();
    
    console.log('🏆 Creating Weekly Challenge system...');
    
    // Drop old leaderboard tables
    await runQuery('DROP TABLE IF EXISTS user_scores');
    await runQuery('DROP TABLE IF EXISTS leaderboard_sessions');  
    await runQuery('DROP TABLE IF EXISTS user_achievements');
    await runQuery('DROP TABLE IF EXISTS achievements');
    console.log('✅ Removed old leaderboard tables');
    
    // Weekly challenges table
    const createWeeklyChallengesTable = `
      CREATE TABLE IF NOT EXISTS weekly_challenges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        week_start_date DATE NOT NULL, -- Monday of the week (YYYY-MM-DD)
        jlpt_level TEXT NOT NULL CHECK(jlpt_level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
        questions_data TEXT NOT NULL, -- JSON array of 20 questions
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(week_start_date, jlpt_level)
      )
    `;
    
    // Weekly challenge submissions
    const createChallengeSubmissionsTable = `
      CREATE TABLE IF NOT EXISTS challenge_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        challenge_id INTEGER NOT NULL,
        answers TEXT NOT NULL, -- JSON object of user answers
        score INTEGER NOT NULL, -- 0-20 correct answers
        completion_time INTEGER NOT NULL, -- time in seconds
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (challenge_id) REFERENCES weekly_challenges (id) ON DELETE CASCADE,
        UNIQUE(user_id, challenge_id) -- One submission per user per challenge
      )
    `;
    
    // Weekly leaderboards (snapshot each week)
    const createWeeklyLeaderboardsTable = `
      CREATE TABLE IF NOT EXISTS weekly_leaderboards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        challenge_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        user_name TEXT NOT NULL,
        score INTEGER NOT NULL,
        completion_time INTEGER NOT NULL,
        rank_position INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (challenge_id) REFERENCES weekly_challenges (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(challenge_id, user_id)
      )
    `;
    
    await runQuery(createWeeklyChallengesTable);
    console.log('✅ weekly_challenges table created');
    
    await runQuery(createChallengeSubmissionsTable);
    console.log('✅ challenge_submissions table created');
    
    await runQuery(createWeeklyLeaderboardsTable);
    console.log('✅ weekly_leaderboards table created');
    
    // Create initial challenges for current week
    console.log('🎯 Creating initial weekly challenges...');
    
    const getMonday = (date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(d.setDate(diff)).toISOString().split('T')[0];
    };
    
    const currentMonday = getMonday(new Date());
    const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
    
    for (const level of levels) {
      // Generate sample questions (in real implementation, these would be random)
      const sampleQuestions = Array.from({length: 20}, (_, i) => ({
        id: i + 1,
        question: `Weekly Challenge ${level} Question ${i + 1}`,
        options: {
          A: `Option A for question ${i + 1}`,
          B: `Option B for question ${i + 1}`,
          C: `Option C for question ${i + 1}`,
          D: `Option D for question ${i + 1}`
        },
        correct: 'A',
        vocab_id: i + 1
      }));
      
      await runQuery(`
        INSERT OR IGNORE INTO weekly_challenges (week_start_date, jlpt_level, questions_data)
        VALUES (?, ?, ?)
      `, [currentMonday, level, JSON.stringify(sampleQuestions)]);
      
      console.log(`✅ Created ${level} challenge for week ${currentMonday}`);
    }
    
    console.log('🎉 Weekly Challenge system created successfully!');
    console.log(`📅 Current week: ${currentMonday}`);
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating Weekly Challenge system:', error);
    process.exit(1);
  }
}

createWeeklyChallengeSystem();