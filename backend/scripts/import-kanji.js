const fs = require('fs');
const path = require('path');
const { runQuery, allQuery, initDatabase } = require('../database/database');

/**
 * Import Kanji dictionary data into the database
 * This script expects a simplified JSON file with kanji entries
 * Format: { kanji: [{ character, meanings, on_readings, kun_readings, etc }] }
 */

const importKanjiData = async (jsonFilePath) => {
  try {
    console.log('🚀 Starting kanji data import...');
    
    // Initialize database first
    await initDatabase();
    
    // Check if file exists
    if (!fs.existsSync(jsonFilePath)) {
      console.error(`❌ File not found: ${jsonFilePath}`);
      console.log('📝 Please create a JSON file with the following structure:');
      console.log(JSON.stringify({
        kanji: [
          {
            character: "水",
            meanings: ["water"],
            on_readings: ["スイ"],
            kun_readings: ["みず"],
            name_readings: [],
            stroke_count: 4,
            radical: "水",
            radical_name: "water",
            jlpt_level: 5,
            grade_level: 1,
            frequency_rank: 100,
            unicode: "U+6C34",
            components: ["水"],
            variants: [],
            examples: [
              {
                word: "水道",
                reading: "すいどう",
                meaning: "water supply"
              }
            ],
            tags: ["elementary", "basic"]
          }
        ]
      }, null, 2));
      return;
    }

    // Read and parse JSON file
    console.log(`📖 Reading file: ${jsonFilePath}`);
    const fileContent = fs.readFileSync(jsonFilePath, 'utf8');
    const data = JSON.parse(fileContent);

    if (!data.kanji || !Array.isArray(data.kanji)) {
      throw new Error('Invalid JSON format. Expected { kanji: [...] }');
    }

    console.log(`📊 Found ${data.kanji.length} kanji to import`);

    // Clear existing data
    const clearQuery = 'DELETE FROM kanji';
    await runQuery(clearQuery);
    console.log('🗑️ Cleared existing kanji data');

    // Import kanji in batches
    const batchSize = 50;
    let imported = 0;
    let errors = 0;

    for (let i = 0; i < data.kanji.length; i += batchSize) {
      const batch = data.kanji.slice(i, i + batchSize);
      
      console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(data.kanji.length / batchSize)}`);

      for (const kanji of batch) {
        try {
          // Validate required fields
          if (!kanji.character || !kanji.meanings) {
            console.warn(`⚠️ Skipping invalid kanji: ${JSON.stringify(kanji)}`);
            errors++;
            continue;
          }

          // Validate character is single kanji
          if (kanji.character.length !== 1) {
            console.warn(`⚠️ Skipping multi-character entry: ${kanji.character}`);
            errors++;
            continue;
          }

          // Insert kanji
          const insertQuery = `
            INSERT INTO kanji (
              character, meanings, on_readings, kun_readings, name_readings,
              stroke_count, radical, radical_name, jlpt_level, grade_level,
              frequency_rank, unicode, components, variants, examples, tags
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          await runQuery(insertQuery, [
            kanji.character,
            JSON.stringify(kanji.meanings || []),
            JSON.stringify(kanji.on_readings || []),
            JSON.stringify(kanji.kun_readings || []),
            JSON.stringify(kanji.name_readings || []),
            kanji.stroke_count || null,
            kanji.radical || null,
            kanji.radical_name || null,
            kanji.jlpt_level || null,
            kanji.grade_level || null,
            kanji.frequency_rank || null,
            kanji.unicode || null,
            JSON.stringify(kanji.components || []),
            JSON.stringify(kanji.variants || []),
            JSON.stringify(kanji.examples || []),
            JSON.stringify(kanji.tags || [])
          ]);

          imported++;

        } catch (err) {
          console.error(`❌ Error importing kanji ${kanji.character}:`, err.message);
          errors++;
        }
      }
    }

    console.log(`✅ Import completed!`);
    console.log(`📊 Statistics:`);
    console.log(`   - Total kanji: ${data.kanji.length}`);
    console.log(`   - Successfully imported: ${imported}`);
    console.log(`   - Errors: ${errors}`);

    // Show sample data
    const sampleQuery = 'SELECT * FROM kanji LIMIT 3';
    const samples = await allQuery(sampleQuery);
    console.log(`📋 Sample imported kanji:`);
    if (samples && samples.length > 0) {
      samples.forEach((sample, idx) => {
        const meanings = JSON.parse(sample.meanings || '[]');
        console.log(`   ${idx + 1}. ${sample.character} - ${meanings.join(', ')}`);
      });
    }

    // Show statistics by JLPT level
    const statsQuery = `
      SELECT jlpt_level, COUNT(*) as count
      FROM kanji 
      WHERE jlpt_level IS NOT NULL
      GROUP BY jlpt_level
      ORDER BY jlpt_level
    `;
    const stats = await allQuery(statsQuery);
    
    console.log(`📈 JLPT Level Distribution:`);
    if (stats && stats.length > 0) {
      stats.forEach(stat => {
        console.log(`   - JLPT N${stat.jlpt_level}: ${stat.count} kanji`);
      });
    }

  } catch (error) {
    console.error('❌ Import failed:', error);
  }
};

// Run import if called directly
if (require.main === module) {
  const jsonFilePath = process.argv[2] || path.join(__dirname, 'data', 'kanji.json');
  
  console.log('='.repeat(60));
  console.log('🈵 Kanji Dictionary Data Import Tool');
  console.log('='.repeat(60));
  
  importKanjiData(jsonFilePath)
    .then(() => {
      console.log('🎉 Import process finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Import process failed:', error);
      process.exit(1);
    });
}

module.exports = { importKanjiData };