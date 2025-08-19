const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { runQuery, getQuery, allQuery } = require('../database/database');
const router = express.Router();

// Search dictionary entries
router.get('/search', [
  query('q').notEmpty().withMessage('Query parameter q is required'),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid parameters',
        errors: errors.array()
      });
    }

    const { q, limit = 20, offset = 0 } = req.query;
    
    console.log(`Dictionary search: "${q}" (limit: ${limit}, offset: ${offset})`);

    // Use FTS for search if available, otherwise fallback to LIKE
    let searchSql = `
      SELECT 
        id, entry_id, kanji, kana, romaji, meanings, 
        parts_of_speech, jlpt_level, is_common, tags, examples,
        CASE 
          WHEN kanji = ? THEN 10
          WHEN kana = ? THEN 9
          WHEN kanji LIKE ? THEN 8
          WHEN kana LIKE ? THEN 7
          WHEN meanings LIKE ? THEN 6
          ELSE 1
        END as relevance_score
      FROM dictionary 
      WHERE (
        kanji = ? OR 
        kana = ? OR 
        kanji LIKE ? OR 
        kana LIKE ? OR 
        meanings LIKE ? OR
        romaji LIKE ?
      )
      ORDER BY relevance_score DESC, is_common DESC, frequency_rank ASC
      LIMIT ? OFFSET ?
    `;

    const searchPattern = `%${q}%`;
    const searchParams = [
      q, q, searchPattern, searchPattern, searchPattern, // for CASE
      q, q, searchPattern, searchPattern, searchPattern, searchPattern, // for WHERE
      limit, offset
    ];

    const results = await allQuery(searchSql, searchParams);

    // Parse JSON fields
    const processedResults = results.map(entry => ({
      ...entry,
      meanings: entry.meanings ? JSON.parse(entry.meanings) : [],
      parts_of_speech: entry.parts_of_speech ? JSON.parse(entry.parts_of_speech) : [],
      tags: entry.tags ? JSON.parse(entry.tags) : [],
      examples: entry.examples ? JSON.parse(entry.examples) : [],
      is_common: Boolean(entry.is_common)
    }));

    res.json({
      success: true,
      data: processedResults,
      query: q,
      total: processedResults.length,
      limit,
      offset
    });

  } catch (error) {
    console.error('Dictionary search error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during dictionary search'
    });
  }
});

// Get dictionary entry by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const entry = await getQuery(`
      SELECT * FROM dictionary WHERE id = ?
    `, [id]);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Dictionary entry not found'
      });
    }

    // Parse JSON fields
    const processedEntry = {
      ...entry,
      meanings: entry.meanings ? JSON.parse(entry.meanings) : [],
      parts_of_speech: entry.parts_of_speech ? JSON.parse(entry.parts_of_speech) : [],
      tags: entry.tags ? JSON.parse(entry.tags) : [],
      examples: entry.examples ? JSON.parse(entry.examples) : [],
      is_common: Boolean(entry.is_common)
    };

    res.json({
      success: true,
      data: processedEntry
    });

  } catch (error) {
    console.error('Get dictionary entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get dictionary statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await allQuery(`
      SELECT 
        jlpt_level,
        COUNT(*) as count,
        COUNT(CASE WHEN is_common = 1 THEN 1 END) as common_count
      FROM dictionary 
      GROUP BY jlpt_level
      ORDER BY jlpt_level
    `);

    const totalCount = await getQuery('SELECT COUNT(*) as total FROM dictionary');

    res.json({
      success: true,
      data: {
        total: totalCount.total,
        by_jlpt: stats
      }
    });

  } catch (error) {
    console.error('Get dictionary stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add new dictionary entry (admin only)
router.post('/', [
  body('entry_id').notEmpty().withMessage('Entry ID is required'),
  body('meanings').isArray().withMessage('Meanings must be an array'),
  body('kanji').optional(),
  body('kana').notEmpty().withMessage('Kana reading is required'),
  body('parts_of_speech').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data',
        errors: errors.array()
      });
    }

    const {
      entry_id,
      kanji,
      kana,
      romaji,
      meanings,
      parts_of_speech = [],
      jlpt_level,
      frequency_rank,
      is_common = false,
      tags = [],
      examples = []
    } = req.body;

    // Check if entry already exists
    const existing = await getQuery(
      'SELECT id FROM dictionary WHERE entry_id = ?',
      [entry_id]
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Dictionary entry with this ID already exists'
      });
    }

    const result = await runQuery(`
      INSERT INTO dictionary (
        entry_id, kanji, kana, romaji, meanings, parts_of_speech,
        jlpt_level, frequency_rank, is_common, tags, examples
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      entry_id,
      kanji,
      kana,
      romaji,
      JSON.stringify(meanings),
      JSON.stringify(parts_of_speech),
      jlpt_level,
      frequency_rank,
      is_common ? 1 : 0,
      JSON.stringify(tags),
      JSON.stringify(examples)
    ]);

    const newEntry = await getQuery(
      'SELECT * FROM dictionary WHERE id = ?',
      [result.id]
    );

    res.status(201).json({
      success: true,
      message: 'Dictionary entry created successfully',
      data: newEntry
    });

  } catch (error) {
    console.error('Add dictionary entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;