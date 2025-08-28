import React, { useState, useEffect } from 'react';
import { Search, Volume2, Loader, BookOpen, Star, ExternalLink, Eye, PenTool, Layers, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { playTextToSpeech } from '../utils/japaneseData';
import KanjiStrokeViewer from './KanjiStrokeViewer';
import JLPTLevelTabs from './common/JLPTLevelTabs';
import KanjiDetailPage from './KanjiDetailPage';

const KanjiPage = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('dictionary');
  
  // Dictionary tab states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Learning tab states
  const [selectedLevel, setSelectedLevel] = useState('N5');
  const [kanjiData, setKanjiData] = useState([]);
  const [learningSearchTerm, setLearningSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalKanji, setTotalKanji] = useState(0);
  const [learningLoading, setLearningLoading] = useState(false);
  const itemsPerPage = 24;

  // Detail page states for JLPT learning tab
  const [selectedKanjiForDetail, setSelectedKanjiForDetail] = useState(null);
  const [showKanjiDetail, setShowKanjiDetail] = useState(false);

  // Search using local backend API
  const searchKanji = async (kanji) => {
    if (!kanji.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      
      console.log('Searching kanji:', kanji);
      
      // Use local backend API
      const response = await fetch(`http://localhost:5001/api/kanji/search/${encodeURIComponent(kanji)}`);
      console.log('Kanji API status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Kanji API error! status: ${response.status}`);
      }
      
      const apiData = await response.json();
      console.log('Kanji API Response:', apiData);
      
      if (apiData.success && apiData.data) {
        const kanjiData = apiData.data;
        
        // Convert backend format to display format
        const processedKanji = {
          kanji: kanjiData.character,
          meanings: kanjiData.meanings || [],
          on_readings: kanjiData.on_readings || [],
          kun_readings: kanjiData.kun_readings || [],
          name_readings: kanjiData.name_readings || [],
          stroke_count: kanjiData.stroke_count || 0,
          jlpt: kanjiData.jlpt_level,
          grade: kanjiData.grade_level,
          frequency_rank: kanjiData.frequency_rank,
          radical: kanjiData.radical,
          radical_name: kanjiData.radical_name,
          unicode: kanjiData.unicode,
          components: kanjiData.components || [],
          variants: kanjiData.variants || [],
          examples: kanjiData.examples || [],
          tags: kanjiData.tags || [],
          stroke_order_data: kanjiData.stroke_order_data || null
        };
        
        setSearchResults([processedKanji]);
        setError(null);
      } else {
        setError('Không tìm thấy kanji này trong cơ sở dữ liệu');
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Kanji search error:', err);
      setError(`Lỗi kết nối đến API: ${err.message}`);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch kanji by JLPT level with pagination
  const fetchKanjiByLevel = async (level, page = 1, search = '') => {
    setLearningLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString()
      });
      
      if (search) {
        params.append('search', search);
      }
      
      // Temporary fix: use grade endpoint while backend level endpoint is being fixed
      // For now, let's try N5 -> grade 1 as it has the most basic kanji
      const gradeMapping = { 'N5': 1, 'N4': 2, 'N3': 3, 'N2': 4, 'N1': 5 };
      const grade = gradeMapping[level] || 1;
      const response = await fetch(`http://localhost:5001/api/kanji/grade/${grade}?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Handle pagination for grade endpoint (doesn't have built-in pagination)
          const allData = data.data || [];
          const startIndex = (page - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const pageData = allData.slice(startIndex, endIndex);
          
          setKanjiData(pageData);
          setTotalPages(Math.ceil(allData.length / itemsPerPage));
          setTotalKanji(allData.length);
        } else {
          console.error('Failed to fetch kanji data:', data.message);
          setKanjiData([]);
          setTotalPages(1);
          setTotalKanji(0);
        }
      } else {
        console.error('API error:', response.status);
        setKanjiData([]);
        setTotalPages(1);
        setTotalKanji(0);
      }
    } catch (error) {
      console.error('Error fetching kanji:', error);
      setKanjiData([]);
      setTotalPages(1);
      setTotalKanji(0);
    } finally {
      setLearningLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === 'learning') {
        fetchKanjiByLevel(selectedLevel, 1, learningSearchTerm);
        setCurrentPage(1);
      }
    }, 300); // 300ms delay
    
    return () => clearTimeout(timeoutId);
  }, [learningSearchTerm]);

  // Effects for learning tab
  useEffect(() => {
    if (activeTab === 'learning') {
      fetchKanjiByLevel(selectedLevel, 1, '');
      setCurrentPage(1);
      setLearningSearchTerm('');
    }
  }, [activeTab, selectedLevel]);

  // Effect for page changes
  useEffect(() => {
    if (activeTab === 'learning' && currentPage > 1) {
      fetchKanjiByLevel(selectedLevel, currentPage, learningSearchTerm);
    }
  }, [currentPage]);

  // Pagination components from VocabularyPage
  const PaginationControls = ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    onPrevPage, 
    onNextPage 
  }) => {
    if (totalPages <= 1) return null;

    const generatePageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
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
            className="w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 text-gray-600 hover:text-orange-600 hover:bg-orange-50 bg-white border border-gray-200"
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
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPage === page
                ? 'bg-orange-500 text-white shadow-lg'
                : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50 bg-white border border-gray-200'
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
            className="w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 text-gray-600 hover:text-orange-600 hover:bg-orange-50 bg-white border border-gray-200"
          >
            {totalPages}
          </button>
        );
      }

      return pages;
    };

    return (
      <div className="flex items-center space-x-4">
        {/* Previous Button */}
        <button
          onClick={onPrevPage}
          disabled={currentPage === 1}
          className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentPage === 1
              ? 'text-gray-400 cursor-not-allowed bg-gray-100'
              : 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 bg-white border border-gray-200'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Trước</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-2">
          {generatePageNumbers()}
        </div>

        {/* Next Button */}
        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentPage === totalPages
              ? 'text-gray-400 cursor-not-allowed bg-gray-100'
              : 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 bg-white border border-gray-200'
          }`}
        >
          <span>Tiếp</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle kanji detail page for JLPT learning tab
  const handleKanjiClick = (kanji) => {
    setSelectedKanjiForDetail(kanji.character);
    setShowKanjiDetail(true);
  };

  const handleBackFromDetail = () => {
    setShowKanjiDetail(false);
    setSelectedKanjiForDetail(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.length === 1) {
      searchKanji(searchTerm);
    } else {
      setError('Vui lòng nhập chỉ 1 ký tự kanji');
    }
  };

  const getJLPTColor = (level) => {
    const colors = {
      5: 'bg-blue-100 text-blue-800 border-blue-200',
      4: 'bg-orange-100 text-orange-800 border-orange-200',
      3: 'bg-purple-100 text-purple-800 border-purple-200',
      2: 'bg-green-100 text-green-800 border-green-200',
      1: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[level] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getGradeColor = (grade) => {
    if (grade <= 2) return 'bg-green-500';
    if (grade <= 4) return 'bg-blue-500';
    if (grade <= 6) return 'bg-purple-500';
    return 'bg-gray-500';
  };

  const KanjiCard = ({ kanji }) => {
    const meanings = kanji.meanings || [];
    const onReadings = kanji.on_readings || [];
    const kunReadings = kanji.kun_readings || [];
    const examples = kanji.examples || [];
    const strokeCount = kanji.stroke_count || 0;
    
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100 hover:shadow-3xl transition-all duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main kanji display */}
          <div className="lg:col-span-1">
            <div className="text-center">
              <div className="text-9xl font-bold text-gray-800 mb-6 select-text">
                {kanji.kanji}
              </div>
              
              {/* JLPT & Grade badges */}
              <div className="flex justify-center space-x-3 mb-6">
                {kanji.jlpt && (
                  <div className={`px-4 py-2 rounded-full border text-sm font-semibold ${getJLPTColor(kanji.jlpt)}`}>
                    JLPT N{kanji.jlpt}
                  </div>
                )}
                {kanji.grade && (
                  <div className={`px-4 py-2 rounded-full text-white text-sm font-semibold ${getGradeColor(kanji.grade)}`}>
                    Grade {kanji.grade}
                  </div>
                )}
              </div>

              {/* Audio button */}
              <button
                onClick={() => playTextToSpeech(kanji.kanji)}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <Volume2 className="w-5 h-5" />
                <span>Phát âm</span>
              </button>
              
              {strokeCount > 0 && (
                <div className="mt-4">
                  <KanjiStrokeViewer 
                    kanji={kanji.kanji} 
                    strokeData={kanji.stroke_order_data}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Meanings */}
            {meanings.length > 0 && (
              <div>
                <h3 className="flex items-center text-xl font-bold text-gray-800 mb-4">
                  <BookOpen className="w-6 h-6 mr-3 text-blue-600" />
                  Nghĩa
                </h3>
                <div className="flex flex-wrap gap-3">
                  {meanings.slice(0, 8).map((meaning, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium border border-blue-200">
                      {meaning}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* On readings */}
            {onReadings.length > 0 && (
              <div>
                <h3 className="flex items-center text-xl font-bold text-gray-800 mb-4">
                  <Eye className="w-6 h-6 mr-3 text-green-600" />
                  Âm ON (音読み)
                </h3>
                <div className="flex flex-wrap gap-3">
                  {onReadings.map((reading, idx) => (
                    <span key={idx} className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium border border-green-200 text-lg">
                      {reading}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Kun readings */}
            {kunReadings.length > 0 && (
              <div>
                <h3 className="flex items-center text-xl font-bold text-gray-800 mb-4">
                  <PenTool className="w-6 h-6 mr-3 text-purple-600" />
                  Âm KUN (訓読み)
                </h3>
                <div className="flex flex-wrap gap-3">
                  {kunReadings.map((reading, idx) => (
                    <span key={idx} className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-medium border border-purple-200 text-lg">
                      {reading}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Examples */}
            {examples.length > 0 && (
              <div>
                <h3 className="flex items-center text-xl font-bold text-gray-800 mb-4">
                  <Star className="w-6 h-6 mr-3 text-yellow-600" />
                  Ví dụ
                </h3>
                <div className="space-y-3">
                  {examples.slice(0, 5).map((example, idx) => (
                    <div key={idx} className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-800">
                          {example.word || example.japanese || example.example}
                        </span>
                        <button
                          onClick={() => playTextToSpeech(example.word || example.japanese || example.example)}
                          className="text-yellow-600 hover:text-yellow-700 p-1"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {example.reading && `[${example.reading}]`}
                      </div>
                      {(example.meaning || (example.meaning && example.meaning.english)) && (
                        <p className="text-yellow-800 mt-2">
                          {typeof example.meaning === 'string' ? example.meaning : example.meaning?.english}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unicode and technical info */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="flex items-center text-lg font-bold text-gray-800 mb-4">
                <Layers className="w-5 h-5 mr-3 text-gray-600" />
                Thông tin kỹ thuật
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 font-medium">Unicode:</span>
                  <span className="ml-2 font-mono bg-gray-200 px-2 py-1 rounded">
                    {kanji.unicode || 'N/A'}
                  </span>
                </div>
                {kanji.radical && (
                  <div>
                    <span className="text-gray-600 font-medium">Radical:</span>
                    <span className="ml-2 font-bold">
                      {typeof kanji.radical === 'string' ? kanji.radical : kanji.radical.character}
                    </span>
                  </div>
                )}
                {strokeCount > 0 && (
                  <div>
                    <span className="text-gray-600 font-medium">Stroke Count:</span>
                    <span className="ml-2 font-bold">
                      {strokeCount}
                    </span>
                  </div>
                )}
                {kanji.frequency && (
                  <div>
                    <span className="text-gray-600 font-medium">Usage:</span>
                    <span className={`ml-2 font-bold ${kanji.frequency === 'Common' ? 'text-green-600' : 'text-orange-600'}`}>
                      {kanji.frequency}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const mainContent = (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-6">
            <BookOpen className="w-4 h-4" />
            <span>Kanji Learning Center</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Kanji
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {activeTab === 'dictionary' 
              ? 'Khám phá ý nghĩa, cách đọc và thông tin chi tiết về các ký tự Kanji'
              : 'Học Kanji theo level JLPT một cách có hệ thống'
            }
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('dictionary')}
                className={`relative px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  activeTab === 'dictionary'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                {activeTab === 'dictionary' && (
                  <div className="absolute inset-0 bg-white/20 animate-pulse rounded-xl" />
                )}
                <span className="relative flex items-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span>Từ điển Kanji</span>
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('learning')}
                className={`relative px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  activeTab === 'learning'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                {activeTab === 'learning' && (
                  <div className="absolute inset-0 bg-white/20 animate-pulse rounded-xl" />
                )}
                <span className="relative flex items-center space-x-2">
                  <PenTool className="w-5 h-5" />
                  <span>Học theo JLPT</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Dictionary Tab Content */}
        {activeTab === 'dictionary' && (
          <>
            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nhập 1 ký tự Kanji để tra cứu..."
                  maxLength="1"
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 bg-white/80 backdrop-blur-sm transition-all duration-200 text-center text-3xl font-bold"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2 rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 font-medium"
                >
                  {loading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    'Tra cứu'
                  )}
                </button>
              </div>
            </form>

            {/* Popular kanji */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="text-center mb-6">
                <p className="text-gray-600 mb-4">Kanji phổ biến:</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {['人', '水', '火', '木', '土', '金', '月', '日', '愛', '学', '生', '心'].map((kanji) => (
                    <button
                      key={kanji}
                      onClick={() => {
                        setSearchTerm(kanji);
                        searchKanji(kanji);
                      }}
                      className="w-16 h-16 bg-white/80 backdrop-blur-sm border-2 border-purple-200 rounded-xl text-2xl font-bold text-gray-800 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    >
                      {kanji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-16">
                <Loader className="w-16 h-16 animate-spin text-purple-500 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Đang tra cứu kanji...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="max-w-2xl mx-auto mb-8">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                  <div className="text-red-600 text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-bold text-red-800 mb-2">Lỗi tra cứu</h3>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* Results */}
            {searchResults.length > 0 && (
              <div className="max-w-5xl mx-auto">
                {searchResults.map((kanji, index) => (
                  <KanjiCard key={index} kanji={kanji} />
                ))}
              </div>
            )}

            {/* Empty state - only show if searched but no results and no error */}
            {hasSearched && searchResults.length === 0 && !error && !loading && (
              <div className="max-w-2xl mx-auto text-center py-16">
                <div className="text-6xl mb-6">🔍</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Không tìm thấy kết quả
                </h3>
                <p className="text-gray-600">
                  Thử nhập một ký tự kanji khác để tra cứu
                </p>
              </div>
            )}
          </>
        )}

        {/* Learning Tab Content */}
        {activeTab === 'learning' && (
          <>
            {/* JLPT Level Tabs */}
            <JLPTLevelTabs
              selectedLevel={selectedLevel}
              onLevelChange={setSelectedLevel}
              className="kanji-learning-level-tabs mb-8"
            />

            {/* Level Info */}
            <div className="max-w-4xl mx-auto mb-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  JLPT {selectedLevel} Kanji
                </h3>
                <p className="text-gray-600">
                  {totalKanji} kanji found for {selectedLevel} level
                  {learningSearchTerm && ` matching "${learningSearchTerm}"`}
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={learningSearchTerm}
                  onChange={(e) => setLearningSearchTerm(e.target.value)}
                  placeholder="Search kanji, meanings, or readings..."
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600">
                <span>Hiển thị</span>
                <span className="font-bold text-orange-600">{kanjiData.length}</span>
                <span>kanji {selectedLevel}</span>
                <span>-</span>
                <span>Trang {currentPage}/{totalPages}</span>
                <span>-</span>
                <span className="font-bold text-blue-600">{totalKanji}</span>
                <span>tổng cộng</span>
                {learningSearchTerm && <span>cho "{learningSearchTerm}"</span>}
              </div>
            </div>

            {/* Loading */}
            {learningLoading && (
              <div className="text-center py-16">
                <Loader className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
                <p className="text-gray-600">Loading kanji...</p>
              </div>
            )}

            {/* Kanji Grid */}
            {!learningLoading && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
                {kanjiData.map((kanji, index) => (
                  <div
                    key={kanji.id || index}
                    className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 border border-white/20"
                    onClick={() => handleKanjiClick(kanji)}
                  >
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-3 text-gray-800">
                        {kanji.character}
                      </div>
                      
                      {kanji.meanings && kanji.meanings.length > 0 && (
                        <div className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {kanji.meanings.slice(0, 2).join(', ')}
                        </div>
                      )}
                      
                      {kanji.stroke_count && (
                        <div className="text-xs text-gray-500">
                          {kanji.stroke_count} strokes
                        </div>
                      )}
                      
                      <div className="mt-2 text-xs text-orange-600 font-medium">
                        Click for details
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mb-12">
                <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-6 py-4 shadow-lg">
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    onPrevPage={handlePrevPage}
                    onNextPage={handleNextPage}
                  />

                  {/* Page Info */}
                  <div className="text-center mt-4 text-sm text-gray-500">
                    Trang {currentPage} / {totalPages} • {totalKanji} kanji
                  </div>
                </div>
              </div>
            )}

            {/* No Results */}
            {!learningLoading && kanjiData.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {learningSearchTerm ? 'Không tìm thấy kanji nào' : 'Chưa có dữ liệu kanji'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {learningSearchTerm 
                    ? `Không tìm thấy kanji nào cho "${learningSearchTerm}" trong level ${selectedLevel}`
                    : `Chưa có dữ liệu kanji cho level ${selectedLevel}`
                  }
                </p>
                {learningSearchTerm && (
                  <button
                    onClick={() => setLearningSearchTerm('')}
                    className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors font-medium"
                  >
                    Xóa tìm kiếm
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  // Show Kanji Detail Page if a kanji is selected in learning tab
  if (showKanjiDetail && selectedKanjiForDetail) {
    return (
      <KanjiDetailPage
        kanjiCharacter={selectedKanjiForDetail}
        onBack={handleBackFromDetail}
        jlptLevel={selectedLevel}
      />
    );
  }

  return mainContent;
};

export default KanjiPage;