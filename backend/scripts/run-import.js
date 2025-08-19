const path = require('path');
const { importDictionaryData } = require('./import-dictionary');
const { importKanjiData } = require('./import-kanji');

/**
 * Run both dictionary and kanji data imports
 */
const runFullImport = async () => {
  try {
    console.log('🚀 Starting full data import process...');
    console.log('=' .repeat(60));
    
    // Import dictionary data
    const dictionaryFile = path.join(__dirname, 'data', 'sample-dictionary.json');
    console.log('\n📚 Step 1: Importing Dictionary Data');
    console.log('-'.repeat(40));
    await importDictionaryData(dictionaryFile);
    
    console.log('\n' + '='.repeat(60));
    
    // Import kanji data  
    const kanjiFile = path.join(__dirname, 'data', 'sample-kanji.json');
    console.log('\n🈵 Step 2: Importing Kanji Data');
    console.log('-'.repeat(40));
    await importKanjiData(kanjiFile);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Full import process completed successfully!');
    console.log('🎉 Your Japanese learning app database is now ready to use.');
    console.log('\n📝 Next steps:');
    console.log('   1. Start the backend server: npm run dev');
    console.log('   2. Test the APIs:');
    console.log('      - Dictionary: http://localhost:5000/api/dictionary/search?q=水');
    console.log('      - Kanji: http://localhost:5000/api/kanji/search/水');
    console.log('   3. Start the frontend and test the new pages!');
    
  } catch (error) {
    console.error('❌ Import process failed:', error);
    process.exit(1);
  }
};

// Run import if called directly
if (require.main === module) {
  runFullImport()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error during import:', error);
      process.exit(1);
    });
}

module.exports = { runFullImport };