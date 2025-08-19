import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Clock, AlertTriangle, 
  Home, ArrowRight, ArrowLeft 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

// Timer Component
const QuizTimer = ({ timeLeft, totalTime, isPaused, onTimeUp }) => {
  const percentage = (timeLeft / totalTime) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  useEffect(() => {
    if (timeLeft <= 0 && !isPaused) {
      onTimeUp();
    }
  }, [timeLeft, isPaused, onTimeUp]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock className={`w-5 h-5 ${timeLeft <= 60 ? 'text-red-500' : 'text-blue-500'}`} />
          <span className="font-medium text-gray-700">Thời gian còn lại</span>
        </div>
        <div className={`text-2xl font-bold ${
          timeLeft <= 60 ? 'text-red-500' : timeLeft <= 180 ? 'text-yellow-500' : 'text-blue-500'
        }`}>
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-3 rounded-full transition-all duration-1000 ${
            percentage <= 10 ? 'bg-red-500' : 
            percentage <= 30 ? 'bg-yellow-500' : 'bg-blue-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {timeLeft <= 60 && (
        <div className="mt-2 text-center">
          <span className="text-red-600 text-sm font-medium animate-pulse">
            ⚠️ Sắp hết thời gian!
          </span>
        </div>
      )}
    </div>
  );
};

// Question Component
const QuizQuestion = ({ 
  question, 
  questionIndex, 
  totalQuestions, 
  selectedAnswer, 
  onAnswerSelect, 
  showResult,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  submitting
}) => {
  if (!question) return null;

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
      {/* Question Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 text-center">
        <div className="mb-4">
          <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
            Câu {questionIndex + 1}/{totalQuestions}
          </span>
        </div>
        
        <h3 className="text-xl font-medium mb-6 opacity-90">
          Từ "{question.japanese}" ({question.hiragana}) có nghĩa là gì?
        </h3>
        
        <div className="text-6xl font-bold mb-4 font-serif">
          {question.japanese}
        </div>
        
        <div className="text-2xl opacity-90 font-medium">
          {question.hiragana}
        </div>
      </div>

      {/* Answer Options */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {Object.entries(question.options).map(([key, option]) => {
            let buttonClass = "group relative w-full p-6 rounded-2xl border-2 font-medium text-lg transition-all duration-300 text-left ";
            
            if (!selectedAnswer) {
              buttonClass += "border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-lg transform hover:-translate-y-1 bg-white cursor-pointer";
            } else {
              // Show correct/incorrect after selection
              // Get the correct answer from the question (should be set by backend)
              const correctOptionKey = question.correct_option || 'A';
              
              if (key === correctOptionKey) {
                buttonClass += "border-green-500 bg-green-100 text-green-700 shadow-lg";
              } else if (key === selectedAnswer) {
                buttonClass += "border-red-500 bg-red-100 text-red-700 shadow-lg";
              } else {
                buttonClass += "border-gray-200 bg-gray-50 text-gray-500 opacity-60";
              }
            }

            return (
              <button
                key={key}
                onClick={() => !selectedAnswer && onAnswerSelect(key)}
                disabled={!!selectedAnswer}
                className={buttonClass}
              >
                <div className="flex items-center space-x-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                    !selectedAnswer 
                      ? 'border-blue-300 text-blue-600 group-hover:border-blue-500 group-hover:text-blue-700'
                      : (() => {
                          const correctOptionKey = question.correct_option || 'A';
                          if (key === correctOptionKey) {
                            return 'border-green-500 bg-green-500 text-white';
                          } else if (key === selectedAnswer) {
                            return 'border-red-500 bg-red-500 text-white';
                          } else {
                            return 'border-gray-300 text-gray-400';
                          }
                        })()
                  }`}>
                    {key}
                  </div>
                  <span className="flex-1">{option}</span>
                </div>
                
                {!selectedAnswer && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity" />
                )}
              </button>
            );
          })}
        </div>

        {/* Result Feedback */}
        {selectedAnswer && (
          <div className="text-center mb-8">
            <div className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full font-semibold text-lg border-2 ${
              selectedAnswer === (question.correct_option || 'A')
                ? 'bg-green-100 text-green-600 border-green-200' 
                : 'bg-red-100 text-red-600 border-red-200'
            }`}>
              <span className="text-2xl">
                {selectedAnswer === (question.correct_option || 'A') ? '✅' : '❌'}
              </span>
              <span>
                {selectedAnswer === (question.correct_option || 'A')
                  ? 'Chính xác! Tuyệt vời!' 
                  : `Sai rồi! Đáp án đúng là: ${question.options[question.correct_option || 'A']}`}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              canGoPrevious
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Câu trước</span>
          </button>

          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Tiến độ</div>
            <div className="flex space-x-2">
              {Array.from({ length: totalQuestions }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < questionIndex ? 'bg-green-500' : 
                    i === questionIndex ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={onNext}
            disabled={!canGoNext || submitting}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              canGoNext && !submitting
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>{questionIndex === totalQuestions - 1 ? 'Hoàn thành' : 'Câu tiếp'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Quiz Game Screen
const QuizGameScreen = ({ quizNumber, jlptLevel = 'N5', onBack, onComplete, isRetake = false }) => {
  console.log('🎯 QuizGameScreen rendered with props:', { quizNumber, isRetake });
  const { getAuthToken } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const loadingQuizRef = useRef(false);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !isPaused && !loading) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isPaused, loading]);

  const loadQuiz = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (loadingQuizRef.current) {
      console.log('🚫 Quiz loading already in progress, skipping...');
      return;
    }
    
    try {
      loadingQuizRef.current = true;
      setLoading(true);
      const token = getAuthToken();
      console.log('📝 Loading quiz:', { quizNumber, isRetake, token: token ? 'Present' : 'Missing' });
      
      const requestBody = {
        jlpt_level: jlptLevel,
        quiz_number: quizNumber,
        allow_retake: isRetake
      };
      console.log('📤 Sending request body:', requestBody);
      
      const response = await fetch(`${API_BASE_URL}/quiz/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('📝 Quiz API response:', data);
      
      if (data.success) {
        setQuiz(data.quiz);
        setError(null);
      } else {
        console.error('❌ Quiz API error:', data.message);
        setError(data.message);
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      setError('Không thể tải bài quiz. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      loadingQuizRef.current = false;
    }
  }, [quizNumber, jlptLevel, isRetake, getAuthToken]);

  // Load quiz questions - placed after loadQuiz definition
  useEffect(() => {
    console.log('🔄 QuizGameScreen useEffect triggered:', { quizNumber, isRetake });
    loadQuiz();
  }, [loadQuiz]);

  const submitQuiz = useCallback(async () => {
    // Prevent double submission
    if (submitting) {
      console.log('🚫 Submit blocked - already submitting');
      return;
    }
    
    try {
      console.log('📤 Starting quiz submission...');
      setSubmitting(true);
      
      // Check if user has answered at least one question
      const answeredQuestions = Object.keys(answers).length;
      if (answeredQuestions === 0) {
        setError('Bạn cần trả lời ít nhất 1 câu hỏi trước khi nộp bài!');
        setSubmitting(false);
        return;
      }

      const token = getAuthToken();
      const timeSpent = 600 - timeLeft; // Calculate time spent

      console.log('📤 Submitting quiz:', { session_id: quiz.session_id, answeredQuestions });

      const response = await fetch(`${API_BASE_URL}/quiz/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: quiz.session_id,
          answers: answers,
          time_spent: timeSpent
        })
      });

      const data = await response.json();
      console.log('📥 Submit response:', data);
      
      if (data.success) {
        console.log('✅ Quiz submitted successfully');
        onComplete(data.result);
      } else {
        console.error('❌ Quiz submission failed:', data.message);
        setError(data.message);
        setSubmitting(false); // Reset submitting state on error
      }
    } catch (error) {
      console.error('❌ Error submitting quiz:', error);
      setError('Không thể nộp bài quiz. Vui lòng thử lại.');
      setSubmitting(false); // Reset submitting state on error
    }
    // Note: Don't reset submitting to false on success, let onComplete handle it
  }, [submitting, quiz, answers, timeLeft, getAuthToken, onComplete]);

  const handleTimeUp = useCallback(() => {
    console.log('⏰ Time up triggered, submitting state:', submitting);
    if (!submitting) {
      submitQuiz();
    } else {
      console.log('⏰ Time up ignored - already submitting');
    }
  }, [submitting, submitQuiz]);

  const handleAnswerSelect = (questionId, answerKey) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerKey
    }));
  };

  const handleNext = () => {
    if (submitting) return; // Prevent action if already submitting
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Last question - submit quiz
      submitQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bài quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onBack}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!quiz || !quiz.questions) {
    return null;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestion?.id];
  const canGoNext = selectedAnswer || currentQuestionIndex === quiz.questions.length - 1;
  const canGoPrevious = currentQuestionIndex > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button - Top Left */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 bg-white text-gray-700 px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100"
          >
            <Home className="w-4 h-4" />
            <span>Thoát</span>
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Quiz N5 - Bài {quizNumber}</h1>
          <p className="text-gray-600">10 câu hỏi từ vựng trong 10 phút</p>
        </div>

        {/* Timer */}
        <div className="mb-8">
          <QuizTimer
            timeLeft={timeLeft}
            totalTime={600}
            isPaused={isPaused}
            onTimeUp={handleTimeUp}
          />
        </div>

        {/* Question */}
        <QuizQuestion
          question={currentQuestion}
          questionIndex={currentQuestionIndex}
          totalQuestions={quiz.questions.length}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={(answerKey) => handleAnswerSelect(currentQuestion.id, answerKey)}
          showResult={!!selectedAnswer}
          onNext={handleNext}
          onPrevious={handlePrevious}
          canGoNext={canGoNext}
          canGoPrevious={canGoPrevious}
          submitting={submitting}
        />

        {/* Submit overlay when time is up */}
        {submitting && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang nộp bài quiz...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizGameScreen;