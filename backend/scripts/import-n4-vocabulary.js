const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { runQuery, allQuery, initDatabase } = require('../database/database');

/**
 * Import N4 vocabulary from CSV into both vocabulary and dictionary tables
 */
const importN4VocabularyFromCSV = async (csvFilePath) => {
  try {
    console.log('🚀 Starting N4 vocabulary import from CSV...');
    
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
          separator: ',',
          quote: '"',
          escape: '"'
        }))
        .on('data', (row) => {
          // Clean and validate row data
          const cleanRow = {
            japanese: row.Kanji?.trim() || '',
            hiragana: row.Hiragana?.trim() || '',
            meaning: row['Tiếng Việt']?.trim() || '',
            category: row['Từ loại']?.trim() || '',
            jlpt_level: row['JLPT Level']?.trim() || 'N4'
          };
          
          // Skip rows with missing essential data
          if (cleanRow.hiragana && cleanRow.meaning) {
            vocabularyData.push(cleanRow);
          } else {
            console.log(`⚠️ Skipping incomplete row:`, cleanRow);
          }
        })
        .on('end', async () => {
          try {
            console.log(`📊 Parsed ${vocabularyData.length} vocabulary entries`);
            
            if (vocabularyData.length === 0) {
              console.log('❌ No valid vocabulary data found');
              resolve();
              return;
            }
            
            await processVocabularyData(vocabularyData);
            resolve();
          } catch (error) {
            console.error('❌ Error processing vocabulary data:', error);
            reject(error);
          }
        })
        .on('error', (error) => {
          console.error('❌ Error reading CSV:', error);
          reject(error);
        });
    });

  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
};

/**
 * Process and insert vocabulary data into database
 */
const processVocabularyData = async (vocabularyData) => {
  console.log('💾 Processing vocabulary data...');
  
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  
  for (const vocab of vocabularyData) {
    try {
      // Check if vocabulary already exists (by hiragana as it's unique identifier)
      const existing = await allQuery(
        `SELECT id FROM vocabulary WHERE hiragana = ? AND jlpt_level = ?`,
        [vocab.hiragana, vocab.jlpt_level]
      );
      
      if (existing.length > 0) {
        // Update existing vocabulary
        await runQuery(`
          UPDATE vocabulary 
          SET japanese = ?, meaning = ?, category = ?, updated_at = datetime('now')
          WHERE hiragana = ? AND jlpt_level = ?
        `, [vocab.japanese, vocab.meaning, vocab.category, vocab.hiragana, vocab.jlpt_level]);
        
        updated++;
      } else {
        // Insert new vocabulary - need to provide romaji
        const romaji = vocab.hiragana; // Use hiragana as romaji for now
        await runQuery(`
          INSERT INTO vocabulary (japanese, hiragana, romaji, meaning, category, jlpt_level, created_at)
          VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        `, [vocab.japanese, vocab.hiragana, romaji, vocab.meaning, vocab.category, vocab.jlpt_level]);
        
        inserted++;
      }
      
      // Also add to dictionary table for search functionality
      const existingDict = await allQuery(
        `SELECT id FROM dictionary WHERE word = ?`,
        [vocab.hiragana]
      );
      
      if (existingDict.length === 0) {
        await runQuery(`
          INSERT INTO dictionary (word, reading, meaning, word_type, jlpt_level, created_at)
          VALUES (?, ?, ?, ?, ?, datetime('now'))
        `, [vocab.hiragana, vocab.hiragana, vocab.meaning, vocab.category, vocab.jlpt_level]);
        
        // If has kanji, also add kanji version to dictionary
        if (vocab.japanese && vocab.japanese !== vocab.hiragana) {
          const existingKanjiDict = await allQuery(
            `SELECT id FROM dictionary WHERE word = ?`,
            [vocab.japanese]
          );
          
          if (existingKanjiDict.length === 0) {
            await runQuery(`
              INSERT INTO dictionary (word, reading, meaning, word_type, jlpt_level, created_at)
              VALUES (?, ?, ?, ?, ?, datetime('now'))
            `, [vocab.japanese, vocab.hiragana, vocab.meaning, vocab.category, vocab.jlpt_level]);
          }
        }
      }
      
    } catch (error) {
      console.error(`❌ Error processing vocabulary ${vocab.hiragana}:`, error);
      skipped++;
    }
  }
  
  console.log('✅ N4 Vocabulary import completed!');
  console.log(`📊 Summary:`);
  console.log(`   • Inserted: ${inserted} new vocabulary entries`);
  console.log(`   • Updated: ${updated} existing entries`);
  console.log(`   • Skipped: ${skipped} entries due to errors`);
  console.log(`   • Total processed: ${inserted + updated + skipped}/${vocabularyData.length}`);
};

// Run the import
const csvFilePath = path.join(__dirname, '..', 'csv file', 'Tu Vung N4.csv');

if (require.main === module) {
  importN4VocabularyFromCSV(csvFilePath)
    .then(() => {
      console.log('🎉 N4 vocabulary import finished successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 N4 vocabulary import failed:', error);
      process.exit(1);
    });
}

module.exports = { importN4VocabularyFromCSV };