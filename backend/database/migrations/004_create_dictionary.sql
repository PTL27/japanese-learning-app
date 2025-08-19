-- Create dictionary table for JMdict data
CREATE TABLE IF NOT EXISTS dictionary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id TEXT UNIQUE NOT NULL, -- JMdict entry sequence number
    kanji TEXT,                    -- Main kanji writing
    kana TEXT,                     -- Main kana reading  
    romaji TEXT,                   -- Romanized version
    meanings TEXT NOT NULL,        -- JSON array of English meanings
    parts_of_speech TEXT,         -- JSON array of parts of speech
    jlpt_level TEXT,              -- N5, N4, N3, N2, N1
    frequency_rank INTEGER,        -- Frequency ranking if available
    is_common BOOLEAN DEFAULT 0,   -- Common usage flag
    tags TEXT,                     -- JSON array of tags
    examples TEXT,                 -- JSON array of example sentences
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_dictionary_kanji ON dictionary(kanji);
CREATE INDEX IF NOT EXISTS idx_dictionary_kana ON dictionary(kana);
CREATE INDEX IF NOT EXISTS idx_dictionary_jlpt ON dictionary(jlpt_level);
CREATE INDEX IF NOT EXISTS idx_dictionary_common ON dictionary(is_common);
CREATE INDEX IF NOT EXISTS idx_dictionary_meanings ON dictionary(meanings);

-- Create FTS (Full Text Search) table for better search
CREATE VIRTUAL TABLE IF NOT EXISTS dictionary_fts USING fts5(
    kanji,
    kana, 
    romaji,
    meanings,
    content='dictionary',
    content_rowid='id'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS dictionary_fts_insert AFTER INSERT ON dictionary BEGIN
    INSERT INTO dictionary_fts(rowid, kanji, kana, romaji, meanings) 
    VALUES (NEW.id, NEW.kanji, NEW.kana, NEW.romaji, NEW.meanings);
END;

CREATE TRIGGER IF NOT EXISTS dictionary_fts_delete AFTER DELETE ON dictionary BEGIN
    INSERT INTO dictionary_fts(dictionary_fts, rowid, kanji, kana, romaji, meanings) 
    VALUES ('delete', OLD.id, OLD.kanji, OLD.kana, OLD.romaji, OLD.meanings);
END;

CREATE TRIGGER IF NOT EXISTS dictionary_fts_update AFTER UPDATE ON dictionary BEGIN
    INSERT INTO dictionary_fts(dictionary_fts, rowid, kanji, kana, romaji, meanings) 
    VALUES ('delete', OLD.id, OLD.kanji, OLD.kana, OLD.romaji, OLD.meanings);
    INSERT INTO dictionary_fts(rowid, kanji, kana, romaji, meanings) 
    VALUES (NEW.id, NEW.kanji, NEW.kana, NEW.romaji, NEW.meanings);
END;