// Seed vocabulary data from existing frontend data
const { runQuery, initDatabase, closeDatabase } = require('../database/database');

// Import vocabulary data from frontend (copy from japaneseData.js)
const vocabularyN5 = [
  // Danh từ (Nouns)
  { japanese: '人', hiragana: 'ひと', romaji: 'hito', meaning: 'người', category: 'danh từ' },
  { japanese: '水', hiragana: 'みず', romaji: 'mizu', meaning: 'nước', category: 'danh từ' },
  { japanese: '火', hiragana: 'ひ', romaji: 'hi', meaning: 'lửa', category: 'danh từ' },
  { japanese: '木', hiragana: 'き', romaji: 'ki', meaning: 'cây', category: 'danh từ' },
  { japanese: '土', hiragana: 'つち', romaji: 'tsuchi', meaning: 'đất', category: 'danh từ' },
  { japanese: '金', hiragana: 'きん', romaji: 'kin', meaning: 'vàng/tiền', category: 'danh từ' },
  { japanese: '月', hiragana: 'つき', romaji: 'tsuki', meaning: 'mặt trăng/tháng', category: 'danh từ' },
  { japanese: '日', hiragana: 'ひ', romaji: 'hi', meaning: 'mặt trời/ngày', category: 'danh từ' },
  { japanese: '時間', hiragana: 'じかん', romaji: 'jikan', meaning: 'thời gian', category: 'danh từ' },
  { japanese: '友達', hiragana: 'ともだち', romaji: 'tomodachi', meaning: 'bạn bè', category: 'danh từ' },
  { japanese: '家族', hiragana: 'かぞく', romaji: 'kazoku', meaning: 'gia đình', category: 'danh từ' },
  { japanese: '学校', hiragana: 'がっこう', romaji: 'gakkou', meaning: 'trường học', category: 'danh từ' },
  { japanese: '仕事', hiragana: 'しごと', romaji: 'shigoto', meaning: 'công việc', category: 'danh từ' },
  { japanese: '会社', hiragana: 'かいしゃ', romaji: 'kaisha', meaning: 'công ty', category: 'danh từ' },
  { japanese: '電話', hiragana: 'でんわ', romaji: 'denwa', meaning: 'điện thoại', category: 'danh từ' },
  
  // Động từ (Verbs)
  { japanese: '食べる', hiragana: 'たべる', romaji: 'taberu', meaning: 'ăn', category: 'động từ' },
  { japanese: '飲む', hiragana: 'のむ', romaji: 'nomu', meaning: 'uống', category: 'động từ' },
  { japanese: '見る', hiragana: 'みる', romaji: 'miru', meaning: 'nhìn/xem', category: 'động từ' },
  { japanese: '聞く', hiragana: 'きく', romaji: 'kiku', meaning: 'nghe', category: 'động từ' },
  { japanese: '話す', hiragana: 'はなす', romaji: 'hanasu', meaning: 'nói', category: 'động từ' },
  { japanese: '読む', hiragana: 'よむ', romaji: 'yomu', meaning: 'đọc', category: 'động từ' },
  { japanese: '書く', hiragana: 'かく', romaji: 'kaku', meaning: 'viết', category: 'động từ' },
  { japanese: '行く', hiragana: 'いく', romaji: 'iku', meaning: 'đi', category: 'động từ' },
  { japanese: '来る', hiragana: 'くる', romaji: 'kuru', meaning: 'đến', category: 'động từ' },
  { japanese: '帰る', hiragana: 'かえる', romaji: 'kaeru', meaning: 'về', category: 'động từ' },
  { japanese: '寝る', hiragana: 'ねる', romaji: 'neru', meaning: 'ngủ', category: 'động từ' },
  { japanese: '起きる', hiragana: 'おきる', romaji: 'okiru', meaning: 'thức dậy', category: 'động từ' },
  { japanese: '働く', hiragana: 'はたらく', romaji: 'hataraku', meaning: 'làm việc', category: 'động từ' },
  { japanese: '勉強する', hiragana: 'べんきょうする', romaji: 'benkyou suru', meaning: 'học tập', category: 'động từ' },
  { japanese: '買う', hiragana: 'かう', romaji: 'kau', meaning: 'mua', category: 'động từ' },
  
  // Tính từ (Adjectives)
  { japanese: '大きい', hiragana: 'おおきい', romaji: 'ookii', meaning: 'lớn', category: 'tính từ' },
  { japanese: '小さい', hiragana: 'ちいさい', romaji: 'chiisai', meaning: 'nhỏ', category: 'tính từ' },
  { japanese: '新しい', hiragana: 'あたらしい', romaji: 'atarashii', meaning: 'mới', category: 'tính từ' },
  { japanese: '古い', hiragana: 'ふるい', romaji: 'furui', meaning: 'cũ', category: 'tính từ' },
  { japanese: '良い', hiragana: 'よい', romaji: 'yoi', meaning: 'tốt', category: 'tính từ' },
  { japanese: '悪い', hiragana: 'わるい', romaji: 'warui', meaning: 'xấu', category: 'tính từ' },
  { japanese: '高い', hiragana: 'たかい', romaji: 'takai', meaning: 'cao/đắt', category: 'tính từ' },
  { japanese: '安い', hiragana: 'やすい', romaji: 'yasui', meaning: 'rẻ', category: 'tính từ' },
  { japanese: '暑い', hiragana: 'あつい', romaji: 'atsui', meaning: 'nóng', category: 'tính từ' },
  { japanese: '寒い', hiragana: 'さむい', romaji: 'samui', meaning: 'lạnh', category: 'tính từ' },
  { japanese: '美しい', hiragana: 'うつくしい', romaji: 'utsukushii', meaning: 'đẹp', category: 'tính từ' },
  { japanese: '面白い', hiragana: 'おもしろい', romaji: 'omoshiroi', meaning: 'thú vị', category: 'tính từ' },
  { japanese: '難しい', hiragana: 'むずかしい', romaji: 'muzukashii', meaning: 'khó', category: 'tính từ' },
  { japanese: '易しい', hiragana: 'やさしい', romaji: 'yasashii', meaning: 'dễ/dễ thương', category: 'tính từ' },
  { japanese: '忙しい', hiragana: 'いそがしい', romaji: 'isogashii', meaning: 'bận rộn', category: 'tính từ' },
  
  // Đại từ và từ khác (Pronouns & Others)
  { japanese: '私', hiragana: 'わたし', romaji: 'watashi', meaning: 'tôi', category: 'đại từ' },
  { japanese: 'あなた', hiragana: 'あなた', romaji: 'anata', meaning: 'bạn', category: 'đại từ' },
  { japanese: '彼', hiragana: 'かれ', romaji: 'kare', meaning: 'anh ấy', category: 'đại từ' },
  { japanese: '彼女', hiragana: 'かのじょ', romaji: 'kanojo', meaning: 'cô ấy', category: 'đại từ' },
  { japanese: 'これ', hiragana: 'これ', romaji: 'kore', meaning: 'cái này', category: 'đại từ' },
  { japanese: 'それ', hiragana: 'それ', romaji: 'sore', meaning: 'cái đó', category: 'đại từ' },
  { japanese: 'あれ', hiragana: 'あれ', romaji: 'are', meaning: 'cái kia', category: 'đại từ' },
  { japanese: 'どれ', hiragana: 'どれ', romaji: 'dore', meaning: 'cái nào', category: 'đại từ' },
  { japanese: 'ここ', hiragana: 'ここ', romaji: 'koko', meaning: 'ở đây', category: 'đại từ' },
  { japanese: 'そこ', hiragana: 'そこ', romaji: 'soko', meaning: 'ở đó', category: 'đại từ' },
  { japanese: 'あそこ', hiragana: 'あそこ', romaji: 'asoko', meaning: 'ở kia', category: 'đại từ' },
  { japanese: 'どこ', hiragana: 'どこ', romaji: 'doko', meaning: 'ở đâu', category: 'đại từ' }
];

// N4 Vocabulary Data (100 words)
const vocabularyN4 = [
  // Danh từ nâng cao (Advanced Nouns)
  { japanese: '政治', hiragana: 'せいじ', romaji: 'seiji', meaning: 'chính trị', category: 'danh từ' },
  { japanese: '経済', hiragana: 'けいざい', romaji: 'keizai', meaning: 'kinh tế', category: 'danh từ' },
  { japanese: '社会', hiragana: 'しゃかい', romaji: 'shakai', meaning: 'xã hội', category: 'danh từ' },
  { japanese: '文化', hiragana: 'ぶんか', romaji: 'bunka', meaning: 'văn hóa', category: 'danh từ' },
  { japanese: '歴史', hiragana: 'れきし', romaji: 'rekishi', meaning: 'lịch sử', category: 'danh từ' },
  { japanese: '科学', hiragana: 'かがく', romaji: 'kagaku', meaning: 'khoa học', category: 'danh từ' },
  { japanese: '技術', hiragana: 'ぎじゅつ', romaji: 'gijutsu', meaning: 'kỹ thuật', category: 'danh từ' },
  { japanese: '環境', hiragana: 'かんきょう', romaji: 'kankyou', meaning: 'môi trường', category: 'danh từ' },
  { japanese: '問題', hiragana: 'もんだい', romaji: 'mondai', meaning: 'vấn đề', category: 'danh từ' },
  { japanese: '解決', hiragana: 'かいけつ', romaji: 'kaiketsu', meaning: 'giải quyết', category: 'danh từ' },
  { japanese: '機会', hiragana: 'きかい', romaji: 'kikai', meaning: 'cơ hội', category: 'danh từ' },
  { japanese: '経験', hiragana: 'けいけん', romaji: 'keiken', meaning: 'kinh nghiệm', category: 'danh từ' },
  { japanese: '知識', hiragana: 'ちしき', romaji: 'chishiki', meaning: 'kiến thức', category: 'danh từ' },
  { japanese: '能力', hiragana: 'のうりょく', romaji: 'nouryoku', meaning: 'khả năng', category: 'danh từ' },
  { japanese: '努力', hiragana: 'どりょく', romaji: 'doryoku', meaning: 'nỗ lực', category: 'danh từ' },
  { japanese: '成功', hiragana: 'せいこう', romaji: 'seikou', meaning: 'thành công', category: 'danh từ' },
  { japanese: '失敗', hiragana: 'しっぱい', romaji: 'shippai', meaning: 'thất bại', category: 'danh từ' },
  { japanese: '計画', hiragana: 'けいかく', romaji: 'keikaku', meaning: 'kế hoạch', category: 'danh từ' },
  { japanese: '目標', hiragana: 'もくひょう', romaji: 'mokuhyou', meaning: 'mục tiêu', category: 'danh từ' },
  { japanese: '結果', hiragana: 'けっか', romaji: 'kekka', meaning: 'kết quả', category: 'danh từ' },
  { japanese: '原因', hiragana: 'げんいん', romaji: 'gen\'in', meaning: 'nguyên nhân', category: 'danh từ' },
  { japanese: '影響', hiragana: 'えいきょう', romaji: 'eikyou', meaning: 'ảnh hưởng', category: 'danh từ' },
  { japanese: '関係', hiragana: 'かんけい', romaji: 'kankei', meaning: 'mối quan hệ', category: 'danh từ' },
  { japanese: '連絡', hiragana: 'れんらく', romaji: 'renraku', meaning: 'liên lạc', category: 'danh từ' },
  { japanese: '相談', hiragana: 'そうだん', romaji: 'soudan', meaning: 'tham khảo', category: 'danh từ' },
  { japanese: '約束', hiragana: 'やくそく', romaji: 'yakusoku', meaning: 'lời hứa', category: 'danh từ' },
  { japanese: '会議', hiragana: 'かいぎ', romaji: 'kaigi', meaning: 'cuộc họp', category: 'danh từ' },
  { japanese: '発表', hiragana: 'はっぴょう', romaji: 'happyou', meaning: 'thuyết trình', category: 'danh từ' },
  { japanese: '説明', hiragana: 'せつめい', romaji: 'setsumei', meaning: 'giải thích', category: 'danh từ' },
  { japanese: '意見', hiragana: 'いけん', romaji: 'iken', meaning: 'ý kiến', category: 'danh từ' },
  
  // Động từ nâng cao (Advanced Verbs)
  { japanese: '決める', hiragana: 'きめる', romaji: 'kimeru', meaning: 'quyết định', category: 'động từ' },
  { japanese: '選ぶ', hiragana: 'えらぶ', romaji: 'erabu', meaning: 'chọn', category: 'động từ' },
  { japanese: '比べる', hiragana: 'くらべる', romaji: 'kuraberu', meaning: 'so sánh', category: 'động từ' },
  { japanese: '考える', hiragana: 'かんがえる', romaji: 'kangaeru', meaning: 'suy nghĩ', category: 'động từ' },
  { japanese: '覚える', hiragana: 'おぼえる', romaji: 'oboeru', meaning: 'nhớ', category: 'động từ' },
  { japanese: '忘れる', hiragana: 'わすれる', romaji: 'wasureru', meaning: 'quên', category: 'động từ' },
  { japanese: '理解する', hiragana: 'りかいする', romaji: 'rikai suru', meaning: 'hiểu', category: 'động từ' },
  { japanese: '説明する', hiragana: 'せつめいする', romaji: 'setsumei suru', meaning: 'giải thích', category: 'động từ' },
  { japanese: '発見する', hiragana: 'はっけんする', romaji: 'hakken suru', meaning: 'khám phá', category: 'động từ' },
  { japanese: '発明する', hiragana: 'はつめいする', romaji: 'hatsumei suru', meaning: 'phát minh', category: 'động từ' },
  { japanese: '改善する', hiragana: 'かいぜんする', romaji: 'kaizen suru', meaning: 'cải thiện', category: 'động từ' },
  { japanese: '発展する', hiragana: 'はってんする', romaji: 'hatten suru', meaning: 'phát triển', category: 'động từ' },
  { japanese: '変化する', hiragana: 'へんかする', romaji: 'henka suru', meaning: 'thay đổi', category: 'động từ' },
  { japanese: '増加する', hiragana: 'ぞうかする', romaji: 'zouka suru', meaning: 'tăng', category: 'động từ' },
  { japanese: '減少する', hiragana: 'げんしょうする', romaji: 'genshou suru', meaning: 'giảm', category: 'động từ' },
  { japanese: '続ける', hiragana: 'つづける', romaji: 'tsuzukeru', meaning: 'tiếp tục', category: 'động từ' },
  { japanese: '止める', hiragana: 'やめる', romaji: 'yameru', meaning: 'dừng lại', category: 'động từ' },
  { japanese: '始める', hiragana: 'はじめる', romaji: 'hajimeru', meaning: 'bắt đầu', category: 'động từ' },
  { japanese: '終わる', hiragana: 'おわる', romaji: 'owaru', meaning: 'kết thúc', category: 'động từ' },
  { japanese: '完成する', hiragana: 'かんせいする', romaji: 'kansei suru', meaning: 'hoàn thành', category: 'động từ' },
  { japanese: '準備する', hiragana: 'じゅんびする', romaji: 'junbi suru', meaning: 'chuẩn bị', category: 'động từ' },
  { japanese: '確認する', hiragana: 'かくにんする', romaji: 'kakunin suru', meaning: 'xác nhận', category: 'động từ' },
  { japanese: '注意する', hiragana: 'ちゅういする', romaji: 'chuui suru', meaning: 'chú ý', category: 'động từ' },
  { japanese: '心配する', hiragana: 'しんぱいする', romaji: 'shinpai suru', meaning: 'lo lắng', category: 'động từ' },
  { japanese: '安心する', hiragana: 'あんしんする', romaji: 'anshin suru', meaning: 'yên tâm', category: 'động từ' },
  
  // Tính từ nâng cao (Advanced Adjectives)
  { japanese: '複雑な', hiragana: 'ふくざつな', romaji: 'fukuzatsu na', meaning: 'phức tạp', category: 'tính từ' },
  { japanese: '簡単な', hiragana: 'かんたんな', romaji: 'kantan na', meaning: 'đơn giản', category: 'tính từ' },
  { japanese: '重要な', hiragana: 'じゅうような', romaji: 'juuyou na', meaning: 'quan trọng', category: 'tính từ' },
  { japanese: '必要な', hiragana: 'ひつような', romaji: 'hitsuyou na', meaning: 'cần thiết', category: 'tính từ' },
  { japanese: '便利な', hiragana: 'べんりな', romaji: 'benri na', meaning: 'tiện lợi', category: 'tính từ' },
  { japanese: '不便な', hiragana: 'ふべんな', romaji: 'fuben na', meaning: 'bất tiện', category: 'tính từ' },
  { japanese: '安全な', hiragana: 'あんぜんな', romaji: 'anzen na', meaning: 'an toàn', category: 'tính từ' },
  { japanese: '危険な', hiragana: 'きけんな', romaji: 'kiken na', meaning: 'nguy hiểm', category: 'tính từ' },
  { japanese: '正確な', hiragana: 'せいかくな', romaji: 'seikaku na', meaning: 'chính xác', category: 'tính từ' },
  { japanese: '間違った', hiragana: 'まちがった', romaji: 'machigatta', meaning: 'sai lầm', category: 'tính từ' },
  { japanese: '適当な', hiragana: 'てきとうな', romaji: 'tekitou na', meaning: 'phù hợp', category: 'tính từ' },
  { japanese: '特別な', hiragana: 'とくべつな', romaji: 'tokubetsu na', meaning: 'đặc biệt', category: 'tính từ' },
  { japanese: '普通の', hiragana: 'ふつうの', romaji: 'futsuu no', meaning: 'bình thường', category: 'tính từ' },
  { japanese: '自然な', hiragana: 'しぜんな', romaji: 'shizen na', meaning: 'tự nhiên', category: 'tính từ' },
  { japanese: '人工的な', hiragana: 'じんこうてきな', romaji: 'jinkouteki na', meaning: 'nhân tạo', category: 'tính từ' },
  { japanese: '現代的な', hiragana: 'げんだいてきな', romaji: 'gendaiteki na', meaning: 'hiện đại', category: 'tính từ' },
  { japanese: '伝統的な', hiragana: 'でんとうてきな', romaji: 'dentouteki na', meaning: 'truyền thống', category: 'tính từ' },
  { japanese: '国際的な', hiragana: 'こくさいてきな', romaji: 'kokusaiteki na', meaning: 'quốc tế', category: 'tính từ' },
  { japanese: '個人的な', hiragana: 'こじんてきな', romaji: 'kojinteki na', meaning: 'cá nhân', category: 'tính từ' },
  { japanese: '社会的な', hiragana: 'しゃかいてきな', romaji: 'shakaiteki na', meaning: 'xã hội', category: 'tính từ' },
  
  // Trạng từ và từ khác (Adverbs & Others)
  { japanese: 'すぐに', hiragana: 'すぐに', romaji: 'sugu ni', meaning: 'ngay lập tức', category: 'trạng từ' },
  { japanese: 'ゆっくり', hiragana: 'ゆっくり', romaji: 'yukkuri', meaning: 'chậm rãi', category: 'trạng từ' },
  { japanese: '急に', hiragana: 'きゅうに', romaji: 'kyuu ni', meaning: 'đột ngột', category: 'trạng từ' },
  { japanese: '特に', hiragana: 'とくに', romaji: 'toku ni', meaning: 'đặc biệt', category: 'trạng từ' },
  { japanese: '実際に', hiragana: 'じっさいに', romaji: 'jissai ni', meaning: 'thực tế', category: 'trạng từ' },
  { japanese: '確かに', hiragana: 'たしかに', romaji: 'tashika ni', meaning: 'chắc chắn', category: 'trạng từ' },
  { japanese: 'おそらく', hiragana: 'おそらく', romaji: 'osoraku', meaning: 'có lẽ', category: 'trạng từ' },
  { japanese: 'たぶん', hiragana: 'たぶん', romaji: 'tabun', meaning: 'có thể', category: 'trạng từ' },
  { japanese: 'きっと', hiragana: 'きっと', romaji: 'kitto', meaning: 'chắc chắn', category: 'trạng từ' },
  { japanese: 'もちろん', hiragana: 'もちろん', romaji: 'mochiron', meaning: 'tất nhiên', category: 'trạng từ' },
  { japanese: 'やはり', hiragana: 'やはり', romaji: 'yahari', meaning: 'quả nhiên', category: 'trạng từ' },
  { japanese: 'さすが', hiragana: 'さすが', romaji: 'sasuga', meaning: 'đúng như mong đợi', category: 'trạng từ' },
  { japanese: 'なるほど', hiragana: 'なるほど', romaji: 'naruhodo', meaning: 'hiểu rồi', category: 'trạng từ' },
  { japanese: 'つまり', hiragana: 'つまり', romaji: 'tsumari', meaning: 'có nghĩa là', category: 'trạng từ' },
  { japanese: 'ところで', hiragana: 'ところで', romaji: 'tokoro de', meaning: 'nhân tiện', category: 'trạng từ' },
  { japanese: 'それでは', hiragana: 'それでは', romaji: 'sore dewa', meaning: 'vậy thì', category: 'trạng từ' },
  { japanese: 'しかし', hiragana: 'しかし', romaji: 'shikashi', meaning: 'tuy nhiên', category: 'liên từ' },
  { japanese: 'だから', hiragana: 'だから', romaji: 'dakara', meaning: 'vì vậy', category: 'liên từ' },
  { japanese: 'それに', hiragana: 'それに', romaji: 'sore ni', meaning: 'thêm vào đó', category: 'liên từ' },
  { japanese: 'また', hiragana: 'また', romaji: 'mata', meaning: 'ngoài ra', category: 'liên từ' },
  
  // Từ vựng chuyên môn (Professional vocabulary)
  { japanese: '資料', hiragana: 'しりょう', romaji: 'shiryou', meaning: 'tài liệu', category: 'danh từ' },
  { japanese: '情報', hiragana: 'じょうほう', romaji: 'jouhou', meaning: 'thông tin', category: 'danh từ' },
  { japanese: '報告', hiragana: 'ほうこく', romaji: 'houkoku', meaning: 'báo cáo', category: 'danh từ' },
  { japanese: '研究', hiragana: 'けんきゅう', romaji: 'kenkyuu', meaning: 'nghiên cứu', category: 'danh từ' },
  { japanese: '実験', hiragana: 'じっけん', romaji: 'jikken', meaning: 'thí nghiệm', category: 'danh từ' },
  { japanese: '調査', hiragana: 'ちょうさ', romaji: 'chousa', meaning: 'điều tra', category: 'danh từ' },
  { japanese: '分析', hiragana: 'ぶんせき', romaji: 'bunseki', meaning: 'phân tích', category: 'danh từ' },
  { japanese: '統計', hiragana: 'とうけい', romaji: 'toukei', meaning: 'thống kê', category: 'danh từ' },
  { japanese: '効果', hiragana: 'こうか', romaji: 'kouka', meaning: 'hiệu quả', category: 'danh từ' },
  { japanese: '方法', hiragana: 'ほうほう', romaji: 'houhou', meaning: 'phương pháp', category: 'danh từ' },
  { japanese: '手段', hiragana: 'しゅだん', romaji: 'shudan', meaning: 'phương tiện', category: 'danh từ' },
  { japanese: '条件', hiragana: 'じょうけん', romaji: 'jouken', meaning: 'điều kiện', category: 'danh từ' },
  { japanese: '状況', hiragana: 'じょうきょう', romaji: 'joukyou', meaning: 'tình hình', category: 'danh từ' },
  { japanese: '場合', hiragana: 'ばあい', romaji: 'baai', meaning: 'trường hợp', category: 'danh từ' },
  { japanese: '理由', hiragana: 'りゆう', romaji: 'riyuu', meaning: 'lý do', category: 'danh từ' },
  { japanese: '目的', hiragana: 'もくてき', romaji: 'mokuteki', meaning: 'mục đích', category: 'danh từ' },
  { japanese: '意味', hiragana: 'いみ', romaji: 'imi', meaning: 'ý nghĩa', category: 'danh từ' },
  { japanese: '価値', hiragana: 'かち', romaji: 'kachi', meaning: 'giá trị', category: 'danh từ' },
  { japanese: '利益', hiragana: 'りえき', romaji: 'rieki', meaning: 'lợi ích', category: 'danh từ' },
  { japanese: '損失', hiragana: 'そんしつ', romaji: 'sonshitsu', meaning: 'tổn thất', category: 'danh từ' }
];

async function seedVocabulary() {
  try {
    console.log('🌱 Bắt đầu seed vocabulary data...');
    
    await initDatabase();
    console.log('✅ Database connected');

    // Clear existing data
    await runQuery('DELETE FROM vocabulary');
    console.log('🧹 Cleared existing vocabulary data');

    let successCount = 0;
    let errorCount = 0;
    const totalVocab = vocabularyN5.length + vocabularyN4.length;

    // Insert N5 vocabulary data
    console.log('📖 Inserting N5 vocabulary...');
    for (const [index, vocab] of vocabularyN5.entries()) {
      try {
        await runQuery(`
          INSERT INTO vocabulary (
            japanese, hiragana, romaji, meaning, category, 
            jlpt_level, difficulty, frequency_rank
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          vocab.japanese,
          vocab.hiragana,
          vocab.romaji,
          vocab.meaning,
          vocab.category,
          'N5',
          Math.floor(Math.random() * 3) + 1, // Random difficulty 1-3 for N5
          index + 1 // Use index as frequency rank
        ]);
        
        successCount++;
        
        if (successCount % 10 === 0) {
          console.log(`📝 Inserted ${successCount}/${totalVocab} vocabulary items...`);
        }
        
      } catch (error) {
        console.error(`❌ Error inserting N5 ${vocab.japanese}:`, error.message);
        errorCount++;
      }
    }

    // Insert N4 vocabulary data
    console.log('📘 Inserting N4 vocabulary...');
    for (const [index, vocab] of vocabularyN4.entries()) {
      try {
        await runQuery(`
          INSERT INTO vocabulary (
            japanese, hiragana, romaji, meaning, category, 
            jlpt_level, difficulty, frequency_rank
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          vocab.japanese,
          vocab.hiragana,
          vocab.romaji,
          vocab.meaning,
          vocab.category,
          'N4',
          Math.floor(Math.random() * 2) + 3, // Random difficulty 3-4 for N4 (harder than N5)
          vocabularyN5.length + index + 1 // Continue frequency rank from N5
        ]);
        
        successCount++;
        
        if (successCount % 10 === 0) {
          console.log(`📝 Inserted ${successCount}/${totalVocab} vocabulary items...`);
        }
        
      } catch (error) {
        console.error(`❌ Error inserting N4 ${vocab.japanese}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 SEED RESULTS:');
    console.log(`✅ Successfully inserted: ${successCount} items`);
    console.log(`❌ Errors: ${errorCount} items`);
    console.log(`📝 Total processed: ${totalVocab} items (${vocabularyN5.length} N5 + ${vocabularyN4.length} N4)`);

    // Show sample data
    const sampleData = await runQuery(`
      SELECT japanese, hiragana, meaning, category 
      FROM vocabulary 
      LIMIT 5
    `);
    
    console.log('\n📖 Sample vocabulary data:');
    console.table(sampleData);

    // Show statistics
    const stats = await runQuery(`
      SELECT 
        category,
        COUNT(*) as count
      FROM vocabulary 
      GROUP BY category
      ORDER BY count DESC
    `);
    
    console.log('\n📈 Vocabulary by category:');
    console.table(stats);

    await closeDatabase();
    console.log('\n🎉 Vocabulary seeding completed successfully!');

  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedVocabulary();
}

module.exports = { seedVocabulary };