const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './database/japanese_learning.db';
const DB_DIR = path.dirname(DB_PATH);

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let db = null;

// Initialize database connection
const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
      } else {
        console.log(`✅ Connected to SQLite database at ${DB_PATH}`);
        createTables()
          .then(() => resolve())
          .catch(reject);
      }
    });
  });
};

// Create tables
const createTables = async () => {
  return new Promise((resolve, reject) => {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        age INTEGER,
        phone TEXT,
        address TEXT,
        japanese_level TEXT DEFAULT 'N5' CHECK(japanese_level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createPasswordResetsTable = `
      CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `;

    const createUserProgressTable = `
      CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category TEXT NOT NULL,
        item_id TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        score INTEGER,
        attempts INTEGER DEFAULT 0,
        last_attempt_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(user_id, category, item_id)
      )
    `;

    const createVocabularyTable = `
      CREATE TABLE IF NOT EXISTS vocabulary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        japanese TEXT NOT NULL,
        hiragana TEXT NOT NULL,
        romaji TEXT NOT NULL,
        meaning TEXT NOT NULL,
        category TEXT NOT NULL,
        jlpt_level TEXT DEFAULT 'N5' CHECK(jlpt_level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
        audio_url TEXT,
        example_sentence_jp TEXT,
        example_sentence_vn TEXT,
        difficulty INTEGER DEFAULT 1 CHECK(difficulty BETWEEN 1 AND 5),
        frequency_rank INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createCharactersTable = `
      CREATE TABLE IF NOT EXISTS characters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        character TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL CHECK(type IN ('hiragana', 'katakana', 'kanji')),
        romaji TEXT NOT NULL,
        sound TEXT NOT NULL,
        stroke_count INTEGER,
        stroke_order TEXT, -- JSON string containing stroke data
        meaning TEXT, -- For kanji
        onyomi TEXT, -- For kanji
        kunyomi TEXT, -- For kanji
        jlpt_level TEXT CHECK(jlpt_level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
        frequency_rank INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createLessonsTable = `
      CREATE TABLE IF NOT EXISTS lessons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL CHECK(type IN ('alphabet', 'vocabulary', 'grammar', 'kanji')),
        jlpt_level TEXT DEFAULT 'N5' CHECK(jlpt_level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
        order_index INTEGER DEFAULT 0,
        content TEXT, -- JSON string containing lesson content
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Execute table creation queries
    db.serialize(() => {
      db.run(createUsersTable, (err) => {
        if (err) {
          console.error('Error creating users table:', err);
          reject(err);
          return;
        }
      });

      db.run(createPasswordResetsTable, (err) => {
        if (err) {
          console.error('Error creating password_resets table:', err);
          reject(err);
          return;
        }
      });

      db.run(createUserProgressTable, (err) => {
        if (err) {
          console.error('Error creating user_progress table:', err);
          reject(err);
          return;
        }
      });

      db.run(createVocabularyTable, (err) => {
        if (err) {
          console.error('Error creating vocabulary table:', err);
          reject(err);
          return;
        }
      });

      db.run(createCharactersTable, (err) => {
        if (err) {
          console.error('Error creating characters table:', err);
          reject(err);
          return;
        }
      });

      db.run(createLessonsTable, (err) => {
        if (err) {
          console.error('Error creating lessons table:', err);
          reject(err);
          return;
        }
        
        console.log('✅ All database tables created successfully');
        resolve();
      });
    });
  });
};

// Database helper functions
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Close database connection
const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Database connection closed');
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
};

module.exports = {
  initDatabase,
  closeDatabase,
  runQuery,
  getQuery,
  allQuery,
  get db() { return db; }
};