import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Trophy, BarChart3, CheckCircle, 
  Circle, Lock, Star, Target, Award,
  AlertTriangle, TrendingUp, Zap, Clock,
  Play, BookOpen, Activity, Unlock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import QuizGameScreen from './QuizGameScreen';
import QuizResultScreen from './QuizResultScreen';
import QuizStatisticsScreen from './QuizStatisticsScreen';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

// N4 Quiz Selection Component
const N4QuizSelectionScreen = ({ onSelectQuiz, onViewStats, onBack, availableQuizzes, stats, loading, n5Stats }) => {
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách quiz N4...</p>
        </div>
      </div>
    );
  }

  // Check if N4 is unlocked
  const isN4Unlocked = n5Stats && n5Stats.total_completed >= 5 && n5Stats.average_score >= 80;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button - Top Left */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 bg-white text-gray-700 px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
        </div>

        {/* Unlock Status */}
        {isN4Unlocked ? (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Unlock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-800">🎉 N4 UNLOCKED!</h3>
                <p className="text-green-700">
                  Requirements met: N5 Average {n5Stats.average_score.toFixed(1)}% (Required: 70%), 
                  Completed {n5Stats.total_completed}/10 (Required: 3/10)
                </p>
                <p className="text-green-600 text-sm mt-1">Ready for intermediate vocabulary challenge!</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Lock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-yellow-800">🔒 N4 LOCKED</h3>
                <p className="text-yellow-700">
                  Complete N5 requirements: Average ≥80% and Complete ≥5 quizzes
                </p>
                <p className="text-yellow-600 text-sm mt-1">
                  Current N5: {n5Stats?.average_score?.toFixed(1) || 0}% average, {n5Stats?.total_completed || 0}/10 completed
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-6">
            <Target className="w-4 h-4" />
            <span>N4 Vocabulary Challenge</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🍊 Từ vựng N4
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Intermediate vocabulary challenge. Harder words, complex meanings. Test your growing Japanese skills!
          </p>
        </div>

        {/* Difficulty Warning */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200 mb-8">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-orange-600 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-orange-800 mb-2">⚠️ Difficulty Increase</h3>
              <p className="text-orange-700 mb-3">
                N4 vocabulary is significantly harder than N5. Expect:
              </p>
              <ul className="space-y-1 text-orange-700 text-sm">
                <li>• More complex kanji combinations</li>
                <li>• Abstract concepts and feelings</li>
                <li>• Business and formal expressions</li>
                <li>• Multiple meanings per word</li>
              </ul>
              <div className="flex items-center space-x-1 mt-3">
                {[...Array(4)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-orange-500 fill-current" />
                ))}
                <Star className="w-4 h-4 text-gray-300" />
                <span className="text-xs ml-2 text-orange-600">Difficulty: 4/5 (Intermediate)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        {stats && isN4Unlocked && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đã hoàn thành</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_completed}/10</p>
                </div>
                <BookOpen className="w-10 h-10 text-orange-500" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Điểm trung bình</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.average_score.toFixed(1)}%</p>
                </div>
                <BarChart3 className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Điểm cao nhất</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.best_score.toFixed(1)}%</p>
                </div>
                <Trophy className="w-10 h-10 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Xu hướng</p>
                  <p className={`text-xl font-bold ${
                    stats.improvement_trend === 'improving' ? 'text-green-600' : 
                    stats.improvement_trend === 'declining' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stats.improvement_trend === 'improving' ? '📈 Tăng' : 
                     stats.improvement_trend === 'declining' ? '📉 Giảm' : '➡️ Ổn định'}
                  </p>
                </div>
                <TrendingUp className={`w-10 h-10 ${
                  stats.improvement_trend === 'improving' ? 'text-green-500' : 
                  stats.improvement_trend === 'declining' ? 'text-red-500' : 'text-gray-500'
                }`} />
              </div>
            </div>
          </div>
        )}

        {/* Quiz Grid */}
        {isN4Unlocked ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
            {availableQuizzes.map((quiz) => {
              const isCompleted = quiz.is_completed;
              const score = quiz.score;
              
              return (
                <div
                  key={quiz.quiz_number}
                  className={`relative bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 ${
                    isCompleted 
                      ? score >= 80 ? 'border-green-200 bg-green-50' : 
                        score >= 60 ? 'border-orange-200 bg-orange-50' : 'border-red-200 bg-red-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                  onClick={() => onSelectQuiz(quiz.quiz_number)}
                >
                  {/* Quiz Number */}
                  <div className="text-center mb-4">
                    <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl font-bold ${
                      isCompleted 
                        ? score >= 80 ? 'bg-green-500 text-white' : 
                          score >= 60 ? 'bg-orange-500 text-white' : 'bg-red-500 text-white'
                        : 'bg-orange-100 text-orange-600'
                    }`}>
                      {quiz.quiz_number}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="text-center">
                    {isCompleted ? (
                      <>
                        <div className="flex items-center justify-center space-x-1 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-green-600">Hoàn thành</span>
                        </div>
                        <div className={`text-lg font-bold ${
                          score >= 80 ? 'text-green-600' : 
                          score >= 60 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {score.toFixed(1)}%
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-center space-x-1 mb-2">
                          <Circle className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">Chưa làm</span>
                        </div>
                        <div className="text-lg font-bold text-gray-600">Quiz {quiz.quiz_number}</div>
                      </>
                    )}
                  </div>

                  {/* Play Button */}
                  <div className="mt-4 text-center">
                    <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                      isCompleted 
                        ? 'bg-gray-200 text-gray-600' 
                        : 'bg-orange-100 text-orange-600'
                    }`}>
                      <Play className="w-3 h-3" />
                      <span>{isCompleted ? 'Làm lại' : 'Bắt đầu'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">N4 Quiz Locked</h3>
            <p className="text-gray-600 mb-6">
              Complete N5 requirements to unlock N4 vocabulary challenges
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-center space-x-2">
                <Circle className={`w-4 h-4 ${n5Stats?.total_completed >= 3 ? 'text-green-500' : 'text-gray-400'}`} />
                <span>Complete 3+ N5 quizzes ({n5Stats?.total_completed || 0}/3)</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Circle className={`w-4 h-4 ${n5Stats?.average_score >= 70 ? 'text-green-500' : 'text-gray-400'}`} />
                <span>Achieve 70%+ N5 average ({n5Stats?.average_score?.toFixed(1) || 0}%/70%)</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {isN4Unlocked && (
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={onViewStats}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-8 py-4 rounded-2xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Xem thống kê N4</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Main N4 Page Component
const VocabularyN4Page = ({ onBack }) => {
  const { user, getAuthToken } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('selection'); // 'selection', 'quiz', 'result', 'stats'
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [stats, setStats] = useState(null);
  const [n5Stats, setN5Stats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuizNumber, setSelectedQuizNumber] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [isRetakeMode, setIsRetakeMode] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadAvailableQuizzes(),
        loadStats(),
        loadN5Stats()
      ]);
    } catch (error) {
      console.error('Error loading N4 data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableQuizzes = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/quiz/available/N4`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setAvailableQuizzes(data.quizzes);
      }
    } catch (error) {
      console.error('Error loading N4 quizzes:', error);
      // Create mock data for N4 since it might not exist yet
      setAvailableQuizzes(Array.from({ length: 10 }, (_, i) => ({
        quiz_number: i + 1,
        is_completed: false,
        score: null,
        completed_at: null
      })));
    }
  };

  const loadStats = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/quiz/stats/N4`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      } else {
        // Set default stats for N4
        setStats({
          total_completed: 0,
          average_score: 0,
          best_score: 0,
          improvement_trend: 'stable'
        });
      }
    } catch (error) {
      console.error('Error loading N4 stats:', error);
      setStats({
        total_completed: 0,
        average_score: 0,
        best_score: 0,
        improvement_trend: 'stable'
      });
    }
  };

  const loadN5Stats = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/quiz/stats/N5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setN5Stats(data.stats);
      }
    } catch (error) {
      console.error('Error loading N5 stats:', error);
    }
  };

  const handleSelectQuiz = (quizNumber) => {
    setSelectedQuizNumber(quizNumber);
    
    // Check if this quiz is already completed - if so, it's a retake
    const completedQuiz = availableQuizzes.find(q => q.quiz_number === quizNumber && q.is_completed);
    const isRetake = !!completedQuiz;
    
    setIsRetakeMode(isRetake);
    setCurrentScreen('quiz');
  };

  const handleViewStats = () => {
    setCurrentScreen('stats');
  };

  const handleBackToSelection = () => {
    setCurrentScreen('selection');
    setSelectedQuizNumber(null);
    setQuizResult(null);
    loadData();
  };

  const handleQuizComplete = (result) => {
    setQuizResult(result);
    setCurrentScreen('result');
  };

  const handleRetakeQuiz = () => {
    setQuizResult(null);
    setIsRetakeMode(true);
    setCurrentScreen('quiz');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cần đăng nhập</h2>
          <p className="text-gray-600">Vui lòng đăng nhập để sử dụng chức năng quiz</p>
        </div>
      </div>
    );
  }

  // Render different screens based on current state
  switch (currentScreen) {
    case 'selection':
      return (
        <>
          <div className="fixed top-4 left-4 z-10">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
          
          <N4QuizSelectionScreen
            onSelectQuiz={handleSelectQuiz}
            onViewStats={handleViewStats}
            onBack={onBack}
            availableQuizzes={availableQuizzes}
            stats={stats}
            loading={loading}
            n5Stats={n5Stats}
          />
        </>
      );
    
    case 'quiz':
      return (
        <QuizGameScreen
          quizNumber={selectedQuizNumber}
          jlptLevel="N4"
          onBack={handleBackToSelection}
          onComplete={handleQuizComplete}
          isRetake={isRetakeMode}
        />
      );
    
    case 'result':
      return (
        <QuizResultScreen
          result={quizResult}
          quizNumber={selectedQuizNumber}
          jlptLevel="N4"
          onRetakeQuiz={handleRetakeQuiz}
          onBackToHome={handleBackToSelection}
        />
      );
    
    case 'stats':
      return (
        <QuizStatisticsScreen 
          jlptLevel="N4"
          onBack={handleBackToSelection} 
        />
      );
    
    default:
      return null;
  }
};

export default VocabularyN4Page;