# 🔧 Bug Fixes và Database Guide

## ✅ Các lỗi đã sửa

### 1. 🎯 Animation che mất chữ Hiragana/Katakana
**Vấn đề:** Overlay description animation đặt ở `bottom` che mất chữ cái khi hiển thị.

**Giải pháp:**
- Di chuyển overlay từ `bottom-4` sang `top-4`  
- Đổi background từ `bg-black/80` sang `bg-white/95` để dễ đọc
- Giảm kích thước và thêm `right-16` để không che nút status

```javascript
// CustomStrokeAnimation.js - line 217
<div className="absolute top-4 left-4 right-16">
  <div className="bg-white/95 backdrop-blur-sm text-gray-800 text-sm p-3 rounded-xl border border-gray-200 shadow-lg">
```

### 2. 🔢 Số thứ tự che mất từ vựng 
**Vấn đề:** Index number được đặt ở `top-4 left-4` che mất phần đầu của từ vựng Japanese.

**Giải pháp:**
- Di chuyển từ `top-4 left-4` sang `top-2 right-2`
- Giảm kích thước từ `w-8 h-8` và font từ `text-sm` sang `text-xs`
- Thay đổi styling để ít nổi bật hơn

```javascript
// VocabularyPage.js - line 61
<div className="absolute top-2 right-2">
  <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 border border-gray-300 shadow-sm">
```

### 3. 🖊️ Cải thiện Animation SVG Paths
**Vấn đề:** SVG paths trong strokeDatabase không đúng hình dạng chữ thực tế.

**Giải pháp:** Cải thiện các SVG paths cho chính xác hơn:

```javascript
// japaneseData.js - Ví dụ cho chữ 'あ'
'あ': {
  strokes: [
    { 
      path: 'M30,20 Q35,15 45,18 Q55,22 60,30 Q62,38 58,45 Q52,50 45,48', 
      start: [30, 20],
      description: 'Nét đầu: từ trái cong lên rồi xuống'
    },
    // ... các nét khác được cải thiện
  ]
}
```

## 🗄️ Database Schema cho Từ vựng

### Các bảng mới được thêm:

#### 1. **vocabulary** - Lưu trữ từ vựng
```sql
CREATE TABLE vocabulary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  japanese TEXT NOT NULL,              -- Chữ Nhật (漢字)
  hiragana TEXT NOT NULL,              -- Phiên âm hiragana  
  romaji TEXT NOT NULL,                -- Phiên âm La-tinh
  meaning TEXT NOT NULL,               -- Nghĩa tiếng Việt
  category TEXT NOT NULL,              -- Loại từ: danh từ, động từ, tính từ, đại từ
  jlpt_level TEXT DEFAULT 'N5',       -- Cấp độ JLPT: N5-N1
  audio_url TEXT,                      -- Link file âm thanh
  example_sentence_jp TEXT,            -- Câu ví dụ tiếng Nhật
  example_sentence_vn TEXT,            -- Câu ví dụ tiếng Việt
  difficulty INTEGER DEFAULT 1,        -- Độ khó 1-5
  frequency_rank INTEGER,              -- Thứ tự tần suất sử dụng
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. **characters** - Lưu trữ ký tự (Hiragana, Katakana, Kanji)
```sql
CREATE TABLE characters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character TEXT NOT NULL UNIQUE,      -- Ký tự: あ, ア, 愛
  type TEXT NOT NULL,                  -- hiragana, katakana, kanji
  romaji TEXT NOT NULL,                -- Phiên âm: a, a, ai
  sound TEXT NOT NULL,                 -- Âm thanh: ah, ah, ai
  stroke_count INTEGER,               -- Số nét vẽ
  stroke_order TEXT,                  -- JSON chứa thông tin stroke animation
  meaning TEXT,                       -- Nghĩa (cho kanji)
  onyomi TEXT,                        -- Âm ON (cho kanji)
  kunyomi TEXT,                       -- Âm KUN (cho kanji)
  jlpt_level TEXT,                    -- Cấp độ JLPT
  frequency_rank INTEGER,             -- Thứ tự tần suất
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. **lessons** - Lưu trữ bài học
```sql
CREATE TABLE lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,                -- Tiêu đề bài học
  description TEXT,                   -- Mô tả
  type TEXT NOT NULL,                 -- alphabet, vocabulary, grammar, kanji
  jlpt_level TEXT DEFAULT 'N5',      -- Cấp độ
  order_index INTEGER DEFAULT 0,      -- Thứ tự bài học
  content TEXT,                       -- Nội dung (JSON)
  is_active BOOLEAN DEFAULT TRUE,     -- Bài học có hoạt động không
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 API Endpoints cho Vocabulary

### GET /api/vocabulary
Lấy danh sách từ vựng với filter và pagination

**Query Parameters:**
- `jlpt_level`: N5, N4, N3, N2, N1
- `category`: danh từ, động từ, tính từ, đại từ
- `search`: Tìm kiếm trong japanese, hiragana, romaji, meaning
- `page`: Trang (mặc định 1)
- `limit`: Số lượng per page (mặc định 50, max 100)

**Example:**
```bash
GET /api/vocabulary?jlpt_level=N5&category=danh từ&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "japanese": "人",
      "hiragana": "ひと", 
      "romaji": "hito",
      "meaning": "người",
      "category": "danh từ",
      "jlpt_level": "N5",
      "difficulty": 1,
      "frequency_rank": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 57,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Các endpoints khác:
- `GET /api/vocabulary/categories` - Lấy danh sách categories
- `GET /api/vocabulary/:id` - Lấy từ vựng theo ID
- `POST /api/vocabulary` - Thêm từ vựng mới
- `PUT /api/vocabulary/:id` - Cập nhật từ vựng
- `DELETE /api/vocabulary/:id` - Xóa từ vựng
- `GET /api/vocabulary/stats/overview` - Thống kê từ vựng

## 📊 Database Seeding

### Chạy seed data:
```bash
cd backend
node scripts/seed-vocabulary.js
```

### Kết quả:
- ✅ 57 từ vựng N5 được import thành công
- 📈 Phân bố: 15 danh từ, 15 động từ, 15 tính từ, 12 đại từ
- 🎯 Mỗi từ có difficulty ngẫu nhiên 1-3 và frequency_rank

## 🔍 Testing & Monitoring

### Test API:
```bash
# Lấy tất cả từ vựng
curl http://localhost:5001/api/vocabulary

# Lọc theo category
curl http://localhost:5001/api/vocabulary?category=danh%20từ

# Tìm kiếm
curl http://localhost:5001/api/vocabulary?search=人

# Lấy categories
curl http://localhost:5001/api/vocabulary/categories
```

### Xem database:
```bash
cd backend
node scripts/db-query.js
```

### Hoặc sử dụng SQLite Browser:
1. Tải DB Browser for SQLite: https://sqlitebrowser.org/
2. Mở file: `backend/database/japanese_learning.db`
3. Browse các bảng: users, vocabulary, characters, lessons, etc.

## 💡 Suggestions cho việc lưu trữ từ vựng

### 1. **Structured Data** ✅ 
Thay vì hardcode trong file JavaScript, data giờ được lưu trong database với:
- Proper indexing cho search performance
- Data validation với CHECK constraints  
- Relational structure cho future expansion

### 2. **Scalability**
```sql
-- Index cho tìm kiếm nhanh
CREATE INDEX idx_vocabulary_search ON vocabulary(japanese, hiragana, romaji);
CREATE INDEX idx_vocabulary_category ON vocabulary(category, jlpt_level);
CREATE INDEX idx_vocabulary_frequency ON vocabulary(frequency_rank);
```

### 3. **Content Management**
- Admin có thể thêm/sửa/xóa từ vựng qua API
- Bulk import từ CSV/Excel files
- Version control cho content changes
- Analytics về từ vựng được học nhiều nhất

### 4. **Enhanced Features**
```javascript
// Example: Audio integration
const vocab = await getVocabulary(id);
if (vocab.audio_url) {
  playAudio(vocab.audio_url);
} else {
  // Fallback to TTS
  playTextToSpeech(vocab.japanese);
}

// Example: Progress tracking
await updateUserProgress(userId, 'vocabulary', vocab.id, {
  completed: true,
  score: 85,
  attempts: 3
});
```

### 5. **Performance Optimization**
- Pagination để không load hết data
- Caching cho frequently accessed data
- Lazy loading cho images/audio
- Search indexing với FTS (Full-Text Search)

## 🎯 Next Steps

1. **Frontend Integration**: Update VocabularyPage component để dùng API thay vì hardcoded data
2. **Audio Storage**: Implement audio file storage và streaming
3. **User Progress**: Track từ vựng nào user đã học
4. **Spaced Repetition**: Algorithm để review từ vựng theo schedule
5. **Content Management**: Admin dashboard để manage vocabulary
6. **Analytics**: Track learning patterns và performance

## 🐛 Debug Commands

```bash
# Xem status hệ thống
node check-status.js

# Test tất cả API endpoints
node test-api.js

# Query database trực tiếp
cd backend && node scripts/db-query.js

# Seed lại vocabulary data
cd backend && node scripts/seed-vocabulary.js

# Check vocabulary API
curl http://localhost:5001/api/vocabulary?limit=5 | jq .
```