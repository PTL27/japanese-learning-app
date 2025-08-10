# Debug Guide - Japanese Learning App

## 🚀 Cách Khởi Động Ứng Dụng

### Backend Server
```bash
cd "C:\Users\lucpt\OneDrive\Desktop\japanese-learning-app\backend"
npm run dev
```
Server sẽ chạy tại: http://localhost:5001

### Frontend React App
```bash
cd "C:\Users\lucpt\OneDrive\Desktop\japanese-learning-app"
PORT=3002 npm start
```
App sẽ chạy tại: http://localhost:3002

## 🔍 Debug Frontend với Browser DevTools

### 1. Mở Browser DevTools
- Mở http://localhost:3002
- Nhấn F12 hoặc Ctrl+Shift+I
- Vào tab Console để xem logs
- Vào tab Network để xem API calls

### 2. Theo Dõi API Calls
- Trong Network tab, filter theo "XHR" hoặc "Fetch"
- Khi bạn login/signup, sẽ thấy các request đến API
- Click vào từng request để xem:
  - Request headers (có Authorization token không?)
  - Request payload (data gửi đi)
  - Response (data server trả về)

### 3. Kiểm Tra Authentication State
Trong Console tab, gõ:
```javascript
// Kiểm tra token trong localStorage
localStorage.getItem('jwt_token')

// Kiểm tra user service
window.userService = require('./src/services/userService').userService
await window.userService.getCurrentUser()
```

## 🧪 Test Manual Flows

### Flow 1: Đăng Ký User Mới
1. Mở http://localhost:3002
2. Nhấn "Đăng ký" 
3. Điền form với thông tin hợp lệ
4. Kiểm tra Network tab - thấy POST /api/auth/signup
5. Sau khi thành công, user sẽ tự động đăng nhập

### Flow 2: Đăng Nhập
1. Nhấn "Đăng nhập"
2. Nhập email/password đã tạo
3. Kiểm tra Network tab - thấy POST /api/auth/login
4. Sau khi thành công, redirect về trang chính

### Flow 3: Forgot Password
1. Ở trang login, nhấn "Quên mật khẩu"
2. Nhập email
3. Server sẽ generate token (trong development mode sẽ trả về token)
4. Nhập token và mật khẩu mới
5. Test login với mật khẩu mới

### Flow 4: Profile Management
1. Sau khi đăng nhập, click vào avatar (góc trên phải)
2. Chọn "Thông tin cá nhân"
3. Chỉnh sửa thông tin và save
4. Kiểm tra Network tab - thấy PUT /api/users/profile

## 📊 Kiểm Tra Database

### 1. Sử dụng SQLite Browser (Khuyến nghị)
- Tải DB Browser for SQLite: https://sqlitebrowser.org/
- Mở file: `C:\Users\lucpt\OneDrive\Desktop\japanese-learning-app\backend\database\japanese_learning.db`

### 2. Sử dụng Command Line
```bash
# Vào thư mục backend
cd "C:\Users\lucpt\OneDrive\Desktop\japanese-learning-app\backend"

# Mở SQLite CLI
sqlite3 database/japanese_learning.db

# Các câu lệnh SQLite hữu ích:
.tables                          # Liệt kê tất cả bảng
.schema users                    # Xem cấu trúc bảng users
SELECT * FROM users;             # Xem tất cả users
SELECT * FROM password_resets;   # Xem password reset tokens
SELECT * FROM user_progress;     # Xem tiến trình học tập

# Thoát
.quit
```

### 3. Query Hữu Ích

```sql
-- Xem thông tin user
SELECT id, name, email, japanese_level, created_at FROM users;

-- Xem password reset tokens (để debug forgot password)
SELECT pr.*, u.email 
FROM password_resets pr 
JOIN users u ON pr.user_id = u.id 
WHERE pr.used = FALSE;

-- Xem tiến trình học tập của user
SELECT up.*, u.name 
FROM user_progress up 
JOIN users u ON up.user_id = u.id;

-- Xem thống kê users theo level
SELECT japanese_level, COUNT(*) as count 
FROM users 
GROUP BY japanese_level;
```

## 🐛 Common Issues & Solutions

### Issue 1: CORS Error
```
Access to fetch at 'http://localhost:5001/api/auth/login' from origin 'http://localhost:3002' has been blocked by CORS policy
```
**Solution:** Kiểm tra FRONTEND_URL trong backend/.env phải match với port của React app

### Issue 2: 401 Unauthorized
```
Token không hợp lệ hoặc đã hết hạn
```
**Solution:** 
- Kiểm tra localStorage có jwt_token không
- Token có thể đã hết hạn (7 ngày)
- Logout và login lại

### Issue 3: Database Connection Error
```
Error opening database
```
**Solution:**
- Kiểm tra file database/japanese_learning.db có tồn tại không
- Kiểm tra quyền write vào thư mục database/

## 📝 Debug Tips

### 1. Backend Debug
- Xem server logs trong terminal
- Thêm console.log trong routes để trace
- Sử dụng Postman hoặc curl để test API trực tiếp

### 2. Frontend Debug  
- Sử dụng React DevTools extension
- Console.log trong useAuth hook
- Kiểm tra state trong React components

### 3. Database Debug
- Luôn backup database trước khi test
- Sử dụng transaction để rollback nếu cần
- Monitor database file size để detect memory leaks

## 🚨 Production Notes

Khi deploy production:
1. Đổi JWT_SECRET trong .env
2. Đổi NODE_ENV=production
3. Setup proper email service cho forgot password
4. Sử dụng PostgreSQL thay vì SQLite
5. Setup proper logging system