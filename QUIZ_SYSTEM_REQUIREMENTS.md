# 📋 Yêu Cầu Nghiệp Vụ - Hệ Thống Quiz JLPT

## 📖 Tổng Quan Hệ Thống

Hệ thống Quiz JLPT là một nền tảng học tập tương tác được thiết kế để giúp người học tiếng Nhật luyện tập và đánh giá kiến thức theo chuẩn JLPT (Japanese Language Proficiency Test). Hệ thống được tổ chức theo cấu trúc phân cấp 3 tầng: **Category → Level → Quiz**.

---

## 🎯 Mục Tiêu Nghiệp Vụ

### 1. **Học Tập Có Hệ Thống**
- Cung cấp lộ trình học tập rõ ràng từ cơ bản đến nâng cao
- Đảm bảo người học nắm vững kiến thức trước khi chuyển cấp độ

### 2. **Đánh Giá Tiến Độ**
- Theo dõi chi tiết kết quả học tập của từng người dùng
- Cung cấp thống kê và phân tích xu hướng học tập

### 3. **Động Lực Học Tập**
- Hệ thống achievement và gamification
- Khuyến khích người học qua các thành tích và mục tiêu

---

## 🏗️ Kiến Trúc Hệ Thống

### **Cấu Trúc 3 Tầng:**

```
🏠 Quiz Hub (Dashboard Chính)
├── 📖 Từ Vựng (Vocabulary)
│   ├── 🔵 N5 (Beginner)
│   ├── 🟠 N4 (Intermediate) 
│   ├── 🟣 N3 (Advanced)
│   ├── 🟢 N2 (Expert)
│   └── 🔴 N1 (Master)
├── 📝 Ngữ Pháp (Grammar) [Coming Soon]
│   ├── 🔵 N5 → 🟠 N4 → 🟣 N3 → 🟢 N2 → 🔴 N1
└── 🈂️ Kanji [Coming Soon]
    ├── 🔵 N5 → 🟠 N4 → 🟣 N3 → 🟢 N2 → 🔴 N1
```

---

## 🎮 Chi Tiết Chức Năng

### **1. 🏠 Quiz Hub - Dashboard Chính**

#### **Yêu Cầu Nghiệp Vụ:**
- **UC001**: Hiển thị tổng quan tiến độ học tập
- **UC002**: Cung cấp điều hướng đến các category
- **UC003**: Thể hiện tình trạng unlock/lock của từng category

#### **Giao Diện:**
- **Header**: Logo, title "Master Japanese"
- **Progress Overview**: 3 card thống kê tổng (Vocabulary, Grammar, Kanji)
- **Category Cards**: 4 card chính (Vocabulary, Grammar, Kanji, Mixed Test)
- **Quick Stats**: Tổng số quiz hoàn thành, điểm trung bình, % tiến độ

#### **Business Rules:**
- Grammar và Kanji hiển thị "Coming Soon"
- Mixed Test unlock khi hoàn thành ít nhất 1 level của mỗi category
- Hiển thị progress bar cho mỗi category

---

### **2. 📖 Vocabulary Quiz System**

#### **2.1 Category Overview Page**

##### **Yêu Cầu Nghiệp Vụ:**
- **UC101**: Hiển thị các cấp độ N5-N1
- **UC102**: Thể hiện tình trạng unlock/lock của từng level
- **UC103**: Cung cấp thống kê chi tiết cho level hiện tại
- **UC104**: Đưa ra khuyến nghị học tập thông minh

##### **Level Tabs:**
- **N5**: 🔵 Blue - Always unlocked
- **N4**: 🟠 Orange - Unlocks when N5 requirements met
- **N3**: 🟣 Purple - Unlocks when N4 requirements met
- **N2**: 🟢 Green - Unlocks when N3 requirements met  
- **N1**: 🔴 Red - Unlocks when N2 requirements met

##### **Smart Recommendations:**
```javascript
// Logic nghiệp vụ cho khuyến nghị
if (total_completed === 0) {
    recommend: "Bắt đầu với Quiz 1"
} else if (total_completed < 3) {
    recommend: "Tiếp tục Quiz " + (total_completed + 1)
} else if (average_score >= 70) {
    recommend: "Sẵn sàng cho level tiếp theo"
} else {
    recommend: "Cải thiện điểm số trước khi chuyển level"
}
```

#### **2.2 Level-Specific Pages (N5, N4, N3...)**

##### **Yêu Cầu Nghiệp Vụ:**
- **UC201**: Hiển thị 10 quiz cho mỗi level
- **UC202**: Thể hiện trạng thái hoàn thành của từng quiz
- **UC203**: Cung cấp thống kê chi tiết cho level
- **UC204**: Kiểm tra điều kiện unlock level

##### **Quiz Grid Layout:**
```
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│  1  │ │  2  │ │  3  │ │  4  │ │  5  │
│ ✅  │ │ ✅  │ │ 🎯  │ │ 🔒  │ │ 🔒  │
│100% │ │ 85% │ │Next │ │Lock │ │Lock │
└─────┘ └─────┘ └─────┘ └─────┘ └─────┘
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│  6  │ │  7  │ │  8  │ │  9  │ │ 10  │
│ 🔒  │ │ 🔒  │ │ 🔒  │ │ 🔒  │ │👑  │
│Lock │ │Lock │ │Lock │ │Lock │ │Boss │
└─────┘ └─────┘ └─────┘ └─────┘ └─────┘
```

##### **Unlock Requirements:**
```javascript
// N4 Unlock Conditions
N5_requirements = {
    minimum_completed: 3,  // Hoàn thành ít nhất 3/10 quiz
    minimum_average: 70,   // Điểm trung bình ≥ 70%
    status: "unlocked"     // Khi đủ điều kiện
}
```

---

### **3. 🎯 Quiz Game Engine**

#### **3.1 Quiz Generation**

##### **Yêu Cầu Nghiệp Vụ:**
- **UC301**: Tạo 10 câu hỏi ngẫu nhiên từ pool từ vựng
- **UC302**: Đảm bảo không trùng lặp trong 1 quiz
- **UC303**: Cung cấp 4 lựa chọn cho mỗi câu hỏi
- **UC304**: Hỗ trợ retake quiz đã hoàn thành

##### **Question Format:**
```
Câu hỏi: "Từ '食べる' (たべる) có nghĩa là gì?"
A. Uống
B. Ăn ✓
C. Ngủ  
D. Đi
```

##### **Business Rules:**
- Mỗi quiz có đúng 10 câu hỏi
- Thời gian giới hạn: 10 phút (600 giây)
- 1 đáp án đúng, 3 đáp án sai ngẫu nhiên
- Cho phép retake không giới hạn

#### **3.2 Quiz Execution**

##### **Yêu Cầu Nghiệp Vụ:**
- **UC401**: Hiển thị timer đếm ngược
- **UC402**: Lưu progress theo thời gian thực
- **UC403**: Cảnh báo khi sắp hết thời gian
- **UC404**: Tự động submit khi hết giờ

##### **UI Components:**
- **Timer**: Hiển thị thời gian còn lại, đổi màu khi < 60s
- **Progress Bar**: Hiển thị câu hỏi hiện tại (3/10)
- **Question Card**: Hiển thị câu hỏi và 4 lựa chọn
- **Navigation**: Previous/Next buttons

#### **3.3 Quiz Submission & Results**

##### **Yêu Cầu Nghiệp Vụ:**
- **UC501**: Tính toán điểm số (% correct answers)
- **UC502**: Lưu kết quả vào database
- **UC503**: Hiển thị kết quả chi tiết
- **UC504**: Cập nhật thống kê tổng thể

##### **Scoring Logic:**
```javascript
score_percentage = (correct_answers / total_questions) * 100
final_score = Math.round(score_percentage * 100) / 100

// Phân loại kết quả
if (score >= 80) category = "Excellent" (Green)
else if (score >= 60) category = "Good" (Blue)  
else category = "Need Improvement" (Orange)
```

---

## 📊 Hệ Thống Thống Kê

### **4.1 Individual Quiz Statistics**

#### **Yêu Cầu Nghiệp Vụ:**
- **UC601**: Theo dõi multiple attempts cho mỗi quiz
- **UC602**: Hiển thị max/min/average score
- **UC603**: Lưu trữ 3 lần thử gần nhất
- **UC604**: Tính toán xu hướng cải thiện

#### **Data Structure:**
```javascript
quiz_stats = {
    quiz_number: 1,
    max_score: 100,
    min_score: 70, 
    avg_score: 85,
    attempt_count: 3,
    latest_date: "2025-08-15",
    last_3_attempts: [
        { score: 100, date: "2025-08-15", time_spent: 450 },
        { score: 80, date: "2025-08-10", time_spent: 500 },
        { score: 70, date: "2025-08-05", time_spent: 520 }
    ]
}
```

### **4.2 Level Statistics**

#### **Yêu Cầu Nghiệp Vụ:**
- **UC701**: Tính toán thống kê tổng thể cho level
- **UC702**: Xác định xu hướng học tập (improving/declining/stable)
- **UC703**: Hiển thị progress completion
- **UC704**: So sánh performance giữa các quiz

#### **Trend Calculation:**
```javascript
// Logic tính xu hướng
if (sessions.length >= 4) {
    recent_avg = average(last_2_sessions)
    earlier_avg = average(first_2_sessions)
    
    if (recent_avg > earlier_avg + 5) trend = "improving"
    else if (earlier_avg > recent_avg + 5) trend = "declining"
    else trend = "stable"
}
```

### **4.3 Cross-Level Analytics**

#### **Yêu Cầu Nghiệp Vụ:**
- **UC801**: So sánh performance giữa các level
- **UC802**: Tracking overall JLPT progress
- **UC803**: Recommendations cho level tiếp theo
- **UC804**: Achievement system

---

## 🏆 Achievement System

### **5.1 Categories**

#### **Beginner Achievements:**
- 🎯 **First Step**: Hoàn thành quiz đầu tiên
- ⭐ **Consistent**: Hoàn thành 5 quiz liên tiếp
- 🔥 **Perfect Score**: Đạt 100% trong 1 quiz

#### **Intermediate Achievements:**
- 🎖️ **Level Master**: Hoàn thành tất cả quiz của 1 level
- 📈 **Improving**: Cải thiện điểm số qua 5 lần thử liên tiếp
- ⚡ **Speed Master**: Hoàn thành quiz trong < 5 phút

#### **Advanced Achievements:**
- 👑 **JLPT Expert**: Đạt 80%+ average trên tất cả level
- 🌟 **Perfectionist**: Đạt 100% trên 10 quiz khác nhau
- 🚀 **Dedicated**: Học liên tục 30 ngày

---

## 🔒 Business Rules & Constraints

### **6.1 Level Unlocking**
```javascript
unlock_conditions = {
    N4: { N5_completed: 3, N5_average: 70 },
    N3: { N4_completed: 3, N4_average: 70 },
    N2: { N3_completed: 5, N3_average: 75 },
    N1: { N2_completed: 5, N2_average: 80 }
}
```

### **6.2 Data Retention**
- Quiz results: Permanent storage
- User progress: Permanent storage  
- Session data: 1 year retention
- Performance analytics: 2 year retention

### **6.3 Performance Requirements**
- Quiz load time: < 2 seconds
- Statistics calculation: < 1 second
- Database queries: < 500ms
- Concurrent users: 100+ supported

---

## 🛠️ Technical Implementation

### **7.1 Database Schema**

#### **Core Tables:**
```sql
-- Quiz Sessions
quiz_sessions {
    id, user_id, quiz_type, jlpt_level, quiz_number,
    total_questions, correct_answers, incorrect_answers,
    score_percentage, time_spent, created_at
}

-- Quiz Questions  
quiz_questions {
    id, session_id, vocabulary_id, question_text,
    option_a, option_b, option_c, option_d,
    correct_option, user_answer, is_correct
}

-- Vocabulary Database
vocabulary {
    id, japanese, hiragana, romaji, meaning,
    category, jlpt_level, difficulty, frequency_rank
}
```

### **7.2 API Endpoints**

#### **Quiz Management:**
- `POST /api/quiz/generate` - Tạo quiz mới
- `POST /api/quiz/submit` - Nộp bài quiz
- `GET /api/quiz/available/:level` - Lấy danh sách quiz
- `GET /api/quiz/stats/:level` - Lấy thống kê

#### **User Progress:**
- `GET /api/user/progress` - Tiến độ tổng thể
- `GET /api/user/achievements` - Danh sách achievement
- `POST /api/user/update-progress` - Cập nhật tiến độ

---

## 📈 Success Metrics

### **8.1 User Engagement**
- **Quiz Completion Rate**: >80% quiz được hoàn thành
- **Return Rate**: >60% user quay lại trong 7 ngày
- **Level Progression**: >40% user unlock level tiếp theo

### **8.2 Learning Effectiveness**  
- **Score Improvement**: Trung bình +15% từ lần thử đầu đến cuối
- **Retention Rate**: >70% kiến thức được duy trì sau 30 ngày
- **JLPT Pass Rate**: >85% user đạt mục tiêu JLPT

### **8.3 System Performance**
- **Response Time**: <2s cho mọi operation
- **Uptime**: >99.5% availability
- **Error Rate**: <0.1% failed requests

---

## 🚀 Future Enhancements

### **Phase 2: Grammar System**
- Pattern-based questions
- Conjugation exercises
- Context-based scenarios

### **Phase 3: Kanji System**
- Stroke order practice
- Radical recognition
- Reading practice (On/Kun)

### **Phase 4: Mixed Testing**
- Comprehensive JLPT simulation
- Adaptive difficulty
- AI-powered recommendations

### **Phase 5: Social Features**
- Leaderboards
- Study groups
- Peer challenges

---

## 📝 Appendix

### **A1. Glossary**
- **JLPT**: Japanese Language Proficiency Test
- **Level**: Cấp độ khó (N5-N1)
- **Category**: Loại nội dung (Vocabulary, Grammar, Kanji)
- **Quiz**: Bài kiểm tra 10 câu hỏi
- **Session**: Phiên làm bài của user

### **A2. References**
- JLPT Official Guidelines
- Japanese Language Learning Standards
- User Experience Research Data
- Performance Benchmarking Results

---

**📅 Document Version**: 1.0  
**🗓️ Last Updated**: August 15, 2025  
**👤 Author**: Development Team  
**✅ Status**: Implementation Complete (Phase 1)

---

*This document serves as the comprehensive business requirements specification for the Japanese Learning Quiz System. All features described herein have been implemented and tested as of the document date.*