const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const { runQuery, getQuery, runTransaction } = require('../database/database');
const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Register/Signup endpoint
router.post('/signup', [
  body('name').trim().notEmpty().withMessage('Tên không được để trống'),
  body('email').isEmail().normalizeEmail().withMessage('Email không hợp lệ'),
  body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('age').optional().isInt({ min: 1, max: 120 }).withMessage('Tuổi không hợp lệ'),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('japaneseLevel').optional().isIn(['N5', 'N4', 'N3', 'N2', 'N1']).withMessage('Trình độ tiếng Nhật không hợp lệ')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const { name, email, password, age, phone, address, japaneseLevel } = req.body;

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Check if email already exists first
    const existingUser = await getQuery(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    // Create user (without transaction to avoid locks)
    const result = await runQuery(
      `INSERT INTO users (name, email, password_hash, age, phone, address, japanese_level) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, passwordHash, age || null, phone || null, address || null, japaneseLevel || 'N5']
    );

    // Get created user (without password)
    const newUser = await getQuery(
      'SELECT id, name, email, age, phone, address, japanese_level, created_at FROM users WHERE id = ?',
      [result.id]
    );

    // Generate token
    const token = generateToken(newUser.id);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        age: newUser.age,
        phone: newUser.phone,
        address: newUser.address,
        japaneseLevel: newUser.japanese_level,
        createdAt: newUser.created_at
      },
      token
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle specific errors
    if (error.message === 'Email đã được sử dụng') {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng ký'
    });
  }
});

// Login endpoint
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Email không hợp lệ'),
  body('password').notEmpty().withMessage('Mật khẩu không được để trống')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Get user with password hash
    const user = await getQuery(
      'SELECT id, name, email, password_hash, age, phone, address, japanese_level, created_at FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        phone: user.phone,
        address: user.address,
        japaneseLevel: user.japanese_level,
        createdAt: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng nhập'
    });
  }
});

// Forgot password - Step 1: Request reset
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Email không hợp lệ')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Check if user exists
    const user = await getQuery('SELECT id FROM users WHERE email = ?', [email]);
    if (!user) {
      // For security, don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'Nếu email tồn tại, bạn sẽ nhận được mã xác thực'
      });
    }

    // Generate reset token (6 digits)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store reset token
    await runQuery(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, resetToken, expiresAt.toISOString()]
    );

    // In production, send email with reset token
    // For development, we'll return the token
    res.json({
      success: true,
      message: 'Mã xác thực đã được gửi đến email của bạn',
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi yêu cầu đặt lại mật khẩu'
    });
  }
});

// Forgot password - Step 2: Reset with token
router.post('/reset-password', [
  body('email').isEmail().normalizeEmail().withMessage('Email không hợp lệ'),
  body('token').isLength({ min: 6, max: 6 }).withMessage('Mã xác thực phải có 6 chữ số'),
  body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const { email, token, newPassword } = req.body;

    // Get user and check reset token
    const resetRecord = await getQuery(`
      SELECT pr.id, pr.user_id, pr.expires_at, pr.used, u.email
      FROM password_resets pr
      JOIN users u ON pr.user_id = u.id
      WHERE u.email = ? AND pr.token = ? AND pr.used = FALSE
      ORDER BY pr.created_at DESC
      LIMIT 1
    `, [email, token]);

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: 'Mã xác thực không hợp lệ'
      });
    }

    // Check if token expired
    if (new Date() > new Date(resetRecord.expires_at)) {
      return res.status(400).json({
        success: false,
        message: 'Mã xác thực đã hết hạn'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await runQuery(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [passwordHash, resetRecord.user_id]
    );

    // Mark reset token as used
    await runQuery(
      'UPDATE password_resets SET used = TRUE WHERE id = ?',
      [resetRecord.id]
    );

    res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đặt lại mật khẩu'
    });
  }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token không được cung cấp'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getQuery(
      'SELECT id, name, email, age, phone, address, japanese_level, created_at FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        phone: user.phone,
        address: user.address,
        japaneseLevel: user.japanese_level,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }

    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xác thực token'
    });
  }
});

module.exports = router;