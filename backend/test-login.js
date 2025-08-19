const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('🔍 Testing login API...');
    
    const response = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('Response body:', data);
    
    if (response.ok) {
      console.log('✅ Login API is working');
    } else {
      console.log('❌ Login API failed');
    }
    
  } catch (error) {
    console.error('❌ Error testing login:', error.message);
    console.error('❌ Full error:', error);
  }
}

testLogin();