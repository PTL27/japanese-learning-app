const { initDatabase } = require('../database/database');
const migration = require('../database/migrations/006_create_friendships_table');

async function runFriendsMigration() {
  try {
    await initDatabase();
    console.log('🚀 Running friends migration...');
    
    await migration.up();
    
    console.log('✅ Friends migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runFriendsMigration();