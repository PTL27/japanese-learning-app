const axios = require('axios');
const Database = require('better-sqlite3');

const API_BASE = 'http://localhost:5001/api';

async function populateAllJLPTStrokes() {
  console.log('🚀 Populating stroke data for ALL JLPT kanji...\n');
  
  // Open database to get all JLPT kanji without stroke data
  const db = new Database('./database/japanese_app.db');
  
  // Get all JLPT kanji without stroke data, ordered by priority
  const jlptKanjiQuery = `
    SELECT character, stroke_count, jlpt_level, grade_level, frequency_rank
    FROM kanji 
    WHERE stroke_order_data IS NULL
      AND jlpt_level IS NOT NULL
    ORDER BY 
      -- Prioritize by JLPT level (higher levels first for most common kanji)
      jlpt_level DESC,
      -- Then by grade level (lower grades = more basic)
      CASE WHEN grade_level IS NOT NULL THEN grade_level ELSE 999 END ASC,
      -- Then by frequency (more frequent = more important)
      CASE WHEN frequency_rank IS NOT NULL THEN frequency_rank ELSE 999999 END ASC
  `;
  
  const jlptKanji = db.prepare(jlptKanjiQuery).all();
  
  // Get current coverage stats
  const totalJLPT = db.prepare('SELECT COUNT(*) as count FROM kanji WHERE jlpt_level IS NOT NULL').get();
  const currentWithStrokes = db.prepare('SELECT COUNT(*) as count FROM kanji WHERE jlpt_level IS NOT NULL AND stroke_order_data IS NOT NULL').get();
  
  db.close();
  
  console.log(`📋 JLPT Kanji Stroke Data Plan:`);
  console.log(`   Total JLPT kanji: ${totalJLPT.count}`);
  console.log(`   Already have stroke data: ${currentWithStrokes.count}`);
  console.log(`   Need to populate: ${jlptKanji.length}`);
  console.log(`   Target coverage: ${totalJLPT.count} kanji (100%)`);
  
  // Show breakdown by level
  console.log('\n📊 Breakdown by JLPT level:');
  const levelBreakdown = {};
  jlptKanji.forEach(k => {
    levelBreakdown[k.jlpt_level] = (levelBreakdown[k.jlpt_level] || 0) + 1;
  });
  
  Object.keys(levelBreakdown).sort().forEach(level => {
    console.log(`   N${level}: ${levelBreakdown[level]} kanji`);
  });
  
  // Show first 20 as preview
  console.log('\n🔍 First 20 kanji to process (highest priority):');
  jlptKanji.slice(0, 20).forEach((k, i) => {
    const jlpt = `N${k.jlpt_level}`;
    const grade = k.grade_level || 'N/A';
    const freq = k.frequency_rank || 'N/A';
    console.log(`   ${i + 1}. ${k.character} (${k.stroke_count} strokes) - ${jlpt}, Grade:${grade}, Freq:${freq}`);
  });
  
  console.log('\n⚠️  This will take approximately 1-2 hours to complete.');
  console.log('💡 The script uses respectful delays to avoid overwhelming KanjiVG servers.');
  console.log('🔄 Progress will be saved incrementally, so you can stop and resume anytime.');
  console.log('\n⏱️ Starting in 5 seconds...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const results = [];
  const batchSize = 50; // Process in batches for better progress tracking
  
  for (let i = 0; i < jlptKanji.length; i++) {
    const kanji = jlptKanji[i];
    const char = kanji.character;
    const progress = `[${i + 1}/${jlptKanji.length}]`;
    const percentage = ((i + 1) / jlptKanji.length * 100).toFixed(1);
    
    try {
      console.log(`\n${progress} (${percentage}%) Processing: ${char}`);
      console.log(`   Info: N${kanji.jlpt_level}, ${kanji.stroke_count} strokes, Grade ${kanji.grade_level || '?'}`);
      
      // Fetch and save stroke data
      const fetchResponse = await axios.post(`${API_BASE}/kanji/strokes/${encodeURIComponent(char)}`);
      
      if (fetchResponse.data.success) {
        console.log(`   ✅ SUCCESS: ${char} stroke data saved (${fetchResponse.data.data.totalStrokes} strokes)`);
        results.push({
          kanji: char,
          status: 'success',
          strokes: fetchResponse.data.data.totalStrokes,
          jlpt_level: kanji.jlpt_level
        });
      } else {
        console.log(`   ❌ FAILED: ${fetchResponse.data.message}`);
        results.push({
          kanji: char,
          status: 'failed',
          error: fetchResponse.data.message,
          jlpt_level: kanji.jlpt_level
        });
      }
      
      // Progress checkpoint every 50 kanji
      if ((i + 1) % batchSize === 0) {
        const successful = results.filter(r => r.status === 'success').length;
        const failed = results.filter(r => r.status !== 'success').length;
        console.log(`\n🔄 CHECKPOINT: Processed ${i + 1}/${jlptKanji.length} kanji`);
        console.log(`   ✅ Success: ${successful}, ❌ Failed: ${failed}`);
        console.log(`   📈 Success rate: ${(successful / (successful + failed) * 100).toFixed(1)}%`);
      }
      
      // Respectful delay based on progress
      if (i < jlptKanji.length - 1) {
        let delay;
        if (i < 100) delay = 300;      // First 100: faster
        else if (i < 500) delay = 500; // Next 400: medium  
        else delay = 800;              // Rest: slower to be respectful
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
    } catch (error) {
      console.error(`   ❌ ERROR: ${char} - ${error.message}`);
      results.push({
        kanji: char,
        status: 'error',
        error: error.message,
        jlpt_level: kanji.jlpt_level
      });
    }
  }
  
  // Final comprehensive summary
  console.log('\n' + '='.repeat(80));
  console.log('🎉 COMPREHENSIVE JLPT STROKE DATA POPULATION COMPLETE!');
  console.log('='.repeat(80));
  
  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status !== 'success');
  
  console.log(`\n📊 OVERALL RESULTS:`);
  console.log(`   ✅ Successfully processed: ${successful.length}/${jlptKanji.length} (${(successful.length/jlptKanji.length*100).toFixed(1)}%)`);
  console.log(`   ❌ Failed: ${failed.length}/${jlptKanji.length} (${(failed.length/jlptKanji.length*100).toFixed(1)}%)`);
  
  // Success breakdown by JLPT level
  console.log(`\n📈 SUCCESS BY JLPT LEVEL:`);
  for (let level = 1; level <= 4; level++) {
    const levelSuccessful = successful.filter(r => r.jlpt_level === level);
    const levelTotal = jlptKanji.filter(k => k.jlpt_level === level).length;
    const percentage = levelTotal > 0 ? (levelSuccessful.length / levelTotal * 100).toFixed(1) : 0;
    console.log(`   N${level}: ${levelSuccessful.length}/${levelTotal} kanji (${percentage}%)`);
  }
  
  if (successful.length > 0) {
    console.log(`\n🎉 AMAZING! You now have stroke animations for ${successful.length} JLPT kanji!`);
    console.log(`📱 These kanji will now show beautiful stroke animations in your app.`);
    
    // Show some examples from each level
    console.log(`\n✨ Sample successful kanji by level:`);
    for (let level = 1; level <= 4; level++) {
      const levelSuccessful = successful.filter(r => r.jlpt_level === level).slice(0, 10);
      if (levelSuccessful.length > 0) {
        const kanjiList = levelSuccessful.map(r => r.kanji).join(', ');
        console.log(`   N${level}: ${kanjiList}${levelSuccessful.length === 10 ? '...' : ''}`);
      }
    }
  }
  
  if (failed.length > 0 && failed.length <= 20) {
    console.log(`\n❌ Failed kanji (need manual review):`);
    failed.forEach(result => {
      console.log(`   ${result.kanji} (N${result.jlpt_level}) - ${result.status}: ${result.error}`);
    });
  } else if (failed.length > 20) {
    console.log(`\n❌ ${failed.length} kanji failed - see logs above for details`);
  }
  
  console.log(`\n🚀 NEXT STEPS:`);
  console.log(`   1. Test stroke animations in the frontend by clicking any JLPT kanji`);
  console.log(`   2. The stroke viewer should now work for most JLPT kanji`);
  console.log(`   3. Consider running populate-basic-kanji.js for non-JLPT common kanji`);
  
  console.log(`\n💾 Total stroke data now available: ${currentWithStrokes.count + successful.length} kanji`);
}

// Run the script
if (require.main === module) {
  populateAllJLPTStrokes()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { populateAllJLPTStrokes };