import React, { useEffect, useState, useRef } from 'react';
import { 
  Trophy, Star, CheckCircle, XCircle, Target, 
  RotateCcw, Home, BookOpen, Zap
} from 'lucide-react';
import Fireworks from 'fireworks-js';

// Enhanced Fireworks Animation Component using fireworks-js
const FireworksDisplay = ({ onComplete }) => {
  const containerRef = useRef(null);
  const fireworksRef = useRef(null);

  useEffect(() => {
    console.log('🎆 FireworksDisplay useEffect triggered', { containerExists: !!containerRef.current });
    if (containerRef.current) {
      console.log('🎆 Initializing fireworks...', { Fireworks: typeof Fireworks });
      try {
        // Initialize fireworks with enhanced settings
        fireworksRef.current = new Fireworks(containerRef.current, {
        autoresize: true,
        opacity: 0.8,
        acceleration: 1.05,
        friction: 0.97,
        gravity: 1.5,
        particles: 80,
        traceLength: 3,
        traceSpeed: 10,
        explosion: 8,
        intensity: 30,
        flickering: 50,
        lineStyle: 'round',
        hue: {
          min: 0,
          max: 360
        },
        delay: {
          min: 30,
          max: 60
        },
        rocketsPoint: {
          min: 50,
          max: 50
        },
        lineWidth: {
          explosion: {
            min: 1,
            max: 4
          },
          trace: {
            min: 1,
            max: 2
          }
        },
        brightness: {
          min: 50,
          max: 80
        },
        decay: {
          min: 0.015,
          max: 0.03
        },
        mouse: {
          click: false,
          move: false,
          max: 1
        }
      });

        // Start the fireworks
        console.log('🎆 Starting fireworks animation...');
        fireworksRef.current.start();

        // Stop after 8 seconds
        const timer = setTimeout(() => {
          if (fireworksRef.current) {
            fireworksRef.current.stop();
          }
          if (onComplete) {
            onComplete();
          }
        }, 8000);

        return () => {
          clearTimeout(timer);
          if (fireworksRef.current) {
            fireworksRef.current.stop();
          }
        };
      } catch (error) {
        console.error('🎆 Error initializing fireworks:', error);
        console.log('🎆 Falling back to CSS fireworks');
        // Could add CSS fallback here if needed
      }
    }
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ background: 'transparent' }}
    />
  );
};

// Old CSS-based Fireworks (keeping as fallback)
const OldFireworks = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      <style jsx>{`
        @keyframes firework {
          0% { 
            transform: translateY(100vh) scale(0); 
            opacity: 1; 
            box-shadow: 0 0 0 0 currentColor;
          }
          15% { 
            transform: translateY(60vh) scale(0.3); 
            opacity: 1; 
          }
          50% { 
            transform: translateY(30vh) scale(1); 
            opacity: 1; 
            box-shadow: 0 0 40px 20px currentColor;
          }
          100% { 
            transform: translateY(20vh) scale(2); 
            opacity: 0; 
            box-shadow: 0 0 80px 40px currentColor;
          }
        }
        
        @keyframes sparkle {
          0%, 100% { 
            opacity: 0; 
            transform: scale(0) rotate(0deg); 
          }
          25% { 
            opacity: 1; 
            transform: scale(1.5) rotate(90deg); 
          }
          50% { 
            opacity: 1; 
            transform: scale(2) rotate(180deg); 
          }
          75% { 
            opacity: 1; 
            transform: scale(1.5) rotate(270deg); 
          }
        }
        
        @keyframes burst {
          0% { 
            transform: scale(0); 
            opacity: 1; 
          }
          50% { 
            transform: scale(3); 
            opacity: 0.8; 
          }
          100% { 
            transform: scale(5); 
            opacity: 0; 
          }
        }
        
        .firework {
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          animation: firework 4s ease-out infinite;
          filter: brightness(2) saturate(3) drop-shadow(0 0 10px currentColor);
        }
        
        .firework:nth-child(1) { 
          left: 15%; 
          background: radial-gradient(circle, #ff0080, #ff8c00, #ffff00); 
          animation-delay: 0s; 
          color: #ff0080;
        }
        .firework:nth-child(2) { 
          left: 30%; 
          background: radial-gradient(circle, #00ff80, #0080ff, #8000ff); 
          animation-delay: 0.5s; 
          color: #00ff80;
        }
        .firework:nth-child(3) { 
          left: 45%; 
          background: radial-gradient(circle, #ff8000, #ffff00, #ff0080); 
          animation-delay: 1s; 
          color: #ff8000;
        }
        .firework:nth-child(4) { 
          left: 60%; 
          background: radial-gradient(circle, #8000ff, #ff0080, #ff8c00); 
          animation-delay: 1.5s; 
          color: #8000ff;
        }
        .firework:nth-child(5) { 
          left: 75%; 
          background: radial-gradient(circle, #00ffff, #0080ff, #00ff80); 
          animation-delay: 2s; 
          color: #00ffff;
        }
        .firework:nth-child(6) { 
          left: 90%; 
          background: radial-gradient(circle, #ff4080, #ff8040, #ffff00); 
          animation-delay: 2.5s; 
          color: #ff4080;
        }
        .firework:nth-child(7) { 
          left: 20%; 
          background: radial-gradient(circle, #80ff00, #40ff80, #00ffff); 
          animation-delay: 3s; 
          color: #80ff00;
        }
        .firework:nth-child(8) { 
          left: 35%; 
          background: radial-gradient(circle, #ff0040, #ff4000, #ff8000); 
          animation-delay: 3.5s; 
          color: #ff0040;
        }
        .firework:nth-child(9) { 
          left: 50%; 
          background: radial-gradient(circle, #ff006e, #8338ec, #3a86ff); 
          animation-delay: 4s; 
          color: #ff006e;
        }
        .firework:nth-child(10) { 
          left: 65%; 
          background: radial-gradient(circle, #06ffa5, #ffbe0b, #fb5607); 
          animation-delay: 4.5s; 
          color: #06ffa5;
        }
        .firework:nth-child(11) { 
          left: 80%; 
          background: radial-gradient(circle, #f72585, #7209b7, #560bad); 
          animation-delay: 5s; 
          color: #f72585;
        }
        .firework:nth-child(12) { 
          left: 10%; 
          background: radial-gradient(circle, #ff9500, #ff5400, #ff006e); 
          animation-delay: 5.5s; 
          color: #ff9500;
        }
        
        .sparkle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: linear-gradient(45deg, #ffff00, #ff8000, #ff0080, #8000ff, #0080ff, #00ffff);
          border-radius: 50%;
          animation: sparkle 3s ease-in-out infinite;
          filter: brightness(3) saturate(4) drop-shadow(0 0 15px currentColor);
          box-shadow: 0 0 15px currentColor, 0 0 25px currentColor;
        }
        
        .burst {
          position: absolute;
          width: 30px;
          height: 30px;
          border: 4px solid;
          border-radius: 50%;
          animation: burst 3s ease-out infinite;
          filter: drop-shadow(0 0 20px currentColor);
        }
        
        .burst:nth-child(odd) { 
          border-color: #ff0080; 
          animation-delay: 1s; 
        }
        .burst:nth-child(even) { 
          border-color: #00ff80; 
          animation-delay: 2s; 
        }
      `}</style>
      
      {/* Firework particles */}
      {[...Array(12)].map((_, i) => (
        <div key={i} className="firework" />
      ))}
      
      {/* Burst effects */}
      {[...Array(10)].map((_, i) => (
        <div 
          key={`burst-${i}`}
          className="burst"
          style={{
            left: `${10 + i * 10}%`,
            top: `${15 + Math.random() * 40}%`,
            animationDelay: `${i * 0.6}s`
          }}
        />
      ))}
      
      {/* Sparkle particles */}
      {[...Array(50)].map((_, i) => (
        <div 
          key={`sparkle-${i}`}
          className="sparkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 70}%`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}
      
      {/* Additional large sparkles for extra beauty */}
      {[...Array(15)].map((_, i) => (
        <div 
          key={`large-sparkle-${i}`}
          className="sparkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 80}%`,
            animationDelay: `${Math.random() * 6}s`,
            width: '12px',
            height: '12px',
            background: `linear-gradient(${Math.random() * 360}deg, #ff006e, #8338ec, #3a86ff, #06ffa5, #ffbe0b, #fb5607)`,
          }}
        />
      ))}
    </div>
  );
};

// Individual Question Result Component
const QuestionResult = ({ question, index }) => {
  const isCorrect = question.is_correct;
  const userAnswer = question.user_answer;
  const correctOption = question.correct_option;

  return (
    <div className={`bg-white rounded-2xl p-6 border-2 shadow-lg ${
      isCorrect ? 'border-green-200' : 'border-red-200'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm font-medium">
              Câu {index + 1}
            </span>
            {isCorrect ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
          
          <div className="text-lg font-bold text-gray-900 mb-2">
            {question.japanese} ({question.hiragana})
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Đáp án đúng:</span>
              <span className="font-medium text-green-600">{correctOption}. {question.correct_meaning}</span>
            </div>
            
            {!isCorrect && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Bạn chọn:</span>
                <span className="font-medium text-red-600">
                  {userAnswer ? `${userAnswer}. ${question.user_answer_text}` : 'Không trả lời'}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className={`text-2xl ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
          {isCorrect ? '✅' : '❌'}
        </div>
      </div>
    </div>
  );
};

// Performance Analysis Component
const PerformanceAnalysis = ({ result }) => {
  const { score_percentage, correct_answers, incorrect_answers, time_spent } = result;
  
  let performanceLevel = '';
  let performanceColor = '';
  let performanceIcon = null;
  let performanceMessage = '';
  
  if (score_percentage >= 90) {
    performanceLevel = 'Xuất sắc';
    performanceColor = 'text-blue-600 bg-blue-50 border-blue-200';
    performanceIcon = <Trophy className="w-6 h-6 text-blue-500" />;
    performanceMessage = 'Bạn có kiến thức từ vựng N5 rất xuất sắc! Hãy thử thách bản thân với N4.';
  } else if (score_percentage >= 70) {
    performanceLevel = 'Tốt';
    performanceColor = 'text-green-600 bg-green-50 border-green-200';
    performanceIcon = <Star className="w-6 h-6 text-green-500" />;
    performanceMessage = 'Bạn đã nắm vững phần lớn từ vựng N5. Ôn tập thêm một chút nữa là hoàn hảo!';
  } else if (score_percentage >= 50) {
    performanceLevel = 'Khá';
    performanceColor = 'text-blue-600 bg-blue-50 border-blue-200';
    performanceIcon = <Target className="w-6 h-6 text-blue-500" />;
    performanceMessage = 'Bạn đã có nền tảng tốt. Hãy dành thêm thời gian ôn tập từ vựng mỗi ngày.';
  } else {
    performanceLevel = 'Cần cố gắng';
    performanceColor = 'text-red-600 bg-red-50 border-red-200';
    performanceIcon = <BookOpen className="w-6 h-6 text-red-500" />;
    performanceMessage = 'Đừng nản lòng! Học từ vựng cần thời gian. Hãy bắt đầu với 5-10 từ mỗi ngày.';
  }

  const timeMinutes = Math.floor(time_spent / 60);
  const timeSeconds = time_spent % 60;

  return (
    <div className={`rounded-2xl p-6 border-2 ${performanceColor}`}>
      <div className="flex items-center space-x-3 mb-4">
        {performanceIcon}
        <h3 className="text-xl font-bold">Phân tích kết quả - {performanceLevel}</h3>
      </div>
      
      <p className="text-gray-700 mb-6">{performanceMessage}</p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{correct_answers}</div>
          <div className="text-sm text-gray-600">Câu đúng</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{incorrect_answers}</div>
          <div className="text-sm text-gray-600">Câu sai</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{score_percentage.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Độ chính xác</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {timeMinutes}:{timeSeconds.toString().padStart(2, '0')}
          </div>
          <div className="text-sm text-gray-600">Thời gian</div>
        </div>
      </div>
    </div>
  );
};

// Main Quiz Result Screen Component
const QuizResultScreen = ({ result, quizNumber, onRetakeQuiz, onBackToHome }) => {
  const { 
    score_percentage, 
    correct_answers, 
    incorrect_answers, 
    detailed_results,
    time_spent 
  } = result;

  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    // Show fireworks for excellent results (>= 90%)
    console.log('🎆 Checking fireworks condition:', { score_percentage, shouldShow: score_percentage >= 90 });
    if (score_percentage >= 90) {
      console.log('🎆 Setting showFireworks to true');
      setShowFireworks(true);
      // Hide fireworks after 8 seconds (matches fireworks duration)
      const timer = setTimeout(() => {
        console.log('🎆 Hiding fireworks after 8 seconds');
        setShowFireworks(false);
      }, 8000);
      return () => clearTimeout(timer);
    } else {
      console.log('🎆 Score too low for fireworks:', score_percentage);
    }
  }, [score_percentage]);

  // Determine overall result styling
  let resultData = {};
  if (score_percentage >= 90) {
    resultData = { 
      message: 'Xuất sắc!', 
      emoji: '🏆', 
      color: 'from-blue-400 to-cyan-500', 
      bgColor: 'from-blue-50 to-cyan-50',
      textColor: 'text-blue-600'
    };
  } else if (score_percentage >= 70) {
    resultData = { 
      message: 'Tốt lắm!', 
      emoji: '🎉', 
      color: 'from-green-400 to-emerald-500', 
      bgColor: 'from-green-50 to-emerald-50',
      textColor: 'text-green-600'
    };
  } else if (score_percentage >= 50) {
    resultData = { 
      message: 'Ổn đấy!', 
      emoji: '👍', 
      color: 'from-blue-400 to-indigo-500', 
      bgColor: 'from-blue-50 to-indigo-50',
      textColor: 'text-blue-600'
    };
  } else {
    resultData = { 
      message: 'Cần cố gắng hơn!', 
      emoji: '💪', 
      color: 'from-red-400 to-pink-500', 
      bgColor: 'from-red-50 to-pink-50',
      textColor: 'text-red-600'
    };
  }

  const timeMinutes = Math.floor(time_spent / 60);
  const timeSeconds = time_spent % 60;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${resultData.bgColor} px-4 py-8`}>
      {/* Enhanced Fireworks effect for excellent results */}
      {showFireworks && (
        <>
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50 text-sm font-bold">
            🎆 FIREWORKS ACTIVE!
          </div>
          <FireworksDisplay onComplete={() => {/* Optional callback */}} />
        </>
      )}
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center space-x-2 bg-gradient-to-r ${resultData.color} text-white px-6 py-2 rounded-full text-sm font-medium mb-6`}>
            <Trophy className="w-4 h-4" />
            <span>Kết quả Quiz N5 - Bài {quizNumber}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Hoàn thành Quiz!
          </h1>
          <p className="text-xl text-gray-600">
            Xem kết quả chi tiết và phân tích của bạn
          </p>
        </div>

        {/* Main Result Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mb-8">
          {/* Result Header */}
          <div className={`bg-gradient-to-r ${resultData.color} text-white p-8 text-center`}>
            <div className="text-8xl mb-4">{resultData.emoji}</div>
            <h2 className="text-3xl font-bold mb-2">{resultData.message}</h2>
            <p className="text-xl opacity-90">Bạn đã hoàn thành bài quiz!</p>
          </div>
          
          {/* Score Summary */}
          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center bg-gray-50 rounded-2xl p-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {correct_answers}
                </div>
                <div className="text-sm text-gray-600">Câu đúng</div>
              </div>
              
              <div className="text-center bg-gray-50 rounded-2xl p-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {incorrect_answers}
                </div>
                <div className="text-sm text-gray-600">Câu sai</div>
              </div>
              
              <div className="text-center bg-gray-50 rounded-2xl p-6">
                <div className={`text-3xl font-bold bg-gradient-to-r ${resultData.color} bg-clip-text text-transparent mb-2`}>
                  {score_percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Độ chính xác</div>
              </div>
              
              <div className="text-center bg-gray-50 rounded-2xl p-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {timeMinutes}:{timeSeconds.toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-600">Thời gian</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-8 overflow-hidden">
              <div 
                className={`bg-gradient-to-r ${resultData.color} h-4 rounded-full transition-all duration-2000 ease-out`}
                style={{ width: `${score_percentage}%` }}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => {
                  try {
                    console.log('🎯 Retake button clicked in QuizResultScreen');
                    alert('Retake button clicked! Check console for details.');
                    console.log('🔍 onRetakeQuiz function:', typeof onRetakeQuiz);
                    if (onRetakeQuiz) {
                      onRetakeQuiz();
                    } else {
                      console.error('❌ onRetakeQuiz function is not defined!');
                    }
                  } catch (error) {
                    console.error('❌ Error clicking retake button:', error);
                    console.error('❌ Error stack:', error.stack);
                  }
                }}
                className={`flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r ${resultData.color} text-white px-8 py-4 rounded-2xl hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 font-medium`}
              >
                <RotateCcw className="w-5 h-5" />
                <span>Làm lại Quiz</span>
              </button>
              
              <button
                onClick={onBackToHome}
                className="flex-1 flex items-center justify-center space-x-2 bg-gray-500 text-white px-8 py-4 rounded-2xl hover:bg-gray-600 transition-colors font-medium"
              >
                <Home className="w-5 h-5" />
                <span>Về trang chủ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Performance Analysis */}
        <div className="mb-8">
          <PerformanceAnalysis result={result} />
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <CheckCircle className="w-6 h-6 mr-2 text-blue-500" />
              Chi tiết từng câu hỏi
            </h3>
            <p className="text-gray-600 mt-1">
              Xem lại các câu trả lời để học hỏi thêm
            </p>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {detailed_results && detailed_results.map((question, index) => (
                <QuestionResult 
                  key={question.id} 
                  question={question} 
                  index={index} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-bold text-gray-900">Gợi ý học tập</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Để cải thiện điểm số:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Ôn tập 10-15 từ mỗi ngày</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Sử dụng từ trong câu để nhớ lâu hơn</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Làm quiz thường xuyên để luyện tập</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Mẹo làm bài:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Đọc kỹ câu hỏi trước khi chọn</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Loại trừ các đáp án sai trước</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  <span>Quản lý thời gian hiệu quả</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResultScreen;