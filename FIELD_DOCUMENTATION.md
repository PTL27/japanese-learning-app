# 📋 Japanese Learning App - Chi Tiết Tài Liệu Field

## 📖 Tổng Quan

Tài liệu này mô tả chi tiết tất cả các field, kiểu dữ liệu, độ dài, validation rules cho từng màn hình trong Japanese Learning App.

---

## 🔐 Authentication Screens

### 1. 🔑 Màn Hình Đăng Nhập (LoginPage)

**File Path:** `/src/components/auth/LoginPage.js`

| Field Name | Type | Required | Max Length | Validation Rules | Default Value | Description |
|------------|------|----------|------------|------------------|---------------|-------------|
| `email` | String | ✅ Yes | N/A | HTML5 email validation | "" | Email đăng nhập |
| `password` | String | ✅ Yes | N/A | Required field | "" | Mật khẩu đăng nhập |

**State Variables:**
| Variable Name | Type | Default | Purpose |
|---------------|------|---------|---------|
| `showPassword` | Boolean | false | Hiển thị/ẩn mật khẩu |
| `isLoading` | Boolean | false | Trạng thái loading |
| `error` | String | "" | Thông báo lỗi |

**API Request Structure:**
```json
{
  "email": "string",
  "password": "string"
}
```

**API Response Structure:**
```json
{
  "success": "boolean",
  "user": "object",
  "token": "string",
  "error": "string (optional)"
}
```

---

### 2. 📝 Màn Hình Đăng Ký (SignupPage)

**File Path:** `/src/components/auth/SignupPage.js`

| Field Name | Type | Required | Max Length | Validation Rules | Default Value | Description |
|------------|------|----------|------------|------------------|---------------|-------------|
| `name` | String | ✅ Yes | N/A | Required, trimmed | "" | Họ và tên |
| `email` | String | ✅ Yes | N/A | Required, email regex, lowercase | "" | Email đăng ký |
| `password` | String | ✅ Yes | N/A | Required, min 6 characters | "" | Mật khẩu |
| `confirmPassword` | String | ✅ Yes | N/A | Required, must match password | "" | Xác nhận mật khẩu |
| `age` | Number | ❌ No | N/A | 13-100 if provided | "" | Tuổi |
| `phone` | String | ❌ No | N/A | No validation | "" | Số điện thoại |
| `address` | String | ❌ No | N/A | No validation | "" | Địa chỉ |

**State Variables:**
| Variable Name | Type | Default | Purpose |
|---------------|------|---------|---------|
| `showPassword` | Boolean | false | Hiển thị mật khẩu |
| `showConfirmPassword` | Boolean | false | Hiển thị xác nhận mật khẩu |
| `isLoading` | Boolean | false | Trạng thái loading |
| `error` | String | "" | Thông báo lỗi |

**API Request Structure:**
```json
{
  "name": "string",
  "email": "string", 
  "password": "string",
  "age": "number | null",
  "phone": "string",
  "address": "string",
  "japaneseLevel": "string (default: 'N5')"
}
```

---

### 3. 🔒 Màn Hình Quên Mật Khẩu (ForgotPasswordPage)

**File Path:** `/src/components/auth/ForgotPasswordPage.js`

**Step 1 - Request Reset:**
| Field Name | Type | Required | Max Length | Validation Rules | Default Value | Description |
|------------|------|----------|------------|------------------|---------------|-------------|
| `email` | String | ✅ Yes | N/A | Required | "" | Email để reset |

**Step 2 - Reset Password:**
| Field Name | Type | Required | Max Length | Validation Rules | Default Value | Description |
|------------|------|----------|------------|------------------|---------------|-------------|
| `resetToken` | String | ✅ Yes | N/A | Required | "" | Token từ email |
| `newPassword` | String | ✅ Yes | N/A | Required, min 6 characters | "" | Mật khẩu mới |
| `confirmPassword` | String | ✅ Yes | N/A | Required, must match newPassword | "" | Xác nhận mật khẩu mới |

**State Variables:**
| Variable Name | Type | Default | Purpose |
|---------------|------|---------|---------|
| `step` | Number | 1 | Bước hiện tại (1 hoặc 2) |
| `isLoading` | Boolean | false | Trạng thái loading |
| `error` | String | "" | Thông báo lỗi |
| `success` | String | "" | Thông báo thành công |
| `generatedToken` | String | "" | Token demo cho dev |

---

### 4. 🔄 Màn Hình Đổi Mật Khẩu (ChangePasswordPage)

**File Path:** `/src/components/auth/ChangePasswordPage.js`

| Field Name | Type | Required | Max Length | Validation Rules | Default Value | Description |
|------------|------|----------|------------|------------------|---------------|-------------|
| `oldPassword` | String | ✅ Yes | N/A | Required | "" | Mật khẩu cũ |
| `newPassword` | String | ✅ Yes | N/A | Required, min 6 chars, differ from old | "" | Mật khẩu mới |
| `confirmPassword` | String | ✅ Yes | N/A | Required, must match newPassword | "" | Xác nhận mật khẩu mới |

**State Variables:**
| Variable Name | Type | Default | Purpose |
|---------------|------|---------|---------|
| `showPasswords.old` | Boolean | false | Hiển thị mật khẩu cũ |
| `showPasswords.new` | Boolean | false | Hiển thị mật khẩu mới |
| `showPasswords.confirm` | Boolean | false | Hiển thị xác nhận mật khẩu |

---

## 👤 Profile Screen

### 5. 📄 Màn Hình Hồ Sơ (ProfilePage)

**File Path:** `/src/components/profile/ProfilePage.js`

| Field Name | Type | Required | Max Length | Validation Rules | Default Value | Description |
|------------|------|----------|------------|------------------|---------------|-------------|
| `name` | String | ✅ Yes | N/A | Required, trimmed | User.name | Họ và tên |
| `email` | String | ✅ Yes | N/A | Required, email regex, lowercase | User.email | Email |
| `phone` | String | ❌ No | N/A | No validation | User.phone | Số điện thoại |
| `address` | String | ❌ No | N/A | No validation | User.address | Địa chỉ |
| `age` | Number | ❌ No | N/A | 13-100 if provided | User.age | Tuổi |
| `japaneseLevel` | String | ✅ Yes | N/A | Required, must be N5/N4/N3/N2/N1 | User.japaneseLevel | Trình độ JLPT |

**Japanese Level Options:**
- `N5` - Beginner
- `N4` - Elementary  
- `N3` - Intermediate
- `N2` - Upper Intermediate
- `N1` - Advanced

**State Variables:**
| Variable Name | Type | Default | Purpose |
|---------------|------|---------|---------|
| `isEditing` | Boolean | false | Chế độ chỉnh sửa |
| `isLoading` | Boolean | false | Trạng thái loading |
| `error` | String | "" | Thông báo lỗi |
| `success` | String | "" | Thông báo thành công |

---

## 🎯 Quiz Screens

### 6. 🎮 Màn Hình Quiz Game (QuizGameScreen)

**File Path:** `/src/components/QuizGameScreen.js`

**Component Props:**
| Prop Name | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `quizNumber` | Number | ✅ Yes | N/A | Số thứ tự quiz |
| `jlptLevel` | String | ❌ No | 'N5' | Cấp độ JLPT |
| `onBack` | Function | ✅ Yes | N/A | Callback quay lại |
| `onComplete` | Function | ✅ Yes | N/A | Callback hoàn thành |
| `isRetake` | Boolean | ❌ No | false | Có phải làm lại không |

**State Variables:**
| Variable Name | Type | Default | Description |
|---------------|------|---------|-------------|
| `quiz` | Object | null | Dữ liệu quiz |
| `currentQuestionIndex` | Number | 0 | Vị trí câu hỏi hiện tại |
| `answers` | Object | {} | Câu trả lời của user |
| `timeLeft` | Number | 600 | Thời gian còn lại (giây) |
| `isPaused` | Boolean | false | Trạng thái tạm dừng |
| `loading` | Boolean | true | Trạng thái loading |
| `submitting` | Boolean | false | Trạng thái submit |
| `error` | String | "" | Thông báo lỗi |

**Quiz Data Structure:**
```json
{
  "session_id": "string",
  "questions": [
    {
      "id": "number",
      "japanese": "string",
      "hiragana": "string", 
      "options": {
        "A": "string",
        "B": "string", 
        "C": "string",
        "D": "string"
      },
      "correct_option": "string"
    }
  ]
}
```

**Answer Data Structure:**
```json
{
  "[questionId]": "selectedOptionKey"
}
```

---

### 7. 📊 Màn Hình Kết Quả Quiz (QuizResultScreen)

**File Path:** `/src/components/QuizResultScreen.js`

**Component Props:**
| Prop Name | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `result` | Object | ✅ Yes | N/A | Kết quả quiz |
| `quizNumber` | Number | ✅ Yes | N/A | Số thứ tự quiz |
| `onRetakeQuiz` | Function | ✅ Yes | N/A | Callback làm lại |
| `onBackToHome` | Function | ✅ Yes | N/A | Callback về trang chủ |

**Result Data Structure:**
```json
{
  "score_percentage": "number",
  "correct_answers": "number",
  "incorrect_answers": "number", 
  "time_spent": "number",
  "detailed_results": [
    {
      "id": "number",
      "japanese": "string",
      "hiragana": "string",
      "is_correct": "boolean",
      "user_answer": "string",
      "correct_option": "string", 
      "user_answer_text": "string",
      "correct_meaning": "string"
    }
  ]
}
```

---

### 8. 📈 Màn Hình Thống Kê Quiz (QuizStatisticsScreen)

**File Path:** `/src/components/QuizStatisticsScreen.js`

**Component Props:**
| Prop Name | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `jlptLevel` | String | ❌ No | 'N5' | Cấp độ JLPT |
| `onBack` | Function | ✅ Yes | N/A | Callback quay lại |

**Statistics Data Structure:**
```json
{
  "total_completed": "number",
  "average_score": "number",
  "best_score": "number",
  "improvement_trend": "string",
  "quiz_progress": [
    {
      "quiz_number": "number",
      "attempt_count": "number",
      "max_score": "number",
      "min_score": "number", 
      "avg_score": "number",
      "latest_date": "string",
      "last_3_attempts": [
        {
          "score": "number",
          "date": "string"
        }
      ]
    }
  ]
}
```

**Improvement Trend Values:**
- `improving` - Đang cải thiện
- `declining` - Đang giảm  
- `stable` - Ổn định

---

### 9. 🏠 Màn Hình Quiz Hub (QuizHubPage)

**File Path:** `/src/components/QuizHubPage.js`

**State Variables:**
| Variable Name | Type | Default | Description |
|---------------|------|---------|-------------|
| `currentView` | String | 'hub' | Trạng thái navigation |
| `overallStats` | Object | null | Thống kê tổng thể |
| `loading` | Boolean | true | Trạng thái loading |

**View States:**
- `hub` - Dashboard chính
- `vocabulary` - Trang từ vựng
- `grammar` - Trang ngữ pháp (coming soon)
- `kanji` - Trang kanji (coming soon)

**Overall Stats Structure:**
```json
{
  "vocabulary": {
    "N5": { "total_completed": "number", "average_score": "number", "best_score": "number" },
    "N4": { "total_completed": "number", "average_score": "number", "best_score": "number" },
    "N3": { "total_completed": "number", "average_score": "number", "best_score": "number" }
  },
  "grammar": {
    "N5": { "total_completed": "number", "average_score": "number", "best_score": "number" },
    "N4": { "total_completed": "number", "average_score": "number", "best_score": "number" },
    "N3": { "total_completed": "number", "average_score": "number", "best_score": "number" }
  },
  "kanji": {
    "N5": { "total_completed": "number", "average_score": "number", "best_score": "number" },
    "N4": { "total_completed": "number", "average_score": "number", "best_score": "number" },
    "N3": { "total_completed": "number", "average_score": "number", "best_score": "number" }
  }
}
```

---

### 10. 📖 Màn Hình Vocabulary Quiz (VocabularyQuizPage)

**File Path:** `/src/components/VocabularyQuizPage.js`

**State Variables:**
| Variable Name | Type | Default | Description |
|---------------|------|---------|-------------|
| `activeTab` | String | 'N5' | Tab JLPT hiện tại |
| `currentView` | String | 'overview' | View hiện tại |
| `selectedQuizNumber` | Number | null | Quiz được chọn |
| `levelStats` | Object | {} | Thống kê từng level |
| `loading` | Boolean | true | Trạng thái loading |

**Active Tab Values:**
- `N5` - 🔵 Cấp độ N5 (Blue - luôn unlock)
- `N4` - 🟠 Cấp độ N4 (Orange - unlock khi N5 đạt yêu cầu)
- `N3` - 🟣 Cấp độ N3 (Purple - unlock khi N4 đạt yêu cầu)
- `N2` - 🟢 Cấp độ N2 (Green - unlock khi N3 đạt yêu cầu)
- `N1` - 🔴 Cấp độ N1 (Red - unlock khi N2 đạt yêu cầu)

**Current View Values:**
- `overview` - Tổng quan level
- `quiz` - Đang làm quiz
- `result` - Kết quả quiz
- `statistics` - Thống kê chi tiết

---

### 11. 🟠 Màn Hình Vocabulary N4 (VocabularyN4Page)

**File Path:** `/src/components/VocabularyN4Page.js`

**Unlock Requirements:**
| Field Name | Type | Value | Description |
|------------|------|-------|-------------|
| `N5_REQUIRED_COMPLETED` | Number | 3 | Số quiz N5 cần hoàn thành |
| `N5_REQUIRED_AVERAGE` | Number | 70 | Điểm trung bình N5 cần đạt |

**State Variables:**
| Variable Name | Type | Default | Description |
|---------------|------|---------|-------------|
| `currentScreen` | String | 'selection' | Màn hình hiện tại |
| `availableQuizzes` | Array | [] | Danh sách quiz có sẵn |
| `stats` | Object | null | Thống kê N4 |
| `n5Stats` | Object | null | Thống kê N5 (để check unlock) |
| `selectedQuizNumber` | Number | null | Quiz được chọn |
| `quizResult` | Object | null | Kết quả quiz |
| `loading` | Boolean | true | Trạng thái loading |
| `isRetakeMode` | Boolean | false | Chế độ làm lại |

---

## 📚 Vocabulary & Dictionary Screens

### 12. 📖 Màn Hình Từ Vựng (VocabularyPage)

**File Path:** `/src/components/VocabularyPage.js`

**State Variables:**
| Variable Name | Type | Default | Description |
|---------------|------|---------|-------------|
| `selectedLevel` | String | 'N5' | Cấp độ JLPT được chọn |
| `selectedCategory` | String | 'all' | Danh mục được chọn |
| `searchTerm` | String | '' | Từ khóa tìm kiếm |
| `vocabulary` | Array | [] | Dữ liệu từ vựng |
| `categories` | Array | [] | Danh sách danh mục |
| `loading` | Boolean | true | Trạng thái loading |
| `error` | String | '' | Thông báo lỗi |
| `currentPage` | Number | 1 | Trang hiện tại |
| `totalPages` | Number | 1 | Tổng số trang |
| `totalVocab` | Number | 0 | Tổng số từ vựng |
| `itemsPerPage` | Number | 50 | Số item mỗi trang |
| `viewMode` | String | 'grid' | Chế độ hiển thị |

**Search Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `jlpt_level` | String | Cấp độ JLPT filter |
| `category` | String | Danh mục filter |
| `search` | String | Từ khóa tìm kiếm |
| `limit` | Number | Số item mỗi trang |
| `page` | Number | Số trang |

**Vocabulary Data Structure:**
```json
{
  "japanese": "string",
  "hiragana": "string", 
  "romaji": "string",
  "meaning": "string",
  "category": "string",
  "id": "number"
}
```

**View Mode Values:**
- `grid` - Hiển thị dạng lưới
- `list` - Hiển thị dạng danh sách
- `table` - Hiển thị dạng bảng

---

### 13. 🔍 Màn Hình Từ Điển (DictionaryPage)

**File Path:** `/src/components/DictionaryPage.js`

**State Variables:**
| Variable Name | Type | Default | Description |
|---------------|------|---------|-------------|
| `searchTerm` | String | '' | Từ khóa tìm kiếm |
| `results` | Array | [] | Kết quả tìm kiếm |
| `loading` | Boolean | false | Trạng thái loading |
| `error` | String | '' | Thông báo lỗi |

**Search Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | String | N/A | Từ khóa tìm kiếm |
| `limit` | Number | 10 | Giới hạn kết quả |

**Dictionary Entry Structure:**
```json
{
  "japanese": [
    {
      "word": "string",
      "reading": "string (optional)"
    }
  ],
  "senses": [
    {
      "english_definitions": ["string"],
      "parts_of_speech": ["string"],
      "tags": ["string (optional)"]
    }
  ],
  "tags": ["string (optional)"]
}
```

---

## 🈂️ Kanji Screens

### 14. 🎯 Màn Hình Kanji Explorer (KanjiExplorer)

**File Path:** `/src/components/KanjiExplorer.js`

**State Variables:**
| Variable Name | Type | Default | Description |
|---------------|------|---------|-------------|
| `kanjiList` | Array | [] | Danh sách kanji |
| `loading` | Boolean | true | Trạng thái loading |
| `error` | String | '' | Thông báo lỗi |
| `selectedKanji` | Object | null | Kanji được chọn |
| `searchTerm` | String | '' | Từ khóa tìm kiếm |
| `currentPage` | Number | 1 | Trang hiện tại |
| `totalPages` | Number | 1 | Tổng số trang |

**Filter Object:**
| Field Name | Type | Description |
|------------|------|-------------|
| `jlpt_level` | String | Cấp độ JLPT filter |
| `grade` | String | Cấp lớp filter |
| `min_strokes` | Number | Số nét tối thiểu |
| `max_strokes` | Number | Số nét tối đa |

**Kanji Data Structure:**
```json
{
  "character": "string",
  "meanings": ["string"],
  "readings_on": ["string"],
  "readings_kun": ["string"], 
  "jlpt_level": "string",
  "grade": "number",
  "stroke_count": "number",
  "frequency": "number"
}
```

---

### 15. ✍️ Màn Hình Kanji Stroke Viewer (KanjiStrokeViewer)

**File Path:** `/src/components/KanjiStrokeViewer.js`

**Component Props:**
| Prop Name | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `kanji` | String | ✅ Yes | N/A | Ký tự kanji |
| `strokeData` | Object | ❌ No | null | Dữ liệu stroke animation |
| `className` | String | ❌ No | '' | CSS classes |

**Stroke Data Structure:**
```json
{
  "character": "string",
  "stroke_count": "number",
  "paths": [
    {
      "d": "string",
      "id": "string", 
      "type": "string (optional)"
    }
  ]
}
```

---

## 🧭 Navigation & Context

### 16. 🧭 Navigation Component (Navigation)

**File Path:** `/src/components/Navigation.js`

**State Variables:**
| Variable Name | Type | Default | Description |
|---------------|------|---------|-------------|
| `showUserMenu` | Boolean | false | Hiển thị dropdown user |

**Navigation Items Structure:**
```json
[
  { "id": "home", "name": "Trang chủ", "icon": "Home", "color": "from-blue-500 to-blue-600" },
  { "id": "alphabet", "name": "Bảng chữ cái", "icon": "BookOpen", "color": "from-purple-500 to-purple-600" },
  { "id": "vocabulary", "name": "Từ vựng", "icon": "Star", "color": "from-green-500 to-green-600" },
  { "id": "dictionary", "name": "Từ điển", "icon": "Search", "color": "from-indigo-500 to-blue-600" },
  { "id": "kanji", "name": "Kanji", "icon": "PenTool", "color": "from-purple-600 to-indigo-600" },
  { "id": "quiz-hub", "name": "Quiz Hub", "icon": "Trophy", "color": "from-purple-500 to-pink-600" }
]
```

---

### 17. 🔐 Auth Context (AuthContext)

**File Path:** `/src/contexts/AuthContext.js`

**State Variables:**
| Variable Name | Type | Default | Description |
|---------------|------|---------|-------------|
| `user` | Object | null | Dữ liệu user hiện tại |
| `isLoading` | Boolean | true | Trạng thái loading authentication |

**User Data Structure:**
```json
{
  "id": "number",
  "name": "string", 
  "email": "string",
  "phone": "string (optional)",
  "address": "string (optional)",
  "age": "number (optional)",
  "japaneseLevel": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

---

## 📊 Database Schema & API

### 18. 🗄️ API Endpoints Data Structures

**Authentication Endpoints:**
| Endpoint | Method | Request Body | Response |
|----------|--------|--------------|----------|
| `/auth/login` | POST | `{ email, password }` | `{ success, user, token, error? }` |
| `/auth/signup` | POST | `{ name, email, password, age?, phone?, address?, japaneseLevel? }` | `{ success, user, token, error? }` |
| `/auth/forgot-password` | POST | `{ email }` | `{ success, message, error? }` |
| `/auth/reset-password` | POST | `{ email, token, newPassword }` | `{ success, message, error? }` |
| `/auth/verify` | GET | N/A | `{ success, user, error? }` |

**User Management Endpoints:**
| Endpoint | Method | Request Body | Response |
|----------|--------|--------------|----------|
| `/users/profile` | PUT | `{ name, email, phone?, address?, age?, japaneseLevel }` | `{ success, user, error? }` |
| `/users/change-password` | PUT | `{ currentPassword, newPassword }` | `{ success, message, error? }` |
| `/users/progress` | GET | N/A | `{ success, progress, error? }` |
| `/users/progress` | PUT | `{ progress }` | `{ success, message, error? }` |
| `/users/stats` | GET | N/A | `{ success, stats, error? }` |

**Quiz Endpoints:**
| Endpoint | Method | Request Body | Response |
|----------|--------|--------------|----------|
| `/quiz/generate` | POST | `{ jlpt_level, quiz_number }` | `{ success, quiz, error? }` |
| `/quiz/submit` | POST | `{ session_id, answers }` | `{ success, result, error? }` |
| `/quiz/available/:level` | GET | N/A | `{ success, quizzes, error? }` |
| `/quiz/stats/:level` | GET | N/A | `{ success, stats, error? }` |

**Vocabulary Endpoints:**
| Endpoint | Method | Query Params | Response |
|----------|--------|--------------|----------|
| `/vocabulary` | GET | `jlpt_level, category?, search?, limit, page` | `{ success, data, pagination, error? }` |
| `/vocabulary/categories` | GET | `jlpt_level?` | `{ success, categories, error? }` |

**Dictionary Endpoints:**
| Endpoint | Method | Query Params | Response |
|----------|--------|--------------|----------|
| `/dictionary/search` | GET | `q, limit?` | `{ success, results, error? }` |

**Kanji Endpoints:**
| Endpoint | Method | Query Params | Response |
|----------|--------|--------------|----------|
| `/kanji` | GET | `jlpt_level?, grade?, min_strokes?, max_strokes?, search?, page, limit` | `{ success, data, pagination, error? }` |
| `/kanji/stroke-data/:character` | GET | N/A | `{ success, strokeData, error? }` |

---

## 🎨 UI Component Props

### 19. 📱 Common UI Components

**CategoryCard Component:**
| Prop Name | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `icon` | Component | ✅ Yes | N/A | Lucide icon component |
| `title` | String | ✅ Yes | N/A | Tiêu đề card |
| `subtitle` | String | ✅ Yes | N/A | Mô tả card |
| `difficulty` | Number | ✅ Yes | N/A | Độ khó (1-5 sao) |
| `available` | Boolean | ✅ Yes | N/A | Có khả dụng không |
| `progress` | Object | ❌ No | null | Tiến độ `{ completed, total }` |
| `levels` | Array | ✅ Yes | N/A | Danh sách level `[{ name, completed, total, average }]` |
| `color` | String | ✅ Yes | N/A | Màu theme (blue, green, red, yellow) |
| `comingSoon` | Boolean | ❌ No | false | Có phải coming soon không |
| `onClick` | Function | ❌ No | null | Click handler |

**ProgressBar Component:**
| Prop Name | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `label` | String | ✅ Yes | N/A | Nhãn progress bar |
| `value` | Number | ✅ Yes | N/A | Giá trị hiện tại |
| `maxValue` | Number | ✅ Yes | N/A | Giá trị tối đa |
| `color` | String | ❌ No | 'blue' | Màu (blue, green, yellow) |
| `showPercentage` | Boolean | ❌ No | true | Hiển thị phần trăm |

**AchievementBadge Component:**
| Prop Name | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `icon` | Component | ✅ Yes | N/A | Icon achievement |
| `title` | String | ✅ Yes | N/A | Tên achievement |
| `description` | String | ✅ Yes | N/A | Mô tả achievement |
| `achieved` | Boolean | ✅ Yes | N/A | Đã đạt được chưa |
| `progress` | Number | ❌ No | null | Tiến độ (0-100) |

---

## 📋 Validation Rules Summary

### Required Field Validation:
- **Email**: HTML5 email pattern, required, lowercase conversion
- **Password**: Minimum 6 characters, required
- **Name**: Required, trimmed whitespace
- **Age**: Optional, range 13-100 if provided
- **Japanese Level**: Required, must be one of N5/N4/N3/N2/N1
- **Quiz Answers**: Must answer all questions before submission
- **Quiz Time**: 10 minutes (600 seconds) maximum per quiz

### Data Constraints:
- **Quiz Questions**: Exactly 10 per quiz
- **Answer Options**: 4 choices (A, B, C, D) per question
- **Vocabulary Pagination**: 50 items per page default
- **Dictionary Search**: 10 results limit default
- **Kanji Stroke Count**: Range 1-30+ strokes
- **Score Percentage**: 0-100%, rounded to 1 decimal place

### Business Rules:
- **Level Unlocking**: N4 requires 3 N5 quizzes completed with 70%+ average
- **Achievement System**: 6 categories of achievements with progress tracking
- **Retake Policy**: Unlimited retakes allowed for all quizzes
- **Progress Tracking**: Last 3 attempts stored per quiz
- **Session Management**: Auto-submit quiz when time expires

---

## 🔧 Technical Implementation Notes

### State Management Patterns:
- **useState** for local component state
- **useContext** for global authentication state
- **useEffect** for side effects and API calls
- **Props drilling** for parent-child communication

### API Communication:
- **Authorization**: Bearer token in headers
- **Content-Type**: application/json for all requests
- **Error Handling**: Consistent error response format
- **Loading States**: Boolean flags for async operations

### Data Flow:
1. User input → Local state
2. Form submission → API call with loading state
3. API response → Update state + user feedback
4. Navigation → Context updates + route changes

---

**📅 Document Version**: 1.0  
**🗓️ Last Updated**: August 15, 2025  
**👤 Author**: Development Team  
**✅ Status**: Complete Field Documentation

---

*Tài liệu này cung cấp chi tiết đầy đủ về tất cả các field, kiểu dữ liệu, validation rules và data structures trong Japanese Learning App. Tất cả thông tin được tổ chức theo từng màn hình để dễ dàng tham khảo và maintenance.*