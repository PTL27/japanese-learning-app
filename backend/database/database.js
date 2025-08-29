const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './database/japanese_app.db';
const DB_DIR = path.dirname(DB_PATH);

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let db = null;

// Initialize database connection
const initDatabase = async () => {
  try {
    console.log(`🔄 Initializing database connection to ${DB_PATH}`);
    
    // Create database connection with better-sqlite3
    db = new Database(DB_PATH, {
      verbose: process.env.NODE_ENV === 'development' ? console.log : null,
      fileMustExist: false // Allow creating new database if not exists
    });

    // Configure database for better performance (skip WAL for now)
    db.pragma('synchronous = NORMAL');
    db.pragma('cache_size = 1000');
    db.pragma('temp_store = MEMORY');

    console.log(`✅ Connected to SQLite database at ${DB_PATH}`);
    
    // Verify database is working
    const testQuery = db.prepare('SELECT 1 as test');
    const result = testQuery.get();
    if (result?.test === 1) {
      console.log('✅ Database connection verified');
    }

    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
};

// Database helper functions with better performance
const runQuery = (sql, params = []) => {
  try {
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    const stmt = db.prepare(sql);
    const result = stmt.run(params);
    return { 
      id: result.lastInsertRowid, 
      changes: result.changes 
    };
  } catch (error) {
    console.error('Database run query error:', error);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
};

const getQuery = (sql, params = []) => {
  try {
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    const stmt = db.prepare(sql);
    return stmt.get(params);
  } catch (error) {
    console.error('Database get query error:', error);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
};

const allQuery = (sql, params = []) => {
  try {
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    const stmt = db.prepare(sql);
    return stmt.all(params);
  } catch (error) {
    console.error('Database all query error:', error);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
};

// Transaction support for better consistency
const runTransaction = (callback) => {
  try {
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    return db.transaction(callback)();
  } catch (error) {
    console.error('Database transaction error:', error);
    throw error;
  }
};

// Close database connection
const closeDatabase = () => {
  try {
    if (db) {
      db.close();
      console.log('✅ Database connection closed');
    }
  } catch (error) {
    console.error('Error closing database:', error);
  }
};

// Get database info for debugging
const getDatabaseInfo = () => {
  if (!db) {
    return { connected: false };
  }
  
  try {
    return {
      connected: true,
      inTransaction: db.inTransaction,
      readonly: db.readonly,
      name: db.name,
      memory: db.memory
    };
  } catch (error) {
    return { connected: false, error: error.message };
  }
};

// Handle process shutdown gracefully
process.on('exit', closeDatabase);
process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});
process.on('SIGTERM', () => {
  closeDatabase();
  process.exit(0);
});

module.exports = {
  initDatabase,
  closeDatabase,
  runQuery,
  getQuery,
  allQuery,
  runTransaction,
  getDatabaseInfo,
  get db() { return db; }
};