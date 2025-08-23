import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import AlphabetPage from './components/AlphabetPage';
import VocabularyPage from './components/VocabularyPage';
import DictionaryPage from './components/DictionaryPage';
import KanjiPage from './components/KanjiPage';
import QuizMainPage from './components/QuizMainPage';
import QuizHubPage from './components/QuizHubPage';
import WeeklyChallengePage from './components/WeeklyChallengeePage';
import WeeklyChallengeQuiz from './components/WeeklyChallengeQuiz';
import WeeklyChallengeResult from './components/WeeklyChallengeResult';
import FriendsPage from './components/FriendsPage';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import ChangePasswordPage from './components/auth/ChangePasswordPage';
import OAuthCallback from './components/auth/OAuthCallback';
import ProfilePage from './components/profile/ProfilePage';
import { loadVoices } from './utils/japaneseData';

// TTS Voice Loading Hook
const useTTSVoices = () => {
  const [voicesReady, setVoicesReady] = useState(false);

  useEffect(() => {
    const initializeVoices = async () => {
      try {
        loadVoices();
        
        const checkVoices = () => {
          if (window.speechSynthesis && window.speechSynthesis.getVoices().length > 0) {
            setVoicesReady(true);
            console.log('✅ TTS Voices loaded successfully');
          } else {
            setTimeout(checkVoices, 100);
          }
        };
        
        if (window.speechSynthesis) {
          if (window.speechSynthesis.getVoices().length > 0) {
            setVoicesReady(true);
          } else {
            window.speechSynthesis.addEventListener('voiceschanged', () => {
              setVoicesReady(true);
              console.log('✅ TTS Voices loaded via event');
            });
            setTimeout(checkVoices, 1000);
          }
        } else {
          console.log('❌ TTS not supported');
        }
      } catch (error) {
        console.error('TTS initialization error:', error);
      }
    };

    initializeVoices();
  }, []);

  return voicesReady;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Auth Route Component
const AuthRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

// Layout Component
const Layout = () => {
  const voicesReady = useTTSVoices();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {!voicesReady && (
        <div className="bg-yellow-100 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                🔊 Đang tải voices cho phát âm... Nếu lâu quá, hãy refresh trang.
              </p>
            </div>
          </div>
        </div>
      )}
      <main className="py-8">
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={
            <AuthRoute>
              <LoginPage onNavigate={(page) => navigate(`/${page}`)} />
            </AuthRoute>
          } />
          <Route path="/signup" element={
            <AuthRoute>
              <SignupPage onNavigate={(page) => navigate(`/${page}`)} />
            </AuthRoute>
          } />
          <Route path="/forgot-password" element={
            <AuthRoute>
              <ForgotPasswordPage onNavigate={(page) => navigate(`/${page}`)} />
            </AuthRoute>
          } />
          
          {/* OAuth Callback Routes */}
          <Route path="/auth/success" element={<OAuthCallback />} />
          <Route path="/auth/error" element={<OAuthCallback />} />
          
          {/* Protected Routes */}
          <Route path="/home" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/alphabet" element={
            <ProtectedRoute>
              <AlphabetPage />
            </ProtectedRoute>
          } />
          <Route path="/vocabulary" element={
            <ProtectedRoute>
              <VocabularyPage />
            </ProtectedRoute>
          } />
          <Route path="/dictionary" element={
            <ProtectedRoute>
              <DictionaryPage />
            </ProtectedRoute>
          } />
          <Route path="/kanji" element={
            <ProtectedRoute>
              <KanjiPage />
            </ProtectedRoute>
          } />
          <Route path="/quiz" element={
            <ProtectedRoute>
              <QuizMainPage />
            </ProtectedRoute>
          } />
          <Route path="/quiz-hub" element={
            <ProtectedRoute>
              <QuizHubPage />
            </ProtectedRoute>
          } />
          <Route path="/weekly-challenge" element={
            <ProtectedRoute>
              <WeeklyChallengePage />
            </ProtectedRoute>
          } />
          <Route path="/weekly-challenge/:level/:challengeId" element={
            <ProtectedRoute>
              <WeeklyChallengeQuiz />
            </ProtectedRoute>
          } />
          <Route path="/weekly-challenge-result" element={
            <ProtectedRoute>
              <WeeklyChallengeResult />
            </ProtectedRoute>
          } />
          <Route path="/friends" element={
            <ProtectedRoute>
              <FriendsPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/change-password" element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          } />
          
          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
    </div>
  );
};

// Main App Component with Router
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout />
      </Router>
    </AuthProvider>
  );
};

export default App;