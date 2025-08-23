const { initDatabase, runQuery, getQuery } = require('../database/database');

async function fixOAuthUsers() {
  try {
    await initDatabase();
    
    console.log('🔧 Making password_hash nullable for OAuth users...');
    
    // Check if we need to update the schema
    const tableInfo = await runQuery("PRAGMA table_info(users)");
    console.log('Current users table schema:', tableInfo);
    
    // Since SQLite doesn't support ALTER COLUMN directly, we need to:
    // 1. Create a new table with the correct schema
    // 2. Copy data from old table
    // 3. Drop old table and rename new table
    
    console.log('📋 Step 1: Creating new users table with nullable password_hash...');
    
    await runQuery(`
      CREATE TABLE IF NOT EXISTS users_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        age INTEGER,
        phone TEXT,
        address TEXT,
        japanese_level TEXT DEFAULT 'N5' CHECK(japanese_level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
        google_id TEXT,
        microsoft_id TEXT,
        auth_provider TEXT DEFAULT 'local',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('📋 Step 2: Copying existing data...');
    
    // Copy existing data to new table
    await runQuery(`
      INSERT INTO users_new (id, name, email, password_hash, age, phone, address, japanese_level, google_id, microsoft_id, auth_provider, created_at, updated_at)
      SELECT id, name, email, password_hash, age, phone, address, japanese_level, google_id, microsoft_id, auth_provider, created_at, updated_at
      FROM users
    `);
    
    console.log('📋 Step 3: Dropping old table and renaming new table...');
    
    await runQuery('DROP TABLE users');
    await runQuery('ALTER TABLE users_new RENAME TO users');
    
    console.log('✅ Successfully updated users table schema!');
    console.log('✅ password_hash is now nullable for OAuth users');
    
    // Test the fix by checking the schema
    const newTableInfo = await runQuery("PRAGMA table_info(users)");
    console.log('Updated users table schema:', newTableInfo);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error fixing OAuth users table:', error);
    process.exit(1);
  }
}

fixOAuthUsers();