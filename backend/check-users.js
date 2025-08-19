const { initDatabase, allQuery } = require('./database/database.js');

async function checkUsers() {
  try {
    console.log('🔍 Initializing database...');
    await initDatabase();
    
    console.log('🔍 Checking users in database...');
    
    const users = await allQuery('SELECT id, email, name FROM users LIMIT 10');
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
    } else {
      console.log('✅ Found users:');
      users.forEach(user => {
        console.log(`- ID: ${user.id}, Email: ${user.email}, Name: ${user.name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error.message);
  }
}

checkUsers();