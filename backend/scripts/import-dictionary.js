const fs = require('fs');
const path = require('path');
const { runQuery, allQuery, initDatabase } = require('../database/database');

/**
 * Import JMdict dictionary data into the database
 * This script expects a simplified JSON file with dictionary entries
 * Format: { entries: [{ entry_id, kanji, kana, meanings, parts_of_speech, etc }] }
 */

const importDictionaryData = async (jsonFilePath) => {
  try {
    console.log('🚀 Starting dictionary data import...');
    
    // Initialize database first
    await initDatabase();
    
    // Check if file exists
    if (!fs.existsSync(jsonFilePath)) {
      console.error(`❌ File not found: ${jsonFilePath}`);
      console.log('📝 Please create a JSON file with the following structure:');
      console.log(JSON.stringify({
        entries: [
          {
            entry_id: "1234567",
            kanji: "水",
            kana: "みず",
            romaji: "mizu",
            meanings: ["water"],
            parts_of_speech: ["noun"],
            jlpt_level: "N5",
            frequency_rank: 100,
            is_common: true,
            tags: ["basic"],
            examples: [
              {
                japanese: "水を飲む",
                reading: "みずをのむ",
                meaning: "drink water"
              }
            ]
          }
        ]
      }, null, 2));
      return;
    }

    // Read and parse JSON file
    console.log(`📖 Reading file: ${jsonFilePath}`);
    const fileContent = fs.readFileSync(jsonFilePath, 'utf8');
    const data = JSON.parse(fileContent);

    if (!data.entries || !Array.isArray(data.entries)) {
      throw new Error('Invalid JSON format. Expected { entries: [...] }');
    }

    console.log(`📊 Found ${data.entries.length} entries to import`);

    // Clear existing data
    const clearQuery = 'DELETE FROM dictionary';
    await runQuery(clearQuery);
    console.log('🗑️ Cleared existing dictionary data');

    // Import entries in batches
    const batchSize = 100;
    let imported = 0;
    let errors = 0;

    for (let i = 0; i < data.entries.length; i += batchSize) {
      const batch = data.entries.slice(i, i + batchSize);
      
      console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(data.entries.length / batchSize)}`);

      for (const entry of batch) {
        try {
          // Validate required fields
          if (!entry.entry_id || !entry.meanings) {
            console.warn(`⚠️ Skipping invalid entry: ${JSON.stringify(entry)}`);
            errors++;
            continue;
          }

          // Insert entry
          const insertQuery = `
            INSERT INTO dictionary (
              entry_id, kanji, kana, romaji, meanings, parts_of_speech,
              jlpt_level, frequency_rank, is_common, tags, examples
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          await runQuery(insertQuery, [
            entry.entry_id,
            entry.kanji || null,
            entry.kana || null,
            entry.romaji || null,
            JSON.stringify(entry.meanings || []),
            JSON.stringify(entry.parts_of_speech || []),
            entry.jlpt_level || null,
            entry.frequency_rank || null,
            entry.is_common ? 1 : 0,
            JSON.stringify(entry.tags || []),
            JSON.stringify(entry.examples || [])
          ]);

          imported++;

        } catch (err) {
          console.error(`❌ Error importing entry ${entry.entry_id}:`, err.message);
          errors++;
        }
      }
    }

    console.log(`✅ Import completed!`);
    console.log(`📊 Statistics:`);
    console.log(`   - Total entries: ${data.entries.length}`);
    console.log(`   - Successfully imported: ${imported}`);
    console.log(`   - Errors: ${errors}`);

    // Show sample data
    const sampleQuery = 'SELECT * FROM dictionary LIMIT 3';
    const samples = await allQuery(sampleQuery);
    console.log(`📋 Sample imported data:`);
    if (samples && samples.length > 0) {
      samples.forEach((sample, idx) => {
        console.log(`   ${idx + 1}. ${sample.kanji || sample.kana} - ${sample.meanings}`);
      });
    }

  } catch (error) {
    console.error('❌ Import failed:', error);
  }
};

// Run import if called directly
if (require.main === module) {
  const jsonFilePath = process.argv[2] || path.join(__dirname, 'data', 'dictionary.json');
  
  console.log('='.repeat(60));
  console.log('📚 JMdict Dictionary Data Import Tool');
  console.log('='.repeat(60));
  
  importDictionaryData(jsonFilePath)
    .then(() => {
      console.log('🎉 Import process finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Import process failed:', error);
      process.exit(1);
    });
}

module.exports = { importDictionaryData };