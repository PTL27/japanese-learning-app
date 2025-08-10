const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { runQuery, getQuery, allQuery } = require('../database/database');
const router = express.Router();

// Authentication middleware
const authenticateToken = async (req, res, next) => {
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
      'SELECT id, name, email, age, phone, address, japanese_level FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xác thực'
    });
  }
};

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        age: req.user.age,
        phone: req.user.phone,
        address: req.user.address,
        japaneseLevel: req.user.japanese_level
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin profile'
    });
  }
});

// Update user profile
router.put('/profile', [
  authenticateToken,
  body('name').trim().notEmpty().withMessage('Tên không được để trống'),
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

    const { name, age, phone, address, japaneseLevel } = req.body;
    const userId = req.user.id;

    // Update user profile
    await runQuery(`
      UPDATE users 
      SET name = ?, age = ?, phone = ?, address = ?, japanese_level = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, age || null, phone || null, address || null, japaneseLevel || req.user.japanese_level, userId]);

    // Get updated user data
    const updatedUser = await getQuery(
      'SELECT id, name, email, age, phone, address, japanese_level FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        age: updatedUser.age,
        phone: updatedUser.phone,
        address: updatedUser.address,
        japaneseLevel: updatedUser.japanese_level
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật thông tin'
    });
  }
});

// Change password
router.put('/change-password', [
  authenticateToken,
  body('currentPassword').notEmpty().withMessage('Mật khẩu hiện tại không được để trống'),
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

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get current password hash
    const user = await getQuery('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu hiện tại không chính xác'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await runQuery(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPasswordHash, userId]
    );

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đổi mật khẩu'
    });
  }
});

// Get user progress
router.get('/progress', authenticateToken, async (req, res) => {
  try {
    const { category } = req.query;
    const userId = req.user.id;

    let sql = `
      SELECT category, item_id, completed, score, attempts, last_attempt_at 
      FROM user_progress 
      WHERE user_id = ?
    `;
    const params = [userId];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY category, item_id';

    const progress = await allQuery(sql, params);

    res.json({
      success: true,
      progress
    });

  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy tiến trình học tập'
    });
  }
});

// Update user progress
router.put('/progress', [
  authenticateToken,
  body('category').notEmpty().withMessage('Category không được để trống'),
  body('itemId').notEmpty().withMessage('Item ID không được để trống'),
  body('completed').optional().isBoolean(),
  body('score').optional().isInt({ min: 0, max: 100 }),
  body('attempts').optional().isInt({ min: 0 })
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

    const { category, itemId, completed, score, attempts } = req.body;
    const userId = req.user.id;

    // Check if progress record exists
    const existingProgress = await getQuery(
      'SELECT id FROM user_progress WHERE user_id = ? AND category = ? AND item_id = ?',
      [userId, category, itemId]
    );

    if (existingProgress) {
      // Update existing record
      await runQuery(`
        UPDATE user_progress 
        SET completed = COALESCE(?, completed), 
            score = COALESCE(?, score), 
            attempts = COALESCE(?, attempts),
            last_attempt_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [completed, score, attempts, existingProgress.id]);
    } else {
      // Create new record
      await runQuery(`
        INSERT INTO user_progress (user_id, category, item_id, completed, score, attempts, last_attempt_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [userId, category, itemId, completed || false, score || null, attempts || 1]);
    }

    res.json({
      success: true,
      message: 'Cập nhật tiến trình thành công'
    });

  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật tiến trình'
    });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get overall statistics
    const [totalProgress, completedProgress, avgScore] = await Promise.all([
      getQuery('SELECT COUNT(*) as count FROM user_progress WHERE user_id = ?', [userId]),
      getQuery('SELECT COUNT(*) as count FROM user_progress WHERE user_id = ? AND completed = TRUE', [userId]),
      getQuery('SELECT AVG(score) as avg FROM user_progress WHERE user_id = ? AND score IS NOT NULL', [userId])
    ]);

    // Get category-wise statistics
    const categoryStats = await allQuery(`
      SELECT 
        category,
        COUNT(*) as total_items,
        SUM(CASE WHEN completed = TRUE THEN 1 ELSE 0 END) as completed_items,
        AVG(score) as avg_score,
        SUM(attempts) as total_attempts
      FROM user_progress 
      WHERE user_id = ?
      GROUP BY category
      ORDER BY category
    `, [userId]);

    res.json({
      success: true,
      stats: {
        overall: {
          totalItems: totalProgress.count,
          completedItems: completedProgress.count,
          completionRate: totalProgress.count > 0 ? (completedProgress.count / totalProgress.count * 100).toFixed(1) : 0,
          averageScore: avgScore.avg ? Math.round(avgScore.avg) : null
        },
        byCategory: categoryStats
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thống kê'
    });
  }
});

module.exports = router;