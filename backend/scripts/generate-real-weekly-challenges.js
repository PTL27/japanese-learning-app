const { initDatabase, runQuery, allQuery } = require('../database/database');

async function generateRealWeeklyChallenges() {
  try {
    await initDatabase();
    
    console.log('🎯 Generating real N5 weekly challenge...');
    
    // Get current Monday
    const getMonday = (date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(d.setDate(diff)).toISOString().split('T')[0];
    };
    
    const currentMonday = getMonday(new Date());
    console.log(`📅 Current week: ${currentMonday}`);
    
    // Get N5 vocabulary for questions
    const n5Vocabulary = await allQuery(`
      SELECT id, japanese, hiragana, meaning, romaji 
      FROM vocabulary 
      WHERE jlpt_level = 'N5' 
      ORDER BY RANDOM() 
      LIMIT 20
    `);
    
    if (n5Vocabulary.length < 20) {
      console.error('❌ Not enough N5 vocabulary words in database');
      return;
    }
    
    console.log(`✅ Found ${n5Vocabulary.length} N5 vocabulary words`);
    
    // Generate 20 questions
    const questions = [];
    
    for (let i = 0; i < 20; i++) {
      const correctWord = n5Vocabulary[i];
      
      // Get 3 random wrong answers from different words
      const wrongAnswers = n5Vocabulary
        .filter(word => word.id !== correctWord.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      
      // Create multiple choice options
      const options = [correctWord, ...wrongAnswers]
        .sort(() => 0.5 - Math.random()); // Randomize order
      
      const correctOptionIndex = options.findIndex(opt => opt.id === correctWord.id);
      const correctOptionLetter = ['A', 'B', 'C', 'D'][correctOptionIndex];
      
      const question = {
        id: i + 1,
        vocab_id: correctWord.id,
        question_text: `Nghĩa của từ "${correctWord.japanese}" (${correctWord.hiragana}) là gì?`,
        question_type: 'meaning', // meaning, reading, kanji
        options: {
          A: options[0].meaning,
          B: options[1].meaning,
          C: options[2].meaning,
          D: options[3].meaning
        },
        correct: correctOptionLetter,
        explanation: `${correctWord.japanese} (${correctWord.hiragana}) có nghĩa là "${correctWord.meaning}"`
      };
      
      questions.push(question);
    }
    
    // Update N5 challenge with real questions
    await runQuery(`
      UPDATE weekly_challenges 
      SET questions_data = ?
      WHERE week_start_date = ? AND jlpt_level = 'N5'
    `, [JSON.stringify(questions), currentMonday]);
    
    console.log('✅ Updated N5 challenge with 20 real vocabulary questions');
    
    // Create N4 questions if we have N4 vocabulary
    const n4Vocabulary = await allQuery(`
      SELECT id, japanese, hiragana, meaning, romaji 
      FROM vocabulary 
      WHERE jlpt_level = 'N4' 
      ORDER BY RANDOM() 
      LIMIT 20
    `);
    
    if (n4Vocabulary.length >= 20) {
      console.log(`✅ Found ${n4Vocabulary.length} N4 vocabulary words, creating N4 challenge...`);
      
      const n4Questions = [];
      for (let i = 0; i < 20; i++) {
        const correctWord = n4Vocabulary[i];
        const wrongAnswers = n4Vocabulary
          .filter(word => word.id !== correctWord.id)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        
        const options = [correctWord, ...wrongAnswers]
          .sort(() => 0.5 - Math.random());
        
        const correctOptionIndex = options.findIndex(opt => opt.id === correctWord.id);
        const correctOptionLetter = ['A', 'B', 'C', 'D'][correctOptionIndex];
        
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
          correct: correctOptionLetter,
          explanation: `${correctWord.japanese} (${correctWord.hiragana}) có nghĩa là "${correctWord.meaning}"`
        };
        
        n4Questions.push(question);
      }
      
      await runQuery(`
        UPDATE weekly_challenges 
        SET questions_data = ?
        WHERE week_start_date = ? AND jlpt_level = 'N4'
      `, [JSON.stringify(n4Questions), currentMonday]);
      
      console.log('✅ Updated N4 challenge with real questions');
    } else {
      console.log('⚠️  Not enough N4 vocabulary for real questions, keeping sample');
    }
    
    // Show sample of generated questions
    console.log('\n📝 Sample N5 questions generated:');
    questions.slice(0, 3).forEach((q, i) => {
      console.log(`\nQuestion ${i + 1}:`);
      console.log(`  ${q.question_text}`);
      console.log(`  A) ${q.options.A}`);
      console.log(`  B) ${q.options.B}`);
      console.log(`  C) ${q.options.C}`);
      console.log(`  D) ${q.options.D}`);
      console.log(`  ✅ Correct: ${q.correct}`);
    });
    
    console.log('\n🎉 Real weekly challenges generated successfully!');
    console.log('📋 Users can now test the Weekly Challenge feature with real N5 questions');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error generating real weekly challenges:', error);
    process.exit(1);
  }
}

generateRealWeeklyChallenges();