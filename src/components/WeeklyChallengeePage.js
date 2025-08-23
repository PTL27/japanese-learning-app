import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Star, Target, Calendar, Award, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const WeeklyChallengePage = () => {
  console.log('🔍 WeeklyChallengePage component loaded');
  
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userStatus, setUserStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState('N5');
  const [activeTab, setActiveTab] = useState('challenge');
  const { user } = useAuth();

  useEffect(() => {
    fetchChallengeData();
  }, [selectedLevel]);

  const fetchChallengeData = async () => {
    console.log('🔍 fetchChallengeData called for level:', selectedLevel);
    const token = localStorage.getItem('jwt_token');
    console.log('🔍 JWT Token exists:', !!token);
    console.log('🔍 JWT Token preview:', token ? token.substring(0, 20) + '...' : 'null');
    
    try {
      setLoading(true);
      
      // Use absolute URLs to backend server
      const baseURL = 'http://localhost:5001';
      
      // Fetch current challenge, user status, and leaderboard in parallel
      const [challengeRes, statusRes, leaderboardRes] = await Promise.all([
        fetch(`${baseURL}/api/weekly-challenge/current/${selectedLevel}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${baseURL}/api/weekly-challenge/status/${selectedLevel}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${baseURL}/api/weekly-challenge/leaderboard/${selectedLevel}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      console.log('🌐 HTTP Response Status:', {
        challenge: challengeRes.status,
        status: statusRes.status,
        leaderboard: leaderboardRes.status
      });

      const challengeData = await challengeRes.json();
      const statusData = await statusRes.json();
      const leaderboardData = await leaderboardRes.json();

      console.log('🔍 Challenge API responses:', {
        challenge: challengeData,
        status: statusData,
        leaderboard: leaderboardData
      });

      if (challengeData.success) {
        setCurrentChallenge(challengeData.data);
      } else {
        console.error('❌ Challenge fetch failed:', challengeData);
      }
      
      if (statusData.success) {
        setUserStatus(statusData.data);
      } else {
        console.error('❌ Status fetch failed:', statusData);
      }
      
      if (leaderboardData.success) {
        setLeaderboard(leaderboardData.data.leaderboard || []);
      } else {
        console.error('❌ Leaderboard fetch failed:', leaderboardData);
      }

    } catch (error) {
      console.error('❌ Error fetching challenge data:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      // Check if this is a network error
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('🌐 Network Error - Backend server might be down or CORS issue');
      }
    } finally {
      setLoading(false);
    }
  };

  const startChallenge = () => {
    if (currentChallenge) {
      // Navigate to challenge quiz
      window.location.href = `/weekly-challenge/${selectedLevel}/${currentChallenge.challenge_id}`;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Award className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-500" />;
    return <span className="text-sm font-bold text-gray-600">#{rank}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải thử thách tuần...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">
              🏆 Thử Thách Tuần
            </h1>
            <p className="text-purple-100 text-lg">
              Cạnh tranh với cộng đồng qua thử thách hàng tuần
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Level Selector */}
        <div className="bg-white rounded-xl p-4 mb-8 shadow-sm border border-gray-200">
          <div className="flex flex-wrap gap-2">
            {['N5', 'N4', 'N3', 'N2', 'N1'].map(level => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  selectedLevel === level
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                JLPT {level}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl p-2 mb-8 shadow-sm border border-gray-200">
          <div className="flex space-x-1">
            {[
              { id: 'challenge', label: '🎯 Thử thách' },
              { id: 'leaderboard', label: '🏆 Xếp hạng' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Challenge Tab */}
        {activeTab === 'challenge' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Current Challenge */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Target className="w-6 h-6 mr-2 text-purple-600" />
                Thử thách tuần này
              </h2>
              
              {currentChallenge ? (
                <div>
                  <div className="bg-purple-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-purple-800 font-semibold">JLPT {selectedLevel}</span>
                      <span className="text-purple-600 text-sm">
                        {formatDate(currentChallenge.week_start_date)}
                      </span>
                    </div>
                    <p className="text-purple-700">
                      <strong>20 câu hỏi</strong> - Test your {selectedLevel} vocabulary knowledge
                    </p>
                  </div>

                  {userStatus?.has_submitted ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Star className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-800">Đã hoàn thành!</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-green-600">Điểm số</p>
                          <p className="font-bold text-green-800">
                            {userStatus.submission.score}/20
                          </p>
                        </div>
                        <div>
                          <p className="text-green-600">Xếp hạng</p>
                          <p className="font-bold text-green-800">
                            #{userStatus.submission.rank}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={startChallenge}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <Play className="w-5 h-5" />
                      <span>Bắt đầu thử thách</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Không có thử thách nào trong tuần này</p>
                </div>
              )}
            </div>

            {/* Challenge Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Clock className="w-6 h-6 mr-2 text-blue-600" />
                Thông tin
              </h2>
              
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">📅 Lịch trình</h3>
                  <p className="text-blue-700 text-sm">
                    Thử thách mới mỗi <strong>Thứ 2 lúc 00:00</strong>
                  </p>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">🎯 Quy tắc</h3>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    <li>• 20 câu hỏi từ vựng JLPT {selectedLevel}</li>
                    <li>• Mỗi user chỉ được làm 1 lần</li>
                    <li>• Xếp hạng theo điểm số và thời gian</li>
                    <li>• Cùng câu hỏi cho tất cả users</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">🏆 Phần thưởng</h3>
                  <p className="text-green-700 text-sm">
                    Danh hiệu và điểm thành tích cho top performers
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Trophy className="w-6 h-6 mr-2 text-yellow-600" />
                Bảng xếp hạng JLPT {selectedLevel}
              </h2>
              <p className="text-gray-600 mt-1">
                {leaderboard.length} người tham gia tuần này
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Hạng</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Người chơi</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">Điểm</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">Ngày nộp</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.map((player) => (
                    <tr key={player.user_id} className={`hover:bg-gray-50 ${
                      user?.id === player.user_id ? 'bg-purple-50' : ''
                    }`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getRankIcon(player.rank_position)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {player.user_name}
                            {user?.id === player.user_id && (
                              <span className="text-purple-600 ml-1">(Bạn)</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {player.score}/20
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.round((player.score / 20) * 100)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm text-gray-900">
                          {Math.floor(player.completion_time / 60)}:{
                            String(player.completion_time % 60).padStart(2, '0')
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {new Date(player.submitted_at).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                  {leaderboard.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        Chưa có ai tham gia thử thách tuần này
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyChallengePage;