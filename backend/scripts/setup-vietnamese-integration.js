const axios = require('axios');
const Database = require('better-sqlite3');

// Step 1: Download and extract KanjiDictVN data
async function downloadHanVietData() {
  console.log('📚 Downloading KanjiDictVN data for Hán Việt readings...');
  
  try {
    // Download the raw data from KanjiDictVN repo
    const response = await axios.get('https://api.github.com/repos/trungnt2910/KanjiDictVN/contents/out_vn');
    console.log('✅ Found KanjiDictVN files:', response.data.length);
    
    // Look for index.json or similar files
    for (const file of response.data) {
      if (file.name.includes('index.json') || file.name.includes('.json')) {
        console.log(`📄 Found JSON file: ${file.name} (${file.size} bytes)`);
        
        // Download the actual JSON content
        const contentResponse = await axios.get(file.download_url);
        return contentResponse.data;
      }
    }
  } catch (error) {
    console.error('❌ Error downloading KanjiDictVN data:', error.message);
    console.log('💡 Alternative: Clone the repo manually and extract data');
    return null;
  }
}

// Step 2: Setup Google Translate integration
function setupGoogleTranslate() {
  console.log('🌐 Setting up Google Translate integration...');
  
  // Check if Google Translate API key is available
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  
  if (!apiKey) {
    console.log(`
⚠️  Google Translate API key not found!

📋 To setup Google Translate:
1. Go to Google Cloud Console: https://console.cloud.google.com
2. Create a new project or select existing
3. Enable "Cloud Translation API"
4. Create API key: APIs & Services > Credentials > Create Credentials
5. Add to environment: GOOGLE_TRANSLATE_API_KEY=your_key_here
6. Free tier: 500,000 characters/month

💡 For now, we'll use alternative translation approach.
    `);
    return false;
  }
  
  console.log('✅ Google Translate API key found');
  return true;
}

// Step 3: Alternative free translation using existing mappings
const createBasicVietnameseMapping = () => {
  return {
    // Basic meanings mapping (expand this based on your kanji data)
    'one': 'một',
    'two': 'hai', 
    'three': 'ba',
    'four': 'bốn',
    'five': 'năm',
    'six': 'sáu',
    'seven': 'bảy',
    'eight': 'tám',
    'nine': 'chín',
    'ten': 'mười',
    'hundred': 'trăm',
    'thousand': 'nghìn',
    'year': 'năm',
    'month': 'tháng',
    'day': 'ngày',
    'big': 'lớn',
    'small': 'nhỏ',
    'person': 'người',
    'man': 'đàn ông',
    'woman': 'phụ nữ',
    'child': 'trẻ em',
    'water': 'nước',
    'fire': 'lửa',
    'tree': 'cây',
    'mountain': 'núi',
    'river': 'sông',
    'sea': 'biển',
    'sky': 'trời',
    'earth': 'đất',
    'sun': 'mặt trời',
    'moon': 'mặt trăng',
    'star': 'ngôi sao',
    'light': 'ánh sáng',
    'dark': 'tối',
    'white': 'trắng',
    'black': 'đen',
    'red': 'đỏ',
    'blue': 'xanh',
    'green': 'xanh lá',
    'yellow': 'vàng',
    'good': 'tốt',
    'bad': 'xấu',
    'new': 'mới',
    'old': 'cũ',
    'hot': 'nóng',
    'cold': 'lạnh',
    'fast': 'nhanh',
    'slow': 'chậm',
    'high': 'cao',
    'low': 'thấp',
    'long': 'dài',
    'short': 'ngắn',
    'wide': 'rộng',
    'narrow': 'hẹp',
    'love': 'yêu',
    'hate': 'ghét',
    'like': 'thích',
    'eat': 'ăn',
    'drink': 'uống',
    'sleep': 'ngủ',
    'walk': 'đi bộ',
    'run': 'chạy',
    'see': 'nhìn',
    'hear': 'nghe',
    'speak': 'nói',
    'read': 'đọc',
    'write': 'viết',
    'study': 'học',
    'work': 'làm việc',
    'play': 'chơi',
    'go': 'đi',
    'come': 'đến',
    'enter': 'vào',
    'exit': 'ra',
    'up': 'lên',
    'down': 'xuống',
    'left': 'trái',
    'right': 'phải',
    'front': 'trước',
    'back': 'sau',
    'inside': 'trong',
    'outside': 'ngoài',
    'house': 'nhà',
    'school': 'trường học',
    'hospital': 'bệnh viện',
    'store': 'cửa hàng',
    'restaurant': 'nhà hàng',
    'book': 'sách',
    'car': 'xe hơi',
    'train': 'tàu hỏa',
    'airplane': 'máy bay',
    'money': 'tiền',
    'time': 'thời gian',
    'friend': 'bạn',
    'family': 'gia đình',
    'father': 'cha',
    'mother': 'mẹ',
    'brother': 'anh/em trai',
    'sister': 'chị/em gái',
    'country': 'đất nước',
    'city': 'thành phố',
    'town': 'thị trấn',
    'village': 'làng',
    'language': 'ngôn ngữ',
    'culture': 'văn hóa',
    'history': 'lịch sử',
    'future': 'tương lai',
    'past': 'quá khứ',
    'present': 'hiện tại'
  };
};

// Step 4: Sample Hán Việt mappings (to be replaced with KanjiDictVN data)
const createHanVietMapping = () => {
  return {
    '一': ['NHẤT'],
    '二': ['NHỊ'],
    '三': ['TAM'],
    '四': ['TỨ'],
    '五': ['NGŨ'],
    '六': ['LỤC'],
    '七': ['THẤT'],
    '八': ['BÁT'],
    '九': ['CỬU'],
    '十': ['THẬP'],
    '百': ['BÁCH'],
    '千': ['THIÊN'],
    '万': ['VẠN'],
    '年': ['NIÊN'],
    '月': ['NGUYỆT'],
    '日': ['NHẬT'],
    '大': ['ĐẠI', 'THÁI'],
    '小': ['TIỂU'],
    '人': ['NHÂN'],
    '水': ['THỦY'],
    '火': ['HỎA'],
    '木': ['MỘC'],
    '土': ['THỔ'],
    '金': ['KIM'],
    '学': ['HỌC'],
    '校': ['KHẢI'],
    '生': ['SINH', 'SANH'],
    '中': ['TRUNG'],
    '本': ['BẢN'],
    '出': ['XUẤT'],
    '見': ['KIẾN'],
    '上': ['THƯỢNG'],
    '下': ['HẠ'],
    '前': ['TIỀN'],
    '後': ['HẬU'],
    '東': ['ĐÔNG'],
    '西': ['TÂY'],
    '南': ['NAM'],
    '北': ['BẮC'],
    '愛': ['ÁI'],
    '心': ['TÂM'],
    '家': ['GIA'],
    '国': ['QUỐC'],
    '語': ['NGỮ']
  };
};

async function main() {
  console.log('🇻🇳 Setting up Vietnamese Integration for Kanji App');
  console.log('=' .repeat(60));
  
  // Step 1: Check current database status
  const db = new Database('./database/japanese_app.db');
  const totalKanji = db.prepare('SELECT COUNT(*) as count FROM kanji WHERE meanings IS NOT NULL').get();
  console.log(`📊 Found ${totalKanji.count} kanji with meanings to process`);
  
  // Step 2: Setup translation options
  console.log('\n📋 Available Translation Options:');
  console.log('1. 🌐 Google Translate API (500k chars free/month)');
  console.log('2. 📚 Basic Vietnamese mapping (free, limited coverage)');
  console.log('3. 📖 KanjiDictVN Hán Việt readings (free, comprehensive)');
  
  const hasGoogleAPI = setupGoogleTranslate();
  const hanVietData = await downloadHanVietData();
  
  console.log('\n🎯 Recommended Implementation Plan:');
  console.log('Phase 1: Implement basic Vietnamese mappings (immediate)');
  console.log('Phase 2: Add KanjiDictVN Hán Việt readings (this week)');  
  console.log('Phase 3: Integrate Google Translate API (optional upgrade)');
  
  console.log('\n✅ Ready to implement! Run specific scripts:');
  console.log('- node scripts/add-basic-vietnamese.js');
  console.log('- node scripts/add-han-viet-readings.js');
  console.log('- node scripts/add-google-translate.js (if API key available)');
  
  db.close();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  createBasicVietnameseMapping,
  createHanVietMapping,
  setupGoogleTranslate
};