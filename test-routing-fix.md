# 🔧 Fix "Failed to fetch" và Routing Issues

## ✅ **Các vấn đề đã được giải quyết:**

### 1. **Failed to fetch** - API Connection Issues

**Nguyên nhân:**
- CORS configuration chỉ allow `localhost:3000` 
- UserService default port là `5000` thay vì `5001`

**Giải pháp:**
```javascript
// backend/server.js - CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:3004',  // New port
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// src/services/userService.js - Fixed default port
this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
```

### 2. **Routing với URLs như /home, /alphabet**

**Implemented React Router:**
- ✅ `BrowserRouter` với proper URL routing
- ✅ Protected routes cho authenticated pages  
- ✅ Auth routes chỉ cho non-authenticated users
- ✅ Navigation integration với URL changes

**Routes Structure:**
```
Auth Routes (redirect to /home if logged in):
- /login
- /signup  
- /forgot-password

Protected Routes (redirect to /login if not logged in):
- /home (default)
- /alphabet
- /vocabulary
- /quiz
- /profile
- /change-password

Default: / redirects to /home
```

## 🚀 **Current Setup:**

- **Frontend**: http://localhost:3004 (React Router enabled)
- **Backend**: http://localhost:5001 (CORS updated)
- **Routing**: Full URL routing với /home, /alphabet, etc.

## 🧪 **Testing:**

1. **Truy cập**: http://localhost:3004
2. **Login** với credentials có sẵn:
   - Email: `test@example.com`
   - Password: `password123`

3. **Navigation sẽ change URL:**
   - Trang chủ: `/home`
   - Bảng chữ cái: `/alphabet`  
   - Từ vựng: `/vocabulary`
   - Quiz: `/quiz`
   - Profile: `/profile`

4. **Auth flows:**
   - Logout → redirect to `/login`
   - Direct URL access → protect hoặc redirect phù hợp

## 📝 **Key Features Implemented:**

### 1. **Protected Routes**
```javascript
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};
```

### 2. **Auth Routes** 
```javascript
const AuthRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/home" replace />;
  }
  return children;
};
```

### 3. **Navigation Integration**
```javascript
const setCurrentPage = (page) => {
  navigate(`/${page}`);  // Changes URL và component
};
```

### 4. **URL-to-Page Mapping**
```javascript
const currentPath = location.pathname.substring(1) || 'home';
// '/alphabet' → 'alphabet'
// '/' → 'home'
```

## ✅ **Verified Working:**

1. ✅ Login API calls work (no more "Failed to fetch")
2. ✅ URL routing: `/home`, `/alphabet`, `/vocabulary`, etc.
3. ✅ Navigation updates URL automatically  
4. ✅ Direct URL access works with proper auth protection
5. ✅ Browser back/forward buttons work correctly
6. ✅ Refresh page maintains current route

## 🎯 **How to Use:**

1. **Start servers:**
```bash
# Backend
cd backend && npm run dev

# Frontend  
PORT=3004 npm start
```

2. **Navigate to:** http://localhost:3004

3. **Login** và enjoy proper URL routing! 🚀

## 🔍 **If Still Having Issues:**

1. **Clear browser cache**: Ctrl+Shift+R (hard refresh)
2. **Check browser console** for any errors
3. **Verify backend logs** trong terminal
4. **Test API directly**: 
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```