const axios = require('axios');
const Database = require('better-sqlite3');

const API_BASE = 'http://localhost:5001/api';

async function populatePriorityStrokes() {
  console.log('🚀 Populating stroke data for priority kanji...\n');
  
  // Open database to get priority kanji
  const db = new Database('../database/japanese_app.db');
  
  // Get kanji sorted by priority (JLPT level, grade level, frequency)
  const priorityQuery = `
    SELECT character, stroke_count, jlpt_level, grade_level, frequency_rank
    FROM kanji 
    WHERE stroke_order_data IS NULL
      AND (
        jlpt_level IS NOT NULL 
        OR grade_level IS NOT NULL 
        OR frequency_rank IS NOT NULL
      )
    ORDER BY 
      CASE 
        WHEN jlpt_level IS NOT NULL THEN jlpt_level 
        ELSE 999 
      END ASC,
      CASE 
        WHEN grade_level IS NOT NULL THEN grade_level 
        ELSE 999 
      END ASC,
      CASE 
        WHEN frequency_rank IS NOT NULL THEN frequency_rank 
        ELSE 999999 
      END ASC
    LIMIT 100
  `;
  
  const priorityKanji = db.prepare(priorityQuery).all();
  db.close();
  
  console.log(`📋 Found ${priorityKanji.length} priority kanji to process:`);
  console.log('   - JLPT levels, grade levels, or high frequency kanji');
  console.log('   - Ordered by importance (JLPT → Grade → Frequency)');
  
  // Show first 10 as preview
  console.log('\n🔍 First 10 kanji to process:');
  priorityKanji.slice(0, 10).forEach((k, i) => {
    const jlpt = k.jlpt_level ? `N${k.jlpt_level}` : 'N/A';
    const grade = k.grade_level || 'N/A';
    const freq = k.frequency_rank || 'N/A';
    console.log(`   ${i + 1}. ${k.character} (${k.stroke_count} strokes) - JLPT:${jlpt}, Grade:${grade}, Freq:${freq}`);
  });
  
  console.log('\n⏱️ Starting in 3 seconds...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const results = [];
  
  for (let i = 0; i < priorityKanji.length; i++) {
    const kanji = priorityKanji[i];
    const char = kanji.character;
    
    try {
      console.log(`\n[${i + 1}/${priorityKanji.length}] Processing: ${char}`);
      console.log(`   Info: ${kanji.stroke_count} strokes, JLPT N${kanji.jlpt_level || '?'}, Grade ${kanji.grade_level || '?'}`);
      
      // Fetch and save stroke data
      const fetchResponse = await axios.post(`${API_BASE}/kanji/strokes/${encodeURIComponent(char)}`);
      
      if (fetchResponse.data.success) {
        console.log(`   ✅ SUCCESS: ${char} stroke data saved (${fetchResponse.data.data.totalStrokes} strokes)`);
        results.push({
          kanji: char,
          status: 'success',
          strokes: fetchResponse.data.data.totalStrokes,
          info: `JLPT N${kanji.jlpt_level || '?'}, Grade ${kanji.grade_level || '?'}`
        });
      } else {
        console.log(`   ❌ FAILED: ${fetchResponse.data.message}`);
        results.push({
          kanji: char,
          status: 'failed',
          error: fetchResponse.data.message,
          info: `JLPT N${kanji.jlpt_level || '?'}, Grade ${kanji.grade_level || '?'}`
        });
      }
      
      // Respectful delay for KanjiVG server
      if (i < priorityKanji.length - 1) {
        const delay = i < 20 ? 500 : 1000; // Slower after first 20
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
    } catch (error) {
      console.error(`   ❌ ERROR: ${char} - ${error.message}`);
      results.push({
        kanji: char,
        status: 'error',
        error: error.message,
        info: `JLPT N${kanji.jlpt_level || '?'}, Grade ${kanji.grade_level || '?'}`
      });
    }
  }
  
  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL SUMMARY');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'failed' || r.status === 'error');
  
  console.log(`✅ Successfully processed: ${successful.length}/${priorityKanji.length}`);
  console.log(`❌ Failed: ${failed.length}/${priorityKanji.length}`);
  
  if (successful.length > 0) {
    console.log(`\n🎉 SUCCESS: Now you have stroke data for ${successful.length} important kanji!`);
    console.log('\n📋 Successfully added kanji by priority:');
    successful.slice(0, 20).forEach((result, i) => {
      console.log(`   ${i + 1}. ${result.kanji} (${result.strokes} strokes) - ${result.info}`);
    });
    
    if (successful.length > 20) {
      console.log(`   ... and ${successful.length - 20} more kanji`);
    }
  }
  
  if (failed.length > 0 && failed.length <= 10) {
    console.log('\n❌ Failed kanji:');
    failed.forEach(result => {
      console.log(`   ${result.kanji} - ${result.status}: ${result.error}`);
    });
  }
  
  console.log('\n💡 These kanji can now display stroke animations in the frontend!');
  console.log('🔍 Test by searching for any of the successful kanji in the app.');
}

// Run the script
if (require.main === module) {
  populatePriorityStrokes()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}