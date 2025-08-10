import React, { useState, useEffect } from 'react';
import { Volume2, Search, Filter, Star, BookOpen, Users, Loader } from 'lucide-react';
import { playTextToSpeech } from '../utils/japaneseData';

const VocabularyCard = ({ word, index }) => {
  const categoryColors = {
    'danh từ': 'from-blue-500 to-blue-600',
    'động từ': 'from-green-500 to-green-600',
    'tính từ': 'from-purple-500 to-purple-600',
    'đại từ': 'from-pink-500 to-pink-600',
    'trạng từ': 'from-orange-500 to-orange-600',
    'liên từ': 'from-teal-500 to-teal-600'
  };

  const categoryBorders = {
    'danh từ': 'border-blue-500',
    'động từ': 'border-green-500',
    'tính từ': 'border-purple-500',
    'đại từ': 'border-pink-500',
    'trạng từ': 'border-orange-500',
    'liên từ': 'border-teal-500'
  };

  return (
    <div className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 ${categoryBorders[word.category]} overflow-hidden`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryColors[word.category]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      <div className="relative p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="text-3xl font-bold text-slate-700 group-hover:text-slate-800 transition-colors">
            {word.japanese}
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${categoryColors[word.category]}`}>
            <Star className="w-3 h-3 mr-1" />
            {word.category}
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="text-xl text-gray-700 font-medium">
            {word.hiragana}
          </div>
          
          <div className="text-sm text-gray-500 font-mono">
            {word.romaji}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="text-lg font-semibold text-green-600">
            {word.meaning}
          </div>
        </div>
        
        <button
          onClick={() => playTextToSpeech(word.japanese)}
          className={`group/btn w-full flex items-center justify-center space-x-2 bg-gradient-to-r ${categoryColors[word.category]} text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 font-medium`}
        >
          <Volume2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          <span>Phát âm</span>
        </button>
      </div>

      {/* Index number - moved to top-right to avoid blocking content */}
      <div className="absolute top-2 right-2">
        <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 border border-gray-300 shadow-sm">
          {index + 1}
        </div>
      </div>
    </div>
  );
};

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  const categoryColors = {
    'all': 'from-gray-500 to-gray-600',
    'danh từ': 'from-blue-500 to-blue-600',
    'động từ': 'from-green-500 to-green-600',
    'tính từ': 'from-purple-500 to-purple-600',
    'đại từ': 'from-pink-500 to-pink-600',
    'trạng từ': 'from-orange-500 to-orange-600',
    'liên từ': 'from-teal-500 to-teal-600'
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {categories.map(category => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 overflow-hidden ${
            selectedCategory === category
              ? `bg-gradient-to-r ${categoryColors[category]} text-white shadow-lg transform scale-105`
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
          }`}
        >
          {selectedCategory === category && (
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-xl" />
          )}
          <span className="relative">
            {category === 'all' ? 'Tất cả' : category}
          </span>
        </button>
      ))}
    </div>
  );
};

const VocabularyPage = () => {
  const [selectedLevel, setSelectedLevel] = useState('N5');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [vocabulary, setVocabulary] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch vocabulary data from API
  const fetchVocabulary = async (level, category = '', search = '') => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const params = new URLSearchParams({
        jlpt_level: level,
        limit: '200'
      });
      
      if (category && category !== 'all') {
        params.append('category', category);
      }
      
      if (search) {
        params.append('search', search);
      }

      const url = `http://localhost:5001/api/vocabulary?${params}`;
      console.log(`Fetching vocabulary: ${url}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log(`Vocabulary response for ${level}:`, data);
      
      if (data.success) {
        setVocabulary(data.data);
        console.log(`Loaded ${data.data.length} vocabulary items for ${level}`);
      } else {
        setError('Không thể tải dữ liệu từ vựng');
        console.error('API returned error:', data);
      }
    } catch (err) {
      console.error('Error fetching vocabulary:', err);
      setError('Lỗi kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/vocabulary/categories');
      const data = await response.json();
      
      if (data.success) {
        const categoryList = ['all', ...data.data.map(cat => cat.category)];
        setCategories(categoryList);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Load data when level, category, or search changes
  useEffect(() => {
    fetchVocabulary(selectedLevel, selectedCategory, searchTerm);
  }, [selectedLevel, selectedCategory, searchTerm]);

  // Reset category and search when switching levels
  useEffect(() => {
    setSelectedCategory('all');
    setSearchTerm('');
  }, [selectedLevel]);

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const getCategoryStats = () => {
    const stats = {};
    categories.slice(1).forEach(cat => {
      stats[cat] = vocabulary.filter(word => word.category === cat).length;
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-6">
            <BookOpen className="w-4 h-4" />
            <span>JLPT Vocabulary</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Từ vựng
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Khám phá từ vựng JLPT từ cơ bản đến nâng cao
          </p>
        </div>

        {/* JLPT Level Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
            <div className="flex space-x-2">
              {['N5', 'N4'].map(level => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`relative px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                    selectedLevel === level
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  {selectedLevel === level && (
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-xl" />
                  )}
                  <span className="relative flex items-center space-x-2">
                    <span>{level}</span>
                    {level === 'N5' && <Users className="w-4 h-4" />}
                    {level === 'N4' && <Star className="w-4 h-4" />}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {categoryStats['danh từ']}
            </div>
            <div className="text-sm text-gray-600">Danh từ</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {categoryStats['động từ']}
            </div>
            <div className="text-sm text-gray-600">Động từ</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {categoryStats['tính từ']}
            </div>
            <div className="text-sm text-gray-600">Tính từ</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
            <div className="text-3xl font-bold text-pink-600 mb-2">
              {categoryStats['đại từ']}
            </div>
            <div className="text-sm text-gray-600">Đại từ</div>
          </div>
        </div>
        
        {/* Filters Section */}
        <div className="mb-12 space-y-6">
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm từ vựng... (kanji, hiragana, romaji hoặc nghĩa)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 text-lg transition-all duration-200 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>
          
          {/* Category Filters */}
          <div className="space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 text-gray-600 mb-4">
                <Filter className="w-5 h-5" />
                <span className="font-medium">Lọc theo loại từ</span>
              </div>
            </div>
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
        </div>

        {/* Results Summary */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600">
            <span>Hiển thị</span>
            <span className="font-bold text-green-600">{vocabulary.length}</span>
            <span>từ vựng {selectedLevel}</span>
            {searchTerm && <span>cho "{searchTerm}"</span>}
            {selectedCategory !== 'all' && <span>trong "{selectedCategory}"</span>}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-6 py-4">
              <Loader className="w-6 h-6 animate-spin text-green-500" />
              <span className="text-gray-600 font-medium">Đang tải từ vựng...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-6">❌</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Lỗi tải dữ liệu
              </h3>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              <button
                onClick={() => fetchVocabulary(selectedLevel, selectedCategory, searchTerm)}
                className="inline-flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors font-medium"
              >
                <span>Thử lại</span>
              </button>
            </div>
          </div>
        )}

        {/* Vocabulary Grid */}
        {!loading && !error && vocabulary.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {vocabulary.map((word, index) => (
              <VocabularyCard 
                key={`${word.japanese}-${word.id}`} 
                word={word} 
                index={index} 
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && vocabulary.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Không tìm thấy từ vựng nào
              </h3>
              <p className="text-gray-600 mb-6">
                Thử thay đổi từ khóa tìm kiếm hoặc chọn loại từ khác
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="inline-flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors font-medium"
              >
                <span>Xem tất cả từ vựng</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Learning Tips */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-1 mb-8">
          <div className="bg-white rounded-2xl p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                💡 Mẹo học từ vựng hiệu quả
              </h3>
              <p className="text-gray-600">Tối đa hóa khả năng ghi nhớ từ vựng tiếng Nhật</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <div className="text-3xl mb-3">🔊</div>
                <h4 className="font-semibold text-blue-800 mb-2">Luyện phát âm</h4>
                <p className="text-blue-600 text-sm">Click nút phát âm để nghe và lặp lại</p>
              </div>
              
              <div className="bg-green-50 rounded-xl p-6 text-center">
                <div className="text-3xl mb-3">✍️</div>
                <h4 className="font-semibold text-green-800 mb-2">Viết nhiều lần</h4>
                <p className="text-green-600 text-sm">Thực hành viết kanji và hiragana</p>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-6 text-center">
                <div className="text-3xl mb-3">🎯</div>
                <h4 className="font-semibold text-purple-800 mb-2">Ôn tập thường xuyên</h4>
                <p className="text-purple-600 text-sm">Học 5-10 từ mới mỗi ngày</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabularyPage;