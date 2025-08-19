import React, { useState, useEffect } from 'react';
import { Volume2, Search, Filter, Star, BookOpen, Users, Loader, ChevronLeft, ChevronRight, Grid, List, Table } from 'lucide-react';
import { playTextToSpeech } from '../utils/japaneseData';

const VocabularyCard = ({ word, index }) => {
  const categoryColors = {
    'Danh Từ': 'from-blue-500 to-blue-600',
    'Động Từ': 'from-green-500 to-green-600', 
    'Tính Từ': 'from-purple-500 to-purple-600',
    'Đại Từ': 'from-pink-500 to-pink-600',
    'Trạng Từ': 'from-orange-500 to-orange-600',
    'Liên Từ': 'from-teal-500 to-teal-600'
  };

  const categoryBorders = {
    'Danh Từ': 'border-blue-500',
    'Động Từ': 'border-green-500',
    'Tính Từ': 'border-purple-500',
    'Đại Từ': 'border-pink-500', 
    'Trạng Từ': 'border-orange-500',
    'Liên Từ': 'border-teal-500'
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

      {/* Index number - small and positioned to not overlap category badge */}
      <div className="absolute top-1 right-1">
        <div className="w-6 h-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 border border-gray-300 shadow-sm">
          {index + 1}
        </div>
      </div>
    </div>
  );
};

const VocabularyListItem = ({ word, index }) => {
  const categoryColors = {
    'Danh Từ': 'text-blue-600 bg-blue-50',
    'Động Từ': 'text-green-600 bg-green-50', 
    'Tính Từ': 'text-purple-600 bg-purple-50',
    'Đại Từ': 'text-pink-600 bg-pink-50',
    'Trạng Từ': 'text-orange-600 bg-orange-50',
    'Liên Từ': 'text-teal-600 bg-teal-50'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          {/* Index */}
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-700">
            {index + 1}
          </div>
          
          {/* Japanese Text */}
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div className="text-2xl font-bold text-slate-700">
                {word.japanese}
              </div>
              <div className="text-lg text-gray-600">
                {word.hiragana}
              </div>
            </div>
            <div className="text-sm text-gray-500 font-mono mt-1">
              {word.romaji}
            </div>
          </div>
          
          {/* Meaning */}
          <div className="flex-1">
            <div className="text-lg font-semibold text-green-600">
              {word.meaning}
            </div>
          </div>
          
          {/* Category */}
          <div className="flex-shrink-0">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${categoryColors[word.category] || 'text-gray-600 bg-gray-50'}`}>
              {word.category}
            </span>
          </div>
        </div>
        
        {/* Action Button */}
        <div className="flex-shrink-0 ml-4">
          <button
            onClick={() => playTextToSpeech(word.japanese)}
            className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const VocabularyTable = ({ vocabulary, currentPage, itemsPerPage }) => {
  const categoryColors = {
    'Danh Từ': 'text-blue-600 bg-blue-50',
    'Động Từ': 'text-green-600 bg-green-50', 
    'Tính Từ': 'text-purple-600 bg-purple-50',
    'Đại Từ': 'text-pink-600 bg-pink-50',
    'Trạng Từ': 'text-orange-600 bg-orange-50',
    'Liên Từ': 'text-teal-600 bg-teal-50'
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Table Container with Horizontal and Vertical Scroll */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Fixed Header */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
            <div className="grid grid-cols-7 gap-4 px-4 py-4">
              <div className="text-sm font-semibold text-gray-700 text-center">
                #
              </div>
              <div className="text-sm font-semibold text-gray-700">
                Kanji/Katakana
              </div>
              <div className="text-sm font-semibold text-gray-700">
                Hiragana
              </div>
              <div className="text-sm font-semibold text-gray-700">
                Romaji
              </div>
              <div className="text-sm font-semibold text-gray-700">
                Nghĩa
              </div>
              <div className="text-sm font-semibold text-gray-700">
                Từ loại
              </div>
              <div className="text-sm font-semibold text-gray-700 text-center">
                Phát âm
              </div>
            </div>
          </div>
          
          {/* Table Body with Fixed Height and Vertical Scroll (20 records max) */}
          <div className="max-h-[800px] overflow-y-auto">
            <div className="divide-y divide-gray-100">
              {vocabulary.map((word, index) => (
                <div 
                  key={`${word.japanese}-${word.id}`}
                  className="grid grid-cols-7 gap-4 px-4 py-4 hover:bg-gray-50 transition-colors duration-150"
                >
                  {/* Index */}
                  <div className="text-sm text-gray-500 font-medium text-center">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </div>
                  
                  {/* Kanji/Katakana */}
                  <div>
                    {word.japanese !== word.hiragana ? (
                      <div className="text-2xl font-bold text-slate-700">
                        {word.japanese}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm">
                        -
                      </div>
                    )}
                  </div>
                  
                  {/* Hiragana */}
                  <div>
                    <div className="text-lg text-gray-600 font-medium">
                      {word.hiragana}
                    </div>
                  </div>
                  
                  {/* Romaji */}
                  <div>
                    <div className="text-sm text-gray-500 font-mono">
                      {word.romaji}
                    </div>
                  </div>
                  
                  {/* Meaning */}
                  <div>
                    <div className="text-sm font-semibold text-green-700">
                      {word.meaning}
                    </div>
                  </div>
                  
                  {/* Category */}
                  <div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryColors[word.category] || 'text-gray-600 bg-gray-50'}`}>
                      {word.category}
                    </span>
                  </div>
                  
                  {/* Pronunciation Button */}
                  <div className="text-center">
                    <button
                      onClick={() => playTextToSpeech(word.japanese)}
                      className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaginationControls = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  onPrevPage, 
  onNextPage, 
  size = 'normal' // 'normal' or 'compact'
}) => {
  const maxVisible = size === 'compact' ? 3 : 5;
  
  if (totalPages <= 1) return null;

  const generatePageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // Add first page if needed
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className={`${size === 'compact' ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg text-sm font-medium transition-all duration-200 text-gray-600 hover:text-green-600 hover:bg-green-50 ${size === 'compact' ? 'bg-white border border-gray-200' : ''}`}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="start-ellipsis" className="text-gray-400 px-2">...</span>
        );
      }
    }

    // Add visible page numbers
    for (let page = startPage; page <= endPage; page++) {
      pages.push(
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`${size === 'compact' ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg text-sm font-medium transition-all duration-200 ${
            currentPage === page
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
              : `text-gray-600 hover:text-green-600 hover:bg-green-50 ${size === 'compact' ? 'bg-white border border-gray-200' : ''}`
          }`}
        >
          {page}
        </button>
      );
    }

    // Add last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="end-ellipsis" className="text-gray-400 px-2">...</span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className={`${size === 'compact' ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg text-sm font-medium transition-all duration-200 text-gray-600 hover:text-green-600 hover:bg-green-50 ${size === 'compact' ? 'bg-white border border-gray-200' : ''}`}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className={`flex items-center ${size === 'compact' ? 'space-x-2' : 'space-x-4'}`}>
      {/* Previous Button */}
      <button
        onClick={onPrevPage}
        disabled={currentPage === 1}
        className={`flex items-center space-x-1 ${size === 'compact' ? 'px-3 py-2' : 'px-4 py-2'} rounded-lg text-sm font-medium transition-all duration-200 ${
          currentPage === 1
            ? 'text-gray-400 cursor-not-allowed bg-gray-100'
            : `text-green-600 hover:text-green-700 hover:bg-green-50 ${size === 'compact' ? 'bg-white border border-gray-200' : ''}`
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Trước</span>
      </button>

      {/* Page Numbers */}
      <div className={`flex items-center ${size === 'compact' ? 'space-x-1' : 'space-x-2'}`}>
        {generatePageNumbers()}
      </div>

      {/* Next Button */}
      <button
        onClick={onNextPage}
        disabled={currentPage === totalPages}
        className={`flex items-center space-x-1 ${size === 'compact' ? 'px-3 py-2' : 'px-4 py-2'} rounded-lg text-sm font-medium transition-all duration-200 ${
          currentPage === totalPages
            ? 'text-gray-400 cursor-not-allowed bg-gray-100'
            : `text-green-600 hover:text-green-700 hover:bg-green-50 ${size === 'compact' ? 'bg-white border border-gray-200' : ''}`
        }`}
      >
        <span>Tiếp</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  const categoryColors = {
    'all': 'from-gray-500 to-gray-600',
    'Danh Từ': 'from-blue-500 to-blue-600',
    'Động Từ': 'from-green-500 to-green-600',
    'Tính Từ': 'from-purple-500 to-purple-600',
    'Đại Từ': 'from-pink-500 to-pink-600',
    'Trạng Từ': 'from-orange-500 to-orange-600',
    'Liên Từ': 'from-teal-500 to-teal-600'
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVocab, setTotalVocab] = useState(0);
  const itemsPerPage = 50; // Show 50 items per page
  
  // View mode state
  const [viewMode, setViewMode] = useState('table'); // 'grid', 'list', or 'table'

  // Fetch vocabulary data from API with pagination
  const fetchVocabulary = async (level, category = '', search = '', page = 1) => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const params = new URLSearchParams({
        jlpt_level: level,
        limit: itemsPerPage.toString(),
        page: page.toString()
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
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalVocab(data.pagination?.total || data.data.length);
        console.log(`Loaded ${data.data.length} vocabulary items for ${level} (page ${page}/${data.pagination?.totalPages || 1})`);
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

  // Load data when level, category, search, or page changes
  useEffect(() => {
    fetchVocabulary(selectedLevel, selectedCategory, searchTerm, currentPage);
  }, [selectedLevel, selectedCategory, searchTerm, currentPage]);

  // Reset category, search, and page when switching levels
  useEffect(() => {
    setSelectedCategory('all');
    setSearchTerm('');
    setCurrentPage(1);
  }, [selectedLevel]);

  // Reset page when search or category changes (but not when currentPage changes to avoid infinite loop)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Don't scroll to top, keep user at the table position
    }
  };

  const handlePrevPage = () => {
    handlePageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    handlePageChange(currentPage + 1);
  };

  // Removed unused categoryStats calculation

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
          
          {/* View Mode Toggle */}
          <div className="flex justify-center">
            <div className="inline-flex bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>Lưới</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <List className="w-4 h-4" />
                <span>Danh sách</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  viewMode === 'table'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Table className="w-4 h-4" />
                <span>Bảng</span>
              </button>
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

        {/* Results Summary with Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          {/* Results Info */}
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600">
            <span>Hiển thị</span>
            <span className="font-bold text-green-600">{vocabulary.length}</span>
            <span>từ vựng {selectedLevel}</span>
            <span>-</span>
            <span>Trang {currentPage}/{totalPages}</span>
            <span>-</span>
            <span className="font-bold text-blue-600">{totalVocab}</span>
            <span>tổng cộng</span>
            {searchTerm && <span>cho "{searchTerm}"</span>}
            {selectedCategory !== 'all' && <span>trong "{selectedCategory}"</span>}
          </div>

          {/* Mini Pagination Controls */}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
            size="compact"
          />
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

        {/* Vocabulary Display */}
        {!loading && !error && vocabulary.length > 0 && (
          <>
            {viewMode === 'grid' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {vocabulary.map((word, index) => (
                  <VocabularyCard 
                    key={`${word.japanese}-${word.id}`} 
                    word={word} 
                    index={(currentPage - 1) * itemsPerPage + index} 
                  />
                ))}
              </div>
            )}
            
            {viewMode === 'list' && (
              <div className="space-y-4 mb-12">
                {vocabulary.map((word, index) => (
                  <VocabularyListItem 
                    key={`${word.japanese}-${word.id}`} 
                    word={word} 
                    index={(currentPage - 1) * itemsPerPage + index} 
                  />
                ))}
              </div>
            )}
            
            {viewMode === 'table' && (
              <div className="mb-12">
                <VocabularyTable 
                  vocabulary={vocabulary}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mb-12">
                <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-6 py-4 shadow-lg">
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    onPrevPage={handlePrevPage}
                    onNextPage={handleNextPage}
                    size="normal"
                  />

                  {/* Page Info */}
                  <div className="text-center mt-4 text-sm text-gray-500">
                    Trang {currentPage} / {totalPages} • {totalVocab} từ vựng
                  </div>
                </div>
              </div>
            )}
          </>
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
                  setCurrentPage(1);
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