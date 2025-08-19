const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Generate JWT token for OAuth users
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Google OAuth Routes
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      const user = req.user;
      const token = generateToken(user.id);
      
      // Update auth_provider if it's still 'local'
      if (user.auth_provider === 'local' || !user.auth_provider) {
        const { runQuery } = require('../database/database');
        await runQuery(
          'UPDATE users SET auth_provider = ? WHERE id = ?',
          ['google', user.id]
        );
      }
      
      console.log('✅ Google OAuth successful for user:', user.email);
      
      // Redirect to frontend with token
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/success?token=${token}`;
      res.redirect(redirectUrl);
      
    } catch (error) {
      console.error('❌ Google OAuth callback error:', error);
      const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/error?message=google_auth_failed`;
      res.redirect(errorUrl);
    }
  }
);

// Microsoft OAuth Routes
router.get('/microsoft',
  passport.authenticate('microsoft', {
    prompt: 'select_account'
  })
);

router.get('/microsoft/callback',
  passport.authenticate('microsoft', { session: false }),
  async (req, res) => {
    try {
      const user = req.user;
      const token = generateToken(user.id);
      
      // Update auth_provider if it's still 'local'
      if (user.auth_provider === 'local' || !user.auth_provider) {
        const { runQuery } = require('../database/database');
        await runQuery(
          'UPDATE users SET auth_provider = ? WHERE id = ?',
          ['microsoft', user.id]
        );
      }
      
      console.log('✅ Microsoft OAuth successful for user:', user.email);
      
      // Redirect to frontend with token
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/success?token=${token}`;
      res.redirect(redirectUrl);
      
    } catch (error) {
      console.error('❌ Microsoft OAuth callback error:', error);
      const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/error?message=microsoft_auth_failed`;
      res.redirect(errorUrl);
    }
  }
);

// OAuth success endpoint (for checking auth status)
router.get('/oauth/status', (req, res) => {
  const token = req.query.token;
  
  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'No token provided'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      success: true,
      token: token,
      user_id: decoded.userId
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

module.exports = router;