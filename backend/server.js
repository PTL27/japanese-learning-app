const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('./config/passport');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const authOAuthRoutes = require('./routes/auth-oauth');
const userRoutes = require('./routes/users');
const vocabularyRoutes = require('./routes/vocabulary');
const dictionaryRoutes = require('./routes/dictionary');
const kanjiRoutes = require('./routes/kanji');
const quizRoutes = require('./routes/quiz');
const weeklyChallengeRoutes = require('./routes/weekly-challenge');
const friendsRoutes = require('./routes/friends');
const chatRoutes = require('./routes/chat');
const notificationRoutes = require('./routes/notifications');
const { initDatabase } = require('./database/database');
const cronService = require('./services/cronService');
const socketService = require('./services/socketService');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs for development
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session middleware for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'japanese-learning-app-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', authOAuthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vocabulary', vocabularyRoutes);
app.use('/api/dictionary', dictionaryRoutes);
app.use('/api/kanji', kanjiRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/weekly-challenge', weeklyChallengeRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Debug endpoint for connected users (development only)
if (process.env.NODE_ENV === 'development') {
  app.get('/api/debug/connected-users', (req, res) => {
    const socketService = require('./services/socketService');
    res.json({
      success: true,
      connectedUsers: socketService.getConnectedUsersInfo(),
      totalConnections: socketService.getOnlineUsersCount()
    });
  });

  // Debug endpoint to verify JWT token
  app.post('/api/debug/verify-token', (req, res) => {
    try {
      const { token } = req.body;
      const jwt = require('jsonwebtoken');
      
      if (!token) {
        return res.json({ success: false, error: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
      res.json({
        success: true,
        decoded: decoded,
        tokenPreview: token.substring(0, 20) + '...',
        expiresAt: new Date(decoded.exp * 1000).toISOString()
      });
    } catch (error) {
      res.json({
        success: false,
        error: error.message,
        tokenPreview: req.body.token ? req.body.token.substring(0, 20) + '...' : 'none'
      });
    }
  });

  // Debug endpoint to test Socket.io authentication manually
  app.post('/api/debug/test-socket-auth', async (req, res) => {
    try {
      const { token } = req.body;
      const jwt = require('jsonwebtoken');
      const { getQuery } = require('./database/database');
      
      if (!token) {
        return res.json({ success: false, step: 'token-check', error: 'No token provided' });
      }

      console.log('🔍 Testing Socket.io auth with token:', token.substring(0, 20) + '...');
      
      // Step 1: Verify JWT token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
        console.log('✅ JWT token valid, decoded:', { userId: decoded.id, name: decoded.name });
      } catch (jwtError) {
        console.log('❌ JWT verification failed:', jwtError.message);
        return res.json({ success: false, step: 'jwt-verify', error: jwtError.message });
      }

      // Step 2: Check user exists in database
      let user;
      try {
        user = await getQuery('SELECT id, name, email FROM users WHERE id = ?', [decoded.id]);
        if (!user) {
          console.log('❌ User not found in database for ID:', decoded.id);
          return res.json({ success: false, step: 'user-lookup', error: 'User not found' });
        }
        console.log('✅ User found in database:', user);
      } catch (dbError) {
        console.log('❌ Database error:', dbError.message);
        return res.json({ success: false, step: 'database', error: dbError.message });
      }

      res.json({
        success: true,
        message: 'Socket.io authentication should work',
        steps: {
          tokenProvided: true,
          jwtValid: true,
          userExists: true
        },
        user: user
      });

    } catch (error) {
      console.error('🚨 Debug endpoint error:', error);
      res.json({
        success: false,
        step: 'general',
        error: error.message
      });
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initDatabase();
    console.log('✅ Database initialized successfully');
    
    // Initialize Socket.io
    socketService.initialize(server);
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`💬 Socket.io server ready for real-time communication`);
      
      // Start cron service
      console.log('\n⏰ Starting scheduled services...');
      cronService.start();
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  cronService.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  cronService.stop();
  process.exit(0);
});