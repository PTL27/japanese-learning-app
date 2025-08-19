import React, { useState } from 'react';
import { Search, Volume2, Loader, BookOpen, Star, ExternalLink, Eye, PenTool, Layers, Pause } from 'lucide-react';
import { playTextToSpeech } from '../utils/japaneseData';
import KanjiStrokeViewer from './KanjiStrokeViewer';

const KanjiPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

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
          tags: kanjiData.tags || []
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
    const [showStrokeOrder, setShowStrokeOrder] = useState(false);
    const [strokeData, setStrokeData] = useState(null);
    const [loadingStroke, setLoadingStroke] = useState(false);
    
    // Handle both Kanji Alive and KanjiAPI.dev formats
    const kanjiChar = kanji.kanji || kanji.character || '';
    const meanings = kanji.meanings || (kanji.meaning ? [kanji.meaning] : []);
    const onReadings = kanji.on_readings || kanji.onyomi || [];
    const kunReadings = kanji.kun_readings || kanji.kunyomi || [];
    const strokeCount = kanji.stroke_count || kanji.strokes || 0;
    const jlptLevel = kanji.jlpt || null;
    const grade = kanji.grade || null;
    const examples = kanji.examples || [];
    
    // Load stroke data when requested
    const loadStrokeData = async () => {
      if (strokeData || loadingStroke) {
        console.log(`Skipping load stroke data - already have data or loading: ${kanjiChar}`);
        return;
      }
      
      try {
        setLoadingStroke(true);
        console.log(`Loading stroke data for: ${kanjiChar}`);
        
        const response = await fetch(`http://localhost:5001/api/kanji/with-strokes/${encodeURIComponent(kanjiChar)}`);
        const data = await response.json();
        
        console.log(`API response for ${kanjiChar}:`, data);
        
        if (data.success && data.data.stroke_order_data) {
          setStrokeData(data.data.stroke_order_data);
          console.log(`✅ Stroke data loaded for ${kanjiChar}:`, data.data.stroke_order_data);
        } else {
          console.log(`❌ No stroke data found for ${kanjiChar}, attempting to fetch from KanjiVG...`);
          // Try to fetch from KanjiVG
          const fetchResponse = await fetch(`http://localhost:5001/api/kanji/strokes/${encodeURIComponent(kanjiChar)}`, {
            method: 'POST'
          });
          const fetchData = await fetchResponse.json();
          
          if (fetchData.success && fetchData.data) {
            setStrokeData(fetchData.data);
            console.log(`✅ Stroke data fetched and saved for ${kanjiChar}:`, fetchData.data);
          }
        }
      } catch (error) {
        console.error('Error loading stroke data:', error);
      } finally {
        setLoadingStroke(false);
      }
    };
    
    const handleStrokeOrderToggle = () => {
      if (!showStrokeOrder && !strokeData && !loadingStroke) {
        loadStrokeData();
      }
      setShowStrokeOrder(!showStrokeOrder);
    };

    return (
      <div className="bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-8">
          <div className="flex justify-between items-start">
            <div className="text-center">
              <div className="text-8xl font-bold mb-4 drop-shadow-lg">
                {kanjiChar}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => playTextToSpeech(kanjiChar)}
                  className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors backdrop-blur-sm"
                  title="Phát âm"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
                <button
                  onClick={handleStrokeOrderToggle}
                  disabled={loadingStroke}
                  className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors backdrop-blur-sm disabled:opacity-50"
                  title="Xem thứ tự nét vẽ"
                >
                  {loadingStroke ? (
                    <Loader className="w-6 h-6 animate-spin" />
                  ) : showStrokeOrder ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <PenTool className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex flex-col space-y-3 items-end">
              {jlptLevel && (
                <span className={`px-4 py-2 rounded-full text-sm font-bold border ${getJLPTColor(jlptLevel)} bg-white/90`}>
                  JLPT N{jlptLevel}
                </span>
              )}
              {grade && (
                <span className={`${getGradeColor(grade)} text-white px-4 py-2 rounded-full text-sm font-bold`}>
                  Lớp {grade}
                </span>
              )}
              <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
                {strokeCount} nét
              </span>
            </div>
          </div>
        </div>

        {/* Stroke Order Viewer */}
        {showStrokeOrder && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <PenTool className="w-5 h-5 mr-2" />
              Thứ tự nét vẽ
            </h3>
            {strokeData ? (
              <KanjiStrokeViewer 
                kanji={kanjiChar} 
                strokeData={strokeData}
                className="max-w-2xl mx-auto"
              />
            ) : loadingStroke ? (
              <div className="text-center py-8">
                <Loader className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
                <p className="text-gray-600">Đang tải dữ liệu nét vẽ...</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-gray-600 mb-4">Không có dữ liệu nét vẽ cho kanji này</p>
                <button
                  onClick={loadStrokeData}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Thử tải lại
                </button>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Meanings */}
          {meanings.length > 0 && (
            <div>
              <h3 className="flex items-center text-xl font-bold text-gray-800 mb-4">
                <BookOpen className="w-6 h-6 mr-3 text-indigo-600" />
                Nghĩa tiếng Anh
              </h3>
              <div className="flex flex-wrap gap-2">
                {meanings.map((meaning, idx) => (
                  <span
                    key={idx}
                    className="bg-indigo-50 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium border border-indigo-200"
                  >
                    {meaning}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* On readings (音読み) */}
          {onReadings.length > 0 && (
            <div>
              <h3 className="flex items-center text-xl font-bold text-gray-800 mb-4">
                <Eye className="w-6 h-6 mr-3 text-green-600" />
                Âm đọc (音読み)
              </h3>
              <div className="flex flex-wrap gap-2">
                {onReadings.map((reading, idx) => (
                  <span
                    key={idx}
                    className="bg-green-50 text-green-800 px-4 py-2 rounded-full text-lg font-bold border border-green-200"
                  >
                    {reading}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Kun readings (訓読み) */}
          {kunReadings.length > 0 && (
            <div>
              <h3 className="flex items-center text-xl font-bold text-gray-800 mb-4">
                <PenTool className="w-6 h-6 mr-3 text-purple-600" />
                Kun đọc (訓読み)
              </h3>
              <div className="flex flex-wrap gap-2">
                {kunReadings.map((reading, idx) => (
                  <span
                    key={idx}
                    className="bg-purple-50 text-purple-800 px-4 py-2 rounded-full text-lg font-medium border border-purple-200"
                  >
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
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-6">
            <BookOpen className="w-4 h-4" />
            <span>Kanji Dictionary</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Từ điển Kanji
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Khám phá ý nghĩa, cách đọc và thông tin chi tiết về các ký tự Kanji
          </p>
        </div>

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
                  className="bg-white/60 hover:bg-white/80 border border-gray-200 hover:border-purple-300 px-4 py-3 rounded-xl text-2xl text-gray-700 hover:text-purple-700 transition-all duration-200 font-bold min-w-[60px]"
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
            <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-6 py-4">
              <Loader className="w-6 h-6 animate-spin text-purple-500" />
              <span className="text-gray-600 font-medium">Đang tra cứu kanji...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-6">❌</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Có lỗi xảy ra
              </h3>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              <button
                onClick={() => searchKanji(searchTerm)}
                className="inline-flex items-center space-x-2 bg-purple-500 text-white px-6 py-3 rounded-xl hover:bg-purple-600 transition-colors font-medium"
              >
                <span>Thử lại</span>
              </button>
            </div>
          </div>
        )}

        {/* No Results */}
        {hasSearched && !loading && !error && searchResults.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Không tìm thấy kanji
              </h3>
              <p className="text-gray-600 mb-6">
                Hãy thử nhập một ký tự kanji hợp lệ
              </p>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Thông tin kanji
              </h3>
              <p className="text-gray-600">
                Kết quả cho "{searchTerm}"
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              {searchResults.map((kanji, index) => (
                <KanjiCard key={index} kanji={kanji} />
              ))}
            </div>

            {/* API Credit */}
            <div className="text-center pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 flex items-center justify-center">
                <span>Dữ liệu từ</span>
                <a
                  href="https://jisho.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-purple-600 hover:text-purple-700 font-medium inline-flex items-center"
                >
                  Jisho.org
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Features */}
        {!hasSearched && (
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-3xl p-1 mb-8">
            <div className="bg-white rounded-2xl p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  ✨ Tính năng từ điển Kanji
                </h3>
                <p className="text-gray-600">Khám phá thế giới ký tự Kanji</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-purple-50 rounded-xl p-6 text-center">
                  <div className="text-3xl mb-3">📚</div>
                  <h4 className="font-semibold text-purple-800 mb-2">Thông tin đầy đủ</h4>
                  <p className="text-purple-600 text-sm">Nghĩa, cách đọc, số nét và JLPT level</p>
                </div>
                
                <div className="bg-indigo-50 rounded-xl p-6 text-center">
                  <div className="text-3xl mb-3">🎌</div>
                  <h4 className="font-semibold text-indigo-800 mb-2">Âm đọc & Kun đọc</h4>
                  <p className="text-indigo-600 text-sm">Học cách đọc kanji trong ngữ cảnh khác nhau</p>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-6 text-center">
                  <div className="text-3xl mb-3">🔊</div>
                  <h4 className="font-semibold text-blue-800 mb-2">Phát âm & Thông tin</h4>
                  <p className="text-blue-600 text-sm">Nghe phát âm và xem thông tin chi tiết</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanjiPage;