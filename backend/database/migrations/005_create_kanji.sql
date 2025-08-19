-- Create kanji table for comprehensive kanji data
CREATE TABLE IF NOT EXISTS kanji (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character TEXT UNIQUE NOT NULL,-- Single kanji character
    meanings TEXT NOT NULL,        -- JSON array of English meanings
    on_readings TEXT,              -- JSON array of on-readings (音読み)
    kun_readings TEXT,             -- JSON array of kun-readings (訓読み)
    name_readings TEXT,            -- JSON array of name readings (名乗り)
    stroke_count INTEGER,          -- Number of strokes
    radical TEXT,                  -- Radical character
    radical_name TEXT,             -- Radical name
    jlpt_level INTEGER,            -- 1-5 (N5=5, N4=4, etc)
    grade_level INTEGER,           -- 1-6 for elementary, 8 for secondary
    frequency_rank INTEGER,        -- Usage frequency ranking
    unicode TEXT,                  -- Unicode codepoint
    components TEXT,               -- JSON array of component parts
    variants TEXT,                 -- JSON array of variant forms
    examples TEXT,                 -- JSON array of example words using this kanji
    stroke_order_data TEXT,        -- SVG or stroke order information
    tags TEXT,                     -- JSON array of tags (common, archaic, etc)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_kanji_character ON kanji(character);
CREATE INDEX IF NOT EXISTS idx_kanji_jlpt ON kanji(jlpt_level);
CREATE INDEX IF NOT EXISTS idx_kanji_grade ON kanji(grade_level);
CREATE INDEX IF NOT EXISTS idx_kanji_frequency ON kanji(frequency_rank);
CREATE INDEX IF NOT EXISTS idx_kanji_stroke_count ON kanji(stroke_count);

-- Create FTS table for kanji search
CREATE VIRTUAL TABLE IF NOT EXISTS kanji_fts USING fts5(
    character,
    meanings,
    on_readings,
    kun_readings,
    content='kanji',
    content_rowid='id'
);

-- Triggers to keep kanji FTS in sync
CREATE TRIGGER IF NOT EXISTS kanji_fts_insert AFTER INSERT ON kanji BEGIN
    INSERT INTO kanji_fts(rowid, character, meanings, on_readings, kun_readings) 
    VALUES (NEW.id, NEW.character, NEW.meanings, NEW.on_readings, NEW.kun_readings);
END;

CREATE TRIGGER IF NOT EXISTS kanji_fts_delete AFTER DELETE ON kanji BEGIN
    INSERT INTO kanji_fts(kanji_fts, rowid, character, meanings, on_readings, kun_readings) 
    VALUES ('delete', OLD.id, OLD.character, OLD.meanings, OLD.on_readings, OLD.kun_readings);
END;

CREATE TRIGGER IF NOT EXISTS kanji_fts_update AFTER UPDATE ON kanji BEGIN
    INSERT INTO kanji_fts(kanji_fts, rowid, character, meanings, on_readings, kun_readings) 
    VALUES ('delete', OLD.id, OLD.character, OLD.meanings, OLD.on_readings, OLD.kun_readings);
    INSERT INTO kanji_fts(rowid, character, meanings, on_readings, kun_readings) 
    VALUES (NEW.id, NEW.character, NEW.meanings, NEW.on_readings, NEW.kun_readings);
END;