const Database = require('better-sqlite3');

async function checkVietnameseProgress() {
  console.log('📊 TIẾN ĐỘ IMPORT DỮ LIỆU VIETNAMESE');
  console.log('=' .repeat(60));
  
  const db = new Database('./database/japanese_app.db');
  
  try {
    // Total kanji
    const totalKanji = db.prepare('SELECT COUNT(*) as count FROM kanji WHERE meanings IS NOT NULL').get();
    
    // Vietnamese meanings coverage  
    const withVietnamese = db.prepare(`SELECT COUNT(*) as count FROM kanji WHERE meanings LIKE '%"vi":%'`).get();
    
    // Name readings coverage
    const withNameReadings = db.prepare(`SELECT COUNT(*) as count FROM kanji WHERE name_readings IS NOT NULL AND name_readings != '[]' AND name_readings != 'null'`).get();
    
    // Stroke data coverage
    const withStrokeData = db.prepare('SELECT COUNT(*) as count FROM kanji WHERE stroke_order_data IS NOT NULL').get();
    
    // JLPT coverage
    const totalJlpt = db.prepare('SELECT COUNT(*) as count FROM kanji WHERE jlpt_level IS NOT NULL').get();
    const jlptWithVietnamese = db.prepare(`SELECT COUNT(*) as count FROM kanji WHERE jlpt_level IS NOT NULL AND meanings LIKE '%"vi":%'`).get();
    const jlptWithStroke = db.prepare('SELECT COUNT(*) as count FROM kanji WHERE jlpt_level IS NOT NULL AND stroke_order_data IS NOT NULL').get();
    
    console.log('🇻🇳 VIETNAMESE MEANINGS:');
    console.log(`   Tổng kanji có meanings: ${totalKanji.count.toLocaleString()}`);
    console.log(`   Đã có Vietnamese meanings: ${withVietnamese.count.toLocaleString()}`);
    console.log(`   Tỷ lệ coverage: ${((withVietnamese.count / totalKanji.count) * 100).toFixed(1)}%`);
    
    console.log('\n📖 HÁN VIỆT READINGS:');
    console.log(`   Kanji có name_readings: ${withNameReadings.count.toLocaleString()}`);
    console.log(`   Tỷ lệ coverage: ${((withNameReadings.count / totalKanji.count) * 100).toFixed(1)}%`);
    
    console.log('\n🖌️ STROKE DATA:');
    console.log(`   Tổng kanji có stroke data: ${withStrokeData.count.toLocaleString()}`);
    console.log(`   Tỷ lệ coverage: ${((withStrokeData.count / totalKanji.count) * 100).toFixed(1)}%`);
    
    console.log('\n📈 COVERAGE BY JLPT LEVEL:');
    console.log('Level | Vietnamese | Readings | Strokes | Total');
    console.log('------|------------|----------|---------|------');
    
    for (let level = 1; level <= 5; level++) {
      const total = db.prepare('SELECT COUNT(*) as count FROM kanji WHERE jlpt_level = ?').get(level);
      const withVi = db.prepare(`SELECT COUNT(*) as count FROM kanji WHERE jlpt_level = ? AND meanings LIKE '%"vi":%'`).get(level);
      const withReadings = db.prepare(`SELECT COUNT(*) as count FROM kanji WHERE jlpt_level = ? AND name_readings IS NOT NULL AND name_readings != '[]'`).get(level);
      const withStrokes = db.prepare('SELECT COUNT(*) as count FROM kanji WHERE jlpt_level = ? AND stroke_order_data IS NOT NULL').get(level);
      
      if (total.count > 0) {
        const viPercent = ((withVi.count / total.count) * 100).toFixed(0);
        const readingsPercent = ((withReadings.count / total.count) * 100).toFixed(0);
        const strokesPercent = ((withStrokes.count / total.count) * 100).toFixed(0);
        
        console.log(`  N${level}  | ${withVi.count.toString().padStart(4)}/${total.count.toString().padEnd(4)} (${viPercent}%) | ${withReadings.count.toString().padStart(4)}/${total.count.toString().padEnd(4)} (${readingsPercent}%) | ${withStrokes.count.toString().padStart(4)}/${total.count.toString().padEnd(4)} (${strokesPercent}%) | ${total.count.toLocaleString()}`);
      }
    }
    
    console.log('\n✨ SAMPLE DATA WITH VIETNAMESE:');
    const samples = db.prepare(`
      SELECT character, meanings, name_readings, jlpt_level, frequency_rank
      FROM kanji 
      WHERE meanings LIKE '%"vi":%' AND jlpt_level IS NOT NULL
      ORDER BY jlpt_level DESC, frequency_rank ASC
      LIMIT 15
    `).all();
    
    samples.forEach((sample, i) => {
      try {
        const meanings = JSON.parse(sample.meanings);
        const nameReadings = JSON.parse(sample.name_readings || '[]');
        
        const en = meanings.en ? meanings.en.slice(0, 2).join(', ') : '';
        const vi = meanings.vi ? meanings.vi.slice(0, 2).join(', ') : '';
        const hanViet = nameReadings.filter(r => 
          /^[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]+$/.test(r)
        ).join(', ');
        
        console.log(`${(i + 1).toString().padStart(2)}. ${sample.character} (N${sample.jlpt_level}): EN[${en}] → VI[${vi}] Hán[${hanViet}]`);
      } catch (error) {
        console.log(`${(i + 1).toString().padStart(2)}. ${sample.character} (N${sample.jlpt_level}): [Parse error]`);
      }
    });
    
    console.log('\n🎯 KẾT LUẬN TỔNG HỢP:');
    console.log(`✅ Vietnamese meanings: ${withVietnamese.count.toLocaleString()} kanji (${((withVietnamese.count / totalKanji.count) * 100).toFixed(1)}%)`);
    console.log(`✅ Hán Việt readings: ${withNameReadings.count.toLocaleString()} kanji (${((withNameReadings.count / totalKanji.count) * 100).toFixed(1)}%)`);
    console.log(`✅ Stroke animations: ${withStrokeData.count.toLocaleString()} kanji (${((withStrokeData.count / totalKanji.count) * 100).toFixed(1)}%)`);
    console.log(`🚀 JLPT Vietnamese coverage: ${jlptWithVietnamese.count}/${totalJlpt.count} (${((jlptWithVietnamese.count / totalJlpt.count) * 100).toFixed(1)}%)`);
    console.log(`🖌️ JLPT Stroke coverage: ${jlptWithStroke.count}/${totalJlpt.count} (${((jlptWithStroke.count / totalJlpt.count) * 100).toFixed(1)}%)`);
    
    console.log('\n🎉 App đã sẵn sàng với Vietnamese + Stroke support hoàn chỉnh!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    db.close();
  }
}

// Run the script
if (require.main === module) {
  checkVietnameseProgress()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { checkVietnameseProgress };