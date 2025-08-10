# 🧪 Frontend Testing Guide

## 🌐 Mở Ứng Dụng
Mở http://localhost:3002 trong browser

## 🔍 Debug với Browser DevTools

### 1. Mở DevTools
- Nhấn F12 hoặc Ctrl+Shift+I  
- Chọn tab **Network** để xem API calls
- Chọn tab **Console** để xem logs

### 2. Filter Network Requests
- Trong Network tab, click **XHR** để chỉ xem API calls
- Hoặc search "localhost:5001" để xem requests tới backend

## 📋 Test Cases Manual

### Test Case 1: Đăng Ký User Mới ✅
**Steps:**
1. Click "Đăng ký"
2. Điền form:
   - Tên: Test User Frontend
   - Email: frontend@test.com  
   - Mật khẩu: password123
   - Tuổi: 25
   - Số điện thoại: 0123456789
   - Địa chỉ: Ha Noi
   - Trình độ: N5

**Expected Result:**
- Network tab: POST /api/auth/signup
- Response có token và user info
- Tự động redirect về trang chính
- User menu hiển thị tên user

**Debug Commands (Console):**
```javascript
// Kiểm tra token
localStorage.getItem('jwt_token')

// Kiểm tra user service
console.log(window.userService)
```

### Test Case 2: Đăng Nhập ✅  
**Steps:**
1. Logout (click avatar → Đăng xuất)
2. Click "Đăng nhập" 
3. Nhập email/password đã tạo

**Expected Result:**
- Network tab: POST /api/auth/login
- Redirect về trang chính
- User menu hiển thị đúng thông tin

### Test Case 3: Profile Management ✅
**Steps:**
1. Click avatar → "Thông tin cá nhân"
2. Click "Chỉnh sửa"
3. Thay đổi tên và trình độ
4. Click "Cập nhật"

**Expected Result:**
- Network tab: PUT /api/users/profile  
- Thông báo thành công
- UI cập nhật thông tin mới
- Navigation bar cập nhật tên

### Test Case 4: Đổi Mật Khẩu ✅
**Steps:**
1. Click avatar → "Đổi mật khẩu"
2. Nhập mật khẩu hiện tại và mật khẩu mới
3. Click "Đổi mật khẩu"

**Expected Result:**
- Network tab: PUT /api/users/change-password
- Thông báo thành công
- Test login với mật khẩu mới

### Test Case 5: Forgot Password ✅
**Steps:**
1. Logout
2. Ở trang login, click "Quên mật khẩu"
3. Nhập email
4. Kiểm tra Console log để lấy reset token (development mode)
5. Nhập token và mật khẩu mới

**Expected Result:**
- Network tab: POST /api/auth/forgot-password
- Console log hiển thị reset token
- Network tab: POST /api/auth/reset-password
- Có thể login với mật khẩu mới

## 🐛 Common Issues & Debug

### Issue 1: API Call Failed (Network Error)
```
TypeError: Failed to fetch
```
**Debug Steps:**
1. Kiểm tra backend server chạy: http://localhost:5001/api/health
2. Kiểm tra CORS trong Network tab
3. Kiểm tra .env file có đúng API URL không

### Issue 2: 401 Unauthorized  
```
Token không hợp lệ hoặc đã hết hạn
```
**Debug Steps:**
1. Console: `localStorage.getItem('jwt_token')`
2. Nếu null → cần login lại
3. Nếu có token → có thể đã hết hạn, logout và login lại

### Issue 3: CORS Error
```
Access-Control-Allow-Origin header is missing
```  
**Debug Steps:**
1. Kiểm tra backend/.env: `FRONTEND_URL=http://localhost:3002`
2. Restart backend server
3. Hard refresh browser (Ctrl+F5)

### Issue 4: Form Validation Error
**Debug Steps:**
1. Console tab để xem validation errors
2. Network tab → click request → Response để xem error message
3. Kiểm tra required fields

## 🔧 Advanced Debug Techniques

### 1. Backend Logs
Mở terminal đang chạy backend để xem real-time logs:
- Request logs
- SQL query logs  
- Error stack traces

### 2. Network Tab Analysis
Cho mỗi API request, kiểm tra:
- **Request URL**: Đúng endpoint không?
- **Method**: GET/POST/PUT đúng không?
- **Headers**: Có Authorization header không?
- **Payload**: Data gửi đi đúng format không?
- **Response**: Status code và response body

### 3. Console Commands
```javascript
// Test API trực tiếp
fetch('http://localhost:5001/api/health')
  .then(r => r.json())
  .then(console.log)

// Test với token
fetch('http://localhost:5001/api/users/profile', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('jwt_token') }
})
.then(r => r.json())
.then(console.log)

// Clear all data
localStorage.clear()
location.reload()
```

### 4. React DevTools
Install React Developer Tools extension để:
- Inspect component state
- Xem AuthContext values
- Track re-renders

## 📱 Mobile Testing
1. Mở DevTools
2. Click device toggle (mobile icon)
3. Test responsive navigation
4. Kiểm tra mobile user menu

## ⚡ Performance Testing
1. DevTools → Performance tab
2. Record interaction (login, navigate)
3. Xem có bottlenecks không
4. Kiểm tra bundle size trong Network tab

## 🎯 Production Checklist
- [ ] All API calls work
- [ ] Error handling works  
- [ ] Loading states display
- [ ] Mobile responsive
- [ ] No console errors
- [ ] JWT token expires handling
- [ ] Form validation works
- [ ] Navigation state management