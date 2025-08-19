const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function populateCommonKanjiStrokes() {
  console.log('🚀 Populating stroke data for common kanji...\n');
  
  // Common kanji from the KanjiPage
  const commonKanji = ['人', '水', '火', '木', '土', '金', '月', '日', '愛', '学', '生', '心'];
  
  const results = [];
  
  for (let i = 0; i < commonKanji.length; i++) {
    const kanji = commonKanji[i];
    
    try {
      console.log(`${i + 1}/${commonKanji.length} Processing: ${kanji}`);
      
      // Check if already has stroke data
      const checkResponse = await axios.get(`${API_BASE}/kanji/with-strokes/${encodeURIComponent(kanji)}`);
      
      if (checkResponse.data.success && checkResponse.data.data.stroke_order_data) {
        console.log(`✅ ${kanji} already has stroke data (${checkResponse.data.data.stroke_order_data.totalStrokes} strokes)`);
        results.push({
          kanji,
          status: 'already_exists',
          strokes: checkResponse.data.data.stroke_order_data.totalStrokes
        });
      } else {
        // Fetch and save stroke data
        const fetchResponse = await axios.post(`${API_BASE}/kanji/strokes/${encodeURIComponent(kanji)}`);
        
        if (fetchResponse.data.success) {
          console.log(`✅ ${kanji} stroke data fetched and saved (${fetchResponse.data.data.totalStrokes} strokes)`);
          results.push({
            kanji,
            status: 'fetched',
            strokes: fetchResponse.data.data.totalStrokes
          });
        } else {
          console.log(`❌ Failed to fetch stroke data for ${kanji}`);
          results.push({
            kanji,
            status: 'failed',
            error: fetchResponse.data.message
          });
        }
      }
      
      // Small delay to be respectful to KanjiVG
      if (i < commonKanji.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${kanji}:`, error.message);
      results.push({
        kanji,
        status: 'error',
        error: error.message
      });
    }
  }
  
  console.log('\n📊 Summary:');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.status === 'fetched' || r.status === 'already_exists');
  const failed = results.filter(r => r.status === 'failed' || r.status === 'error');
  
  console.log(`✅ Successful: ${successful.length}/${commonKanji.length}`);
  console.log(`❌ Failed: ${failed.length}/${commonKanji.length}`);
  
  if (successful.length > 0) {
    console.log('\n✅ Successful kanji:');
    successful.forEach(result => {
      console.log(`   ${result.kanji} (${result.strokes} strokes) - ${result.status}`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Failed kanji:');
    failed.forEach(result => {
      console.log(`   ${result.kanji} - ${result.status}: ${result.error}`);
    });
  }
  
  console.log('\n🎉 Done! You can now test stroke viewer in the frontend.');
}

// Run the script
if (require.main === module) {
  populateCommonKanjiStrokes()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { populateCommonKanjiStrokes };