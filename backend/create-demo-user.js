const { initDatabase, runQuery, getQuery } = require('./database/database.js');
const bcrypt = require('bcryptjs');

async function createDemoUser() {
  try {
    console.log('🔍 Initializing database...');
    await initDatabase();
    
    const email = 'demo@example.com';
    const password = 'demo123';
    
    // Check if user already exists
    const existingUser = await getQuery('SELECT id FROM users WHERE email = ?', [email]);
    
    if (existingUser) {
      console.log('✅ Demo user already exists');
      return;
    }
    
    // Create new demo user
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await runQuery(
      'INSERT INTO users (name, email, password_hash, japanese_level) VALUES (?, ?, ?, ?)',
      ['Demo User', email, hashedPassword, 'N5']
    );
    
    console.log('✅ Demo user created successfully with ID:', result.id);
    console.log('📧 Email:', email);
    console.log('🔐 Password:', password);
    
  } catch (error) {
    console.error('❌ Error creating demo user:', error.message);
  }
}

createDemoUser();