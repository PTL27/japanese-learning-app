const { initDatabase, runQuery, allQuery } = require('../database/database');

async function createCurrentWeekChallenge() {
  try {
    await initDatabase();
    
    // Get current Monday
    const getCurrentMonday = () => {
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff));
      return monday.toISOString().split('T')[0];
    };
    
    const currentMonday = getCurrentMonday();
    const today = new Date().toISOString().split('T')[0];
    
    console.log(`🗓️ Today: ${today}`);
    console.log(`🗓️ Current Monday (calculated): ${currentMonday}`);
    
    // Force create for today's week
    const todayMonday = getCurrentMonday();
    console.log(`🗓️ Creating challenge for current week: ${todayMonday}`);
    
    // Check if challenges already exist for current week
    const existingChallenges = await allQuery(`
      SELECT jlpt_level FROM weekly_challenges 
      WHERE week_start_date = ?
    `, [currentMonday]);
    
    if (existingChallenges.length > 0) {
      console.log(`✅ Challenges already exist for week ${currentMonday}:`);
      existingChallenges.forEach(ch => console.log(`  - ${ch.jlpt_level}`));
      return;
    }
    
    console.log('📝 Creating new challenges for all levels...');
    
    // Create challenges for all JLPT levels
    const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
    
    for (const level of levels) {
      console.log(`\n🎯 Creating ${level} challenge...`);
      
      // Get vocabulary for this level
      const vocabulary = await allQuery(`
        SELECT id, japanese, hiragana, meaning, romaji 
        FROM vocabulary 
        WHERE jlpt_level = ? 
        ORDER BY RANDOM() 
        LIMIT 50
      `, [level]);
      
      if (vocabulary.length < 20) {
        console.log(`⚠️  Not enough ${level} vocabulary (${vocabulary.length} found), creating sample questions`);
        
        // Create sample questions if not enough vocabulary
        const sampleQuestions = Array.from({length: 20}, (_, i) => ({
          id: i + 1,
          vocab_id: Math.floor(Math.random() * 1000) + 1,
          question_text: `[${level}] Sample Weekly Challenge Question ${i + 1}`,
          question_type: 'meaning',
          options: {
            A: `Sample meaning A for ${level}`,
            B: `Sample meaning B for ${level}`,
            C: `Sample meaning C for ${level}`,
            D: `Sample meaning D for ${level}`
          },
          correct: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
          explanation: `This is a sample ${level} question for testing purposes.`
        }));
        
        await runQuery(`
          INSERT OR REPLACE INTO weekly_challenges (week_start_date, jlpt_level, questions_data, is_active)
          VALUES (?, ?, ?, 1)
        `, [currentMonday, level, JSON.stringify(sampleQuestions)]);
        
        console.log(`✅ Created ${level} challenge with 20 sample questions`);
        
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
          INSERT OR REPLACE INTO weekly_challenges (week_start_date, jlpt_level, questions_data, is_active)
          VALUES (?, ?, ?, 1)
        `, [currentMonday, level, JSON.stringify(questions)]);
        
        console.log(`✅ Created ${level} challenge with 20 real vocabulary questions`);
        
        // Show sample questions
        if (level === 'N5') {
          console.log('\n📖 Sample N5 questions:');
          questions.slice(0, 2).forEach((q, idx) => {
            console.log(`\n${idx + 1}. ${q.question_text}`);
            console.log(`   A) ${q.options.A}`);
            console.log(`   B) ${q.options.B}`);
            console.log(`   C) ${q.options.C}`);
            console.log(`   D) ${q.options.D}`);
            console.log(`   ✅ Correct: ${q.correct}`);
          });
        }
      }
    }
    
    // Verify challenges were created
    const createdChallenges = await allQuery(`
      SELECT jlpt_level, LENGTH(questions_data) as data_size 
      FROM weekly_challenges 
      WHERE week_start_date = ?
    `, [currentMonday]);
    
    console.log(`\n🎉 Successfully created ${createdChallenges.length} challenges for week ${currentMonday}:`);
    createdChallenges.forEach(ch => {
      console.log(`   🏆 ${ch.jlpt_level}: ${Math.floor(ch.data_size/1000)}KB data`);
    });
    
    console.log('\n🎯 Users can now access Weekly Challenges!');
    console.log('📱 Go to "Thử thách tuần" to start testing');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating current week challenge:', error);
    process.exit(1);
  }
}

createCurrentWeekChallenge();