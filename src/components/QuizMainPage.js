import React, { useState, useEffect } from 'react';
import { 
  Play, Trophy, BarChart3, CheckCircle, 
  Circle, AlertTriangle, TrendingUp, Target,
  BookOpen, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import QuizGameScreen from './QuizGameScreen';
import QuizResultScreen from './QuizResultScreen';
import QuizStatisticsScreen from './QuizStatisticsScreen';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

// Quiz Selection Component - Shows 10 available quizzes
const QuizSelectionScreen = ({ onSelectQuiz, onViewStats, availableQuizzes, stats, loading, onBack }) => {
  // Removed unused selectedLevel state

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          {/* Back Button */}
          {onBack && (
            <div className="flex items-center mb-8">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
            </div>
          )}
          
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-6">
              <Target className="w-4 h-4" />
              <span>Quiz Challenge</span>
            </div>
          
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Test từ vựng JLPT
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Thử thách kiến thức từ vựng của bạn với 10 bài test N5. Mỗi bài có 10 câu hỏi trong 10 phút.
            </p>
          </div>
        </div>

        {/* Statistics Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đã hoàn thành</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_completed}/10</p>
                </div>
                <BookOpen className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Điểm trung bình</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.average_score.toFixed(1)}%</p>
                </div>
                <BarChart3 className="w-10 h-10 text-green-500" />
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
                  <p className={`text-2xl font-bold ${
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
                      score >= 60 ? 'border-blue-200 bg-blue-50' : 'border-orange-200 bg-orange-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => onSelectQuiz(quiz.quiz_number)}
              >
                {/* Quiz Number */}
                <div className="text-center mb-4">
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl font-bold ${
                    isCompleted 
                      ? score >= 80 ? 'bg-green-500 text-white' : 
                        score >= 60 ? 'bg-blue-500 text-white' : 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600'
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
                        score >= 60 ? 'text-blue-600' : 'text-orange-600'
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
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    <Play className="w-3 h-3" />
                    <span>{isCompleted ? 'Làm lại' : 'Bắt đầu'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <button
            onClick={onViewStats}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-8 py-4 rounded-2xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Xem thống kê chi tiết</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Quiz Component
const QuizMainPage = ({ onBack }) => {
  const { user, getAuthToken } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('selection'); // 'selection', 'quiz', 'result', 'stats'
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuizNumber, setSelectedQuizNumber] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [isRetakeMode, setIsRetakeMode] = useState(false);

  // Debug effect to track isRetakeMode changes
  useEffect(() => {
    console.log('🔍 isRetakeMode state changed to:', isRetakeMode);
  }, [isRetakeMode]);

  useEffect(() => {
    if (user) {
      loadAvailableQuizzes();
      loadStats();
    }
  }, [user]);

  const loadAvailableQuizzes = async () => {
    try {
      const token = getAuthToken();
      console.log('🔑 Loading available quizzes with token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`${API_BASE_URL}/quiz/available/N5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Quiz API response status:', response.status);
      const data = await response.json();
      console.log('📊 Quiz API response data:', data);
      
      if (data.success) {
        setAvailableQuizzes(data.quizzes);
      } else {
        console.error('Error loading quizzes:', data.message);
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      console.log('📈 Loading stats with token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`${API_BASE_URL}/quiz/stats/N5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Stats API response status:', response.status);
      const data = await response.json();
      console.log('📊 Stats API response data:', data);
      
      if (data.success) {
        setStats(data.stats);
      } else {
        console.error('Error loading stats:', data.message);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuiz = (quizNumber) => {
    setSelectedQuizNumber(quizNumber);
    
    // Check if this quiz is already completed - if so, it's a retake
    const completedQuiz = availableQuizzes.find(q => q.quiz_number === quizNumber && q.is_completed);
    const isRetake = !!completedQuiz;
    
    console.log('🎯 Quiz selected:', { quizNumber, isCompleted: !!completedQuiz, isRetake });
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
    loadAvailableQuizzes();
    loadStats();
  };

  const handleQuizComplete = (result) => {
    setQuizResult(result);
    setCurrentScreen('result');
  };

  const handleRetakeQuiz = () => {
    console.log('🔄 Starting retake process for quiz:', selectedQuizNumber);
    console.log('🔍 Current state before retake:', { 
      currentScreen, 
      selectedQuizNumber, 
      isRetakeMode,
      quizResult: quizResult ? 'Present' : 'Null' 
    });
    
    // Set all retake states in the correct order
    setQuizResult(null);
    setIsRetakeMode(true);
    setCurrentScreen('quiz');
    
    console.log('✅ All retake states set - isRetakeMode should be true');
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

  // Render different screens based on current state
  switch (currentScreen) {
    case 'selection':
      return (
        <QuizSelectionScreen
          onSelectQuiz={handleSelectQuiz}
          onViewStats={handleViewStats}
          availableQuizzes={availableQuizzes}
          stats={stats}
          loading={loading}
          onBack={onBack}
        />
      );
    
    case 'quiz':
      return (
        <QuizGameScreen
          quizNumber={selectedQuizNumber}
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
          onRetakeQuiz={handleRetakeQuiz}
          onBackToHome={handleBackToSelection}
        />
      );
    
    case 'stats':
      return (
        <QuizStatisticsScreen onBack={handleBackToSelection} />
      );
    
    default:
      return null;
  }
};

export default QuizMainPage;