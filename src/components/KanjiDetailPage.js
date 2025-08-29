import React, { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, BookOpen, Eye, PenTool } from 'lucide-react';
import { playTextToSpeech } from '../utils/japaneseData';
import KanjiStrokeViewer from './KanjiStrokeViewer';

const KanjiDetailPage = ({ kanjiCharacter, onBack, jlptLevel }) => {
  const [kanjiData, setKanjiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStrokes, setShowStrokes] = useState(true);

  useEffect(() => {
    fetchKanjiDetail();
  }, [kanjiCharacter]);

  const fetchKanjiDetail = async () => {
    if (!kanjiCharacter) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/kanji/search/${encodeURIComponent(kanjiCharacter)}`);
      
      if (response.ok) {
        const apiData = await response.json();
        if (apiData.success && apiData.data) {
          setKanjiData(apiData.data);
          setError(null);
        } else {
          setError('Không tìm thấy thông tin kanji');
        }
      } else {
        setError('Lỗi kết nối API');
      }
    } catch (err) {
      setError('Lỗi tải dữ liệu kanji');
      console.error('Error fetching kanji detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAudio = (text, lang = 'ja') => {
    playTextToSpeech(text, lang);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin kanji...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !kanjiData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="mb-6 inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 text-gray-700 hover:bg-white/90 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
          
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Không thể tải thông tin kanji</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Ưu tiên nghĩa tiếng Việt, fallback sang tiếng Anh nếu không có
  const meanings = kanjiData.meanings?.vi || kanjiData.meanings?.en || [];
  const onReadings = kanjiData.on_readings || [];
  const kunReadings = kanjiData.kun_readings || [];
  
  // Lấy âm Hán Việt từ name_readings nếu có
  const hanVietReadings = kanjiData.name_readings ? 
    kanjiData.name_readings.filter(reading => 
      /^[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ\s]+$/i.test(reading)
    ) : [];
  const examples = kanjiData.examples || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 text-gray-700 hover:bg-white/90 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách</span>
          </button>
          
          {jlptLevel && (
            <div className="bg-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm">
              JLPT {jlptLevel}
            </div>
          )}
        </div>

        {/* Main Kanji Display */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 mb-8">
          <div className="text-center mb-8">
            <div className="text-8xl font-bold text-gray-900 mb-4">
              {kanjiData.character}
            </div>
            
            <button
              onClick={() => handlePlayAudio(kanjiData.character)}
              className="inline-flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-all"
            >
              <Volume2 className="w-5 h-5" />
              <span>Phát âm</span>
            </button>
          </div>

        </div>

        {/* Hán Việt Readings - Moved up */}
        {hanVietReadings.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <BookOpen className="w-6 h-6 mr-3 text-red-500" />
              Âm Hán Việt
            </h2>
            <div className="flex flex-wrap gap-3">
              {hanVietReadings.map((reading, index) => (
                <div 
                  key={index} 
                  className="inline-flex items-center px-6 py-3 bg-red-50 text-red-700 rounded-full border border-red-200 font-semibold text-lg"
                >
                  <span>{reading}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meanings */}
        {meanings.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <BookOpen className="w-6 h-6 mr-3 text-green-500" />
              Nghĩa
            </h2>
            <div className="space-y-3">
              {meanings.map((meaning, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl">
                  <span className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-gray-800 font-medium">{meaning}</span>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Readings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* On Reading */}
          {onReadings.length > 0 && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-3 text-blue-500" />
                Âm On (音読み)
              </h2>
              <div className="space-y-3">
                {onReadings.map((reading, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handlePlayAudio(reading)}
                  >
                    <span className="text-lg font-medium text-gray-800">{reading}</span>
                    <Volume2 className="w-4 h-4 text-blue-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Kun Reading */}
          {kunReadings.length > 0 && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-3 text-purple-500" />
                Âm Kun (訓読み)
              </h2>
              <div className="space-y-3">
                {kunReadings.map((reading, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-purple-50 rounded-xl cursor-pointer hover:bg-purple-100 transition-colors"
                    onClick={() => handlePlayAudio(reading)}
                  >
                    <span className="text-lg font-medium text-gray-800">{reading}</span>
                    <Volume2 className="w-4 h-4 text-purple-500" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stroke Order */}
        {kanjiData.stroke_count > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <PenTool className="w-6 h-6 mr-3 text-orange-500" />
                Thứ tự nét vẽ
              </h2>
              <button
                onClick={() => setShowStrokes(!showStrokes)}
                className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors"
              >
                {showStrokes ? 'Ẩn' : 'Hiện'} nét vẽ
              </button>
            </div>
            
            {showStrokes && (
              <div className="mt-6">
                <KanjiStrokeViewer 
                  kanji={kanjiData.character} 
                  strokeData={kanjiData.stroke_order_data}
                />
              </div>
            )}
          </div>
        )}

        {/* Examples */}
        {examples.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <BookOpen className="w-6 h-6 mr-3 text-indigo-500" />
              Ví dụ sử dụng
            </h2>
            <div className="space-y-4">
              {examples.slice(0, 5).map((example, index) => (
                <div key={index} className="p-4 bg-indigo-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-medium text-gray-900">
                      {example.word || example.japanese}
                    </span>
                    <button
                      onClick={() => handlePlayAudio(example.word || example.japanese)}
                      className="text-indigo-500 hover:text-indigo-600"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  {example.reading && (
                    <div className="text-sm text-gray-600 mb-1">
                      読み: {example.reading}
                    </div>
                  )}
                  {example.meaning && (
                    <div className="text-sm text-gray-700">
                      Nghĩa: {example.meaning}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanjiDetailPage;