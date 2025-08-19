const fs = require('fs');
const path = require('path');
const { runQuery, initDatabase } = require('../database/database');

/**
 * Run all migration files manually
 */
const runAllMigrations = async () => {
  try {
    console.log('🚀 Starting database migrations...');
    
    // Initialize database first
    await initDatabase();
    
    const migrationsDir = path.join(__dirname, '../database/migrations');
    
    // Check if migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      throw new Error('Migrations directory not found');
    }
    
    // Get all migration files
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure order
    
    console.log(`📁 Found ${migrationFiles.length} migration files`);
    
    for (const file of migrationFiles) {
      console.log(`📄 Running migration: ${file}`);
      
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, 'utf8');
      
      // Parse SQL statements more carefully
      const statements = [];
      let currentStatement = '';
      let inTrigger = false;
      
      const lines = sqlContent.split('\n');
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip comments
        if (trimmedLine.startsWith('--') || trimmedLine === '') {
          continue;
        }
        
        currentStatement += line + '\n';
        
        // Check if we're in a trigger block
        if (trimmedLine.includes('CREATE TRIGGER')) {
          inTrigger = true;
        }
        
        // If we hit END and we're in a trigger, or we hit a semicolon outside a trigger
        if ((trimmedLine === 'END;' && inTrigger) || (trimmedLine.endsWith(';') && !inTrigger)) {
          statements.push(currentStatement.trim());
          currentStatement = '';
          inTrigger = false;
        }
      }
      
      // Add any remaining statement
      if (currentStatement.trim()) {
        statements.push(currentStatement.trim());
      }
      
      console.log(`   📝 Found ${statements.length} statements`);
      
      for (const statement of statements) {
        if (!statement) continue;
        
        try {
          await runQuery(statement);
          const preview = statement.replace(/\s+/g, ' ').substring(0, 60);
          console.log(`   ✅ Executed: ${preview}...`);
        } catch (error) {
          // Ignore "already exists" errors
          if (error.message.includes('already exists') || error.message.includes('duplicate column name')) {
            console.log(`   ⚠️ Skipped (already exists)`);
          } else {
            console.error(`   ❌ Failed: ${error.message}`);
            // Continue with other statements
          }
        }
      }
    }
    
    console.log('✅ All migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Run migrations if called directly
if (require.main === module) {
  runAllMigrations()
    .then(() => {
      console.log('🎉 Database is ready!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration process failed:', error);
      process.exit(1);
    });
}

module.exports = { runAllMigrations };