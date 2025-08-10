import React from 'react';
import { BookOpen, Star, Gamepad2, Sparkles, Target, Users, TrendingUp } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, color, gradient }) => (
  <div className={`group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 ${color}`}>
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
    <div className="relative p-8">
      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${gradient} mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-gray-900 transition-colors">
        {title}
      </h3>
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);

const ComingSoonFeature = ({ icon: Icon, title }) => (
  <div className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl hover:bg-white/80 transition-all duration-200">
    <div className="flex-shrink-0">
      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <span className="text-gray-700 font-medium">{title}</span>
  </div>
);

const HomePage = () => {
  const features = [
    {
      icon: BookOpen,
      title: '📝 Bảng chữ cái',
      description: 'Học Hiragana và Katakana với flashcard tương tác, animation viết tay và phát âm chuẩn',
      color: 'border-purple-500',
      gradient: 'from-purple-500 to-indigo-600'
    },
    {
      icon: Star,
      title: '📚 Từ vựng N5',
      description: 'Khám phá từ vựng cơ bản với 20+ từ được phân loại theo chủ đề và có hỗ trợ phát âm',
      color: 'border-green-500',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      icon: Gamepad2,
      title: '🎯 Quiz tương tác',
      description: 'Kiểm tra kiến thức với các câu hỏi trắc nghiệm ngẫu nhiên và theo dõi điểm số',
      color: 'border-pink-500',
      gradient: 'from-pink-500 to-rose-600'
    }
  ];

  const comingSoonFeatures = [
    { icon: Sparkles, title: 'Luyện phát âm với AI' },
    { icon: TrendingUp, title: 'Theo dõi tiến độ học tập' },
    { icon: Target, title: 'Mini games học từ vựng' },
    { icon: Users, title: 'Cộng đồng học tập' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white px-6 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Học tiếng Nhật hiệu quả</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Chào mừng đến với
            <span className="block bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Japanese Learning
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Bắt đầu hành trình học tiếng Nhật của bạn với phương pháp học tương tác, 
            hiện đại và hiệu quả nhất
          </p>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Miễn phí 100%</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Tương tác cao</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>Phát âm chuẩn</span>
            </div>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
        
        {/* Coming Soon Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl transform rotate-1"></div>
          <div className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-1">
            <div className="bg-white rounded-2xl p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Sparkles className="w-4 h-4" />
                  <span>Sắp ra mắt</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Tính năng sắp tới
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Chúng tôi đang phát triển thêm nhiều tính năng thú vị để mang đến trải nghiệm học tập tốt nhất
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {comingSoonFeatures.map((feature, index) => (
                  <ComingSoonFeature key={index} {...feature} />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="mt-16 text-center">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="text-4xl font-bold text-indigo-600 mb-2">50+</div>
              <div className="text-gray-600">Ký tự Hiragana & Katakana</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="text-4xl font-bold text-green-600 mb-2">20+</div>
              <div className="text-gray-600">Từ vựng N5 cơ bản</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="text-4xl font-bold text-pink-600 mb-2">∞</div>
              <div className="text-gray-600">Câu hỏi Quiz ngẫu nhiên</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;