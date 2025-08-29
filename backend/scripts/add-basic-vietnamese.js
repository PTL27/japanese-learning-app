const Database = require('better-sqlite3');

// Comprehensive Vietnamese translation mapping
const vietnameseMapping = {
  // Numbers
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
  'ten thousand': 'mười nghìn',
  
  // Time
  'year': 'năm',
  'month': 'tháng',
  'day': 'ngày',
  'week': 'tuần',
  'hour': 'giờ',
  'minute': 'phút',
  'second': 'giây',
  'time': 'thời gian',
  'morning': 'buổi sáng',
  'afternoon': 'buổi chiều',
  'evening': 'buổi tối',
  'night': 'đêm',
  'today': 'hôm nay',
  'tomorrow': 'ngày mai',
  'yesterday': 'hôm qua',
  'now': 'bây giờ',
  'before': 'trước',
  'after': 'sau',
  'early': 'sớm',
  'late': 'muộn',
  
  // People
  'person': 'người',
  'man': 'đàn ông',
  'woman': 'phụ nữ',
  'child': 'trẻ em',
  'baby': 'em bé',
  'boy': 'cậu bé',
  'girl': 'cô bé',
  'adult': 'người lớn',
  'old person': 'người già',
  'friend': 'bạn',
  'family': 'gia đình',
  'father': 'cha',
  'mother': 'mẹ',
  'brother': 'anh/em trai',
  'sister': 'chị/em gái',
  'son': 'con trai',
  'daughter': 'con gái',
  'husband': 'chồng',
  'wife': 'vợ',
  'student': 'học sinh',
  'teacher': 'giáo viên',
  'doctor': 'bác sĩ',
  'worker': 'công nhân',
  
  // Body parts
  'body': 'cơ thể',
  'head': 'đầu',
  'face': 'mặt',
  'eye': 'mắt',
  'ear': 'tai',
  'nose': 'mũi',
  'mouth': 'miệng',
  'tooth': 'răng',
  'hand': 'tay',
  'finger': 'ngón tay',
  'foot': 'chân',
  'leg': 'chân',
  'heart': 'trái tim',
  'mind': 'tâm trí',
  
  // Nature
  'water': 'nước',
  'fire': 'lửa',
  'tree': 'cây',
  'wood': 'gỗ',
  'forest': 'rừng',
  'mountain': 'núi',
  'river': 'sông',
  'sea': 'biển',
  'ocean': 'đại dương',
  'lake': 'hồ',
  'sky': 'trời',
  'earth': 'đất',
  'ground': 'mặt đất',
  'stone': 'đá',
  'rock': 'đá',
  'sand': 'cát',
  'grass': 'cỏ',
  'flower': 'hoa',
  'leaf': 'lá',
  'fruit': 'quả',
  'seed': 'hạt giống',
  'rain': 'mưa',
  'snow': 'tuyết',
  'wind': 'gió',
  'cloud': 'mây',
  
  // Celestial
  'sun': 'mặt trời',
  'moon': 'mặt trăng',
  'star': 'ngôi sao',
  'light': 'ánh sáng',
  'bright': 'sáng',
  'dark': 'tối',
  'shadow': 'bóng',
  
  // Colors
  'white': 'trắng',
  'black': 'đen',
  'red': 'đỏ',
  'blue': 'xanh dương',
  'green': 'xanh lá',
  'yellow': 'vàng',
  'orange': 'cam',
  'purple': 'tím',
  'pink': 'hồng',
  'brown': 'nâu',
  'gray': 'xám',
  'color': 'màu sắc',
  
  // Adjectives
  'good': 'tốt',
  'bad': 'xấu',
  'new': 'mới',
  'old': 'cũ',
  'young': 'trẻ',
  'hot': 'nóng',
  'cold': 'lạnh',
  'warm': 'ấm',
  'cool': 'mát',
  'fast': 'nhanh',
  'slow': 'chậm',
  'quick': 'nhanh',
  'high': 'cao',
  'low': 'thấp',
  'tall': 'cao',
  'short': 'ngắn',
  'long': 'dài',
  'wide': 'rộng',
  'narrow': 'hẹp',
  'big': 'lớn',
  'small': 'nhỏ',
  'large': 'lớn',
  'little': 'nhỏ',
  'heavy': 'nặng',
  'light': 'nhẹ',
  'strong': 'mạnh',
  'weak': 'yếu',
  'hard': 'cứng',
  'soft': 'mềm',
  'easy': 'dễ',
  'difficult': 'khó',
  'simple': 'đơn giản',
  'complex': 'phức tạp',
  'beautiful': 'đẹp',
  'ugly': 'xấu',
  'clean': 'sạch',
  'dirty': 'bẩn',
  'rich': 'giàu',
  'poor': 'nghèo',
  'full': 'đầy',
  'empty': 'trống',
  'right': 'đúng',
  'wrong': 'sai',
  'true': 'thật',
  'false': 'giả',
  'safe': 'an toàn',
  'dangerous': 'nguy hiểm',
  
  // Emotions
  'love': 'yêu',
  'hate': 'ghét',
  'like': 'thích',
  'happy': 'vui',
  'sad': 'buồn',
  'angry': 'giận',
  'scared': 'sợ',
  'surprised': 'ngạc nhiên',
  'excited': 'phấn khích',
  'worried': 'lo lắng',
  'tired': 'mệt',
  'hungry': 'đói',
  'thirsty': 'khát',
  'sick': 'ốm',
  'healthy': 'khỏe mạnh',
  
  // Actions
  'eat': 'ăn',
  'drink': 'uống',
  'sleep': 'ngủ',
  'wake': 'thức',
  'walk': 'đi bộ',
  'run': 'chạy',
  'jump': 'nhảy',
  'sit': 'ngồi',
  'stand': 'đứng',
  'lie': 'nằm',
  'see': 'nhìn',
  'look': 'nhìn',
  'watch': 'xem',
  'hear': 'nghe',
  'listen': 'lắng nghe',
  'speak': 'nói',
  'talk': 'nói chuyện',
  'say': 'nói',
  'tell': 'kể',
  'read': 'đọc',
  'write': 'viết',
  'draw': 'vẽ',
  'paint': 'sơn',
  'sing': 'hát',
  'dance': 'nhảy',
  'play': 'chơi',
  'work': 'làm việc',
  'study': 'học',
  'learn': 'học',
  'teach': 'dạy',
  'help': 'giúp đỡ',
  'give': 'cho',
  'take': 'lấy',
  'bring': 'mang',
  'carry': 'mang',
  'put': 'đặt',
  'place': 'đặt',
  'get': 'lấy',
  'have': 'có',
  'make': 'làm',
  'do': 'làm',
  'create': 'tạo ra',
  'build': 'xây dựng',
  'break': 'phá',
  'fix': 'sửa',
  'repair': 'sửa chữa',
  'open': 'mở',
  'close': 'đóng',
  'start': 'bắt đầu',
  'stop': 'dừng',
  'end': 'kết thúc',
  'finish': 'hoàn thành',
  'begin': 'bắt đầu',
  'continue': 'tiếp tục',
  
  // Movement
  'go': 'đi',
  'come': 'đến',
  'enter': 'vào',
  'exit': 'ra',
  'leave': 'rời khỏi',
  'arrive': 'đến',
  'return': 'trở về',
  'move': 'di chuyển',
  'turn': 'rẽ',
  'follow': 'theo',
  'lead': 'dẫn dắt',
  'up': 'lên',
  'down': 'xuống',
  'left': 'trái',
  'right': 'phải',
  'front': 'trước',
  'back': 'sau',
  'inside': 'trong',
  'outside': 'ngoài',
  'between': 'giữa',
  'above': 'trên',
  'below': 'dưới',
  'beside': 'bên cạnh',
  'near': 'gần',
  'far': 'xa',
  'here': 'đây',
  'there': 'đó',
  
  // Places
  'house': 'nhà',
  'home': 'nhà',
  'room': 'phòng',
  'kitchen': 'nhà bếp',
  'bedroom': 'phòng ngủ',
  'bathroom': 'nhà tắm',
  'garden': 'vườn',
  'yard': 'sân',
  'school': 'trường học',
  'university': 'đại học',
  'hospital': 'bệnh viện',
  'store': 'cửa hàng',
  'market': 'chợ',
  'restaurant': 'nhà hàng',
  'hotel': 'khách sạn',
  'office': 'văn phòng',
  'bank': 'ngân hàng',
  'library': 'thư viện',
  'museum': 'bảo tàng',
  'park': 'công viên',
  'station': 'ga',
  'airport': 'sân bay',
  'bridge': 'cây cầu',
  'road': 'đường',
  'street': 'phố',
  'path': 'đường mòn',
  
  // Objects
  'thing': 'thứ',
  'object': 'đồ vật',
  'book': 'sách',
  'paper': 'giấy',
  'pen': 'bút',
  'pencil': 'bút chì',
  'bag': 'túi',
  'box': 'hộp',
  'bottle': 'chai',
  'cup': 'cốc',
  'glass': 'ly',
  'plate': 'đĩa',
  'bowl': 'bát',
  'spoon': 'thìa',
  'fork': 'nĩa',
  'knife': 'dao',
  'table': 'bàn',
  'chair': 'ghế',
  'bed': 'giường',
  'door': 'cửa',
  'window': 'cửa sổ',
  'wall': 'tường',
  'floor': 'sàn',
  'ceiling': 'trần',
  'key': 'chìa khóa',
  'car': 'xe hơi',
  'bus': 'xe buýt',
  'train': 'tàu hỏa',
  'airplane': 'máy bay',
  'bicycle': 'xe đạp',
  'boat': 'thuyền',
  'ship': 'tàu',
  'phone': 'điện thoại',
  'computer': 'máy tính',
  'television': 'tivi',
  'radio': 'radio',
  'camera': 'máy ảnh',
  'watch': 'đồng hồ',
  'clock': 'đồng hồ',
  'money': 'tiền',
  'coin': 'đồng xu',
  'clothing': 'quần áo',
  'shirt': 'áo sơ mi',
  'pants': 'quần',
  'shoes': 'giày',
  'hat': 'mũ',
  'food': 'thức ăn',
  'meat': 'thịt',
  'fish': 'cá',
  'vegetable': 'rau',
  'rice': 'cơm',
  'bread': 'bánh mì',
  'milk': 'sữa',
  'tea': 'trà',
  'coffee': 'cà phê',
  'juice': 'nước ép',
  'beer': 'bia',
  'wine': 'rượu',
  
  // Abstract concepts
  'idea': 'ý tưởng',
  'thought': 'suy nghĩ',
  'memory': 'ký ức',
  'dream': 'giấc mơ',
  'hope': 'hy vọng',
  'fear': 'nỗi sợ',
  'pain': 'đau đớn',
  'pleasure': 'niềm vui',
  'problem': 'vấn đề',
  'solution': 'giải pháp',
  'question': 'câu hỏi',
  'answer': 'câu trả lời',
  'reason': 'lý do',
  'cause': 'nguyên nhân',
  'effect': 'tác động',
  'result': 'kết quả',
  'goal': 'mục tiêu',
  'purpose': 'mục đích',
  'meaning': 'ý nghĩa',
  'importance': 'tầm quan trọng',
  'value': 'giá trị',
  'price': 'giá',
  'cost': 'chi phí',
  'benefit': 'lợi ích',
  'advantage': 'lợi thế',
  'disadvantage': 'bất lợi',
  'chance': 'cơ hội',
  'opportunity': 'cơ hội',
  'risk': 'rủi ro',
  'luck': 'may mắn',
  'fortune': 'vận may',
  'success': 'thành công',
  'failure': 'thất bại',
  'victory': 'chiến thắng',
  'defeat': 'thất bại',
  'power': 'quyền lực',
  'strength': 'sức mạnh',
  'force': 'lực',
  'energy': 'năng lượng',
  'speed': 'tốc độ',
  'skill': 'kỹ năng',
  'ability': 'khả năng',
  'talent': 'tài năng',
  'knowledge': 'kiến thức',
  'wisdom': 'trí tuệ',
  'experience': 'kinh nghiệm',
  'education': 'giáo dục',
  'learning': 'học tập',
  'science': 'khoa học',
  'art': 'nghệ thuật',
  'culture': 'văn hóa',
  'history': 'lịch sử',
  'future': 'tương lai',
  'past': 'quá khứ',
  'present': 'hiện tại',
  'tradition': 'truyền thống',
  'custom': 'phong tục',
  'habit': 'thói quen',
  'law': 'luật',
  'rule': 'quy tắc',
  'order': 'trật tự',
  'peace': 'hòa bình',
  'war': 'chiến tranh',
  'fight': 'chiến đấu',
  'battle': 'trận chiến',
  'competition': 'cuộc thi',
  'game': 'trò chơi',
  'sport': 'thể thao',
  'music': 'âm nhạc',
  'song': 'bài hát',
  'sound': 'âm thanh',
  'voice': 'giọng nói',
  'language': 'ngôn ngữ',
  'word': 'từ',
  'sentence': 'câu',
  'story': 'câu chuyện',
  'news': 'tin tức',
  'information': 'thông tin',
  'message': 'tin nhắn',
  'letter': 'thư',
  'email': 'email',
  'meeting': 'cuộc họp',
  'party': 'bữa tiệc',
  'celebration': 'lễ kỷ niệm',
  'holiday': 'ngày lễ',
  'vacation': 'kỳ nghỉ',
  'journey': 'cuộc hành trình',
  'trip': 'chuyến đi',
  'travel': 'du lịch',
  'visit': 'thăm',
  
  // Geography and places
  'country': 'đất nước',
  'nation': 'quốc gia',
  'city': 'thành phố',
  'town': 'thị trấn',
  'village': 'làng',
  'capital': 'thủ đô',
  'center': 'trung tâm',
  'middle': 'giữa',
  'area': 'khu vực',
  'region': 'vùng',
  'place': 'nơi',
  'location': 'vị trí',
  'position': 'chức vụ',
  'direction': 'hướng',
  'way': 'cách',
  'method': 'phương pháp',
  'manner': 'cách thức',
  'style': 'phong cách',
  'type': 'loại',
  'kind': 'loại',
  'sort': 'loại',
  'class': 'lớp',
  'group': 'nhóm',
  'team': 'đội',
  'company': 'công ty',
  'business': 'kinh doanh',
  'job': 'công việc',
  'career': 'sự nghiệp',
  'profession': 'nghề nghiệp',
  'industry': 'công nghiệp',
  'market': 'thị trường',
  'economy': 'kinh tế',
  'government': 'chính phủ',
  'politics': 'chính trị',
  'society': 'xã hội',
  'community': 'cộng đồng',
  'public': 'công cong',
  'private': 'riêng tư',
  'personal': 'cá nhân',
  'individual': 'cá thể',
  'social': 'xã hội',
  'human': 'con người',
  'people': 'mọi người',
  'population': 'dân số',
  'citizen': 'công dân',
  'resident': 'cư dân'
};

// Basic Hán Việt readings for common kanji
const hanVietReadings = {
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
  '時': ['THỜI'],
  '分': ['PHÂN'],
  '秒': ['MIỂU'],
  '今': ['KIM'],
  '昨': ['TÁC'],
  '明': ['MINH'],
  '大': ['ĐẠI', 'THÁI'],
  '小': ['TIỂU'],
  '中': ['TRUNG'],
  '上': ['THƯỢNG'],
  '下': ['HẠ'],
  '前': ['TIỀN'],
  '後': ['HẬU'],
  '左': ['TỎA'],
  '右': ['HỮU'],
  '東': ['ĐÔNG'],
  '西': ['TÂY'],
  '南': ['NAM'],
  '北': ['BẮC'],
  '人': ['NHÂN'],
  '男': ['NAM'],
  '女': ['NỮ'],
  '子': ['TỬ'],
  '父': ['PHỤ'],
  '母': ['MẪU'],
  '家': ['GIA'],
  '国': ['QUỐC'],
  '民': ['DÂN'],
  '社': ['XÃ'],
  '会': ['HỘI'],
  '学': ['HỌC'],
  '校': ['KHẢI'],
  '生': ['SINH', 'SANH'],
  '先': ['TIÊN'],
  '本': ['BẢN'],
  '書': ['THƯ'],
  '文': ['VĂN'],
  '語': ['NGỮ'],
  '話': ['THOẠI'],
  '言': ['NGÔN'],
  '読': ['ĐỘC'],
  '書': ['THƯ'],
  '見': ['KIẾN'],
  '聞': ['VĂN'],
  '出': ['XUẤT'],
  '入': ['NHẬP'],
  '来': ['LAI'],
  '行': ['HÀNH'],
  '帰': ['QUI'],
  '立': ['LẬP'],
  '座': ['TỌA'],
  '走': ['TẨU'],
  '歩': ['BỘ'],
  '車': ['XA'],
  '電': ['ĐIỆN'],
  '道': ['ĐẠO'],
  '駅': ['DỊCH'],
  '店': ['ĐIẾM'],
  '買': ['MÃI'],
  '売': ['MÃI'],
  '金': ['KIM'],
  '銀': ['NGÂN'],
  '円': ['VIÊN'],
  '水': ['THỦY'],
  '火': ['HỎA'],
  '木': ['MỘC'],
  '土': ['THỔ'],
  '石': ['THẠCH'],
  '山': ['SAN'],
  '川': ['XUYÊN'],
  '海': ['HẢI'],
  '空': ['KHÔNG'],
  '天': ['THIÊN'],
  '地': ['ĐỊA'],
  '花': ['HOA'],
  '草': ['THẢO'],
  '森': ['SÂM'],
  '林': ['LÂM'],
  '雨': ['VŨ'],
  '雪': ['TUYẾT'],
  '風': ['PHONG'],
  '雲': ['VÂN'],
  '光': ['QUANG'],
  '暗': ['ÁM'],
  '白': ['BẠCH'],
  '黒': ['HẮC'],
  '赤': ['XÍCH'],
  '青': ['THANH'],
  '黄': ['HOÀNG'],
  '緑': ['LỤC'],
  '色': ['SẮC'],
  '愛': ['ÁI'],
  '心': ['TÂM'],
  '思': ['TƯ'],
  '考': ['KHẢO'],
  '知': ['TRI'],
  '理': ['LÝ'],
  '意': ['Ý'],
  '気': ['KHÍ'],
  '元': ['NGUYÊN'],
  '力': ['LỰC'],
  '強': ['CƯỜNG'],
  '弱': ['NHƯỢC'],
  '高': ['CAO'],
  '低': ['ĐỊ'],
  '長': ['TRƯỜNG'],
  '短': ['ĐOẢN'],
  '新': ['TÂN'],
  '古': ['CỔ'],
  '若': ['NHƯỢC'],
  '老': ['LÃO'],
  '美': ['MỸ'],
  '好': ['HẢO'],
  '悪': ['ÁC'],
  '正': ['CHÍNH'],
  '間': ['GIAN'],
  '世': ['THẾ'],
  '代': ['ĐẠI'],
  '時': ['THỜI'],
  '所': ['SỞ'],
  '場': ['TRƯỜNG'],
  '方': ['PHƯƠNG'],
  '事': ['SỰ'],
  '物': ['VẬT'],
  '者': ['GIẢ'],
  '何': ['HÀ'],
  '問': ['VẤN'],
  '答': ['ĐÁP'],
  '作': ['TÁC'],
  '使': ['SỬ'],
  '働': ['ĐỘNG'],
  '仕': ['SĨ'],
  '住': ['TRÚ'],
  '建': ['KIẾN'],
  '開': ['KHAI'],
  '閉': ['BÍ'],
  '始': ['THỦY'],
  '終': ['CHUNG'],
  '持': ['TRÌ'],
  '取': ['THỦ'],
  '送': ['TỐNG'],
  '運': ['VẬN'],
  '動': ['ĐỘNG'],
  '止': ['CHỈ'],
  '切': ['THIẾT'],
  '分': ['PHÂN'],
  '合': ['HỢP'],
  '集': ['TẬP'],
  '会': ['HỘI'],
  '転': ['CHUYỂN'],
  '変': ['BIẾN'],
  '化': ['HÓA'],
  '成': ['THÀNH'],
  '発': ['PHÁT'],
  '表': ['BIỂU'],
  '現': ['HIỆN'],
  '実': ['THỰC'],
  '真': ['CHÂN'],
  '正': ['CHÍNH'],
  '不': ['BẤT'],
  '未': ['VỊ'],
  '無': ['VÔ'],
  '有': ['HỮU'],
  '多': ['ĐA'],
  '少': ['THIỂU'],
  '全': ['TOÀN'],
  '半': ['BÁN'],
  '同': ['ĐỒNG'],
  '別': ['BIỆT'],
  '特': ['ĐẶC'],
  '個': ['CÁ'],
  '各': ['CÁC'],
  '毎': ['MỖI'],
  '以': ['DĨ'],
  '内': ['NỘI'],
  '外': ['NGOẠI'],
  '間': ['GIAN'],
  '近': ['CẬN'],
  '遠': ['VIỄN'],
  '早': ['TÁO'],
  '遅': ['TRÌ'],
  '速': ['TỐC'],
  '急': ['CẤP'],
  '安': ['AN'],
  '危': ['NGUY'],
  '重': ['TRỌNG'],
  '軽': ['KHINH'],
  '難': ['NAN'],
  '易': ['DỊ'],
  '可': ['KHẢ'],
  '能': ['NĂNG'],
  '必': ['TẤT'],
  '要': ['YẾU'],
  '用': ['DỤNG'],
  '便': ['TIỆN'],
  '利': ['LỢI'],
  '得': ['ĐẮC'],
  '失': ['THẤT'],
  '勝': ['THẮNG'],
  '負': ['PHỤ'],
  '成': ['THÀNH'],
  '功': ['CÔNG'],
  '業': ['NGHIỆP'],
  '産': ['SẢN'],
  '品': ['PHẨM'],
  '質': ['CHẤT'],
  '料': ['LIỆU'],
  '材': ['TÀI'],
  '具': ['CỤ'],
  '機': ['CƠ'],
  '械': ['GIỚI'],
  '技': ['KỸ'],
  '術': ['THUẬT'],
  '科': ['KHOA'],
  '医': ['Y'],
  '薬': ['DƯỢC'],
  '病': ['BỆNH'],
  '院': ['VIỆN'],
  '健': ['KIỆN'],
  '康': ['KHANG'],
  '食': ['THỰC'],
  '飯': ['PHẠN'],
  '肉': ['NHỤC'],
  '魚': ['NGƯ'],
  '野': ['DÃ'],
  '菜': ['THÁI'],
  '果': ['QUẢ'],
  '米': ['MỸ'],
  '茶': ['TRÀ'],
  '酒': ['TỬU'],
  '服': ['PHỤC'],
  '着': ['TRƯỚC'],
  '帽': ['MẠO'],
  '靴': ['HOA'],
  '鞄': ['BÌNH'],
  '時': ['THỜI'],
  '計': ['KẾ'],
  '機': ['CƠ'],
  '械': ['GIỚI'],
  '道': ['ĐẠO'],
  '具': ['CỤ'],
  '台': ['ĐÀI'],
  '箱': ['TƯƠNG'],
  '袋': ['ĐẠI'],
  '紙': ['CHỈ'],
  '本': ['BẢN'],
  '冊': ['SÁT'],
  '雑': ['TẠP'],
  '誌': ['CHÍ'],
  '新': ['TÂN'],
  '聞': ['VĂN'],
  '写': ['TẢ'],
  '真': ['CHÂN'],
  '映': ['ÁNH'],
  '画': ['HỌA'],
  '図': ['ĐỒ'],
  '絵': ['HỘI'],
  '音': ['ÂM'],
  '声': ['THANH'],
  '楽': ['NHẠC'],
  '歌': ['CA'],
  '踊': ['DŨNG'],
  '遊': ['DU'],
  '游': ['DU'],
  '泳': ['VỊNH'],
  '休': ['HƯU'],
  '眠': ['MIÊN'],
  '寝': ['TẨM'],
  '起': ['KHỞ'],
  '座': ['TỌA'],
  '立': ['LẬP'],
  '歩': ['BỘ'],
  '走': ['TẨU'],
  '跳': ['KHIÊU'],
  '飛': ['PHI'],
  '泳': ['VỊNH'],
  '登': ['ĐĂNG'],
  '降': ['GIÁNG'],
  '乗': ['THỪA'],
  '降': ['GIÁNG'],
  '渡': ['ĐỘ'],
  '越': ['VIỆT'],
  '通': ['THÔNG'],
  '過': ['QUA'],
  '達': ['ĐẠT'],
  '着': ['TRƯỚC'],
  '到': ['ĐÁO'],
  '帰': ['QUI'],
  '戻': ['LỆ'],
  '返': ['PHẢN'],
  '向': ['HƯỚNG'],
  '回': ['HỒI'],
  '曲': ['KHÚC'],
  '折': ['CHIẾT'],
  '待': ['ĐÃI'],
  '急': ['CẤP'],
  '忙': ['MANG'],
  '暇': ['HẠ'],
  '暖': ['NOÃN'],
  '涼': ['LƯƠNG'],
  '寒': ['HÀN'],
  '暑': ['THỬ'],
  '熱': ['NHIỆT'],
  '冷': ['LÃNH'],
  '温': ['ÔN'],
  '暖': ['NOÃN'],
  '濡': ['NHU'],
  '乾': ['CÀN'],
  '湿': ['THẤP'],
  '燥': ['TÁO']
};

async function addBasicVietnamese() {
  console.log('🇻🇳 Adding basic Vietnamese meanings and Hán Việt readings...\n');
  
  const db = new Database('./database/japanese_app.db');
  
  // Get JLPT kanji that need Vietnamese data (prioritize high-frequency ones)
  const kanjiToProcess = db.prepare(`
    SELECT id, character, meanings, name_readings, jlpt_level, frequency_rank
    FROM kanji 
    WHERE jlpt_level IS NOT NULL
      AND meanings IS NOT NULL 
      AND (
        meanings NOT LIKE '%"vi":%' 
        OR name_readings IS NULL 
        OR name_readings = '[]'
        OR name_readings = 'null'
      )
    ORDER BY 
      jlpt_level DESC,
      CASE WHEN frequency_rank IS NOT NULL THEN frequency_rank ELSE 999999 END ASC
    LIMIT 1000
  `).all();
  
  console.log(`📊 Found ${kanjiToProcess.length} JLPT kanji to process for Vietnamese data`);
  
  let updated = 0;
  let vietnameseMeaningsAdded = 0;
  let hanVietAdded = 0;
  
  for (const kanji of kanjiToProcess) {
    try {
      let hasChanges = false;
      let currentMeanings = JSON.parse(kanji.meanings || '{}');
      let currentNameReadings = JSON.parse(kanji.name_readings || '[]');
      
      // Add Vietnamese meanings
      if (!currentMeanings.vi && currentMeanings.en) {
        const vietnameseMeanings = [];
        
        for (const englishMeaning of currentMeanings.en) {
          const lowerMeaning = englishMeaning.toLowerCase().trim();
          
          // Direct translation lookup
          if (vietnameseMapping[lowerMeaning]) {
            vietnameseMeanings.push(vietnameseMapping[lowerMeaning]);
          } else {
            // Try partial matches for compound words
            const words = lowerMeaning.split(/[\\s,\\/\\-]+/);
            for (const word of words) {
              if (vietnameseMapping[word.trim()] && !vietnameseMeanings.includes(vietnameseMapping[word.trim()])) {
                vietnameseMeanings.push(vietnameseMapping[word.trim()]);
                break; // Take first match to avoid clutter
              }
            }
          }
        }
        
        if (vietnameseMeanings.length > 0) {
          currentMeanings.vi = vietnameseMeanings;
          hasChanges = true;
          vietnameseMeaningsAdded++;
        }
      }
      
      // Add Hán Việt readings
      if (hanVietReadings[kanji.character]) {
        const hanViet = hanVietReadings[kanji.character];
        const existingReadings = new Set(currentNameReadings);
        let addedNewReadings = false;
        
        for (const reading of hanViet) {
          if (!existingReadings.has(reading)) {
            currentNameReadings.push(reading);
            addedNewReadings = true;
          }
        }
        
        if (addedNewReadings) {
          hasChanges = true;
          hanVietAdded++;
        }
      }
      
      // Update database
      if (hasChanges) {
        const updateStmt = db.prepare(`
          UPDATE kanji 
          SET meanings = ?, name_readings = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `);
        
        updateStmt.run(
          JSON.stringify(currentMeanings),
          JSON.stringify(currentNameReadings),
          kanji.id
        );
        
        updated++;
        
        const viMeanings = currentMeanings.vi ? currentMeanings.vi.join(', ') : '';
        const hanVietStr = hanVietReadings[kanji.character] ? hanVietReadings[kanji.character].join(', ') : '';
        console.log(`✅ ${kanji.character} (N${kanji.jlpt_level}): ${viMeanings} [${hanVietStr}]`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${kanji.character}:`, error.message);
    }
  }
  
  db.close();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('🇻🇳 BASIC VIETNAMESE DATA ADDITION COMPLETE!');
  console.log('='.repeat(60));
  console.log(`📊 RESULTS:`);
  console.log(`   ✅ Kanji updated: ${updated}/${kanjiToProcess.length}`);
  console.log(`   🇻🇳 Vietnamese meanings added: ${vietnameseMeaningsAdded} kanji`);
  console.log(`   📖 Hán Việt readings added: ${hanVietAdded} kanji`);
  
  console.log(`\n💡 COVERAGE BY JLPT LEVEL:`);
  const db2 = new Database('./database/japanese_app.db');
  for (let level = 1; level <= 5; level++) {
    const total = db2.prepare('SELECT COUNT(*) as count FROM kanji WHERE jlpt_level = ?').get(level);
    const withVi = db2.prepare('SELECT COUNT(*) as count FROM kanji WHERE jlpt_level = ? AND meanings LIKE "%\\"vi\\":%"').get(level);
    const percentage = total.count > 0 ? ((withVi.count / total.count) * 100).toFixed(1) : 0;
    console.log(`   N${level}: ${withVi.count}/${total.count} (${percentage}%)`);
  }
  db2.close();
  
  console.log(`\n✨ EXAMPLES:`);
  const db3 = new Database('./database/japanese_app.db');
  const examples = db3.prepare(`
    SELECT character, meanings, name_readings 
    FROM kanji 
    WHERE meanings LIKE '%"vi":%' AND jlpt_level IS NOT NULL
    ORDER BY jlpt_level DESC, frequency_rank ASC
    LIMIT 20
  `).all();
  
  examples.forEach((ex, i) => {
    const meanings = JSON.parse(ex.meanings);
    const nameReadings = JSON.parse(ex.name_readings || '[]');
    const en = meanings.en ? meanings.en.slice(0, 2).join(', ') : '';
    const vi = meanings.vi ? meanings.vi.slice(0, 2).join(', ') : '';
    const hanViet = nameReadings.filter(r => r.match(/^[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]+$/)).join(', ');
    console.log(`   ${i + 1}. ${ex.character}: EN[${en}] → VI[${vi}] HánViệt[${hanViet}]`);
  });
  db3.close();
  
  console.log(`\n🎯 NEXT STEPS:`);
  console.log(`   1. Test Vietnamese display in frontend KanjiDetailPage`);
  console.log(`   2. Run KanjiDictVN integration for comprehensive Hán Việt coverage`);
  console.log(`   3. Consider Google Translate API for remaining untranslated meanings`);
}

// Run the script
if (require.main === module) {
  addBasicVietnamese()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { addBasicVietnamese };