import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Mail, CheckCircle, XCircle, Trash2, UserCheck, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Dialog from './common/Dialog';

const FriendsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ friends_count: 0, pending_requests: 0, sent_requests: 0 });
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [dialog, setDialog] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null });

  useEffect(() => {
    fetchFriendsData();
    fetchStats();
  }, []);

  const fetchFriendsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      
      // Fetch friends and requests in parallel
      const [friendsRes, requestsRes] = await Promise.all([
        fetch('http://localhost:5001/api/friends', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5001/api/friends/requests', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const friendsData = await friendsRes.json();
      const requestsData = await requestsRes.json();

      if (friendsData.success) {
        setFriends(friendsData.data);
      }
      
      if (requestsData.success) {
        setFriendRequests(requestsData.data);
      }
    } catch (error) {
      console.error('Error fetching friends data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch('http://localhost:5001/api/friends/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const searchUsers = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`http://localhost:5001/api/friends/search?query=${encodeURIComponent(query)}&limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch('http://localhost:5001/api/friends/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });
      
      const data = await response.json();
      if (data.success) {
        // Update search results to reflect sent request
        setSearchResults(prev => 
          prev.map(user => 
            user.id === userId 
              ? { ...user, friendship_status: 'pending', request_direction: 'sent' }
              : user
          )
        );
        fetchStats();
        setDialog({
          isOpen: true,
          type: 'success',
          title: 'Thành công',
          message: data.message,
          onConfirm: null
        });
      } else {
        setDialog({
          isOpen: true,
          type: 'error',
          title: 'Lỗi',
          message: data.message,
          onConfirm: null
        });
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể gửi lời mời kết bạn',
        onConfirm: null
      });
    }
  };

  const respondToRequest = async (requestId, action) => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch('http://localhost:5001/api/friends/respond', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requestId, action })
      });
      
      const data = await response.json();
      if (data.success) {
        fetchFriendsData();
        fetchStats();
        setDialog({
          isOpen: true,
          type: 'success',
          title: 'Thành công',
          message: data.message,
          onConfirm: null
        });
      } else {
        setDialog({
          isOpen: true,
          type: 'error',
          title: 'Lỗi',
          message: data.message,
          onConfirm: null
        });
      }
    } catch (error) {
      console.error('Error responding to request:', error);
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể phản hồi lời mời kết bạn',
        onConfirm: null
      });
    }
  };

  const removeFriend = async (friendId) => {
    const performRemoval = async () => {
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch(`http://localhost:5001/api/friends/${friendId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (data.success) {
          fetchFriendsData();
          fetchStats();
          setDialog({
            isOpen: true,
            type: 'success',
            title: 'Thành công',
            message: data.message,
            onConfirm: null
          });
        } else {
          setDialog({
            isOpen: true,
            type: 'error',
            title: 'Lỗi',
            message: data.message,
            onConfirm: null
          });
        }
      } catch (error) {
        console.error('Error removing friend:', error);
        setDialog({
          isOpen: true,
          type: 'error',
          title: 'Lỗi',
          message: 'Không thể xóa bạn bè',
          onConfirm: null
        });
      }
    };

    setDialog({
      isOpen: true,
      type: 'confirm',
      title: 'Xác nhận xóa bạn bè',
      message: 'Bạn có chắc chắn muốn xóa bạn bè này không?',
      onConfirm: performRemoval,
      showCancel: true
    });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    searchUsers(query);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getButtonForUser = (user) => {
    if (!user.friendship_status) {
      return (
        <button
          onClick={() => sendFriendRequest(user.id)}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          <UserPlus className="w-4 h-4" />
          <span>Gửi lời mời</span>
        </button>
      );
    }

    if (user.friendship_status === 'pending') {
      if (user.request_direction === 'sent') {
        return (
          <span className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm">
            <Clock className="w-4 h-4" />
            <span>Đã gửi</span>
          </span>
        );
      } else {
        return (
          <span className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm">
            <Mail className="w-4 h-4" />
            <span>Chờ phản hồi</span>
          </span>
        );
      }
    }

    if (user.friendship_status === 'accepted') {
      return (
        <span className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm">
          <UserCheck className="w-4 h-4" />
          <span>Bạn bè</span>
        </span>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <Users className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">👥 Bạn bè</h1>
            <p className="text-blue-100 text-lg">
              Kết nối và học tập cùng bạn bè
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.friends_count}</p>
                <p className="text-gray-600">Bạn bè</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Mail className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.pending_requests}</p>
                <p className="text-gray-600">Lời mời nhận</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <UserPlus className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.sent_requests}</p>
                <p className="text-gray-600">Lời mời gửi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl p-2 mb-8 shadow-sm border border-gray-200">
          <div className="flex space-x-1">
            {[
              { id: 'friends', label: '👥 Bạn bè', count: stats.friends_count },
              { id: 'requests', label: '📬 Lời mời', count: stats.pending_requests },
              { id: 'search', label: '🔍 Tìm kiếm' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px]">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'friends' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Danh sách bạn bè</h2>
              <p className="text-gray-600 mt-1">{friends.length} bạn bè</p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Đang tải...</p>
                </div>
              ) : friends.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Chưa có bạn bè nào</p>
                  <p className="text-gray-400 text-sm mt-1">Hãy tìm kiếm và kết bạn với người khác!</p>
                </div>
              ) : (
                friends.map(friend => (
                  <div key={friend.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {friend.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{friend.name}</h3>
                          <p className="text-gray-600 text-sm">{friend.email}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span>JLPT {friend.japanese_level || 'N5'}</span>
                            <span>•</span>
                            <span>Kết bạn: {formatDate(friend.friendship_date)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => removeFriend(friend.id)}
                        className="flex items-center space-x-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Lời mời kết bạn</h2>
              <p className="text-gray-600 mt-1">{friendRequests.length} lời mời</p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Đang tải...</p>
                </div>
              ) : friendRequests.length === 0 ? (
                <div className="p-8 text-center">
                  <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Không có lời mời kết bạn nào</p>
                </div>
              ) : (
                friendRequests.map(request => (
                  <div key={request.request_id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {request.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{request.name}</h3>
                          <p className="text-gray-600 text-sm">{request.email}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span>JLPT {request.japanese_level || 'N5'}</span>
                            <span>•</span>
                            <span>{formatDate(request.request_date)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => respondToRequest(request.request_id, 'accept')}
                          className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Chấp nhận</span>
                        </button>
                        <button
                          onClick={() => respondToRequest(request.request_id, 'decline')}
                          className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Từ chối</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Tìm kiếm bạn bè</h2>
              <p className="text-gray-600 mt-1">Tìm kiếm theo tên hoặc email</p>
            </div>
            
            <div className="p-6">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Nhập tên hoặc email để tìm kiếm..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {searching && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2 text-sm">Đang tìm kiếm...</p>
                </div>
              )}
              
              <div className="space-y-4">
                {searchResults.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-gray-600 text-sm">{user.email}</p>
                        <span className="text-xs text-gray-500">JLPT {user.japanese_level || 'N5'}</span>
                      </div>
                    </div>
                    
                    {getButtonForUser(user)}
                  </div>
                ))}
                
                {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Không tìm thấy người dùng nào</p>
                    <p className="text-gray-400 text-sm mt-1">Thử tìm kiếm với từ khóa khác</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dialog Component */}
      <Dialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onConfirm={dialog.onConfirm}
        showCancel={dialog.type === 'confirm'}
      />
    </div>
  );
};

export default FriendsPage;