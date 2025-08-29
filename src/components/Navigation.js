import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, Star, User, Settings, LogOut, ChevronDown, Search, PenTool, Trophy, Award, Users, MessageCircle, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationCenter from './NotificationCenter';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Extract current page from pathname
  const currentPage = location.pathname.substring(1) || 'home';

  const pages = [
    { id: 'home', name: 'Trang chủ', icon: Home, color: 'from-blue-500 to-blue-600' },
    { id: 'alphabet', name: 'Bảng chữ cái', icon: BookOpen, color: 'from-purple-500 to-purple-600' },
    { id: 'vocabulary', name: 'Từ vựng', icon: Star, color: 'from-green-500 to-green-600' },
    { id: 'grammar', name: 'Ngữ pháp', icon: FileText, color: 'from-orange-500 to-red-600' },
    { id: 'dictionary', name: 'Từ điển', icon: Search, color: 'from-indigo-500 to-blue-600' },
    { id: 'kanji', name: 'Kanji', icon: PenTool, color: 'from-purple-600 to-indigo-600' },
    { id: 'quiz-hub', name: 'Quiz Hub', icon: Trophy, color: 'from-purple-500 to-pink-600' },
    { id: 'weekly-challenge', name: 'Weekly Challenge', icon: Award, color: 'from-yellow-500 to-orange-600' },
    { id: 'friends', name: 'Bạn bè', icon: Users, color: 'from-green-500 to-teal-600' },
    { id: 'chat', name: 'Chat', icon: MessageCircle, color: 'from-indigo-500 to-purple-600' }
  ];

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-2xl">
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🌸</div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">
              Japanese Learning
            </h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center space-x-6">
            <div className="flex items-baseline space-x-1">
              {pages.map(page => {
                const Icon = page.icon;
                const isActive = currentPage === page.id;
                return (
                  <button
                    key={page.id}
                    onClick={() => navigate(`/${page.id}`)}
                    className={`group relative px-2.5 py-2 rounded-lg font-medium text-xs transition-all duration-200 ${
                      isActive 
                        ? `bg-gradient-to-r ${page.color} text-white shadow-lg transform scale-105` 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <Icon size={16} className={`transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                      <span>{page.name}</span>
                    </div>
                    {!isActive && (
                      <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${page.color} opacity-0 group-hover:opacity-20 transition-opacity`} />
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* User Menu - Only show when authenticated */}
            {user && (
              <div className="flex items-center space-x-4">
                <NotificationCenter />
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-all duration-200"
                  >
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-white font-medium text-sm">{user.name}</span>
                  <ChevronDown size={16} className={`text-white transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          JLPT {user.japaneseLevel || 'N5'}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setShowUserMenu(false);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User size={16} />
                      <span>Thông tin cá nhân</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/change-password');
                        setShowUserMenu(false);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings size={16} />
                      <span>Đổi mật khẩu</span>
                    </button>
                    
                    <hr className="my-2" />
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="xl:hidden py-4">
          {/* User Info on Mobile - Only show when authenticated */}
          {user && (
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{user.name}</p>
                  <p className="text-gray-300 text-xs">{user.japaneseLevel || 'N5'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-red-400 transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            {pages.map(page => {
              const Icon = page.icon;
              const isActive = currentPage === page.id;
              return (
                <button
                  key={page.id}
                  onClick={() => navigate(`/${page.id}`)}
                  className={`flex items-center justify-center space-x-2 px-3 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                    isActive 
                      ? `bg-gradient-to-r ${page.color} text-white shadow-lg` 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-xs">{page.name}</span>
                </button>
              );
            })}
          </div>
          
          {/* Mobile Profile/Settings Buttons - Only show when authenticated */}
          {user && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate('/profile')}
                className={`flex items-center justify-center space-x-2 px-3 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  currentPage === 'profile'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <User size={16} />
                <span className="text-xs">Hồ sơ</span>
              </button>
              <button
                onClick={() => navigate('/change-password')}
                className={`flex items-center justify-center space-x-2 px-3 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  currentPage === 'change-password'
                    ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Settings size={16} />
                <span className="text-xs">Mật khẩu</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Overlay for mobile menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
};

export default Navigation;