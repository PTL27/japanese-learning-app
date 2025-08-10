# 🌸 Japanese Learning App - Complete Guide

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────┐    HTTP API    ┌─────────────────┐    SQLite    ┌──────────────┐
│   React App     │◄──────────────►│  Node.js API    │◄────────────►│   Database   │
│   (Port 3002)   │    JWT Auth    │   (Port 5001)   │              │              │
└─────────────────┘                └─────────────────┘              └──────────────┘
```

## 🚀 Quick Start

### 1. Khởi Động Backend
```bash
cd backend
npm install
npm run dev
```
✅ Server chạy tại: http://localhost:5001

### 2. Khởi Động Frontend  
```bash
# Ở thư mục root
npm install
PORT=3002 npm start
```  
✅ App chạy tại: http://localhost:3002

### 3. Kiểm Tra Status
```bash
node check-status.js
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/signup` - Đăng ký
- `POST /api/auth/login` - Đăng nhập  
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu
- `GET /api/auth/verify` - Xác thực token

### User Management (Cần JWT token)
- `GET /api/users/profile` - Lấy profile
- `PUT /api/users/profile` - Cập nhật profile
- `PUT /api/users/change-password` - Đổi mật khẩu
- `GET /api/users/progress` - Lấy tiến trình học
- `PUT /api/users/progress` - Cập nhật tiến trình
- `GET /api/users/stats` - Thống kê user

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  age INTEGER,
  phone TEXT,
  address TEXT,
  japanese_level TEXT DEFAULT 'N5', -- N5, N4, N3, N2, N1
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Password Resets Table  
```sql
CREATE TABLE password_resets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### User Progress Table
```sql  
CREATE TABLE user_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  category TEXT NOT NULL, -- 'hiragana', 'katakana', 'vocabulary', etc.
  item_id TEXT NOT NULL,  -- Character or word ID
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER,          -- 0-100
  attempts INTEGER DEFAULT 0,
  last_attempt_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  UNIQUE(user_id, category, item_id)
);
```

## 🛠️ Development Tools

### API Testing
```bash
# Test tất cả endpoints
node test-api.js

# Test individual endpoint
curl -X GET http://localhost:5001/api/health
```

### Database Operations
```bash
# Xem data trong database
cd backend && node scripts/db-query.js

# SQLite CLI
sqlite3 backend/database/japanese_learning.db
```

### Debug Frontend
1. Mở http://localhost:3002
2. F12 → Network tab → XHR filter
3. Xem API calls khi interact với app

## 📁 Project Structure

```
japanese-learning-app/
├── src/                          # Frontend React code
│   ├── components/
│   │   ├── auth/                 # Login, Signup, ForgotPassword
│   │   ├── profile/              # ProfilePage  
│   │   ├── AlphabetPage.js       # Hiragana/Katakana learning
│   │   ├── VocabularyPage.js     # N5 vocabulary
│   │   └── QuizPage.js           # Interactive quiz
│   ├── contexts/
│   │   └── AuthContext.js        # Authentication state
│   ├── services/
│   │   └── userService.js        # API client
│   └── utils/
│       └── japaneseData.js       # Learning content data
├── backend/
│   ├── routes/
│   │   ├── auth.js               # Authentication endpoints
│   │   └── users.js              # User management endpoints
│   ├── database/
│   │   └── database.js           # SQLite setup & helpers
│   ├── scripts/
│   │   └── db-query.js           # Database query utility
│   ├── .env                      # Backend environment variables
│   └── server.js                 # Express server
├── debug-guide.md                # Comprehensive debug guide
├── frontend-test-guide.md        # Frontend testing guide
├── test-api.js                   # API testing script
└── check-status.js               # System status checker
```

## 🔒 Security Features

- ✅ **Password Hashing**: bcryptjs với salt rounds 12
- ✅ **JWT Authentication**: 7 days expiry  
- ✅ **Input Validation**: express-validator
- ✅ **Rate Limiting**: 100 requests per 15 minutes
- ✅ **CORS Protection**: Restricted to frontend URL
- ✅ **Helmet Security**: HTTP headers protection
- ✅ **SQL Injection Protection**: Parameterized queries

## 🚀 Production Deployment

### Environment Variables
```bash
# Backend (.env)
NODE_ENV=production
PORT=5001
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=your-super-secret-key-256-bits
DB_PATH=./database/production.db
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend (.env)  
REACT_APP_API_URL=https://api.yourdomain.com
```

### Build Commands
```bash
# Frontend production build
npm run build

# Backend production start
cd backend && npm start
```

### Database Migration
```bash
# Backup existing data
cp backend/database/japanese_learning.db backup_$(date +%Y%m%d).db

# Run migrations (if any)
cd backend && npm run migrate
```

## 📊 Monitoring & Analytics

### Logging
- Backend logs API requests và errors
- Frontend error boundaries catch React errors
- Database queries có error handling

### Health Checks
```bash
# API Health
curl http://localhost:5001/api/health

# Database Connection
cd backend && node -e "require('./database/database').initDatabase().then(() => console.log('OK'))"
```

### User Analytics (Available via API)
- User registration statistics
- Learning progress tracking  
- Japanese level distribution
- Active users metrics

## 🔧 Troubleshooting

### Common Issues

**Port Conflicts:**
```bash
# Check what's using ports
netstat -ano | findstr :5001
netstat -ano | findstr :3002
```

**Database Locked:**  
```bash
# Stop all processes accessing DB
cd backend && sqlite3 database/japanese_learning.db ".backup backup.db"
```

**CORS Errors:**
- Kiểm tra FRONTEND_URL trong backend/.env
- Restart backend server
- Clear browser cache

**Token Expiry:**  
- Logout và login lại
- Kiểm tra JWT_EXPIRES_IN setting
- Implement refresh token (future feature)

### Performance Optimization

**Frontend:**
- Code splitting by routes
- Image optimization
- Bundle size analysis
- Service worker caching

**Backend:**  
- Database indexing
- Response compression
- Static file serving
- Connection pooling

**Database:**
- Regular VACUUM operation
- Query optimization
- Data archiving strategy
- Backup automation

## 📚 Learning Features

### Current Modules
- 🔤 **Alphabet Learning**: Hiragana & Katakana với stroke animation
- 📚 **Vocabulary**: N5 level words với audio pronunciation  
- 🎯 **Interactive Quiz**: Multiple choice với feedback
- 👤 **User Progress**: Track learning progress per category

### Future Enhancements
- Grammar lessons
- Kanji learning với radicals
- Conversation practice
- Spaced repetition system
- Social learning features
- Mobile app

## 📞 Support & Feedback

Để debug issues hoặc suggest features:
1. Xem logs trong browser DevTools
2. Check backend terminal logs  
3. Query database để verify data
4. Use provided testing scripts
5. Submit detailed bug reports

Happy Learning! 🌸📚