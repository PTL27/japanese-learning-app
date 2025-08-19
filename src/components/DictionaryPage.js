import React, { useState } from 'react';
import { Search, Volume2, Loader, Book, ExternalLink } from 'lucide-react';
import { playTextToSpeech } from '../utils/japaneseData';

const DictionaryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Search using local backend API
  const searchDictionary = async (term) => {
    if (!term.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      
      console.log('Searching for:', term);
      
      // Use local backend API
      const response = await fetch(`http://localhost:5001/api/dictionary/search?q=${encodeURIComponent(term)}&limit=10`);
      console.log('Dictionary API status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Dictionary API error! status: ${response.status}`);
      }
      
      const apiData = await response.json();
      console.log('Dictionary API Response:', apiData);
      
      if (apiData.success && apiData.data && Array.isArray(apiData.data)) {
        const results = apiData.data;
        
        if (results.length > 0) {
          // Convert backend format to display format
          const processedResults = results.map((entry, index) => {
            return {
              slug: entry.kanji || entry.kana,
              japanese: [{
                word: entry.kanji || entry.kana,
                reading: entry.kana || entry.romaji
              }],
              senses: [{
                english_definitions: entry.meanings || ['Định nghĩa không có sẵn'],
                parts_of_speech: entry.parts_of_speech || []
              }],
              tags: entry.tags || [],
              jlpt: entry.jlpt_level ? [entry.jlpt_level] : [],
              is_common: entry.is_common || false,
              entry_id: entry.entry_id,
              examples: entry.examples || []
            };
          });
          
          setSearchResults(processedResults);
          setError(null);
        } else {
          setSearchResults([]);
          setError('Không tìm thấy kết quả cho từ khóa này');
        }
      } else {
        setSearchResults([]);
        setError('Không tìm thấy kết quả nào');
      }
    } catch (err) {
      console.error('Dictionary search error:', err);
      setSearchResults([]);
      setError(`Lỗi kết nối đến từ điển: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchDictionary(searchTerm);
  };

  const getJLPTLevel = (tags) => {
    if (!tags || !Array.isArray(tags)) return null;
    
    // Look for direct JLPT tags first
    const jlptTag = tags.find(tag => tag && tag.toLowerCase().includes('jlpt'));
    if (jlptTag) {
      const level = jlptTag.match(/[nN]?([1-5])/);
      if (level) return `N${level[1]}`;
    }
    
    // Fallback to wanikani levels
    const wanikaniTag = tags.find(tag => tag && tag.startsWith('wanikani'));
    if (wanikaniTag) {
      const level = wanikaniTag.match(/level-(\d+)/);
      if (level) {
        const num = parseInt(level[1]);
        if (num <= 10) return 'N5';
        if (num <= 20) return 'N4';
        if (num <= 30) return 'N3';
        if (num <= 40) return 'N2';
        return 'N1';
      }
    }
    return null;
  };

  const DictionaryEntry = ({ entry, index }) => {
    if (!entry) return null;
    
    const japanese = (entry.japanese && entry.japanese[0]) || {};
    const senses = entry.senses || [];
    const jlptLevel = getJLPTLevel(entry.tags || []);

    return (
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
        {/* Header with word and JLPT level */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold mb-1">
                {japanese.word || entry.slug}
              </h3>
              {japanese.reading && (
                <p className="text-blue-100 text-lg">
                  {japanese.reading}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end space-y-2">
              {jlptLevel && (
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                  JLPT {jlptLevel}
                </span>
              )}
              <button
                onClick={() => playTextToSpeech(japanese.word || entry.slug)}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Meanings */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <Book className="w-4 h-4 mr-2 text-indigo-600" />
              Nghĩa
            </h4>
            <div className="space-y-2">
              {senses.slice(0, 3).map((sense, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(sense.parts_of_speech || []).map((pos, posIdx) => (
                      <span
                        key={posIdx}
                        className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {pos}
                      </span>
                    ))}
                  </div>
                  <ul className="list-disc list-inside text-gray-700">
                    {(sense.english_definitions || []).slice(0, 3).map((def, defIdx) => (
                      <li key={defIdx} className="text-sm">{def}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="border-t pt-3">
              <div className="flex flex-wrap gap-1">
                {entry.tags.slice(0, 5).map((tag, tagIdx) => (
                  <span
                    key={tagIdx}
                    className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-6">
            <Book className="w-4 h-4" />
            <span>Japanese Dictionary</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Từ điển Nhật-Việt
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tra cứu ví dụ câu tiếng Nhật với bản dịch từ cộng đồng Tatoeba
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
              placeholder="Nhập từ hoặc cụm từ tiếng Nhật để tìm ví dụ câu..."
              className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 font-medium"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                'Tìm kiếm'
              )}
            </button>
          </div>
        </form>

        {/* Popular searches */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4">Tìm kiếm phổ biến:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['こんにちは', 'ありがとう', '学校', '友達', '食べる', '美しい', '今日', '明日'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchTerm(term);
                    searchDictionary(term);
                  }}
                  className="bg-white/60 hover:bg-white/80 border border-gray-200 hover:border-blue-300 px-4 py-2 rounded-full text-sm text-gray-700 hover:text-blue-700 transition-all duration-200"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-6 py-4">
              <Loader className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-gray-600 font-medium">Đang tìm kiếm...</span>
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
                onClick={() => searchDictionary(searchTerm)}
                className="inline-flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors font-medium"
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
                Không tìm thấy kết quả
              </h3>
              <p className="text-gray-600 mb-6">
                Hãy thử từ khóa khác hoặc kiểm tra chính tả
              </p>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Kết quả tìm kiếm
              </h3>
              <p className="text-gray-600">
                Tìm thấy {searchResults.length} kết quả cho "{searchTerm}"
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {searchResults.map((entry, index) => (
                <DictionaryEntry key={index} entry={entry} index={index} />
              ))}
            </div>

            {/* API Credit */}
            <div className="text-center pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 flex items-center justify-center flex-wrap gap-2">
                <span>Dữ liệu từ</span>
                <a
                  href="https://tatoeba.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
                >
                  Tatoeba.org
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
                <span>&</span>
                <a
                  href="https://jisho.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
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
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl p-1 mb-8">
            <div className="bg-white rounded-2xl p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  ✨ Tính năng từ điển
                </h3>
                <p className="text-gray-600">Khám phá các tính năng hữu ích</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-xl p-6 text-center">
                  <div className="text-3xl mb-3">📚</div>
                  <h4 className="font-semibold text-blue-800 mb-2">Ví dụ câu thực tế</h4>
                  <p className="text-blue-600 text-sm">Câu ví dụ từ cộng đồng người học tiếng Nhật</p>
                </div>
                
                <div className="bg-green-50 rounded-xl p-6 text-center">
                  <div className="text-3xl mb-3">🌍</div>
                  <h4 className="font-semibold text-green-800 mb-2">Bản dịch cộng đồng</h4>
                  <p className="text-green-600 text-sm">Dịch thuật bởi người bản ngữ và học viên</p>
                </div>
                
                <div className="bg-purple-50 rounded-xl p-6 text-center">
                  <div className="text-3xl mb-3">🔊</div>
                  <h4 className="font-semibold text-purple-800 mb-2">Phát âm & Furigana</h4>
                  <p className="text-purple-600 text-sm">Nghe phát âm và xem cách đọc của từng từ</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DictionaryPage;