const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { runQuery, allQuery, initDatabase } = require('../database/database');

/**
 * Import N5 vocabulary from CSV into both vocabulary and dictionary tables
 */
const importN5VocabularyFromCSV = async (csvFilePath) => {
  try {
    console.log('🚀 Starting N5 vocabulary import from CSV...');
    
    // Initialize database first
    await initDatabase();
    
    // Check if file exists
    if (!fs.existsSync(csvFilePath)) {
      console.error(`❌ File not found: ${csvFilePath}`);
      return;
    }

    console.log(`📖 Reading CSV file: ${csvFilePath}`);
    
    // Parse CSV data
    const vocabularyData = [];
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv({
          // Handle quotes properly to deal with commas in values
          strict: false,
          escape: '"',
          quote: '"'
        }))
        .on('data', (row) => {
          // CSV has columns: Kanji, Hiragana, Tiếng Việt, Từ loại, JLPT Level
          const kanji = row['Kanji']?.trim();
          const hiragana = row['Hiragana']?.trim();
          const meaning = row['Tiếng Việt']?.trim();
          const category = row['Từ loại']?.trim();
          const jlptLevel = row['JLPT Level']?.trim();
          
          // Validate JLPT level format
          const validJlptLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];
          
          if (hiragana && meaning && category && validJlptLevels.includes(jlptLevel)) {
            vocabularyData.push({
              kanji: kanji || null,
              hiragana,
              meaning,
              category,
              jlptLevel,
              // Generate a simple romaji approximation (you might want to use a proper library)
              romaji: convertToRomaji(hiragana)
            });
          } else {
            console.log(`⚠️ Skipping invalid row: ${hiragana} - JLPT Level: "${jlptLevel}"`);
          }
        })
        .on('end', async () => {
          try {
            console.log(`📊 Found ${vocabularyData.length} vocabulary entries to import`);
            
            await processVocabularyData(vocabularyData);
            console.log('✅ N5 vocabulary import completed successfully!');
            resolve();
            
          } catch (error) {
            console.error('❌ Import processing failed:', error);
            reject(error);
          }
        })
        .on('error', (error) => {
          console.error('❌ CSV parsing failed:', error);
          reject(error);
        });
    });
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
};

/**
 * Process vocabulary data and insert into both tables
 */
const processVocabularyData = async (vocabularyData) => {
  let vocabImported = 0;
  let dictImported = 0;
  let vocabErrors = 0;
  let dictErrors = 0;

  console.log('🗑️ Clearing existing N5 vocabulary data...');
  
  // Clear existing N5 data (keep this flexible for different JLPT levels)
  await runQuery("DELETE FROM vocabulary WHERE jlpt_level LIKE 'N%'");
  await runQuery("DELETE FROM dictionary WHERE jlpt_level LIKE 'N%'");

  console.log('📦 Processing vocabulary entries...');

  // Process in batches
  const batchSize = 50;
  for (let i = 0; i < vocabularyData.length; i += batchSize) {
    const batch = vocabularyData.slice(i, i + batchSize);
    console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vocabularyData.length / batchSize)}`);

    for (const item of batch) {
      // Insert into vocabulary table
      try {
        const vocabInsert = `
          INSERT INTO vocabulary (
            japanese, hiragana, romaji, meaning, category, jlpt_level,
            difficulty, frequency_rank
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await runQuery(vocabInsert, [
          item.kanji || item.hiragana,
          item.hiragana,
          item.romaji,
          item.meaning,
          item.category, // Use actual category from CSV
          item.jlptLevel, // Use actual JLPT level from CSV
          1, // Default difficulty for N5
          null // Frequency rank can be added later
        ]);
        
        vocabImported++;
      } catch (error) {
        console.error(`❌ Error importing vocabulary: ${item.hiragana}`, error.message);
        vocabErrors++;
      }

      // Insert into dictionary table for search functionality
      try {
        const dictInsert = `
          INSERT INTO dictionary (
            entry_id, kanji, kana, romaji, meanings, parts_of_speech,
            jlpt_level, frequency_rank, is_common, tags, examples
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Generate unique entry_id
        const entryId = `n5_${i}_${Date.now()}`;
        
        await runQuery(dictInsert, [
          entryId,
          item.kanji,
          item.hiragana,
          item.romaji,
          JSON.stringify([item.meaning]),
          JSON.stringify([item.category]),
          item.jlptLevel,
          null,
          1, // Mark as common since it's N5
          JSON.stringify(['N5', 'từ vựng cơ bản']),
          JSON.stringify([]) // Examples can be added later
        ]);
        
        dictImported++;
      } catch (error) {
        console.error(`❌ Error importing dictionary: ${item.hiragana}`, error.message);
        dictErrors++;
      }
    }
  }

  // Show statistics
  console.log(`✅ Import completed!`);
  console.log(`📊 Vocabulary Table Statistics:`);
  console.log(`   - Successfully imported: ${vocabImported}`);
  console.log(`   - Errors: ${vocabErrors}`);
  console.log(`📊 Dictionary Table Statistics:`);
  console.log(`   - Successfully imported: ${dictImported}`);
  console.log(`   - Errors: ${dictErrors}`);

  // Show sample data from vocabulary table
  console.log(`📋 Sample vocabulary data:`);
  const vocabSamples = await allQuery('SELECT * FROM vocabulary WHERE jlpt_level = ? LIMIT 5', ['N5']);
  if (vocabSamples && vocabSamples.length > 0) {
    vocabSamples.forEach((sample, idx) => {
      console.log(`   ${idx + 1}. ${sample.japanese} (${sample.hiragana}) - ${sample.meaning}`);
    });
  }

  // Show sample data from dictionary table
  console.log(`📋 Sample dictionary data:`);
  const dictSamples = await allQuery('SELECT * FROM dictionary WHERE jlpt_level = ? LIMIT 5', ['N5']);
  if (dictSamples && dictSamples.length > 0) {
    dictSamples.forEach((sample, idx) => {
      const meanings = JSON.parse(sample.meanings || '[]');
      console.log(`   ${idx + 1}. ${sample.kanji || sample.kana} - ${meanings.join(', ')}`);
    });
  }
};

/**
 * Simple hiragana to romaji conversion (basic implementation)
 * For production, consider using a proper library like kuroshiro or wanakana
 */
const convertToRomaji = (hiragana) => {
  const hiraganaToRomaji = {
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
    'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'だ': 'da', 'ぢ': 'di', 'づ': 'du', 'で': 'de', 'ど': 'do',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
    'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'わ': 'wa', 'ゐ': 'wi', 'ゑ': 'we', 'を': 'wo', 'ん': 'n',
    'ー': '', 'っ': ''
  };

  let result = '';
  for (let i = 0; i < hiragana.length; i++) {
    const char = hiragana[i];
    result += hiraganaToRomaji[char] || char;
  }
  
  return result;
};

// Run import if called directly
if (require.main === module) {
  const csvFilePath = process.argv[2] || path.join(__dirname, '..', 'csv file', 'Tu Vung N5.csv');
  
  console.log('='.repeat(60));
  console.log('📚 N5 Vocabulary CSV Import Tool');
  console.log('='.repeat(60));
  
  importN5VocabularyFromCSV(csvFilePath)
    .then(() => {
      console.log('🎉 Import process finished');
      console.log('📝 Next steps:');
      console.log('   1. Test vocabulary API endpoints');
      console.log('   2. Test dictionary search with N5 vocabulary');
      console.log('   3. Check frontend vocabulary page');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Import process failed:', error);
      process.exit(1);
    });
}

module.exports = { importN5VocabularyFromCSV };