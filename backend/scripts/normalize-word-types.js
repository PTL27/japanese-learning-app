const { runQuery, allQuery, initDatabase } = require('../database/database');

/**
 * Normalize word types to have proper capitalization
 * danh từ -> Danh từ, động từ -> Động từ, etc.
 */
const normalizeWordTypes = async () => {
  try {
    console.log('🔄 Starting word type normalization...');
    
    await initDatabase();
    
    // Get all vocabulary entries
    const vocabulary = await allQuery('SELECT * FROM vocabulary');
    
    console.log(`📊 Found ${vocabulary.length} vocabulary entries to process`);
    
    let updated = 0;
    
    for (const word of vocabulary) {
      if (word.category) {
        // Capitalize first letter of each word in category
        const normalizedCategory = word.category
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        // Only update if different
        if (normalizedCategory !== word.category) {
          await runQuery(
            'UPDATE vocabulary SET category = ? WHERE id = ?',
            [normalizedCategory, word.id]
          );
          
          console.log(`✅ Updated: "${word.category}" -> "${normalizedCategory}" (ID: ${word.id})`);
          updated++;
        }
      }
    }
    
    console.log(`🎉 Word type normalization completed!`);
    console.log(`📊 Updated ${updated} entries`);
    
    // Show final statistics
    const finalStats = await allQuery(`
      SELECT category, COUNT(*) as count 
      FROM vocabulary 
      GROUP BY category 
      ORDER BY count DESC
    `);
    
    console.log('\n📈 Final word type distribution:');
    finalStats.forEach(stat => {
      console.log(`   ${stat.category}: ${stat.count}`);
    });
    
  } catch (error) {
    console.error('❌ Error normalizing word types:', error);
    throw error;
  }
};

// Run the normalization
if (require.main === module) {
  normalizeWordTypes()
    .then(() => {
      console.log('✨ Word type normalization finished successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Word type normalization failed:', error);
      process.exit(1);
    });
}

module.exports = { normalizeWordTypes };