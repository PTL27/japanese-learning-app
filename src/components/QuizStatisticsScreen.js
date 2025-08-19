import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Minus, Trophy, Target, 
  Calendar, Award, Star, ArrowLeft, BarChart3, Activity,
  CheckCircle, AlertTriangle, BookOpen, Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

// Function to create gradient background based on score values
const createScoreGradient = (minScore, avgScore, maxScore) => {
  // For single attempt OR when all scores are equal, always use green (like max score)
  if (minScore === maxScore && avgScore === maxScore) {
    return '#34d399';  // Green for perfect consistency
  }

  // For multiple attempts with different scores, return an object with all colors
  return {
    minColor: '#fb923c',    // Orange for min score
    avgColor: '#60a5fa',    // Blue for avg score  
    maxColor: '#34d399',    // Green for max score
    grayColor: '#d1d5db'    // Gray for unachieved area (max to 100%)
  };
};

// Quiz Performance Chart with Max/Min/Avg bars
const QuizPerformanceChart = ({ data, title, color = 'blue' }) => {
  if (!data || data.length === 0) return null;

  // Calculate overall max for scaling
  const globalMax = Math.max(...data.map(d => d.max_score || d.score || 0));
  const globalMin = Math.min(...data.map(d => d.min_score || d.score || 0));

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <BarChart3 className={`w-5 h-5 mr-2 text-${color}-500`} />
        {title}
      </h3>
      
      <div className="space-y-4">
        {data.map((quiz, index) => {
          const hasMultipleAttempts = quiz.attempt_count > 1;
          const maxScore = quiz.max_score || 0;
          const minScore = quiz.min_score || 0;
          const avgScore = quiz.avg_score || 0;
          const attemptCount = quiz.attempt_count || 1;
          
          // Get appropriate colors for this quiz
          const scoreColors = createScoreGradient(minScore, avgScore, maxScore);
          
          // Check if this is a perfect score scenario (all scores equal)
          const isPerfectScore = minScore === maxScore && avgScore === maxScore;
          
          return (
            <div key={index} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                    avgScore >= 80 ? 'bg-green-500' : 
                    avgScore >= 60 ? 'bg-blue-500' : 
                    avgScore > 0 ? 'bg-orange-500' : 'bg-gray-500'
                  }`}>
                    {quiz.quiz_number}
                  </div>
                  <span className="font-semibold text-gray-900">Quiz {quiz.quiz_number}</span>
                  <span className="text-xs text-gray-500">({attemptCount} lần)</span>
                </div>
                <div className="text-right text-sm">
                  {hasMultipleAttempts ? (
                    <div className="space-x-4">
                      <span className="text-orange-600 font-semibold">Min: {minScore.toFixed(1)}%</span>
                      <span className="text-blue-600 font-semibold">TB: {avgScore.toFixed(1)}%</span>
                      <span className="text-green-600 font-semibold">Max: {maxScore.toFixed(1)}%</span>
                    </div>
                  ) : (
                    <span className="text-green-600 font-semibold">{avgScore.toFixed(1)}%</span>
                  )}
                </div>
              </div>
              
              {/* Score visualization bars */}
              <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                {hasMultipleAttempts ? (
                  <>
                    {/* Special case: If all scores are equal (perfect scores), show only green color */}
                    {isPerfectScore ? (
                      <div 
                        className="absolute top-0 left-0 h-full rounded-full"
                        style={{ 
                          width: `${Math.max(maxScore, 0.5)}%`,
                          backgroundColor: typeof scoreColors === 'string' ? scoreColors : scoreColors.maxColor
                        }}
                      />
                    ) : (
                      <>
                        {/* Layer 1: Background - toàn bộ thanh màu xám */}
                        <div 
                          className="absolute top-0 left-0 h-full rounded-full"
                          style={{ 
                            width: '100%',
                            backgroundColor: scoreColors.grayColor
                          }}
                        />
                        
                        {/* Layer 2: Ghi đè thanh điểm min lên thanh xám */}
                        <div 
                          className="absolute top-0 left-0 h-full"
                          style={{ 
                            width: `${Math.max(minScore, 0.5)}%`,
                            backgroundColor: scoreColors.minColor,
                            borderTopLeftRadius: '9999px',
                            borderBottomLeftRadius: '9999px'
                          }}
                        />
                        
                        {/* Layer 3: Nếu avg > min, ghi đè màu avg từ min đến avg */}
                        {avgScore > minScore && (
                          <div 
                            className="absolute top-0 h-full"
                            style={{ 
                              left: `${minScore}%`,
                              width: `${avgScore - minScore}%`,
                              backgroundColor: scoreColors.avgColor
                            }}
                          />
                        )}
                        
                        {/* Layer 4: Nếu avg = min, ghi đè màu avg lên min (ưu tiên avg) */}
                        {avgScore === minScore && avgScore !== maxScore && (
                          <div 
                            className="absolute top-0 left-0 h-full"
                            style={{ 
                              width: `${Math.max(avgScore, 0.5)}%`,
                              backgroundColor: scoreColors.avgColor,
                              borderTopLeftRadius: '9999px',
                              borderBottomLeftRadius: '9999px'
                            }}
                          />
                        )}
                        
                        {/* Layer 5: Nếu max > avg, ghi đè màu max từ avg đến max */}
                        {maxScore > avgScore && (
                          <div 
                            className="absolute top-0 h-full"
                            style={{ 
                              left: `${avgScore}%`,
                              width: `${maxScore - avgScore}%`,
                              backgroundColor: scoreColors.maxColor
                            }}
                          />
                        )}
                        
                        {/* Layer 6: Nếu max = avg nhưng max != min, ghi đè màu max lên avg (ưu tiên max) */}
                        {maxScore === avgScore && maxScore !== minScore && (
                          <div 
                            className="absolute top-0 left-0 h-full"
                            style={{ 
                              width: `${Math.max(maxScore, 0.5)}%`,
                              backgroundColor: scoreColors.maxColor,
                              borderTopLeftRadius: '9999px',
                              borderBottomLeftRadius: '9999px'
                            }}
                          />
                        )}
                        
                        {/* Layer 7: Vùng xám từ max đến 100% (chỉ hiển thị nếu max < 100) */}
                        {maxScore < 100 && (
                          <div 
                            className="absolute top-0 h-full"
                            style={{ 
                              left: `${maxScore}%`,
                              width: `${100 - maxScore}%`,
                              backgroundColor: scoreColors.grayColor,
                              borderTopRightRadius: '9999px',
                              borderBottomRightRadius: '9999px'
                            }}
                          />
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {/* Background: Full 100% gray area */}
                    <div 
                      className="absolute top-0 left-0 h-full rounded-full"
                      style={{ 
                        width: '100%',
                        backgroundColor: '#d1d5db'
                      }}
                    />
                    {/* Single attempt score bar */}
                    <div 
                      className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.max(avgScore, 0.5)}%`,
                        backgroundColor: avgScore > 0 ? '#34d399' : '#9ca3af'
                      }}
                    />
                  </>
                )}
                
                {/* Score labels positioned on their respective color segments */}
                {hasMultipleAttempts ? (
                  <>
                    {/* Special case: If all scores are equal, show only one label */}
                    {isPerfectScore ? (
                      <div className="absolute inset-0 flex items-center justify-end pr-2">
                        <span className="text-xs font-semibold text-white drop-shadow">
                          {maxScore.toFixed(0)}%
                        </span>
                      </div>
                    ) : (
                      <>
                        {/* Min score label - positioned on min color segment */}
                        {minScore !== avgScore && minScore > 5 && (
                          <div 
                            className="absolute inset-y-0 flex items-center justify-center"
                            style={{ 
                              left: '2px',
                              width: `${Math.max(minScore - 4, 0)}%`
                            }}
                          >
                            <span className="text-xs font-semibold text-white drop-shadow">
                              {minScore.toFixed(0)}%
                            </span>
                          </div>
                        )}
                        
                        {/* Avg score label - positioned on avg color segment */}
                        {avgScore > minScore && avgScore !== maxScore && (avgScore - minScore > 3) && (
                          <div 
                            className="absolute inset-y-0 flex items-center justify-center"
                            style={{ 
                              left: `${minScore + 2}%`,
                              width: `${Math.max(avgScore - minScore - 4, 0)}%`
                            }}
                          >
                            <span className="text-xs font-semibold text-white drop-shadow">
                              {avgScore.toFixed(0)}%
                            </span>
                          </div>
                        )}
                        
                        {/* Max score label - positioned on max color segment */}
                        {maxScore > avgScore && (maxScore - avgScore > 3) && (
                          <div 
                            className="absolute inset-y-0 flex items-center justify-center"
                            style={{ 
                              left: `${avgScore + 2}%`,
                              width: `${Math.max(maxScore - avgScore - 4, 0)}%`
                            }}
                          >
                            <span className="text-xs font-semibold text-white drop-shadow">
                              {maxScore.toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-end pr-2">
                    <span className={`text-xs font-semibold drop-shadow ${
                      avgScore > 0 ? 'text-white' : 'text-gray-600'
                    }`}>
                      {avgScore.toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>
              
              {/* Legend for multiple attempts */}
              {hasMultipleAttempts && (
                <div className="flex items-center justify-center space-x-4 mt-2 text-xs">
                  {/* Show legend only if scores are different */}
                  {isPerfectScore ? (
                    <div className="flex items-center space-x-1">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: typeof scoreColors === 'string' ? scoreColors : scoreColors.maxColor }}
                      ></div>
                      <span className="text-gray-600">Điểm hoàn hảo</span>
                    </div>
                  ) : (
                    <>
                      {minScore !== avgScore && (
                        <div className="flex items-center space-x-1">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: scoreColors.minColor }}
                          ></div>
                          <span className="text-gray-600">Thấp nhất</span>
                        </div>
                      )}
                      {avgScore !== minScore && avgScore !== maxScore && (
                        <div className="flex items-center space-x-1">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: scoreColors.avgColor }}
                          ></div>
                          <span className="text-gray-600">Trung bình</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: scoreColors.maxColor }}
                        ></div>
                        <span className="text-gray-600">Cao nhất</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
    </div>
  );
};

// Progress Bar Component
const ProgressBar = ({ label, value, maxValue, color = 'blue', showPercentage = true }) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">
          {showPercentage ? `${percentage.toFixed(1)}%` : `${value}/${maxValue}`}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${
            color === 'blue' ? 'bg-blue-500' : 
            color === 'green' ? 'bg-green-500' : 
            color === 'yellow' ? 'bg-yellow-500' : 'bg-gray-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

// Achievement Badge Component
const AchievementBadge = ({ icon, title, description, achieved, progress }) => {
  return (
    <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
      achieved 
        ? 'border-yellow-200 bg-yellow-50 shadow-lg' 
        : 'border-gray-200 bg-gray-50'
    }`}>
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-full ${
          achieved ? 'bg-yellow-500 text-white' : 'bg-gray-300 text-gray-500'
        }`}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className={`font-semibold ${achieved ? 'text-yellow-800' : 'text-gray-600'}`}>
            {title}
          </h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          {!achieved && progress && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-gray-400 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 mt-1">{progress.toFixed(0)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Statistics Screen Component
const QuizStatisticsScreen = ({ jlptLevel = 'N5', onBack }) => {
  const { getAuthToken, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/quiz/stats/${jlptLevel}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
      setError('Không thể tải thống kê. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onBack}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Calculate achievements
  const achievements = [
    {
      icon: <Trophy className="w-4 h-4" />,
      title: "Người mới bắt đầu",
      description: "Hoàn thành quiz đầu tiên",
      achieved: stats.total_completed >= 1,
      progress: Math.min((stats.total_completed / 1) * 100, 100)
    },
    {
      icon: <Target className="w-4 h-4" />,
      title: "Kiên trì",
      description: "Hoàn thành 5 bài quiz",
      achieved: stats.total_completed >= 5,
      progress: Math.min((stats.total_completed / 5) * 100, 100)
    },
    {
      icon: <Award className="w-4 h-4" />,
      title: "Hoàn thiện",
      description: "Hoàn thành tất cả 10 bài quiz",
      achieved: stats.total_completed >= 10,
      progress: Math.min((stats.total_completed / 10) * 100, 100)
    },
    {
      icon: <Star className="w-4 h-4" />,
      title: "Chuyên gia",
      description: "Đạt điểm trung bình trên 80%",
      achieved: stats.average_score >= 80,
      progress: Math.min((stats.average_score / 80) * 100, 100)
    },
    {
      icon: <Zap className="w-4 h-4" />,
      title: "Thần tốc",
      description: "Hoàn thành quiz trong 5 phút",
      achieved: stats.quiz_progress && stats.quiz_progress.some(q => 
        q.last_3_attempts && q.last_3_attempts.some(attempt => attempt.time_spent <= 300)
      ),
      progress: 0 // Would need to calculate from detailed data
    },
    {
      icon: <BookOpen className="w-4 h-4" />,
      title: "Học giỏi",
      description: "Đạt 100% trong một bài quiz",
      achieved: stats.best_score >= 100,
      progress: Math.min(stats.best_score, 100)
    }
  ];

  const achievedCount = achievements.filter(a => a.achieved).length;
  
  // Trend indicator
  const getTrendIndicator = () => {
    if (stats.improvement_trend === 'improving') {
      return { icon: <TrendingUp className="w-5 h-5 text-green-500" />, color: 'green', text: 'Đang cải thiện' };
    } else if (stats.improvement_trend === 'declining') {
      return { icon: <TrendingDown className="w-5 h-5 text-red-500" />, color: 'red', text: 'Cần cố gắng hơn' };
    } else {
      return { icon: <Minus className="w-5 h-5 text-gray-500" />, color: 'gray', text: 'Ổn định' };
    }
  };

  const trend = getTrendIndicator();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 px-4 py-8">
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

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Thống kê Quiz {jlptLevel}
          </h1>
          <p className="text-xl text-gray-600">
            Theo dõi tiến độ học tập và kết quả quiz của bạn
          </p>
        </div>

        {/* Main Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quiz hoàn thành</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total_completed}/10</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <ProgressBar 
              label="Tiến độ hoàn thành" 
              value={stats.total_completed} 
              maxValue={10} 
              color="green"
              showPercentage={false}
            />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Điểm trung bình</p>
                <p className="text-3xl font-bold text-gray-900">{(stats.average_score || 0).toFixed(1)}%</p>
              </div>
              <BarChart3 className="w-12 h-12 text-blue-500" />
            </div>
            <ProgressBar 
              label="Mục tiêu: 80%" 
              value={stats.average_score || 0} 
              maxValue={100} 
              color="blue"
            />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Điểm cao nhất</p>
                <p className="text-3xl font-bold text-gray-900">{(stats.best_score || 0).toFixed(1)}%</p>
              </div>
              <Trophy className="w-12 h-12 text-yellow-500" />
            </div>
            <ProgressBar 
              label="Tiến tới 100%" 
              value={stats.best_score || 0} 
              maxValue={100} 
              color="yellow"
            />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Xu hướng</p>
                <p className={`text-lg font-bold ${
                  trend.color === 'green' ? 'text-green-600' :
                  trend.color === 'red' ? 'text-red-600' : 'text-gray-600'
                }`}>{trend.text}</p>
              </div>
              {trend.icon}
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-600">
                {stats.improvement_trend === 'improving' ? 'Bạn đang tiến bộ rất tốt! 🎉' :
                 stats.improvement_trend === 'declining' ? 'Hãy ôn tập thêm để cải thiện 📚' :
                 'Kết quả ổn định, tiếp tục phát huy 💪'}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Chart */}
        {stats.quiz_progress && stats.quiz_progress.length > 0 && (
          <div className="mb-12">
            <QuizPerformanceChart 
              data={stats.quiz_progress} 
              title="Biểu đồ điểm số (Max/Trung bình/Min cho từng Quiz)"
              color="purple"
            />
          </div>
        )}

        {/* Achievements */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                <Award className="w-6 h-6 mr-2 text-purple-500" />
                Thành tích ({achievedCount}/{achievements.length})
              </h3>
              <div className="text-sm text-gray-600">
                Hoàn thành: {((achievedCount / achievements.length) * 100).toFixed(0)}%
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <AchievementBadge 
                  key={index}
                  icon={achievement.icon}
                  title={achievement.title}
                  description={achievement.description}
                  achieved={achievement.achieved}
                  progress={achievement.progress}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Quiz Summary */}
        {stats.quiz_progress && stats.quiz_progress.length > 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-indigo-500" />
              Tổng kết các Quiz đã hoàn thành
            </h3>
            
            <div className="space-y-4">
              {stats.quiz_progress.map((quiz, index) => {
                const hasMultipleAttempts = quiz.attempt_count > 1;
                const maxScore = quiz.max_score || 0;
                const avgScore = quiz.avg_score || 0;
                const minScore = quiz.min_score || 0;
                const bestScore = hasMultipleAttempts ? maxScore : avgScore;
                const date = new Date(quiz.latest_date).toLocaleDateString('vi-VN');
                
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        bestScore >= 80 ? 'bg-green-500' : 
                        bestScore >= 60 ? 'bg-blue-500' : 
                        bestScore > 0 ? 'bg-orange-500' : 'bg-gray-500'
                      }`}>
                        {quiz.quiz_number}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Quiz {quiz.quiz_number}</div>
                        <div className="text-sm text-gray-600">
                          {date} • {quiz.attempt_count} lần thử
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      {hasMultipleAttempts ? (
                        <>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">
                              {maxScore.toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500">Cao nhất</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">
                              {avgScore.toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500">Trung bình</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-orange-600">
                              {minScore.toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500">Thấp nhất</div>
                          </div>
                          {quiz.last_3_attempts && quiz.last_3_attempts.length > 0 && (
                            <div className="text-center border-l border-gray-300 pl-4">
                              <div className="text-xs text-gray-500 mb-1">3 lần gần nhất</div>
                              <div className="flex space-x-1">
                                {quiz.last_3_attempts.map((attempt, i) => (
                                  <div 
                                    key={i}
                                    className={`w-8 h-6 flex items-center justify-center text-xs font-bold text-white rounded ${
                                      attempt.score >= 80 ? 'bg-green-500' :
                                      attempt.score >= 60 ? 'bg-blue-500' :
                                      attempt.score > 0 ? 'bg-orange-500' : 'bg-gray-500'
                                    }`}
                                    title={`${attempt.score.toFixed(1)}% - ${new Date(attempt.date).toLocaleDateString('vi-VN')}`}
                                  >
                                    {attempt.score.toFixed(0)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center">
                          <div className={`text-lg font-bold ${
                            bestScore >= 80 ? 'text-green-600' : 
                            bestScore >= 60 ? 'text-blue-600' : 
                            bestScore > 0 ? 'text-orange-600' : 'text-gray-600'
                          }`}>
                            {bestScore.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500">Điểm số</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No data message */}
        {stats.total_completed === 0 && (
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có dữ liệu thống kê</h3>
            <p className="text-gray-600 mb-6">
              Bạn chưa hoàn thành quiz nào. Hãy bắt đầu làm quiz để xem thống kê chi tiết!
            </p>
            <button
              onClick={onBack}
              className="bg-purple-600 text-white px-8 py-4 rounded-2xl hover:bg-purple-700 transition-colors font-medium"
            >
              Bắt đầu Quiz ngay
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizStatisticsScreen;