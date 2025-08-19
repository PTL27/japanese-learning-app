const { initDatabase, runQuery } = require('../database/database');

async function addOAuthColumns() {
  try {
    console.log('🔄 Adding OAuth columns to users table...');
    
    await initDatabase();
    
    // Add columns one by one with error handling
    const columns = [
      { name: 'google_id', sql: 'ALTER TABLE users ADD COLUMN google_id TEXT' },
      { name: 'microsoft_id', sql: 'ALTER TABLE users ADD COLUMN microsoft_id TEXT' }, 
      { name: 'auth_provider', sql: "ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'local'" }
    ];
    
    for (const column of columns) {
      try {
        console.log(`📝 Adding ${column.name} column...`);
        await runQuery(column.sql);
        console.log(`✅ Added ${column.name} column successfully`);
      } catch (error) {
        if (error.message.includes('duplicate column name')) {
          console.log(`ℹ️ Column ${column.name} already exists, skipping`);
        } else {
          throw error;
        }
      }
    }
    
    // Add indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)',
      'CREATE INDEX IF NOT EXISTS idx_users_microsoft_id ON users(microsoft_id)',
      'CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider)'
    ];
    
    for (const indexSQL of indexes) {
      try {
        console.log('📝 Creating index...');
        await runQuery(indexSQL);
        console.log('✅ Index created successfully');
      } catch (error) {
        console.log('ℹ️ Index might already exist, continuing...');
      }
    }
    
    console.log('🎉 OAuth database setup completed!');
    
  } catch (error) {
    console.error('❌ Error setting up OAuth columns:', error);
    throw error;
  }
}

addOAuthColumns()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));