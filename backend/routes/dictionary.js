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

    // Updated for new dictionary schema
    let searchSql = `
      SELECT 
        id, word, reading, meaning, word_type, jlpt_level, tags,
        CASE 
          WHEN word = ? THEN 10
          WHEN reading = ? THEN 9
          WHEN word LIKE ? THEN 8
          WHEN reading LIKE ? THEN 7
          WHEN meaning LIKE ? THEN 6
          ELSE 1
        END as relevance_score
      FROM dictionary 
      WHERE (
        word = ? OR 
        reading = ? OR 
        word LIKE ? OR 
        reading LIKE ? OR 
        meaning LIKE ?
      )
      ORDER BY relevance_score DESC
      LIMIT ? OFFSET ?
    `;

    const searchPattern = `%${q}%`;
    const searchParams = [
      q, q, searchPattern, searchPattern, searchPattern, // for CASE
      q, q, searchPattern, searchPattern, searchPattern, // for WHERE
      limit, offset
    ];

    const results = await allQuery(searchSql, searchParams);

    // Process results for frontend compatibility
    const processedResults = results.map(entry => {
      let parsedTags = {};
      try {
        parsedTags = entry.tags ? JSON.parse(entry.tags) : {};
      } catch (e) {
        parsedTags = {};
      }

      return {
        id: entry.id,
        word: entry.word,
        reading: entry.reading,
        meaning: entry.meaning,
        word_type: entry.word_type,
        jlpt_level: entry.jlpt_level,
        tags: parsedTags,
        // Add compatibility fields for frontend
        kanji: entry.word,
        kana: entry.reading,
        meanings: entry.meaning.split('; '),
        parts_of_speech: entry.word_type ? entry.word_type.split(', ') : [],
        is_common: parsedTags.is_common || false,
        entry_id: parsedTags.entry_id || entry.id.toString()
      };
    });

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

    // Process for frontend compatibility
    let parsedTags = {};
    try {
      parsedTags = entry.tags ? JSON.parse(entry.tags) : {};
    } catch (e) {
      parsedTags = {};
    }

    const processedEntry = {
      id: entry.id,
      word: entry.word,
      reading: entry.reading,
      meaning: entry.meaning,
      word_type: entry.word_type,
      jlpt_level: entry.jlpt_level,
      tags: parsedTags,
      // Add compatibility fields for frontend
      kanji: entry.word,
      kana: entry.reading,
      meanings: entry.meaning.split('; '),
      parts_of_speech: entry.word_type ? entry.word_type.split(', ') : [],
      is_common: parsedTags.is_common || false,
      entry_id: parsedTags.entry_id || entry.id.toString(),
      examples: parsedTags.examples || []
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
        COUNT(*) as count
      FROM dictionary 
      GROUP BY jlpt_level
      ORDER BY jlpt_level
    `);

    const totalCount = await getQuery('SELECT COUNT(*) as total FROM dictionary');
    
    // Count entries with is_common flag in tags
    const commonCount = await getQuery(`
      SELECT COUNT(*) as count FROM dictionary 
      WHERE tags LIKE '%"is_common":true%'
    `);

    res.json({
      success: true,
      data: {
        total: totalCount.total,
        common: commonCount.count,
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