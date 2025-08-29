const Database = require('better-sqlite3');
const path = require('path');

async function importVietnameseFromJSON() {
  console.log('🇻🇳 IMPORT VIETNAMESE DATA FROM JSON FILES');
  console.log('=' .repeat(60));
  
  const db = new Database('./database/japanese_app.db');
  
  try {
    // Load JSON data
    console.log('📂 Loading JSON data...');
    const kanjiBank1Path = path.join(__dirname, '../Kanji json/kanji_bank_1.json');
    const kanjiBank2Path = path.join(__dirname, '../Kanji json/kanji_bank_2.json');
    
    const kanjiBank1 = require(kanjiBank1Path);
    const kanjiBank2 = require(kanjiBank2Path);
    
    console.log(`✅ Loaded ${kanjiBank1.length.toLocaleString()} entries from kanji_bank_1.json`);
    console.log(`✅ Loaded ${kanjiBank2.length.toLocaleString()} entries from kanji_bank_2.json`);
    
    const allKanjiData = [...kanjiBank1, ...kanjiBank2];
    console.log(`📊 Total entries to process: ${allKanjiData.length.toLocaleString()}`);
    
    // Check current database state
    const totalKanji = db.prepare('SELECT COUNT(*) as count FROM kanji').get();
    const currentVietnamese = db.prepare(`SELECT COUNT(*) as count FROM kanji WHERE meanings LIKE '%"vi":%'`).get();
    const currentHanViet = db.prepare(`SELECT COUNT(*) as count FROM kanji WHERE name_readings IS NOT NULL AND name_readings != '[]' AND name_readings != 'null'`).get();
    
    console.log(`\n📊 CURRENT DATABASE STATE:`);
    console.log(`   Total kanji in database: ${totalKanji.count.toLocaleString()}`);
    console.log(`   With Vietnamese meanings: ${currentVietnamese.count.toLocaleString()}`);
    console.log(`   With Hán Việt readings: ${currentHanViet.count.toLocaleString()}`);
    
    // Prepare statements for safe updates (won't overwrite existing data)
    const getKanjiStmt = db.prepare('SELECT character, meanings, name_readings FROM kanji WHERE character = ?');
    const updateMeaningsStmt = db.prepare('UPDATE kanji SET meanings = ? WHERE character = ?');
    const updateNameReadingsStmt = db.prepare('UPDATE kanji SET name_readings = ? WHERE character = ?');
    
    let processed = 0;
    let vietnameseMeaningsAdded = 0;
    let hanVietReadingsAdded = 0;
    let skippedAlreadyHasVietnamese = 0;
    let skippedAlreadyHasHanViet = 0;
    let notFoundInDatabase = 0;
    let errors = 0;
    
    console.log('\n🔄 PROCESSING DATA...\n');
    
    // Process each kanji entry
    for (const entry of allKanjiData) {
      try {
        const [kanji, hanVietReadings, , , vietnameseMeanings, metadata] = entry;
        
        // Get existing kanji data from database
        const existingData = getKanjiStmt.get(kanji);
        
        if (!existingData) {
          notFoundInDatabase++;
          continue;
        }
        
        let shouldUpdateMeanings = false;
        let shouldUpdateReadings = false;
        let updatedMeanings = existingData.meanings;
        let updatedNameReadings = existingData.name_readings;
        
        // Process Vietnamese meanings
        if (vietnameseMeanings && vietnameseMeanings.length > 0) {
          let meaningObj = {};
          
          // Parse existing meanings safely
          if (existingData.meanings) {
            try {
              meaningObj = JSON.parse(existingData.meanings);
            } catch (e) {
              meaningObj = {};
            }
          }
          
          // Only add Vietnamese if not already present
          if (!meaningObj.vi || meaningObj.vi.length === 0) {
            // Clean and format Vietnamese meanings
            const cleanVietnameseMeanings = vietnameseMeanings.map(meaning => {
              // Remove [âm] prefix and clean up
              return meaning.replace(/^\[[^\]]+\]\s*/, '').trim();
            }).filter(meaning => meaning.length > 0);
            
            if (cleanVietnameseMeanings.length > 0) {
              meaningObj.vi = cleanVietnameseMeanings;
              updatedMeanings = JSON.stringify(meaningObj);
              shouldUpdateMeanings = true;
              vietnameseMeaningsAdded++;
            }
          } else {
            skippedAlreadyHasVietnamese++;
          }
        }
        
        // Process Hán Việt readings
        if (hanVietReadings && hanVietReadings.trim()) {
          let nameReadings = [];
          
          // Parse existing readings safely
          if (existingData.name_readings && existingData.name_readings !== 'null' && existingData.name_readings !== '[]') {
            try {
              nameReadings = JSON.parse(existingData.name_readings) || [];
            } catch (e) {
              nameReadings = [];
            }
          }
          
          // Check if already has Vietnamese readings
          const hasVietnameseReadings = nameReadings.some(reading => 
            /^[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ\s]+$/.test(reading)
          );
          
          if (!hasVietnameseReadings) {
            // Parse and clean Hán Việt readings
            const hanVietArray = hanVietReadings
              .split(/\s+/)
              .map(reading => reading.trim().toUpperCase())
              .filter(reading => reading.length > 0);
            
            if (hanVietArray.length > 0) {
              // Add to existing readings without duplicates
              const combinedReadings = [...nameReadings, ...hanVietArray];
              const uniqueReadings = [...new Set(combinedReadings)];
              
              updatedNameReadings = JSON.stringify(uniqueReadings);
              shouldUpdateReadings = true;
              hanVietReadingsAdded++;
            }
          } else {
            skippedAlreadyHasHanViet++;
          }
        }
        
        // Update database if needed
        if (shouldUpdateMeanings) {
          updateMeaningsStmt.run(updatedMeanings, kanji);
        }
        
        if (shouldUpdateReadings) {
          updateNameReadingsStmt.run(updatedNameReadings, kanji);
        }
        
        processed++;
        
        // Progress reporting
        if (processed % 1000 === 0) {
          console.log(`   📈 Processed: ${processed.toLocaleString()} | VI meanings added: ${vietnameseMeaningsAdded.toLocaleString()} | HV readings added: ${hanVietReadingsAdded.toLocaleString()}`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing kanji ${entry[0]}:`, error.message);
        errors++;
      }
      
      // Small delay every 500 operations to be respectful
      if (processed % 500 === 0) {
        await new Promise(resolve => setTimeout(resolve, 5));
      }
    }
    
    // Final statistics
    const finalVietnamese = db.prepare(`SELECT COUNT(*) as count FROM kanji WHERE meanings LIKE '%"vi":%'`).get();
    const finalHanViet = db.prepare(`SELECT COUNT(*) as count FROM kanji WHERE name_readings IS NOT NULL AND name_readings != '[]' AND name_readings != 'null' AND name_readings LIKE '%[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]%'`).get();
    
    console.log('\n🎉 IMPORT COMPLETION REPORT:');
    console.log('=' .repeat(50));
    console.log(`✅ Total processed: ${processed.toLocaleString()} entries`);
    console.log(`✅ Vietnamese meanings added: ${vietnameseMeaningsAdded.toLocaleString()} kanji`);
    console.log(`✅ Hán Việt readings added: ${hanVietReadingsAdded.toLocaleString()} kanji`);
    console.log(`⚠️  Already had Vietnamese meanings: ${skippedAlreadyHasVietnamese.toLocaleString()}`);
    console.log(`⚠️  Already had Hán Việt readings: ${skippedAlreadyHasHanViet.toLocaleString()}`);
    console.log(`❓ Not found in database: ${notFoundInDatabase.toLocaleString()}`);
    console.log(`❌ Errors: ${errors}`);
    
    console.log('\n📈 FINAL DATABASE COVERAGE:');
    console.log(`🇻🇳 Total Vietnamese meanings: ${finalVietnamese.count.toLocaleString()} kanji (${((finalVietnamese.count / totalKanji.count) * 100).toFixed(1)}%)`);
    console.log(`📖 Total Hán Việt readings: ${finalHanViet.count.toLocaleString()} kanji (${((finalHanViet.count / totalKanji.count) * 100).toFixed(1)}%)`);
    
    // Show some sample results
    console.log('\n✨ SAMPLE UPDATED KANJI:');
    const sampleUpdated = db.prepare(`
      SELECT character, meanings, name_readings
      FROM kanji 
      WHERE meanings LIKE '%"vi":%' 
      ORDER BY character 
      LIMIT 5
    `).all();
    
    sampleUpdated.forEach((sample, i) => {
      try {
        const meanings = JSON.parse(sample.meanings);
        const nameReadings = JSON.parse(sample.name_readings || '[]');
        
        const en = meanings.en ? meanings.en.slice(0, 2).join(', ') : 'N/A';
        const vi = meanings.vi ? meanings.vi.slice(0, 2).join(', ') : 'N/A';
        const hanViet = nameReadings.filter(r => 
          /^[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ\s]+$/.test(r)
        ).join(', ') || 'N/A';
        
        console.log(`${(i + 1).toString().padStart(2)}. ${sample.character}: EN[${en}] → VI[${vi}] | HV[${hanViet}]`);
      } catch (error) {
        console.log(`${(i + 1).toString().padStart(2)}. ${sample.character}: [Parse error]`);
      }
    });
    
    console.log('\n🚀 Vietnamese data import completed successfully!');
    console.log('💡 Your kanji now have comprehensive Vietnamese meanings and Hán Việt readings!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    throw error;
  } finally {
    db.close();
  }
}

// Run the script
if (require.main === module) {
  importVietnameseFromJSON()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { importVietnameseFromJSON };