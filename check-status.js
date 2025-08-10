// Status Check Script
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 KIỂM TRA STATUS HỆ THỐNG');
console.log('===========================\n');

// 1. Check if servers are running
console.log('1️⃣ CHECKING SERVERS...');
try {
  // Check backend (port 5001)
  try {
    const backendHealth = execSync('curl -s http://localhost:5001/api/health', { encoding: 'utf8' });
    const healthData = JSON.parse(backendHealth);
    console.log('✅ Backend Server (5001):', healthData.status);
  } catch (error) {
    console.log('❌ Backend Server (5001): Không chạy hoặc không thể truy cập');
    console.log('   👉 Chạy: cd backend && npm run dev');
  }

  // Check frontend (port 3002) 
  try {
    const frontendCheck = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3002', { encoding: 'utf8' });
    if (frontendCheck === '200') {
      console.log('✅ Frontend App (3002): Đang chạy');
    } else {
      console.log('❌ Frontend App (3002): Status code', frontendCheck);
    }
  } catch (error) {
    console.log('❌ Frontend App (3002): Không chạy hoặc không thể truy cập');
    console.log('   👉 Chạy: PORT=3002 npm start');
  }
} catch (error) {
  console.log('❌ Không thể kiểm tra servers (có thể thiếu curl)');
}

console.log('');

// 2. Check database
console.log('2️⃣ CHECKING DATABASE...');
const dbPath = path.join(__dirname, 'backend', 'database', 'japanese_learning.db');
if (fs.existsSync(dbPath)) {
  const stats = fs.statSync(dbPath);
  console.log('✅ Database file:', path.basename(dbPath));
  console.log('   📏 Size:', Math.round(stats.size / 1024), 'KB');
  console.log('   🕒 Modified:', stats.mtime.toLocaleString());
} else {
  console.log('❌ Database file không tồn tại:', dbPath);
  console.log('   👉 Chạy backend server để tạo database tự động');
}

console.log('');

// 3. Check environment files
console.log('3️⃣ CHECKING ENVIRONMENT...');
const backendEnv = path.join(__dirname, 'backend', '.env');
const frontendEnv = path.join(__dirname, '.env');

if (fs.existsSync(backendEnv)) {
  console.log('✅ Backend .env:', 'Tồn tại');
  const envContent = fs.readFileSync(backendEnv, 'utf8');
  const portMatch = envContent.match(/PORT=(\d+)/);
  const frontendUrlMatch = envContent.match(/FRONTEND_URL=(.+)/);
  if (portMatch) console.log('   🚪 Port:', portMatch[1]);
  if (frontendUrlMatch) console.log('   🌐 Frontend URL:', frontendUrlMatch[1]);
} else {
  console.log('❌ Backend .env: Không tồn tại');
}

if (fs.existsSync(frontendEnv)) {
  console.log('✅ Frontend .env:', 'Tồn tại');
  const envContent = fs.readFileSync(frontendEnv, 'utf8');
  const apiUrlMatch = envContent.match(/REACT_APP_API_URL=(.+)/);
  if (apiUrlMatch) console.log('   🔗 API URL:', apiUrlMatch[1]);
} else {
  console.log('❌ Frontend .env: Không tồn tại');
}

console.log('');

// 4. Check package.json dependencies
console.log('4️⃣ CHECKING DEPENDENCIES...');
const backendPackage = path.join(__dirname, 'backend', 'package.json');
const frontendPackage = path.join(__dirname, 'package.json');

if (fs.existsSync(backendPackage)) {
  const pkg = JSON.parse(fs.readFileSync(backendPackage, 'utf8'));
  console.log('✅ Backend dependencies:', Object.keys(pkg.dependencies || {}).length);
} else {
  console.log('❌ Backend package.json: Không tồn tại');
}

if (fs.existsSync(frontendPackage)) {
  const pkg = JSON.parse(fs.readFileSync(frontendPackage, 'utf8'));
  console.log('✅ Frontend dependencies:', Object.keys(pkg.dependencies || {}).length);
} else {
  console.log('❌ Frontend package.json: Không tồn tại');
}

console.log('');

// 5. Usage instructions
console.log('📋 HƯỚNG DẪN SỬ DỤNG:');
console.log('=====================');
console.log('');
console.log('🚀 Khởi động hệ thống:');
console.log('  1. Backend:  cd backend && npm run dev');
console.log('  2. Frontend: PORT=3002 npm start');
console.log('');
console.log('🧪 Test API:');
console.log('  node test-api.js');
console.log('');
console.log('🔍 Xem database:');
console.log('  cd backend && node scripts/db-query.js');
console.log('');
console.log('🌐 URLs:');
console.log('  - Frontend: http://localhost:3002');
console.log('  - Backend API: http://localhost:5001/api');
console.log('  - Health Check: http://localhost:5001/api/health');
console.log('');
console.log('🛠️ Debug:');
console.log('  - Browser DevTools (F12) để xem Network tab');
console.log('  - Backend logs trong terminal');
console.log('  - Database browser: https://sqlitebrowser.org/');