import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const WeeklyChallengeQuiz = () => {
  const { level, challengeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [challenge, setChallenge] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  console.log('🎯 WeeklyChallengeQuiz loaded:', { level, challengeId });

  useEffect(() => {
    fetchChallenge();
  }, [level, challengeId]);

  useEffect(() => {
    if (timeLeft > 0 && challenge) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmit(true); // Auto-submit when time is up
    }
  }, [timeLeft, challenge]);

  const fetchChallenge = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`http://localhost:5001/api/weekly-challenge/current/${level}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('🎯 Challenge data:', data);

      if (data.success) {
        setChallenge(data.data);
      } else {
        console.error('Failed to fetch challenge:', data.message);
        navigate('/weekly-challenge');
      }
    } catch (error) {
      console.error('Error fetching challenge:', error);
      navigate('/weekly-challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    if (submitting) return;
    
    if (!isAutoSubmit) {
      const unanswered = challenge.questions.length - Object.keys(answers).length;
      if (unanswered > 0) {
        const confirm = window.confirm(`Bạn còn ${unanswered} câu chưa trả lời. Bạn có muốn nộp bài không?`);
        if (!confirm) return;
      }
    }

    setSubmitting(true);
    
    try {
      const endTime = Date.now();
      const completionTime = Math.floor((endTime - startTime) / 1000);
      
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`http://localhost:5001/api/weekly-challenge/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          challenge_id: challenge.challenge_id,
          jlpt_level: level,
          answers: answers,
          completion_time: completionTime
        })
      });

      const result = await response.json();
      console.log('🎯 Submit result:', result);

      if (result.success) {
        // Navigate to results page with result data
        navigate('/weekly-challenge-result', {
          state: {
            result: result.data,
            level: level
          }
        });
      } else {
        alert(`Lỗi khi nộp bài: ${result.message}`);
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting challenge:', error);
      alert('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại!');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải thử thách...</p>
        </div>
      </div>
    );
  }

  if (!challenge || !challenge.questions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy thử thách</h1>
          <button
            onClick={() => navigate('/weekly-challenge')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const questions = challenge.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/weekly-challenge')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Quay lại</span>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Thử thách tuần - JLPT {level}
                </h1>
                <p className="text-sm text-gray-600">
                  Câu {currentQuestionIndex + 1} / {questions.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                timeLeft < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="font-medium">{formatTime(timeLeft)}</span>
              </div>
              
              <button
                onClick={() => handleSubmit()}
                disabled={submitting || Object.keys(answers).length === 0}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
                  submitting || Object.keys(answers).length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Đang nộp...' : 'Nộp bài'}</span>
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {currentQuestion && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-2">
                  Câu hỏi {currentQuestionIndex + 1} / {questions.length}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {currentQuestion.question_text}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {['A', 'B', 'C', 'D'].map(option => (
                  <button
                    key={option}
                    onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      answers[currentQuestion.id] === option
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                        answers[currentQuestion.id] === option
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300'
                      }`}>
                        {option}
                      </div>
                      <span className="text-gray-900">
                        {currentQuestion.options[option]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    currentQuestionIndex === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  Câu trước
                </button>
                
                <div className="text-sm text-gray-600">
                  Đã trả lời: {Object.keys(answers).length} / {questions.length}
                </div>
                
                <button
                  onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    currentQuestionIndex === questions.length - 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Câu sau
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Question Overview */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Tổng quan câu hỏi</h3>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-10 h-10 rounded-lg border-2 font-medium text-sm transition-all ${
                  index === currentQuestionIndex
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : answers[questions[index]?.id]
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyChallengeQuiz;