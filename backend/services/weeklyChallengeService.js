const { getQuery, allQuery, runQuery } = require('../database/database');

// Helper function to get current Monday
const getCurrentMonday = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
};

// Helper function to get next Monday
const getNextMonday = () => {
  const now = new Date();
  const day = now.getDay();
  const daysUntilNextMonday = day === 1 ? 7 : (8 - day) % 7;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilNextMonday);
  return nextMonday.toISOString().split('T')[0];
};

// Create new weekly challenge for all levels
const createWeeklyChallenges = async (weekStartDate) => {
  console.log(`🗓️ Creating weekly challenges for week: ${weekStartDate}`);
  
  try {
    const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
    let createdCount = 0;
    
    for (const level of levels) {
      console.log(`\n🎯 Creating ${level} challenge...`);
      
      // Check if challenge already exists for this week and level
      const existingChallenge = await getQuery(`
        SELECT id FROM weekly_challenges 
        WHERE week_start_date = ? AND jlpt_level = ?
      `, [weekStartDate, level]);
      
      if (existingChallenge) {
        console.log(`⚠️ ${level} challenge already exists for week ${weekStartDate}`);
        continue;
      }
      
      // Get vocabulary for this level
      const vocabulary = await allQuery(`
        SELECT id, japanese, hiragana, meaning, romaji 
        FROM vocabulary 
        WHERE jlpt_level = ? 
        ORDER BY RANDOM() 
        LIMIT 50
      `, [level]);
      
      if (vocabulary.length < 20) {
        console.log(`⚠️ Not enough ${level} vocabulary (${vocabulary.length} found), creating sample questions`);
        
        // Create sample questions if not enough vocabulary
        const sampleQuestions = Array.from({length: 20}, (_, i) => ({
          id: i + 1,
          vocab_id: Math.floor(Math.random() * 1000) + 1,
          question_text: `[${level}] Weekly Challenge Question ${i + 1} - Week ${weekStartDate}`,
          question_type: 'meaning',
          options: {
            A: `Sample meaning A for ${level}`,
            B: `Sample meaning B for ${level}`,
            C: `Sample meaning C for ${level}`,
            D: `Sample meaning D for ${level}`
          },
          correct: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
          explanation: `This is a sample ${level} question for Weekly Challenge.`
        }));
        
        await runQuery(`
          INSERT INTO weekly_challenges (week_start_date, jlpt_level, questions_data, is_active)
          VALUES (?, ?, ?, 1)
        `, [weekStartDate, level, JSON.stringify(sampleQuestions)]);
        
        console.log(`✅ Created ${level} challenge with 20 sample questions`);
        createdCount++;
        
      } else {
        // Create real questions from vocabulary
        const questions = [];
        
        for (let i = 0; i < 20; i++) {
          const correctWord = vocabulary[i % vocabulary.length];
          
          // Get 3 wrong answers
          const wrongAnswers = vocabulary
            .filter(word => word.id !== correctWord.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
          
          // Randomize options
          const options = [correctWord, ...wrongAnswers]
            .sort(() => 0.5 - Math.random());
          
          const correctIndex = options.findIndex(opt => opt.id === correctWord.id);
          const correctLetter = ['A', 'B', 'C', 'D'][correctIndex];
          
          const question = {
            id: i + 1,
            vocab_id: correctWord.id,
            question_text: `Nghĩa của từ "${correctWord.japanese}" (${correctWord.hiragana}) là gì?`,
            question_type: 'meaning',
            options: {
              A: options[0].meaning,
              B: options[1].meaning,
              C: options[2].meaning,
              D: options[3].meaning
            },
            correct: correctLetter,
            explanation: `${correctWord.japanese} (${correctWord.hiragana}) có nghĩa là "${correctWord.meaning}"`
          };
          
          questions.push(question);
        }
        
        await runQuery(`
          INSERT INTO weekly_challenges (week_start_date, jlpt_level, questions_data, is_active)
          VALUES (?, ?, ?, 1)
        `, [weekStartDate, level, JSON.stringify(questions)]);
        
        console.log(`✅ Created ${level} challenge with 20 real vocabulary questions`);
        createdCount++;
      }
    }
    
    console.log(`\n🎉 Successfully created ${createdCount} new challenges for week ${weekStartDate}`);
    return createdCount;
    
  } catch (error) {
    console.error('❌ Error creating weekly challenges:', error);
    throw error;
  }
};

// Archive old challenges (set is_active = 0)
const archiveOldChallenges = async (currentWeekStartDate) => {
  console.log(`🗂️ Archiving old challenges (before ${currentWeekStartDate})`);
  
  try {
    const result = await runQuery(`
      UPDATE weekly_challenges 
      SET is_active = 0 
      WHERE week_start_date < ? AND is_active = 1
    `, [currentWeekStartDate]);
    
    console.log(`✅ Archived old challenges`);
    return true;
  } catch (error) {
    console.error('❌ Error archiving old challenges:', error);
    throw error;
  }
};

// Main function to rotate weekly challenges
const rotateWeeklyChallenges = async () => {
  console.log('\n🔄 Starting weekly challenge rotation...');
  
  try {
    const currentMonday = getCurrentMonday();
    const nextMonday = getNextMonday();
    
    console.log(`📅 Current Monday: ${currentMonday}`);
    console.log(`📅 Next Monday: ${nextMonday}`);
    
    // Archive old challenges
    await archiveOldChallenges(currentMonday);
    
    // Create new challenges for next Monday
    const createdCount = await createWeeklyChallenges(nextMonday);
    
    // Verify creation
    const newChallenges = await allQuery(`
      SELECT jlpt_level, LENGTH(questions_data) as data_size 
      FROM weekly_challenges 
      WHERE week_start_date = ? AND is_active = 1
    `, [nextMonday]);
    
    console.log(`\n📊 New challenges for week ${nextMonday}:`);
    newChallenges.forEach(ch => {
      console.log(`   🏆 ${ch.jlpt_level}: ${Math.floor(ch.data_size/1000)}KB data`);
    });
    
    console.log(`\n✅ Weekly challenge rotation completed successfully!`);
    console.log(`🎯 ${createdCount} new challenges are ready for ${nextMonday}`);
    
    return {
      success: true,
      currentWeek: currentMonday,
      nextWeek: nextMonday,
      createdCount: createdCount
    };
    
  } catch (error) {
    console.error('❌ Weekly challenge rotation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get challenge statistics
const getChallengeStats = async () => {
  try {
    const stats = await allQuery(`
      SELECT 
        week_start_date,
        jlpt_level,
        is_active,
        COUNT(*) as challenge_count,
        LENGTH(questions_data) as data_size
      FROM weekly_challenges 
      GROUP BY week_start_date, jlpt_level, is_active
      ORDER BY week_start_date DESC, jlpt_level
    `);
    
    return stats;
  } catch (error) {
    console.error('❌ Error getting challenge stats:', error);
    throw error;
  }
};

module.exports = {
  getCurrentMonday,
  getNextMonday,
  createWeeklyChallenges,
  archiveOldChallenges,
  rotateWeeklyChallenges,
  getChallengeStats
};