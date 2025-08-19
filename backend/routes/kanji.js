const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { runQuery, getQuery, allQuery } = require('../database/database');
const kanjiVGService = require('../services/kanjiVGService');
const router = express.Router();

// Search kanji by character
router.get('/search/:character', async (req, res) => {
  try {
    const { character } = req.params;
    
    if (!character || character.length !== 1) {
      return res.status(400).json({
        success: false,
        message: 'Please provide exactly one kanji character'
      });
    }

    console.log(`Kanji search: "${character}"`);

    const kanji = await getQuery(`
      SELECT * FROM kanji WHERE character = ?
    `, [character]);

    if (!kanji) {
      return res.status(404).json({
        success: false,
        message: 'Kanji not found in database'
      });
    }

    // Parse JSON fields
    const processedKanji = {
      ...kanji,
      meanings: kanji.meanings ? JSON.parse(kanji.meanings) : [],
      on_readings: kanji.on_readings ? JSON.parse(kanji.on_readings) : [],
      kun_readings: kanji.kun_readings ? JSON.parse(kanji.kun_readings) : [],
      name_readings: kanji.name_readings ? JSON.parse(kanji.name_readings) : [],
      components: kanji.components ? JSON.parse(kanji.components) : [],
      variants: kanji.variants ? JSON.parse(kanji.variants) : [],
      examples: kanji.examples ? JSON.parse(kanji.examples) : [],
      tags: kanji.tags ? JSON.parse(kanji.tags) : [],
      stroke_order_data: kanji.stroke_order_data ? JSON.parse(kanji.stroke_order_data) : null
    };

    res.json({
      success: true,
      data: processedKanji
    });

  } catch (error) {
    console.error('Kanji search error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during kanji search'
    });
  }
});

// Search kanji by reading
router.get('/reading/:reading', [
  query('type').optional().isIn(['on', 'kun', 'name']).withMessage('Type must be on, kun, or name')
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

    const { reading } = req.params;
    const { type } = req.query;

    console.log(`Kanji reading search: "${reading}" (type: ${type || 'all'})`);

    let searchSql;
    if (type === 'on') {
      searchSql = `SELECT * FROM kanji WHERE on_readings LIKE ? ORDER BY frequency_rank ASC LIMIT 50`;
    } else if (type === 'kun') {
      searchSql = `SELECT * FROM kanji WHERE kun_readings LIKE ? ORDER BY frequency_rank ASC LIMIT 50`;
    } else if (type === 'name') {
      searchSql = `SELECT * FROM kanji WHERE name_readings LIKE ? ORDER BY frequency_rank ASC LIMIT 50`;
    } else {
      searchSql = `
        SELECT * FROM kanji 
        WHERE on_readings LIKE ? OR kun_readings LIKE ? OR name_readings LIKE ?
        ORDER BY frequency_rank ASC LIMIT 50
      `;
    }

    const searchPattern = `%"${reading}"%`;
    const params = type ? [searchPattern] : [searchPattern, searchPattern, searchPattern];

    const results = await allQuery(searchSql, params);

    // Parse JSON fields for all results
    const processedResults = results.map(kanji => ({
      ...kanji,
      meanings: kanji.meanings ? JSON.parse(kanji.meanings) : [],
      on_readings: kanji.on_readings ? JSON.parse(kanji.on_readings) : [],
      kun_readings: kanji.kun_readings ? JSON.parse(kanji.kun_readings) : [],
      name_readings: kanji.name_readings ? JSON.parse(kanji.name_readings) : [],
      components: kanji.components ? JSON.parse(kanji.components) : [],
      variants: kanji.variants ? JSON.parse(kanji.variants) : [],
      examples: kanji.examples ? JSON.parse(kanji.examples) : [],
      tags: kanji.tags ? JSON.parse(kanji.tags) : []
    }));

    res.json({
      success: true,
      data: processedResults,
      reading,
      type: type || 'all',
      total: processedResults.length
    });

  } catch (error) {
    console.error('Kanji reading search error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get kanji by grade level
router.get('/grade/:level', async (req, res) => {
  try {
    const { level } = req.params;
    const gradeLevel = parseInt(level);

    if (!gradeLevel || gradeLevel < 1 || gradeLevel > 8) {
      return res.status(400).json({
        success: false,
        message: 'Grade level must be between 1 and 8'
      });
    }

    console.log(`Kanji grade search: ${gradeLevel}`);

    const results = await allQuery(`
      SELECT * FROM kanji 
      WHERE grade_level = ? 
      ORDER BY frequency_rank ASC, character ASC
    `, [gradeLevel]);

    const processedResults = results.map(kanji => ({
      character: kanji.character,
      meanings: kanji.meanings ? JSON.parse(kanji.meanings) : [],
      on_readings: kanji.on_readings ? JSON.parse(kanji.on_readings) : [],
      kun_readings: kanji.kun_readings ? JSON.parse(kanji.kun_readings) : [],
      stroke_count: kanji.stroke_count,
      frequency_rank: kanji.frequency_rank
    }));

    res.json({
      success: true,
      data: processedResults,
      grade_level: gradeLevel,
      total: processedResults.length
    });

  } catch (error) {
    console.error('Kanji grade search error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get kanji by JLPT level
router.get('/jlpt/:level', async (req, res) => {
  try {
    const { level } = req.params;
    const jlptLevel = parseInt(level);

    if (!jlptLevel || jlptLevel < 1 || jlptLevel > 5) {
      return res.status(400).json({
        success: false,
        message: 'JLPT level must be between 1 and 5'
      });
    }

    console.log(`Kanji JLPT search: N${jlptLevel}`);

    const results = await allQuery(`
      SELECT * FROM kanji 
      WHERE jlpt_level = ? 
      ORDER BY frequency_rank ASC, character ASC
    `, [jlptLevel]);

    const processedResults = results.map(kanji => ({
      character: kanji.character,
      meanings: kanji.meanings ? JSON.parse(kanji.meanings) : [],
      on_readings: kanji.on_readings ? JSON.parse(kanji.on_readings) : [],
      kun_readings: kanji.kun_readings ? JSON.parse(kanji.kun_readings) : [],
      stroke_count: kanji.stroke_count,
      grade_level: kanji.grade_level,
      frequency_rank: kanji.frequency_rank
    }));

    res.json({
      success: true,
      data: processedResults,
      jlpt_level: jlptLevel,
      total: processedResults.length
    });

  } catch (error) {
    console.error('Kanji JLPT search error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get kanji statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await allQuery(`
      SELECT 
        jlpt_level,
        grade_level,
        COUNT(*) as count,
        AVG(stroke_count) as avg_strokes
      FROM kanji 
      GROUP BY jlpt_level, grade_level
      ORDER BY jlpt_level, grade_level
    `);

    const totalCount = await getQuery('SELECT COUNT(*) as total FROM kanji');
    
    const gradeStats = await allQuery(`
      SELECT grade_level, COUNT(*) as count
      FROM kanji 
      WHERE grade_level IS NOT NULL
      GROUP BY grade_level
      ORDER BY grade_level
    `);

    const jlptStats = await allQuery(`
      SELECT jlpt_level, COUNT(*) as count
      FROM kanji 
      WHERE jlpt_level IS NOT NULL
      GROUP BY jlpt_level
      ORDER BY jlpt_level
    `);

    res.json({
      success: true,
      data: {
        total: totalCount.total,
        by_grade: gradeStats,
        by_jlpt: jlptStats,
        detailed: stats
      }
    });

  } catch (error) {
    console.error('Get kanji stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add new kanji entry (admin only)
router.post('/', [
  body('character').notEmpty().isLength({ min: 1, max: 1 }).withMessage('Character must be exactly one kanji'),
  body('meanings').isArray().withMessage('Meanings must be an array'),
  body('on_readings').optional().isArray(),
  body('kun_readings').optional().isArray()
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
      character,
      meanings,
      on_readings = [],
      kun_readings = [],
      name_readings = [],
      stroke_count,
      radical,
      radical_name,
      jlpt_level,
      grade_level,
      frequency_rank,
      unicode,
      components = [],
      variants = [],
      examples = [],
      tags = []
    } = req.body;

    // Check if kanji already exists
    const existing = await getQuery(
      'SELECT id FROM kanji WHERE character = ?',
      [character]
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Kanji already exists in database'
      });
    }

    const result = await runQuery(`
      INSERT INTO kanji (
        character, meanings, on_readings, kun_readings, name_readings,
        stroke_count, radical, radical_name, jlpt_level, grade_level,
        frequency_rank, unicode, components, variants, examples, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      character,
      JSON.stringify(meanings),
      JSON.stringify(on_readings),
      JSON.stringify(kun_readings),
      JSON.stringify(name_readings),
      stroke_count,
      radical,
      radical_name,
      jlpt_level,
      grade_level,
      frequency_rank,
      unicode,
      JSON.stringify(components),
      JSON.stringify(variants),
      JSON.stringify(examples),
      JSON.stringify(tags)
    ]);

    const newKanji = await getQuery(
      'SELECT * FROM kanji WHERE id = ?',
      [result.id]
    );

    res.status(201).json({
      success: true,
      message: 'Kanji entry created successfully',
      data: newKanji
    });

  } catch (error) {
    console.error('Add kanji entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Batch fetch and save stroke data for multiple kanji (must be before single character route)
router.post('/strokes/batch', [
  body('kanji').isArray().withMessage('Kanji must be an array'),
  body('kanji.*').isLength({ min: 1, max: 1 }).withMessage('Each item must be exactly one kanji character')
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

    const { kanji } = req.body;
    const results = [];
    const errors_list = [];

    console.log(`Batch processing stroke data for ${kanji.length} kanji`);

    for (let i = 0; i < kanji.length; i++) {
      const character = kanji[i];
      
      try {
        if (!kanjiVGService.isValidKanji(character)) {
          errors_list.push({
            character,
            error: 'Invalid kanji character'
          });
          continue;
        }

        // Check if already exists in database
        const existingKanji = await getQuery(`
          SELECT stroke_order_data FROM kanji WHERE character = ?
        `, [character]);

        if (existingKanji && existingKanji.stroke_order_data) {
          results.push({
            character,
            status: 'skipped',
            reason: 'Already has stroke data'
          });
          continue;
        }

        // Fetch and save stroke data
        const strokeData = await kanjiVGService.fetchKanjiStrokes(character);
        
        if (existingKanji) {
          await runQuery(`
            UPDATE kanji 
            SET stroke_order_data = ?, 
                stroke_count = ?,
                updated_at = CURRENT_TIMESTAMP 
            WHERE character = ?
          `, [
            JSON.stringify(strokeData),
            strokeData.totalStrokes,
            character
          ]);
        } else {
          await runQuery(`
            INSERT INTO kanji (
              character, 
              meanings, 
              stroke_order_data, 
              stroke_count,
              unicode
            ) VALUES (?, ?, ?, ?, ?)
          `, [
            character,
            JSON.stringify([`Kanji: ${character}`]),
            JSON.stringify(strokeData),
            strokeData.totalStrokes,
            strokeData.unicode
          ]);
        }

        results.push({
          character,
          status: 'success',
          strokes: strokeData.totalStrokes,
          action: existingKanji ? 'updated' : 'created'
        });

        // Add small delay to be respectful to KanjiVG server
        if (i < kanji.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

      } catch (error) {
        console.error(`Error processing ${character}:`, error.message);
        errors_list.push({
          character,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Processed ${kanji.length} kanji`,
      results: results,
      errors: errors_list,
      summary: {
        total: kanji.length,
        successful: results.filter(r => r.status === 'success').length,
        skipped: results.filter(r => r.status === 'skipped').length,
        failed: errors_list.length
      }
    });

  } catch (error) {
    console.error('Batch stroke data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process batch stroke data',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get stroke data for a kanji from KanjiVG
router.get('/strokes/:character', async (req, res) => {
  try {
    const { character } = req.params;
    
    if (!character || character.length !== 1) {
      return res.status(400).json({
        success: false,
        message: 'Please provide exactly one kanji character'
      });
    }

    if (!kanjiVGService.isValidKanji(character)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid kanji character'
      });
    }

    console.log(`Fetching stroke data for: ${character}`);

    // Check if we already have stroke data in database
    const existingKanji = await getQuery(`
      SELECT stroke_order_data FROM kanji WHERE character = ?
    `, [character]);

    if (existingKanji && existingKanji.stroke_order_data) {
      console.log(`Found cached stroke data for: ${character}`);
      const strokeData = JSON.parse(existingKanji.stroke_order_data);
      
      return res.json({
        success: true,
        data: strokeData,
        source: 'cache'
      });
    }

    // Fetch from KanjiVG
    const strokeData = await kanjiVGService.fetchKanjiStrokes(character);
    
    res.json({
      success: true,
      data: strokeData,
      source: 'kanjivg',
      message: `Found ${strokeData.totalStrokes} strokes for ${character}`
    });

  } catch (error) {
    console.error('Get stroke data error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch stroke data',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Save stroke data to database for a kanji
router.post('/strokes/:character', async (req, res) => {
  try {
    const { character } = req.params;
    
    if (!character || character.length !== 1) {
      return res.status(400).json({
        success: false,
        message: 'Please provide exactly one kanji character'
      });
    }

    if (!kanjiVGService.isValidKanji(character)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid kanji character'
      });
    }

    console.log(`Saving stroke data for: ${character}`);

    // Fetch stroke data from KanjiVG
    const strokeData = await kanjiVGService.fetchKanjiStrokes(character);
    
    // Check if kanji exists in database
    const existingKanji = await getQuery(`
      SELECT id, character FROM kanji WHERE character = ?
    `, [character]);

    if (existingKanji) {
      // Update existing kanji with stroke data
      await runQuery(`
        UPDATE kanji 
        SET stroke_order_data = ?, 
            stroke_count = ?,
            updated_at = CURRENT_TIMESTAMP 
        WHERE character = ?
      `, [
        JSON.stringify(strokeData),
        strokeData.totalStrokes,
        character
      ]);

      console.log(`Updated stroke data for existing kanji: ${character}`);
    } else {
      // Create new kanji entry with stroke data
      await runQuery(`
        INSERT INTO kanji (
          character, 
          meanings, 
          stroke_order_data, 
          stroke_count,
          unicode
        ) VALUES (?, ?, ?, ?, ?)
      `, [
        character,
        JSON.stringify([`Kanji: ${character}`]),
        JSON.stringify(strokeData),
        strokeData.totalStrokes,
        strokeData.unicode
      ]);

      console.log(`Created new kanji entry with stroke data: ${character}`);
    }

    res.json({
      success: true,
      data: strokeData,
      message: `Successfully saved ${strokeData.totalStrokes} strokes for ${character}`,
      action: existingKanji ? 'updated' : 'created'
    });

  } catch (error) {
    console.error('Save stroke data error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save stroke data',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get kanji with stroke data included
router.get('/with-strokes/:character', async (req, res) => {
  try {
    const { character } = req.params;
    
    if (!character || character.length !== 1) {
      return res.status(400).json({
        success: false,
        message: 'Please provide exactly one kanji character'
      });
    }

    const kanji = await getQuery(`
      SELECT * FROM kanji WHERE character = ?
    `, [character]);

    if (!kanji) {
      return res.status(404).json({
        success: false,
        message: 'Kanji not found in database'
      });
    }

    // Parse JSON fields
    const processedKanji = {
      ...kanji,
      meanings: kanji.meanings ? JSON.parse(kanji.meanings) : [],
      on_readings: kanji.on_readings ? JSON.parse(kanji.on_readings) : [],
      kun_readings: kanji.kun_readings ? JSON.parse(kanji.kun_readings) : [],
      name_readings: kanji.name_readings ? JSON.parse(kanji.name_readings) : [],
      components: kanji.components ? JSON.parse(kanji.components) : [],
      variants: kanji.variants ? JSON.parse(kanji.variants) : [],
      examples: kanji.examples ? JSON.parse(kanji.examples) : [],
      tags: kanji.tags ? JSON.parse(kanji.tags) : [],
      stroke_order_data: kanji.stroke_order_data ? JSON.parse(kanji.stroke_order_data) : null
    };

    res.json({
      success: true,
      data: processedKanji
    });

  } catch (error) {
    console.error('Get kanji with strokes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;