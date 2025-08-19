const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { runQuery, getQuery, allQuery } = require('../database/database');
const router = express.Router();

// Get all vocabulary with filtering and pagination
router.get('/', [
  query('jlpt_level').optional().isIn(['N5', 'N4', 'N3', 'N2', 'N1']).withMessage('JLPT level không hợp lệ'),
  query('category').optional().trim(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 500 }).toInt(),
  query('search').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Tham số không hợp lệ',
        errors: errors.array()
      });
    }

    const { 
      jlpt_level, 
      category, 
      page = 1, 
      limit = 50,
      search
    } = req.query;

    let sql = `
      SELECT id, japanese, hiragana, romaji, meaning, category, 
             jlpt_level, difficulty, frequency_rank,
             example_sentence_jp, example_sentence_vn
      FROM vocabulary 
      WHERE 1=1
    `;
    const params = [];

    // Add filters
    if (jlpt_level) {
      sql += ' AND jlpt_level = ?';
      params.push(jlpt_level);
    }

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      sql += ' AND (japanese LIKE ? OR hiragana LIKE ? OR romaji LIKE ? OR meaning LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Add ordering and pagination
    sql += ' ORDER BY frequency_rank ASC, japanese ASC';
    
    const offset = (page - 1) * limit;
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // Get total count for pagination
    let countSql = `
      SELECT COUNT(*) as total 
      FROM vocabulary 
      WHERE 1=1
    `;
    const countParams = [];

    if (jlpt_level) {
      countSql += ' AND jlpt_level = ?';
      countParams.push(jlpt_level);
    }

    if (category) {
      countSql += ' AND category = ?';
      countParams.push(category);
    }

    if (search) {
      countSql += ' AND (japanese LIKE ? OR hiragana LIKE ? OR romaji LIKE ? OR meaning LIKE ?)';
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const [vocabulary, countResult] = await Promise.all([
      allQuery(sql, params),
      getQuery(countSql, countParams)
    ]);

    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: vocabulary,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get vocabulary error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy từ vựng'
    });
  }
});

// Get vocabulary categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await allQuery(`
      SELECT category, COUNT(*) as count 
      FROM vocabulary 
      GROUP BY category 
      ORDER BY category
    `);

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh mục'
    });
  }
});

// Get vocabulary by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const vocabulary = await getQuery(`
      SELECT * FROM vocabulary WHERE id = ?
    `, [id]);

    if (!vocabulary) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy từ vựng'
      });
    }

    res.json({
      success: true,
      data: vocabulary
    });

  } catch (error) {
    console.error('Get vocabulary by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy từ vựng'
    });
  }
});

// Add new vocabulary (admin only - can be extended later with auth middleware)
router.post('/', [
  body('japanese').notEmpty().withMessage('Japanese text không được để trống'),
  body('hiragana').notEmpty().withMessage('Hiragana không được để trống'),
  body('romaji').notEmpty().withMessage('Romaji không được để trống'),
  body('meaning').notEmpty().withMessage('Nghĩa không được để trống'),
  body('category').notEmpty().withMessage('Category không được để trống'),
  body('jlpt_level').optional().isIn(['N5', 'N4', 'N3', 'N2', 'N1']).withMessage('JLPT level không hợp lệ'),
  body('difficulty').optional().isInt({ min: 1, max: 5 }).withMessage('Difficulty phải từ 1-5'),
  body('frequency_rank').optional().isInt({ min: 1 }).withMessage('Frequency rank phải là số dương')
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

    const {
      japanese,
      hiragana, 
      romaji,
      meaning,
      category,
      jlpt_level = 'N5',
      audio_url,
      example_sentence_jp,
      example_sentence_vn,
      difficulty = 1,
      frequency_rank
    } = req.body;

    // Check if vocabulary already exists
    const existing = await getQuery(
      'SELECT id FROM vocabulary WHERE japanese = ? AND meaning = ?',
      [japanese, meaning]
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Từ vựng này đã tồn tại'
      });
    }

    const result = await runQuery(`
      INSERT INTO vocabulary (
        japanese, hiragana, romaji, meaning, category, jlpt_level,
        audio_url, example_sentence_jp, example_sentence_vn, 
        difficulty, frequency_rank
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      japanese, hiragana, romaji, meaning, category, jlpt_level,
      audio_url, example_sentence_jp, example_sentence_vn,
      difficulty, frequency_rank
    ]);

    const newVocabulary = await getQuery(
      'SELECT * FROM vocabulary WHERE id = ?',
      [result.id]
    );

    res.status(201).json({
      success: true,
      message: 'Thêm từ vựng thành công',
      data: newVocabulary
    });

  } catch (error) {
    console.error('Add vocabulary error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi thêm từ vựng'
    });
  }
});

// Update vocabulary
router.put('/:id', [
  body('japanese').optional().notEmpty().withMessage('Japanese text không được để trống'),
  body('hiragana').optional().notEmpty().withMessage('Hiragana không được để trống'),
  body('romaji').optional().notEmpty().withMessage('Romaji không được để trống'),
  body('meaning').optional().notEmpty().withMessage('Nghĩa không được để trống'),
  body('category').optional().notEmpty().withMessage('Category không được để trống'),
  body('jlpt_level').optional().isIn(['N5', 'N4', 'N3', 'N2', 'N1']).withMessage('JLPT level không hợp lệ'),
  body('difficulty').optional().isInt({ min: 1, max: 5 }).withMessage('Difficulty phải từ 1-5')
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

    const { id } = req.params;
    const updateData = req.body;

    // Check if vocabulary exists
    const existing = await getQuery('SELECT id FROM vocabulary WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy từ vựng'
      });
    }

    // Build update query dynamically
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có dữ liệu để cập nhật'
      });
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await runQuery(`
      UPDATE vocabulary 
      SET ${fields.join(', ')} 
      WHERE id = ?
    `, values);

    const updatedVocabulary = await getQuery(
      'SELECT * FROM vocabulary WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Cập nhật từ vựng thành công',
      data: updatedVocabulary
    });

  } catch (error) {
    console.error('Update vocabulary error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật từ vựng'
    });
  }
});

// Delete vocabulary
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await getQuery('SELECT id FROM vocabulary WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy từ vựng'
      });
    }

    await runQuery('DELETE FROM vocabulary WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Xóa từ vựng thành công'
    });

  } catch (error) {
    console.error('Delete vocabulary error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa từ vựng'
    });
  }
});

// Get vocabulary statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await allQuery(`
      SELECT 
        jlpt_level,
        category,
        COUNT(*) as count,
        AVG(difficulty) as avg_difficulty
      FROM vocabulary 
      GROUP BY jlpt_level, category
      ORDER BY jlpt_level, category
    `);

    const totalCount = await getQuery('SELECT COUNT(*) as total FROM vocabulary');

    res.json({
      success: true,
      data: {
        total: totalCount.total,
        byLevelAndCategory: stats
      }
    });

  } catch (error) {
    console.error('Get vocabulary stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thống kê'
    });
  }
});

module.exports = router;