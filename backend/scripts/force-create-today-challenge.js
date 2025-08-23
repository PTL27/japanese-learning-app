const { initDatabase, runQuery, allQuery } = require('../database/database');

async function forceCreateTodayChallenge() {
  try {
    await initDatabase();
    
    // Use today's date as Monday (for testing purposes)
    const today = new Date().toISOString().split('T')[0];
    console.log(`🎯 Force creating challenge for TODAY: ${today}`);
    
    // Delete existing challenges for today if any
    await runQuery(`DELETE FROM weekly_challenges WHERE week_start_date = ?`, [today]);
    console.log('🗑️ Cleared any existing challenges for today');
    
    // Create N5 challenge with real vocabulary
    console.log('🎯 Creating N5 challenge...');
    
    const n5Vocabulary = await allQuery(`
      SELECT id, japanese, hiragana, meaning, romaji 
      FROM vocabulary 
      WHERE jlpt_level = 'N5' 
      ORDER BY RANDOM() 
      LIMIT 30
    `);
    
    if (n5Vocabulary.length < 20) {
      throw new Error(`Not enough N5 vocabulary: ${n5Vocabulary.length} found`);
    }
    
    const questions = [];
    for (let i = 0; i < 20; i++) {
      const correctWord = n5Vocabulary[i];
      
      // Get 3 wrong answers
      const wrongAnswers = n5Vocabulary
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
    
    // Insert N5 challenge
    await runQuery(`
      INSERT INTO weekly_challenges (week_start_date, jlpt_level, questions_data, is_active)
      VALUES (?, 'N5', ?, 1)
    `, [today, JSON.stringify(questions)]);
    
    console.log('✅ N5 challenge created with 20 real questions');
    
    // Create simple challenges for other levels
    for (const level of ['N4', 'N3', 'N2', 'N1']) {
      const sampleQuestions = Array.from({length: 20}, (_, i) => ({
        id: i + 1,
        vocab_id: Math.floor(Math.random() * 1000) + 1,
        question_text: `[${level}] Weekly Challenge Question ${i + 1} - Week ${today}`,
        question_type: 'meaning',
        options: {
          A: `Meaning A for ${level} Q${i + 1}`,
          B: `Meaning B for ${level} Q${i + 1}`,
          C: `Meaning C for ${level} Q${i + 1}`,
          D: `Meaning D for ${level} Q${i + 1}`
        },
        correct: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
        explanation: `This is a sample ${level} question for testing Weekly Challenge.`
      }));
      
      await runQuery(`
        INSERT INTO weekly_challenges (week_start_date, jlpt_level, questions_data, is_active)
        VALUES (?, ?, ?, 1)
      `, [today, level, JSON.stringify(sampleQuestions)]);
      
      console.log(`✅ ${level} challenge created with sample questions`);
    }
    
    // Show sample N5 questions
    console.log('\n📖 Sample N5 questions for today:');
    questions.slice(0, 3).forEach((q, idx) => {
      console.log(`\n${idx + 1}. ${q.question_text}`);
      console.log(`   A) ${q.options.A}`);
      console.log(`   B) ${q.options.B}`);
      console.log(`   C) ${q.options.C}`);
      console.log(`   D) ${q.options.D}`);
      console.log(`   ✅ Correct: ${q.correct}`);
    });
    
    console.log(`\n🎉 Successfully created challenges for TODAY (${today})!`);
    console.log('🎯 Go to "Thử thách tuần" → N5 to test the challenge');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating today challenge:', error);
    process.exit(1);
  }
}

forceCreateTodayChallenge();