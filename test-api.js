// Test API Script - Chạy với Node.js
const API_BASE = 'http://localhost:5001/api';

async function testAPI() {
  console.log('🧪 Bắt đầu test API...\n');
  
  let token = '';
  
  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await fetch(`${API_BASE.replace('/api', '')}/api/health`);
    const health = await healthResponse.json();
    console.log('✅ Health:', health);
    console.log('');

    // Test 2: Signup
    console.log('2️⃣ Testing Signup...');
    const signupData = {
      name: 'Test User ' + Date.now(),
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      age: 25,
      japaneseLevel: 'N5'
    };
    
    const signupResponse = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData)
    });
    
    const signupResult = await signupResponse.json();
    if (signupResult.success) {
      console.log('✅ Signup thành công:', signupResult.user.name);
      token = signupResult.token;
      console.log('🔑 Token:', token.substring(0, 20) + '...');
    } else {
      console.log('❌ Signup failed:', signupResult.message);
    }
    console.log('');

    // Test 3: Login
    console.log('3️⃣ Testing Login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: signupData.email,
        password: signupData.password
      })
    });
    
    const loginResult = await loginResponse.json();
    if (loginResult.success) {
      console.log('✅ Login thành công:', loginResult.user.name);
      token = loginResult.token;
    } else {
      console.log('❌ Login failed:', loginResult.message);
    }
    console.log('');

    // Test 4: Get Profile
    console.log('4️⃣ Testing Get Profile...');
    const profileResponse = await fetch(`${API_BASE}/users/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const profileResult = await profileResponse.json();
    if (profileResult.success) {
      console.log('✅ Get Profile thành công:', profileResult.user);
    } else {
      console.log('❌ Get Profile failed:', profileResult.message);
    }
    console.log('');

    // Test 5: Update Profile
    console.log('5️⃣ Testing Update Profile...');
    const updateResponse = await fetch(`${API_BASE}/users/profile`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Updated Name',
        age: 26,
        japaneseLevel: 'N4'
      })
    });
    
    const updateResult = await updateResponse.json();
    if (updateResult.success) {
      console.log('✅ Update Profile thành công:', updateResult.user.name);
    } else {
      console.log('❌ Update Profile failed:', updateResult.message);
    }
    console.log('');

    // Test 6: Forgot Password
    console.log('6️⃣ Testing Forgot Password...');
    const forgotResponse = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: signupData.email })
    });
    
    const forgotResult = await forgotResponse.json();
    if (forgotResult.success) {
      console.log('✅ Forgot Password thành công');
      if (forgotResult.resetToken) {
        console.log('🔢 Reset Token (dev mode):', forgotResult.resetToken);
        
        // Test 7: Reset Password
        console.log('\n7️⃣ Testing Reset Password...');
        const resetResponse = await fetch(`${API_BASE}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: signupData.email,
            token: forgotResult.resetToken,
            newPassword: 'newpassword123'
          })
        });
        
        const resetResult = await resetResponse.json();
        if (resetResult.success) {
          console.log('✅ Reset Password thành công');
        } else {
          console.log('❌ Reset Password failed:', resetResult.message);
        }
      }
    } else {
      console.log('❌ Forgot Password failed:', forgotResult.message);
    }
    console.log('');

    console.log('🎉 Tất cả tests đã hoàn thành!');
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

// Chạy test nếu file này được execute trực tiếp
if (require.main === module) {
  // Cần cài đặt node-fetch cho Node.js versions < 18
  global.fetch = global.fetch || require('node-fetch');
  testAPI();
}

module.exports = { testAPI };