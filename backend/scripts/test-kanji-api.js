const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function testKanjiStrokeAPI() {
  console.log('🧪 Testing Kanji Stroke API...\n');

  try {
    // Test 1: Get stroke data for a single kanji
    console.log('1️⃣ Testing GET /api/kanji/strokes/:character');
    const testKanji = '水'; // "water" kanji
    const encodedKanji = encodeURIComponent(testKanji);
    
    console.log(`Testing kanji: ${testKanji} (encoded: ${encodedKanji})`);
    
    const strokeResponse = await axios.get(`${API_BASE}/kanji/strokes/${encodedKanji}`);
    console.log('✅ Stroke data fetched successfully');
    console.log(`Strokes found: ${strokeResponse.data.data.totalStrokes}`);
    console.log(`Source: ${strokeResponse.data.source}\n`);

    // Test 2: Save stroke data to database
    console.log('2️⃣ Testing POST /api/kanji/strokes/:character');
    const saveResponse = await axios.post(`${API_BASE}/kanji/strokes/${encodedKanji}`);
    console.log('✅ Stroke data saved successfully');
    console.log(`Action: ${saveResponse.data.action}`);
    console.log(`Message: ${saveResponse.data.message}\n`);

    // Test 3: Get kanji with stroke data from database
    console.log('3️⃣ Testing GET /api/kanji/with-strokes/:character');
    const kanjiWithStrokes = await axios.get(`${API_BASE}/kanji/with-strokes/${encodedKanji}`);
    console.log('✅ Kanji with stroke data retrieved');
    console.log(`Character: ${kanjiWithStrokes.data.data.character}`);
    console.log(`Meanings: ${kanjiWithStrokes.data.data.meanings.join(', ')}`);
    console.log(`Stroke count: ${kanjiWithStrokes.data.data.stroke_count}`);
    console.log(`Has stroke data: ${kanjiWithStrokes.data.data.stroke_order_data ? 'Yes' : 'No'}\n`);

    // Test 4: Batch processing
    console.log('4️⃣ Testing POST /api/kanji/strokes/batch');
    const batchKanji = ['山', '川', '火'];
    const batchResponse = await axios.post(`${API_BASE}/kanji/strokes/batch`, {
      kanji: batchKanji
    });
    console.log('✅ Batch processing completed');
    console.log(`Total processed: ${batchResponse.data.summary.total}`);
    console.log(`Successful: ${batchResponse.data.summary.successful}`);
    console.log(`Skipped: ${batchResponse.data.summary.skipped}`);
    console.log(`Failed: ${batchResponse.data.summary.failed}\n`);

    // Test 5: Test with cached data
    console.log('5️⃣ Testing cached stroke data');
    const cachedResponse = await axios.get(`${API_BASE}/kanji/strokes/${encodedKanji}`);
    console.log('✅ Cached data retrieved');
    console.log(`Source: ${cachedResponse.data.source}`);
    console.log(`Should be 'cache': ${cachedResponse.data.source === 'cache' ? 'Yes' : 'No'}\n`);

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

async function demonstrateStrokeData() {
  console.log('\n📋 Demonstrating stroke data structure...\n');
  
  try {
    const kanji = '人';
    const encodedKanji = encodeURIComponent(kanji);
    
    const response = await axios.get(`${API_BASE}/kanji/with-strokes/${encodedKanji}`);
    const strokeData = response.data.data.stroke_order_data;
    
    if (strokeData) {
      console.log(`📝 Stroke data for ${kanji}:`);
      console.log(`Unicode: ${strokeData.unicode}`);
      console.log(`Total strokes: ${strokeData.totalStrokes}`);
      console.log(`ViewBox: ${strokeData.viewBox}`);
      console.log('\n🖊️ Individual strokes:');
      
      strokeData.strokes.forEach((stroke, index) => {
        console.log(`  Stroke ${stroke.id}:`);
        console.log(`    Path: ${stroke.path.substring(0, 50)}...`);
        console.log(`    Type: ${stroke.type || 'N/A'}`);
        console.log(`    Element: ${stroke.element || 'N/A'}`);
      });
      
      console.log('\n🔧 Groups:');
      strokeData.groups.forEach(group => {
        console.log(`  Group: ${group.element || 'N/A'} (${group.type || 'N/A'})`);
      });
      
      console.log('\n📊 Metadata:');
      console.log(`  Source: ${strokeData.metadata.source}`);
      console.log(`  Fetched at: ${strokeData.metadata.fetchedAt}`);
      console.log(`  URL: ${strokeData.metadata.url}`);
    }
    
  } catch (error) {
    console.error('❌ Failed to demonstrate stroke data:', error.message);
  }
}

// Run tests
if (require.main === module) {
  testKanjiStrokeAPI()
    .then(() => demonstrateStrokeData())
    .catch(console.error);
}

module.exports = {
  testKanjiStrokeAPI,
  demonstrateStrokeData
};