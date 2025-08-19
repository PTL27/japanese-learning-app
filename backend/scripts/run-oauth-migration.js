const fs = require('fs');
const path = require('path');
const { initDatabase, runQuery } = require('../database/database');

async function runOAuthMigration() {
  try {
    console.log('🔄 Starting OAuth migration...');
    
    // Initialize database connection
    await initDatabase();
    
    // Read migration file
    const migrationPath = path.join(__dirname, '../database/migrations/006_add_oauth_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split SQL statements and execute each one
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('📝 Executing:', statement.substring(0, 50) + '...');
        await runQuery(statement);
      }
    }
    
    console.log('✅ OAuth migration completed successfully!');
    console.log('🎉 Database now supports Google and Microsoft OAuth!');
    
  } catch (error) {
    console.error('❌ OAuth migration failed:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  runOAuthMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = runOAuthMigration;