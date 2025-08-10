// Database Query Script
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = './database/japanese_learning.db';

function connectDB() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('✅ Connected to SQLite database');
        resolve(db);
      }
    });
  });
}

function runQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

async function main() {
  let db;
  
  try {
    db = await connectDB();
    
    console.log('\n📊 DATABASE OVERVIEW');
    console.log('===================');
    
    // 1. Show all tables
    console.log('\n1️⃣ TABLES:');
    const tables = await runQuery(db, "SELECT name FROM sqlite_master WHERE type='table'");
    tables.forEach(table => console.log(`  - ${table.name}`));
    
    // 2. Show users
    console.log('\n2️⃣ USERS:');
    const users = await runQuery(db, `
      SELECT id, name, email, japanese_level, 
             DATE(created_at) as created_date,
             CASE 
               WHEN datetime(created_at) > datetime('now', '-1 day') THEN '🆕 New'
               ELSE '👤 Regular'
             END as status
      FROM users 
      ORDER BY created_at DESC
    `);
    
    if (users.length === 0) {
      console.log('  📝 Chưa có user nào');
    } else {
      console.table(users);
    }
    
    // 3. Show password resets
    console.log('\n3️⃣ PASSWORD RESETS:');
    const resets = await runQuery(db, `
      SELECT pr.id, u.email, pr.token, 
             datetime(pr.expires_at) as expires_at,
             CASE 
               WHEN pr.used = 1 THEN '✅ Used'
               WHEN datetime(pr.expires_at) < datetime('now') THEN '⏰ Expired' 
               ELSE '🔄 Active'
             END as status
      FROM password_resets pr
      JOIN users u ON pr.user_id = u.id
      ORDER BY pr.created_at DESC
      LIMIT 10
    `);
    
    if (resets.length === 0) {
      console.log('  📝 Chưa có password reset nào');
    } else {
      console.table(resets);
    }
    
    // 4. Show user progress
    console.log('\n4️⃣ USER PROGRESS:');
    const progress = await runQuery(db, `
      SELECT up.id, u.name as user_name, up.category, up.item_id, 
             up.completed, up.score, up.attempts,
             DATE(up.last_attempt_at) as last_attempt
      FROM user_progress up
      JOIN users u ON up.user_id = u.id
      ORDER BY up.updated_at DESC
      LIMIT 10
    `);
    
    if (progress.length === 0) {
      console.log('  📝 Chưa có progress nào');
    } else {
      console.table(progress);
    }
    
    // 5. Statistics
    console.log('\n5️⃣ STATISTICS:');
    const stats = await runQuery(db, `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN datetime(created_at) > datetime('now', '-7 days') THEN 1 END) as new_users_this_week,
        COUNT(CASE WHEN japanese_level = 'N5' THEN 1 END) as n5_users,
        COUNT(CASE WHEN japanese_level = 'N4' THEN 1 END) as n4_users,
        COUNT(CASE WHEN japanese_level = 'N3' THEN 1 END) as n3_users,
        COUNT(CASE WHEN japanese_level = 'N2' THEN 1 END) as n2_users,
        COUNT(CASE WHEN japanese_level = 'N1' THEN 1 END) as n1_users
      FROM users
    `);
    
    console.table(stats);
    
    // 6. Recent activity
    console.log('\n6️⃣ RECENT ACTIVITY:');
    const activity = await runQuery(db, `
      SELECT 
        'User Registration' as activity_type,
        name as details,
        created_at as timestamp
      FROM users
      WHERE datetime(created_at) > datetime('now', '-24 hours')
      
      UNION ALL
      
      SELECT 
        'Password Reset' as activity_type,
        u.email as details,
        pr.created_at as timestamp
      FROM password_resets pr
      JOIN users u ON pr.user_id = u.id
      WHERE datetime(pr.created_at) > datetime('now', '-24 hours')
      
      UNION ALL
      
      SELECT 
        'Learning Progress' as activity_type,
        u.name || ' - ' || up.category as details,
        up.updated_at as timestamp
      FROM user_progress up
      JOIN users u ON up.user_id = u.id
      WHERE datetime(up.updated_at) > datetime('now', '-24 hours')
      
      ORDER BY timestamp DESC
      LIMIT 10
    `);
    
    if (activity.length === 0) {
      console.log('  📝 Không có hoạt động trong 24h qua');
    } else {
      console.table(activity);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('❌ Error closing database:', err.message);
        } else {
          console.log('\n👋 Database connection closed');
        }
      });
    }
  }
}

// Helper functions for specific queries
async function getUserByEmail(email) {
  const db = await connectDB();
  try {
    const user = await runQuery(db, 'SELECT * FROM users WHERE email = ?', [email]);
    console.log('User found:', user[0] || 'No user found');
    return user[0];
  } finally {
    db.close();
  }
}

async function getActiveResetTokens() {
  const db = await connectDB();
  try {
    const tokens = await runQuery(db, `
      SELECT pr.*, u.email 
      FROM password_resets pr 
      JOIN users u ON pr.user_id = u.id 
      WHERE pr.used = FALSE AND datetime(pr.expires_at) > datetime('now')
    `);
    console.table(tokens);
    return tokens;
  } finally {
    db.close();
  }
}

async function clearExpiredTokens() {
  const db = await connectDB();
  try {
    const result = await runQuery(db, `
      DELETE FROM password_resets 
      WHERE datetime(expires_at) < datetime('now')
    `);
    console.log(`🧹 Cleaned up ${result.changes || 0} expired tokens`);
  } finally {
    db.close();
  }
}

// Export functions
module.exports = {
  main,
  getUserByEmail,
  getActiveResetTokens,
  clearExpiredTokens
};

// Run main function if script is executed directly
if (require.main === module) {
  main();
}