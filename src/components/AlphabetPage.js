import React, { useState } from 'react';
import { Volume2, Play, RotateCcw, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { hiraganaData, katakanaData, strokeDatabase, playTextToSpeech } from '../utils/japaneseData';
import CustomStrokeAnimation from './CustomStrokeAnimation';

const CharacterCard = ({ char, onClick, hasAnimation }) => (
  <div
    onClick={() => onClick(char)}
    className="group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-100 hover:border-blue-300 overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
    <div className="relative p-6 text-center">
      <div className="text-5xl font-bold text-slate-700 mb-3 group-hover:text-blue-600 transition-colors duration-300">
        {char.char}
      </div>
      <div className="text-sm font-medium text-gray-600 mb-1">
        {char.romaji}
      </div>
      <div className="text-xs text-gray-400">
        {char.sound}
      </div>
      
      {hasAnimation && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center space-x-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            <Sparkles className="w-3 h-3" />
            <span>Animation</span>
          </div>
        </div>
      )}
    </div>
    
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
  </div>
);

const CharacterModal = ({ char, isOpen, onClose }) => {
  const [currentStroke, setCurrentStroke] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  const strokeData = strokeDatabase[char?.char];
  const maxStrokes = strokeData?.strokes?.length || char?.strokes?.length || 0;

  const resetStates = () => {
    setCurrentStroke(0);
    setIsPlaying(false);
    setAutoPlay(false);
  };

  const nextStroke = () => {
    if (currentStroke < maxStrokes - 1) {
      setCurrentStroke(currentStroke + 1);
      setIsPlaying(false);
    }
  };

  const prevStroke = () => {
    if (currentStroke > 0) {
      setCurrentStroke(currentStroke - 1);
      setIsPlaying(false);
    }
  };

  const playStroke = () => setIsPlaying(true);

  const playAllStrokes = () => {
    setCurrentStroke(0);
    setAutoPlay(true);
    setIsPlaying(true);
  };

  const onStrokeComplete = () => {
    setIsPlaying(false);
    if (autoPlay && currentStroke < maxStrokes - 1) {
      setTimeout(() => {
        setCurrentStroke(prev => prev + 1);
        setIsPlaying(true);
      }, 500);
    } else {
      setAutoPlay(false);
    }
  };

  if (!isOpen || !char) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="text-center">
            <div className="text-7xl font-bold mb-4">{char.char}</div>
            <div className="text-2xl font-semibold mb-2">{char.romaji}</div>
            <div className="text-lg opacity-90">Phát âm: {char.sound}</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 p-8">
          {/* Left Side - Character Info */}
          <div className="space-y-6">
            <div className="text-center">
              <button
                onClick={() => playTextToSpeech(char.char)}
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Volume2 size={24} />
                <span className="text-lg font-medium">Nghe phát âm</span>
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h4 className="font-bold text-blue-800 mb-4 text-lg flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                Hướng dẫn viết
              </h4>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="text-sm text-blue-600 font-medium mb-2">
                  Nét {currentStroke + 1} / {maxStrokes}
                </div>
                <div className="text-gray-800">
                  {char.strokes[currentStroke] || 'Xem animation bên phải'}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <h4 className="font-bold text-green-800 mb-4 text-lg">🎨 Stroke Animation</h4>
              <div className="text-sm text-green-700">
                {strokeData ? (
                  <div className="space-y-2">
                    <p className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Có stroke animation chính xác
                    </p>
                    <p className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {strokeData.strokes.length} nét với SVG paths
                    </p>
                  </div>
                ) : (
                  <p className="flex items-center text-orange-600">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    Đang phát triển animation cho ký tự này
                  </p>
                )}
              </div>
            </div>

            {/* All strokes list */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 max-h-64 overflow-y-auto">
              <h4 className="font-bold mb-4 text-gray-800">Tất cả các nét:</h4>
              <ol className="space-y-3">
                {char.strokes.map((stroke, index) => (
                  <li 
                    key={index}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 text-sm ${
                      index === currentStroke 
                        ? 'bg-blue-100 border-l-4 border-blue-500 shadow-sm' 
                        : 'hover:bg-gray-50 border-l-4 border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setCurrentStroke(index);
                      setIsPlaying(false);
                      setAutoPlay(false);
                    }}
                  >
                    <span className="font-medium text-blue-600">{index + 1}.</span> {stroke}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Right Side - Animation */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Animation cách viết</h3>
              <p className="text-gray-600">Xem và học cách viết chính xác từng nét</p>
            </div>
            
            <CustomStrokeAnimation
              character={char.char}
              currentStroke={currentStroke}
              isPlaying={isPlaying}
              onComplete={onStrokeComplete}
            />

            {/* Animation Controls */}
            <div className="flex items-center justify-center space-x-2 flex-wrap gap-2">
              <button
                onClick={prevStroke}
                disabled={currentStroke === 0}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  currentStroke === 0 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
                }`}
              >
                <ChevronLeft size={16} />
                <span>Trước</span>
              </button>
              
              <button
                onClick={playStroke}
                disabled={isPlaying || !strokeData}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  isPlaying || !strokeData
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg'
                }`}
              >
                <Play size={16} />
                <span>Vẽ nét</span>
              </button>
              
              <button
                onClick={playAllStrokes}
                disabled={isPlaying || !strokeData}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  isPlaying || !strokeData
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-500 text-white hover:bg-purple-600 hover:shadow-lg'
                }`}
              >
                <Play size={16} />
                <span>Tất cả</span>
              </button>
              
              <button
                onClick={resetStates}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all duration-200 hover:shadow-lg font-medium"
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>
              
              <button
                onClick={nextStroke}
                disabled={currentStroke >= maxStrokes - 1}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  currentStroke >= maxStrokes - 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
                }`}
              >
                <span>Sau</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tiến độ</span>
                <span>{Math.round(((currentStroke + 1) / maxStrokes) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((currentStroke + 1) / maxStrokes) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Status */}
            <div className="text-center">
              {isPlaying && (
                <div className="flex items-center justify-center space-x-2 text-red-500 font-medium">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span>Đang vẽ nét {currentStroke + 1}...</span>
                </div>
              )}
              {autoPlay && !isPlaying && currentStroke < maxStrokes - 1 && (
                <div className="flex items-center justify-center space-x-2 text-purple-500 font-medium">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  <span>Chuẩn bị nét tiếp theo...</span>
                </div>
              )}
              {currentStroke >= maxStrokes - 1 && !isPlaying && (
                <div className="flex items-center justify-center space-x-2 text-green-500 font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Hoàn thành!</span>
                </div>
              )}
              {!strokeData && (
                <div className="flex items-center justify-center space-x-2 text-orange-500 font-medium">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <span>Animation đang phát triển</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex space-x-4 p-8 bg-gray-50 rounded-b-3xl">
          <button
            onClick={() => playTextToSpeech(char.char)}
            className="flex-1 flex items-center justify-center space-x-2 bg-green-500 text-white px-6 py-4 rounded-xl hover:bg-green-600 transition-colors font-medium"
          >
            <Volume2 size={20} />
            <span>Phát âm</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 text-white px-6 py-4 rounded-xl hover:bg-gray-600 transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

const AlphabetPage = () => {
  const [currentType, setCurrentType] = useState('hiragana');
  const [selectedChar, setSelectedChar] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const currentData = currentType === 'hiragana' ? hiraganaData : katakanaData;

  const openCharDetail = (char) => {
    setSelectedChar(char);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedChar(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Học bảng chữ cái Nhật
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Khám phá và học cách viết Hiragana & Katakana với animation tương tác
          </p>
        </div>
        
        {/* Toggle Buttons */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
            <button
              onClick={() => setCurrentType('hiragana')}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                currentType === 'hiragana' 
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg transform scale-105' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              ひらがな (Hiragana)
            </button>
            <button
              onClick={() => setCurrentType('katakana')}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                currentType === 'katakana' 
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg transform scale-105' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              カタカナ (Katakana)
            </button>
          </div>
        </div>

        {/* Character Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4 mb-12">
          {currentData.map((char, index) => (
            <CharacterCard
              key={index}
              char={char}
              onClick={openCharDetail}
              hasAnimation={strokeDatabase[char.char]}
            />
          ))}
        </div>

        {/* Info Section */}
        <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Cách sử dụng
            </h3>
            <p className="text-gray-600 mb-4">
              Click vào từng ký tự để xem animation cách viết chính xác theo thứ tự nét chuẩn của tiếng Nhật
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-green-500" />
                <span>= Có animation</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span>= Đang phát triển</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        <CharacterModal
          char={selectedChar}
          isOpen={showModal}
          onClose={closeModal}
        />
      </div>
    </div>
  );
};

export default AlphabetPage;