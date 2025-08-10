// Seed vocabulary data from existing frontend data
const { runQuery, initDatabase, closeDatabase } = require('../database/database');

// Import vocabulary data from frontend (copy from japaneseData.js)
const vocabularyN5 = [
  // Danh từ (Nouns)
  { japanese: '人', hiragana: 'ひと', romaji: 'hito', meaning: 'người', category: 'danh từ' },
  { japanese: '水', hiragana: 'みず', romaji: 'mizu', meaning: 'nước', category: 'danh từ' },
  { japanese: '火', hiragana: 'ひ', romaji: 'hi', meaning: 'lửa', category: 'danh từ' },
  { japanese: '木', hiragana: 'き', romaji: 'ki', meaning: 'cây', category: 'danh từ' },
  { japanese: '土', hiragana: 'つち', romaji: 'tsuchi', meaning: 'đất', category: 'danh từ' },
  { japanese: '金', hiragana: 'きん', romaji: 'kin', meaning: 'vàng/tiền', category: 'danh từ' },
  { japanese: '月', hiragana: 'つき', romaji: 'tsuki', meaning: 'mặt trăng/tháng', category: 'danh từ' },
  { japanese: '日', hiragana: 'ひ', romaji: 'hi', meaning: 'mặt trời/ngày', category: 'danh từ' },
  { japanese: '時間', hiragana: 'じかん', romaji: 'jikan', meaning: 'thời gian', category: 'danh từ' },
  { japanese: '友達', hiragana: 'ともだち', romaji: 'tomodachi', meaning: 'bạn bè', category: 'danh từ' },
  { japanese: '家族', hiragana: 'かぞく', romaji: 'kazoku', meaning: 'gia đình', category: 'danh từ' },
  { japanese: '学校', hiragana: 'がっこう', romaji: 'gakkou', meaning: 'trường học', category: 'danh từ' },
  { japanese: '仕事', hiragana: 'しごと', romaji: 'shigoto', meaning: 'công việc', category: 'danh từ' },
  { japanese: '会社', hiragana: 'かいしゃ', romaji: 'kaisha', meaning: 'công ty', category: 'danh từ' },
  { japanese: '電話', hiragana: 'でんわ', romaji: 'denwa', meaning: 'điện thoại', category: 'danh từ' },
  
  // Động từ (Verbs)
  { japanese: '食べる', hiragana: 'たべる', romaji: 'taberu', meaning: 'ăn', category: 'động từ' },
  { japanese: '飲む', hiragana: 'のむ', romaji: 'nomu', meaning: 'uống', category: 'động từ' },
  { japanese: '見る', hiragana: 'みる', romaji: 'miru', meaning: 'nhìn/xem', category: 'động từ' },
  { japanese: '聞く', hiragana: 'きく', romaji: 'kiku', meaning: 'nghe', category: 'động từ' },
  { japanese: '話す', hiragana: 'はなす', romaji: 'hanasu', meaning: 'nói', category: 'động từ' },
  { japanese: '読む', hiragana: 'よむ', romaji: 'yomu', meaning: 'đọc', category: 'động từ' },
  { japanese: '書く', hiragana: 'かく', romaji: 'kaku', meaning: 'viết', category: 'động từ' },
  { japanese: '行く', hiragana: 'いく', romaji: 'iku', meaning: 'đi', category: 'động từ' },
  { japanese: '来る', hiragana: 'くる', romaji: 'kuru', meaning: 'đến', category: 'động từ' },
  { japanese: '帰る', hiragana: 'かえる', romaji: 'kaeru', meaning: 'về', category: 'động từ' },
  { japanese: '寝る', hiragana: 'ねる', romaji: 'neru', meaning: 'ngủ', category: 'động từ' },
  { japanese: '起きる', hiragana: 'おきる', romaji: 'okiru', meaning: 'thức dậy', category: 'động từ' },
  { japanese: '働く', hiragana: 'はたらく', romaji: 'hataraku', meaning: 'làm việc', category: 'động từ' },
  { japanese: '勉強する', hiragana: 'べんきょうする', romaji: 'benkyou suru', meaning: 'học tập', category: 'động từ' },
  { japanese: '買う', hiragana: 'かう', romaji: 'kau', meaning: 'mua', category: 'động từ' },
  
  // Tính từ (Adjectives)
  { japanese: '大きい', hiragana: 'おおきい', romaji: 'ookii', meaning: 'lớn', category: 'tính từ' },
  { japanese: '小さい', hiragana: 'ちいさい', romaji: 'chiisai', meaning: 'nhỏ', category: 'tính từ' },
  { japanese: '新しい', hiragana: 'あたらしい', romaji: 'atarashii', meaning: 'mới', category: 'tính từ' },
  { japanese: '古い', hiragana: 'ふるい', romaji: 'furui', meaning: 'cũ', category: 'tính từ' },
  { japanese: '良い', hiragana: 'よい', romaji: 'yoi', meaning: 'tốt', category: 'tính từ' },
  { japanese: '悪い', hiragana: 'わるい', romaji: 'warui', meaning: 'xấu', category: 'tính từ' },
  { japanese: '高い', hiragana: 'たかい', romaji: 'takai', meaning: 'cao/đắt', category: 'tính từ' },
  { japanese: '安い', hiragana: 'やすい', romaji: 'yasui', meaning: 'rẻ', category: 'tính từ' },
  { japanese: '暑い', hiragana: 'あつい', romaji: 'atsui', meaning: 'nóng', category: 'tính từ' },
  { japanese: '寒い', hiragana: 'さむい', romaji: 'samui', meaning: 'lạnh', category: 'tính từ' },
  { japanese: '美しい', hiragana: 'うつくしい', romaji: 'utsukushii', meaning: 'đẹp', category: 'tính từ' },
  { japanese: '面白い', hiragana: 'おもしろい', romaji: 'omoshiroi', meaning: 'thú vị', category: 'tính từ' },
  { japanese: '難しい', hiragana: 'むずかしい', romaji: 'muzukashii', meaning: 'khó', category: 'tính từ' },
  { japanese: '易しい', hiragana: 'やさしい', romaji: 'yasashii', meaning: 'dễ/dễ thương', category: 'tính từ' },
  { japanese: '忙しい', hiragana: 'いそがしい', romaji: 'isogashii', meaning: 'bận rộn', category: 'tính từ' },
  
  // Đại từ và từ khác (Pronouns & Others)
  { japanese: '私', hiragana: 'わたし', romaji: 'watashi', meaning: 'tôi', category: 'đại từ' },
  { japanese: 'あなた', hiragana: 'あなた', romaji: 'anata', meaning: 'bạn', category: 'đại từ' },
  { japanese: '彼', hiragana: 'かれ', romaji: 'kare', meaning: 'anh ấy', category: 'đại từ' },
  { japanese: '彼女', hiragana: 'かのじょ', romaji: 'kanojo', meaning: 'cô ấy', category: 'đại từ' },
  { japanese: 'これ', hiragana: 'これ', romaji: 'kore', meaning: 'cái này', category: 'đại từ' },
  { japanese: 'それ', hiragana: 'それ', romaji: 'sore', meaning: 'cái đó', category: 'đại từ' },
  { japanese: 'あれ', hiragana: 'あれ', romaji: 'are', meaning: 'cái kia', category: 'đại từ' },
  { japanese: 'どれ', hiragana: 'どれ', romaji: 'dore', meaning: 'cái nào', category: 'đại từ' },
  { japanese: 'ここ', hiragana: 'ここ', romaji: 'koko', meaning: 'ở đây', category: 'đại từ' },
  { japanese: 'そこ', hiragana: 'そこ', romaji: 'soko', meaning: 'ở đó', category: 'đại từ' },
  { japanese: 'あそこ', hiragana: 'あそこ', romaji: 'asoko', meaning: 'ở kia', category: 'đại từ' },
  { japanese: 'どこ', hiragana: 'どこ', romaji: 'doko', meaning: 'ở đâu', category: 'đại từ' }
];

async function seedVocabulary() {
  try {
    console.log('🌱 Bắt đầu seed vocabulary data...');
    
    await initDatabase();
    console.log('✅ Database connected');

    // Clear existing data
    await runQuery('DELETE FROM vocabulary');
    console.log('🧹 Cleared existing vocabulary data');

    let successCount = 0;
    let errorCount = 0;

    // Insert vocabulary data
    for (const [index, vocab] of vocabularyN5.entries()) {
      try {
        await runQuery(`
          INSERT INTO vocabulary (
            japanese, hiragana, romaji, meaning, category, 
            jlpt_level, difficulty, frequency_rank
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          vocab.japanese,
          vocab.hiragana,
          vocab.romaji,
          vocab.meaning,
          vocab.category,
          'N5',
          Math.floor(Math.random() * 3) + 1, // Random difficulty 1-3 for N5
          index + 1 // Use index as frequency rank
        ]);
        
        successCount++;
        
        if (successCount % 10 === 0) {
          console.log(`📝 Inserted ${successCount}/${vocabularyN5.length} vocabulary items...`);
        }
        
      } catch (error) {
        console.error(`❌ Error inserting ${vocab.japanese}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 SEED RESULTS:');
    console.log(`✅ Successfully inserted: ${successCount} items`);
    console.log(`❌ Errors: ${errorCount} items`);
    console.log(`📝 Total processed: ${vocabularyN5.length} items`);

    // Show sample data
    const sampleData = await runQuery(`
      SELECT japanese, hiragana, meaning, category 
      FROM vocabulary 
      LIMIT 5
    `);
    
    console.log('\n📖 Sample vocabulary data:');
    console.table(sampleData);

    // Show statistics
    const stats = await runQuery(`
      SELECT 
        category,
        COUNT(*) as count
      FROM vocabulary 
      GROUP BY category
      ORDER BY count DESC
    `);
    
    console.log('\n📈 Vocabulary by category:');
    console.table(stats);

    await closeDatabase();
    console.log('\n🎉 Vocabulary seeding completed successfully!');

  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedVocabulary();
}

module.exports = { seedVocabulary };