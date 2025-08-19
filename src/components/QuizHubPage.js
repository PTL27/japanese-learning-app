import React, { useState, useEffect } from 'react';
import { 
  BookOpen, PenTool, Square, Trophy, ArrowRight, 
  Lock, Star, AlertTriangle, Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import VocabularyQuizPage from './VocabularyQuizPage';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

// Category Card Component
const CategoryCard = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  difficulty, 
  available, 
  progress, 
  levels, 
  color,
  comingSoon = false,
  onClick 
}) => {
  return (
    <div
      className={`relative bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 ${
        available 
          ? `border-${color}-200 hover:border-${color}-300` 
          : 'border-gray-200 bg-gray-50'
      }`}
      onClick={available ? onClick : undefined}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${
          available ? `bg-${color}-100` : 'bg-gray-100'
        }`}>
          <Icon className={`w-8 h-8 ${
            available ? `text-${color}-600` : 'text-gray-400'
          }`} />
        </div>
        
        {comingSoon && (
          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
            Coming Soon
          </div>
        )}
        
        {!available && !comingSoon && (
          <Lock className="w-5 h-5 text-gray-400" />
        )}
      </div>

      {/* Title */}
      <h3 className={`text-xl font-bold mb-2 ${
        available ? 'text-gray-900' : 'text-gray-500'
      }`}>
        {title}
      </h3>
      
      <p className={`text-sm mb-4 ${
        available ? 'text-gray-600' : 'text-gray-400'
      }`}>
        {subtitle}
      </p>

      {/* Difficulty */}
      <div className="flex items-center space-x-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-4 h-4 ${
              i < difficulty 
                ? available ? `text-${color}-500 fill-current` : 'text-gray-300 fill-current'
                : 'text-gray-200'
            }`} 
          />
        ))}
        <span className={`text-xs ml-2 ${
          available ? 'text-gray-600' : 'text-gray-400'
        }`}>
          {difficulty === 5 ? 'Expert' : 
           difficulty === 4 ? 'Hard' : 
           difficulty === 3 ? 'Medium' : 
           difficulty === 2 ? 'Easy' : 'Beginner'}
        </span>
      </div>

      {/* Progress */}
      {available && progress && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{progress.completed}/{progress.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${(progress.completed / progress.total) * 100}%`,
                backgroundColor: color === 'blue' ? '#3b82f6' : 
                               color === 'green' ? '#10b981' : 
                               color === 'red' ? '#ef4444' : 
                               color === 'yellow' ? '#f59e0b' : '#6b7280'
              }}
            />
          </div>
        </div>
      )}

      {/* Levels */}
      <div className="space-y-2 mb-4">
        {levels.map((level, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className={available ? 'text-gray-600' : 'text-gray-400'}>
              {level.name}: {level.completed}/{level.total}
            </span>
            {level.average > 0 && (
              <span className={`font-medium ${
                level.average >= 80 ? 'text-green-600' : 
                level.average >= 60 ? `text-${color}-600` : 'text-orange-600'
              }`}>
                {level.average.toFixed(0)}%
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Action Button */}
      <div className="pt-2">
        {comingSoon ? (
          <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-500 px-4 py-3 rounded-xl cursor-not-allowed">
            <Bell className="w-4 h-4" />
            <span>Notify Me</span>
          </button>
        ) : available ? (
          <button className={`w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-${color}-500 to-${color}-600 text-white px-4 py-3 rounded-xl hover:from-${color}-600 hover:to-${color}-700 transition-all duration-200`}>
            <span>Enter</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button className="w-full flex items-center justify-center space-x-2 bg-gray-200 text-gray-500 px-4 py-3 rounded-xl cursor-not-allowed">
            <Lock className="w-4 h-4" />
            <span>Locked</span>
          </button>
        )}
      </div>
    </div>
  );
};

// Main Quiz Hub Component
const QuizHubPage = () => {
  const { user, getAuthToken } = useAuth();
  const [currentView, setCurrentView] = useState('hub'); // 'hub', 'vocabulary', 'grammar', 'kanji'
  const [overallStats, setOverallStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOverallStats();
    }
  }, [user]);

  const loadOverallStats = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      // Load N5 stats (currently only available)
      const response = await fetch(`${API_BASE_URL}/quiz/stats/N5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setOverallStats({
          vocabulary: {
            N5: data.stats,
            N4: { total_completed: 0, average_score: 0, best_score: 0 },
            N3: { total_completed: 0, average_score: 0, best_score: 0 }
          },
          grammar: {
            N5: { total_completed: 0, average_score: 0, best_score: 0 },
            N4: { total_completed: 0, average_score: 0, best_score: 0 },
            N3: { total_completed: 0, average_score: 0, best_score: 0 }
          },
          kanji: {
            N5: { total_completed: 0, average_score: 0, best_score: 0 },
            N4: { total_completed: 0, average_score: 0, best_score: 0 },
            N3: { total_completed: 0, average_score: 0, best_score: 0 }
          }
        });
      }
    } catch (error) {
      console.error('Error loading overall stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setCurrentView(category);
  };

  const handleBackToHub = () => {
    setCurrentView('hub');
    loadOverallStats(); // Refresh stats when returning
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu quiz...</p>
        </div>
      </div>
    );
  }

  // Show specific category view
  if (currentView === 'vocabulary') {
    return <VocabularyQuizPage onBack={handleBackToHub} />;
  }

  // Calculate overall progress
  const vocabularyProgress = overallStats ? {
    completed: overallStats.vocabulary.N5.total_completed + overallStats.vocabulary.N4.total_completed + overallStats.vocabulary.N3.total_completed,
    total: 30, // 10 quizzes x 3 levels
    average: overallStats.vocabulary.N5.total_completed > 0 ? overallStats.vocabulary.N5.average_score : 0
  } : { completed: 0, total: 30, average: 0 };

  const grammarProgress = { completed: 0, total: 30, average: 0 };
  const kanjiProgress = { completed: 0, total: 30, average: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-6">
            <Trophy className="w-4 h-4" />
            <span>JLPT Quiz Hub</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🎌 Master Japanese
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Master Japanese through practice tests. Choose your path: Vocabulary, Grammar, or Kanji.
          </p>
        </div>

        {/* Overall Progress */}
        {overallStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">📖 Từ vựng</p>
                  <p className="text-2xl font-bold text-gray-900">{vocabularyProgress.completed}/30</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${(vocabularyProgress.completed / vocabularyProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
                <BookOpen className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">📝 Ngữ pháp</p>
                  <p className="text-2xl font-bold text-gray-900">{grammarProgress.completed}/30</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="h-2 rounded-full bg-green-500 transition-all duration-500"
                      style={{ width: `${(grammarProgress.completed / grammarProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
                <PenTool className="w-10 h-10 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">🈂️ Kanji</p>
                  <p className="text-2xl font-bold text-gray-900">{kanjiProgress.completed}/30</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="h-2 rounded-full bg-red-500 transition-all duration-500"
                      style={{ width: `${(kanjiProgress.completed / kanjiProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
                <Square className="w-10 h-10 text-red-500" />
              </div>
            </div>
          </div>
        )}

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Vocabulary */}
          <CategoryCard
            icon={BookOpen}
            title="📖 TỪ VỰNG"
            subtitle="Master JLPT vocabulary step by step"
            difficulty={4}
            available={true}
            color="blue"
            progress={vocabularyProgress}
            levels={[
              { 
                name: 'N5', 
                completed: overallStats?.vocabulary.N5.total_completed || 0, 
                total: 10,
                average: overallStats?.vocabulary.N5.average_score || 0
              },
              { 
                name: 'N4', 
                completed: overallStats?.vocabulary.N4.total_completed || 0, 
                total: 10,
                average: overallStats?.vocabulary.N4.average_score || 0
              },
              { 
                name: 'N3', 
                completed: overallStats?.vocabulary.N3.total_completed || 0, 
                total: 10,
                average: overallStats?.vocabulary.N3.average_score || 0
              }
            ]}
            onClick={() => handleCategorySelect('vocabulary')}
          />

          {/* Grammar */}
          <CategoryCard
            icon={PenTool}
            title="📝 NGỮ PHÁP"
            subtitle="Practice grammar patterns and usage"
            difficulty={4}
            available={false}
            color="green"
            comingSoon={true}
            progress={grammarProgress}
            levels={[
              { name: 'N5', completed: 0, total: 10, average: 0 },
              { name: 'N4', completed: 0, total: 10, average: 0 },
              { name: 'N3', completed: 0, total: 10, average: 0 }
            ]}
          />

          {/* Kanji */}
          <CategoryCard
            icon={Square}
            title="🈂️ KANJI"
            subtitle="Learn kanji readings and meanings"
            difficulty={5}
            available={false}
            color="red"
            comingSoon={true}
            progress={kanjiProgress}
            levels={[
              { name: 'N5', completed: 0, total: 10, average: 0 },
              { name: 'N4', completed: 0, total: 10, average: 0 },
              { name: 'N3', completed: 0, total: 10, average: 0 }
            ]}
          />

          {/* Mixed Challenge */}
          <CategoryCard
            icon={Trophy}
            title="🏆 MIXED TEST"
            subtitle="Ultimate challenge mixing all categories"
            difficulty={5}
            available={false}
            color="yellow"
            progress={{ completed: 0, total: 5 }}
            levels={[
              { name: 'Mix', completed: 0, total: 5, average: 0 }
            ]}
          />
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">🎯 Your Progress Journey</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {vocabularyProgress.completed}
              </div>
              <div className="text-sm text-gray-600">Total Quizzes Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">
                {vocabularyProgress.average.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">
                {Math.round((vocabularyProgress.completed / vocabularyProgress.total) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Overall Progress</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizHubPage;