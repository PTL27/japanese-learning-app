import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Trophy, BarChart3, CheckCircle, 
  Circle, Lock, Star, Target, Award,
  AlertTriangle, TrendingUp, Zap, Clock, Unlock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import QuizMainPage from './QuizMainPage';
import VocabularyN4Page from './VocabularyN4Page';
import QuizGameScreen from './QuizGameScreen';
import QuizResultScreen from './QuizResultScreen';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

// Unlock Test Screen Component
const UnlockTestScreen = ({ currentLevel, onBack, onUnlockSuccess }) => {
  const { getAuthToken } = useAuth();
  const [testState, setTestState] = useState('intro'); // 'intro', 'testing', 'result'
  const [unlockQuiz, setUnlockQuiz] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const getNextLevel = (level) => {
    const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
    const currentIndex = levels.indexOf(level);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
  };

  const startUnlockTest = async () => {
    try {
      setLoading(true);
      setTestState('testing');
      
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/quiz/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jlpt_level: currentLevel,
          quiz_number: 999, // Special number for unlock test
          allow_retake: true
        })
      });

      const data = await response.json();
      if (data.success) {
        setUnlockQuiz(data.quiz);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error starting unlock test:', error);
      alert('Không thể tạo bài test. Vui lòng thử lại.');
      setTestState('intro');
    } finally {
      setLoading(false);
    }
  };

  const handleTestComplete = async (result) => {
    setTestResult(result);
    setTestState('result');
    
    // Check if passed (≥80%)
    if (result.score_percentage >= 80) {
      const nextLevel = getNextLevel(currentLevel);
      if (nextLevel) {
        onUnlockSuccess(nextLevel);
      }
    }
  };

  if (testState === 'testing' && unlockQuiz) {
    return (
      <QuizGameScreen
        quizNumber={999}
        jlptLevel={currentLevel}
        onBack={onBack}
        onComplete={handleTestComplete}
        isRetake={true}
      />
    );
  }

  if (testState === 'result' && testResult) {
    return (
      <QuizResultScreen
        result={testResult}
        quizNumber={999}
        onRetakeQuiz={() => setTestState('intro')}
        onBackToHome={onBack}
      />
    );
  }

  // Intro screen
  const nextLevel = getNextLevel(currentLevel);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 bg-white text-gray-700 px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8 text-center">
            <Unlock className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">🚀 Bài Test Thăng Cấp</h1>
            <p className="text-green-100 text-lg">
              Mở khóa {nextLevel} - Intermediate Level
            </p>
          </div>

          <div className="p-8">
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-blue-800 mb-3">📋 Yêu cầu bài test:</h3>
                <ul className="space-y-2 text-blue-700">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span>10 câu hỏi từ vựng {currentLevel} ngẫu nhiên</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span>Thời gian: 10 phút</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span>Cần đạt ≥80% để mở khóa {nextLevel}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                <h3 className="text-lg font-bold text-yellow-800 mb-3">⚠️ Lưu ý quan trọng:</h3>
                <ul className="space-y-2 text-yellow-700">
                  <li>• Đây là bài test chính thức để mở khóa level tiếp theo</li>
                  <li>• Bạn có thể làm lại nếu không đạt yêu cầu</li>
                  <li>• Hãy chuẩn bị kỹ lưỡng trước khi bắt đầu</li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={startUnlockTest}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Đang tạo bài test...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Target className="w-5 h-5 mr-2" />
                      Bắt đầu Test Thăng Cấp
                    </span>
                  )}
                </button>
                
                <button
                  onClick={onBack}
                  className="px-8 py-4 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-colors font-medium"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Level Tab Component
const LevelTab = ({ level, isActive, isLocked, stats, onClick }) => {
  const getColor = () => {
    switch(level) {
      case 'N5': return 'blue';
      case 'N4': return 'orange'; 
      case 'N3': return 'purple';
      case 'N2': return 'green';
      case 'N1': return 'red';
      default: return 'gray';
    }
  };

  const color = getColor();

  return (
    <button
      onClick={!isLocked ? onClick : undefined}
      className={`relative px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
        isLocked 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
        isActive 
          ? `bg-${color}-500 text-white shadow-lg` 
          : `bg-white text-${color}-600 hover:bg-${color}-50 border border-${color}-200`
      }`}
      disabled={isLocked}
    >
      <div className="flex items-center space-x-2">
        {isLocked && <Lock className="w-4 h-4" />}
        <span className="font-bold">{level}</span>
      </div>
      
      {stats && !isLocked && stats.completed > 0 && (
        <div className="mt-1 text-xs">
          <div>{stats.completed}/10</div>
          {stats.average > 0 && (
            <div className={isActive ? 'text-white/80' : `text-${color}-500`}>
              {stats.average.toFixed(0)}%
            </div>
          )}
        </div>
      )}
      
      {isLocked && (
        <div className="mt-1 text-xs text-gray-400">Locked</div>
      )}
    </button>
  );
};

// Progress Card Component  
const ProgressCard = ({ title, value, subtitle, icon: Icon, color, trend }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
      
      {trend && (
        <div className="mt-3 flex items-center space-x-1">
          <TrendingUp className={`w-4 h-4 ${
            trend === 'improving' ? 'text-green-500' : 
            trend === 'declining' ? 'text-red-500' : 'text-gray-500'
          }`} />
          <span className={`text-xs ${
            trend === 'improving' ? 'text-green-600' : 
            trend === 'declining' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend === 'improving' ? 'Đang cải thiện' : 
             trend === 'declining' ? 'Cần cố gắng hơn' : 'Ổn định'}
          </span>
        </div>
      )}
    </div>
  );
};

// Recommendation Card Component
const RecommendationCard = ({ currentLevel, stats, canTakeUnlockTest, onTakeUnlockTest }) => {
  const getRecommendation = () => {
    if (currentLevel === 'N5') {
      if (stats.total_completed === 0) {
        return {
          title: "🎯 Bắt đầu hành trình",
          description: "Hãy bắt đầu với Quiz 1 để làm quen với định dạng câu hỏi",
          action: "Bắt đầu Quiz 1",
          color: "blue",
          showUnlockTest: false
        };
      } else if (stats.total_completed < 5) {
        return {
          title: "⭐ Tiếp tục N5",
          description: `Bạn đã hoàn thành ${stats.total_completed}/10 quiz. Cần ít nhất 5 quiz để mở khóa N4!`,
          action: `Làm Quiz ${stats.total_completed + 1}`,
          color: "blue",
          showUnlockTest: false
        };
      } else if (canTakeUnlockTest) {
        return {
          title: "🚀 Sẵn sàng thăng cấp!",
          description: "Bạn đã đạt yêu cầu! Làm bài test thăng cấp để mở khóa N4.",
          action: "Bài Test Thăng Cấp N4",
          color: "green",
          showUnlockTest: true
        };
      } else if (stats.average_score < 80) {
        return {
          title: "📚 Cải thiện điểm số",
          description: `Điểm TB hiện tại: ${stats.average_score.toFixed(1)}%. Cần ≥80% để mở khóa N4.`,
          action: "Ôn tập N5",
          color: "yellow",
          showUnlockTest: false
        };
      } else {
        return {
          title: "📈 Tiếp tục luyện tập",
          description: "Hãy làm thêm quiz để nâng cao kỹ năng!",
          action: "Tiếp tục N5",
          color: "blue",
          showUnlockTest: false
        };
      }
    } else if (currentLevel === 'N4') {
      return {
        title: "🎯 Thử thách N4",
        description: "Từ vựng N4 khó hơn N5. Hãy chuẩn bị tinh thần!",
        action: "Bắt đầu N4",
        color: "orange",
        showUnlockTest: false
      };
    }
    
    return {
      title: "🔒 Cần mở khóa",
      description: "Hoàn thành các level trước để mở khóa level này",
      action: "Quay lại N5",
      color: "gray",
      showUnlockTest: false
    };
  };

  const rec = getRecommendation();

  return (
    <div className={`bg-gradient-to-r from-${rec.color}-50 to-${rec.color}-100 rounded-xl p-6 border border-${rec.color}-200`}>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{rec.title}</h3>
      <p className="text-gray-700 mb-4">{rec.description}</p>
      <button
        onClick={rec.showUnlockTest ? onTakeUnlockTest : undefined}
        className={`inline-flex items-center space-x-2 bg-${rec.color}-500 text-white px-4 py-2 rounded-lg text-sm font-medium ${
          rec.showUnlockTest ? 'hover:bg-' + rec.color + '-600 transition-colors cursor-pointer' : ''
        }`}
      >
        <Target className="w-4 h-4" />
        <span>{rec.action}</span>
      </button>
    </div>
  );
};

// Main Vocabulary Quiz Page Component
const VocabularyQuizPage = ({ onBack }) => {
  const { user, getAuthToken } = useAuth();
  const [currentLevel, setCurrentLevel] = useState('N5');
  const [currentView, setCurrentView] = useState('overview'); // 'overview', 'n5-quiz', 'n4-quiz', 'unlock-test'
  const [allStats, setAllStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [unlockedLevels, setUnlockedLevels] = useState(['N5']); // Track which levels are actually unlocked

  useEffect(() => {
    if (user) {
      loadAllLevelStats();
    }
  }, [user]);

  const loadAllLevelStats = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      // Load N5 stats (currently only available)
      const n5Response = await fetch(`${API_BASE_URL}/quiz/stats/N5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const n5Data = await n5Response.json();
      
      setAllStats({
        N5: n5Data.success ? n5Data.stats : { total_completed: 0, average_score: 0, best_score: 0, improvement_trend: 'stable' },
        N4: { total_completed: 0, average_score: 0, best_score: 0, improvement_trend: 'stable' },
        N3: { total_completed: 0, average_score: 0, best_score: 0, improvement_trend: 'stable' }
      });
    } catch (error) {
      console.error('Error loading level stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const isLevelLocked = (level) => {
    // Check if level is in unlocked levels list
    return !unlockedLevels.includes(level);
  };

  // Check if user can take unlock test for next level
  const canTakeUnlockTest = (currentLevel) => {
    const stats = allStats[currentLevel];
    return stats && stats.total_completed >= 5 && stats.average_score >= 80;
  };

  const handleLevelSelect = (level) => {
    if (!isLevelLocked(level)) {
      setCurrentLevel(level);
    }
  };

  const handleStartQuiz = () => {
    if (currentLevel === 'N5') {
      setCurrentView('n5-quiz');
    } else if (currentLevel === 'N4') {
      setCurrentView('n4-quiz');
    }
  };

  const handleBackToOverview = () => {
    setCurrentView('overview');
    loadAllLevelStats(); // Refresh stats
  };

  const handleTakeUnlockTest = () => {
    setCurrentView('unlock-test');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cần đăng nhập</h2>
          <p className="text-gray-600">Vui lòng đăng nhập để sử dụng chức năng quiz</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu từ vựng...</p>
        </div>
      </div>
    );
  }

  // Show specific quiz level
  if (currentView === 'n5-quiz') {
    return <QuizMainPage onBack={handleBackToOverview} />;
  }
  
  if (currentView === 'n4-quiz') {
    return <VocabularyN4Page onBack={handleBackToOverview} />;
  }

  // Show unlock test
  if (currentView === 'unlock-test') {
    return (
      <UnlockTestScreen 
        currentLevel={currentLevel}
        onBack={handleBackToOverview}
        onUnlockSuccess={(newLevel) => {
          setUnlockedLevels(prev => [...prev, newLevel]);
          handleBackToOverview();
        }}
      />
    );
  }

  const currentStats = allStats[currentLevel] || { total_completed: 0, average_score: 0, best_score: 0, improvement_trend: 'stable' };

  console.log('🔍 VocabularyQuizPage render state:', { currentView, currentLevel, loading });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                📖 TỪ VỰNG QUIZ
              </h1>
              <p className="text-gray-600 mt-1">Master JLPT vocabulary step by step</p>
            </div>
          </div>
        </div>

        {/* Level Navigation */}
        <div className="flex flex-wrap gap-4 mb-8">
          {['N5', 'N4', 'N3', 'N2', 'N1'].map((level) => {
            const levelStats = allStats[level];
            const formattedStats = levelStats ? {
              completed: levelStats.total_completed,
              average: levelStats.average_score
            } : null;
            
            return (
              <LevelTab
                key={level}
                level={level}
                isActive={currentLevel === level}
                isLocked={isLevelLocked(level)}
                stats={formattedStats}
                onClick={() => handleLevelSelect(level)}
              />
            );
          })}
        </div>

        {/* Current Level Info */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Current Level: {currentLevel} 
                <span className="ml-2 text-lg text-gray-600">
                  ({currentLevel === 'N5' ? 'Beginner' : 
                    currentLevel === 'N4' ? 'Intermediate' : 
                    currentLevel === 'N3' ? 'Advanced' : 'Expert'})
                </span>
              </h2>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span>🎖️ Progress: {currentStats.total_completed}/10 completed</span>
                <span>📊 Average: {currentStats.average_score.toFixed(1)}%</span>
                <span>🏆 Best: {currentStats.best_score.toFixed(1)}%</span>
              </div>
            </div>
            
            {!isLevelLocked(currentLevel) && (
              <button
                onClick={handleStartQuiz}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium"
              >
                <Zap className="w-5 h-5" />
                <span>Start Quiz</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <ProgressCard
            title="Đã hoàn thành"
            value={`${currentStats.total_completed}/10`}
            subtitle="quizzes"
            icon={CheckCircle}
            color="green"
          />
          
          <ProgressCard
            title="Điểm trung bình"
            value={`${currentStats.average_score.toFixed(1)}%`}
            subtitle="overall score"
            icon={BarChart3}
            color="blue"
            trend={currentStats.improvement_trend}
          />
          
          <ProgressCard
            title="Điểm cao nhất"
            value={`${currentStats.best_score.toFixed(1)}%`}
            subtitle="personal best"
            icon={Trophy}
            color="yellow"
          />
          
          <ProgressCard
            title="Cần đạt"
            value="80%"
            subtitle="to unlock next level"
            icon={Target}
            color="purple"
          />
        </div>

        {/* Recommendation */}
        <div className="mb-8">
          <RecommendationCard 
            currentLevel={currentLevel} 
            stats={currentStats} 
            canTakeUnlockTest={canTakeUnlockTest(currentLevel)}
            onTakeUnlockTest={handleTakeUnlockTest}
          />
        </div>

        {/* Level Requirements */}
        {isLevelLocked(currentLevel) && (
          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200 mb-8">
            <div className="flex items-start space-x-3">
              <Lock className="w-6 h-6 text-yellow-600 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-yellow-800 mb-2">🔒 Level Locked</h3>
                <p className="text-yellow-700 mb-4">
                  To unlock {currentLevel}, you need to meet these requirements:
                </p>
                <ul className="space-y-2 text-yellow-700">
                  <li className="flex items-center space-x-2">
                    <Circle className="w-4 h-4" />
                    <span>Complete at least 5 quizzes in the previous level</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Circle className="w-4 h-4" />
                    <span>Achieve 80% average score in the previous level</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">🚀 Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={handleStartQuiz}
              disabled={isLevelLocked(currentLevel)}
              className={`flex items-center justify-center space-x-2 p-4 rounded-xl transition-all duration-200 ${
                isLevelLocked(currentLevel)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              <Zap className="w-5 h-5" />
              <span>Start Quiz</span>
            </button>
            
            <button className="flex items-center justify-center space-x-2 bg-green-50 text-green-600 p-4 rounded-xl hover:bg-green-100 transition-all duration-200">
              <BarChart3 className="w-5 h-5" />
              <span>View Stats</span>
            </button>
            
            <button className="flex items-center justify-center space-x-2 bg-purple-50 text-purple-600 p-4 rounded-xl hover:bg-purple-100 transition-all duration-200">
              <Award className="w-5 h-5" />
              <span>Achievements</span>
            </button>
            
            <button className="flex items-center justify-center space-x-2 bg-orange-50 text-orange-600 p-4 rounded-xl hover:bg-orange-100 transition-all duration-200">
              <Clock className="w-5 h-5" />
              <span>Daily Challenge</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabularyQuizPage;