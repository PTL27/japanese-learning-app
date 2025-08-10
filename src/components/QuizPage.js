import React, { useState } from 'react';
import { Play, RotateCcw, Home, Trophy, Target, Clock } from 'lucide-react';
import { vocabularyN5 } from '../utils/japaneseData';

const QuizStartScreen = ({ onStart }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-purple-50 flex items-center justify-center px-4">
    <div className="max-w-2xl w-full">
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-6">
          <Target className="w-4 h-4" />
          <span>Quiz Challenge</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Quiz từ vựng N5
        </h2>
        <p className="text-xl text-gray-600">
          Thử thách bản thân với các câu hỏi ngẫu nhiên
        </p>
      </div>
      
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
        <div className="text-center mb-8">
          <div className="text-8xl mb-6">🎯</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Sẵn sàng kiểm tra kiến thức?
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            Quiz gồm 10 câu hỏi ngẫu nhiên từ danh sách từ vựng N5. 
            Hãy chọn nghĩa đúng của từ tiếng Nhật được hiển thị.
          </p>
        </div>
        
        {/* Quiz Rules */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100">
          <h4 className="font-bold text-blue-800 mb-4 flex items-center">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
              <span className="text-white text-sm">!</span>
            </div>
            Luật chơi
          </h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>10 câu hỏi ngẫu nhiên</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>4 lựa chọn mỗi câu</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Không giới hạn thời gian</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              <span>Điểm số theo độ chính xác</span>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <button
            onClick={onStart}
            className="group relative inline-flex items-center space-x-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-12 py-4 rounded-2xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-bold text-lg"
          >
            <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span>Bắt đầu Quiz</span>
            <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>
      </div>
    </div>
  </div>
);

const QuizResultScreen = ({ score, totalQuestions, onRestart, onHome, percentage }) => {
  let resultData = {};
  
  if (percentage >= 90) {
    resultData = { message: 'Xuất sắc! Bạn thật giỏi!', emoji: '🏆', color: 'from-yellow-400 to-orange-500', bgColor: 'from-yellow-50 to-orange-50' };
  } else if (percentage >= 70) {
    resultData = { message: 'Tốt lắm! Tiếp tục cố gắng!', emoji: '🎉', color: 'from-green-400 to-emerald-500', bgColor: 'from-green-50 to-emerald-50' };
  } else if (percentage >= 50) {
    resultData = { message: 'Ổn đấy! Hãy ôn tập thêm nhé!', emoji: '👍', color: 'from-blue-400 to-indigo-500', bgColor: 'from-blue-50 to-indigo-50' };
  } else {
    resultData = { message: 'Cần cố gắng hơn! Đừng bỏ cuộc!', emoji: '💪', color: 'from-red-400 to-pink-500', bgColor: 'from-red-50 to-pink-50' };
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${resultData.bgColor} flex items-center justify-center px-4`}>
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center space-x-2 bg-gradient-to-r ${resultData.color} text-white px-6 py-2 rounded-full text-sm font-medium mb-6`}>
            <Trophy className="w-4 h-4" />
            <span>Kết quả Quiz</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Hoàn thành Quiz!
          </h2>
        </div>
        
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header with gradient */}
          <div className={`bg-gradient-to-r ${resultData.color} text-white p-8 text-center`}>
            <div className="text-8xl mb-4">{resultData.emoji}</div>
            <h3 className="text-2xl font-bold mb-2">{resultData.message}</h3>
            <div className="text-lg opacity-90">Bạn đã hoàn thành quiz!</div>
          </div>
          
          {/* Results */}
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="text-3xl font-bold text-gray-800 mb-2">
                    {score}
                  </div>
                  <div className="text-sm text-gray-600">Câu đúng</div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="text-3xl font-bold text-gray-800 mb-2">
                    {totalQuestions}
                  </div>
                  <div className="text-sm text-gray-600">Tổng số câu</div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className={`text-3xl font-bold bg-gradient-to-r ${resultData.color} bg-clip-text text-transparent mb-2`}>
                    {percentage}%
                  </div>
                  <div className="text-sm text-gray-600">Độ chính xác</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-4 mb-6 overflow-hidden">
                <div 
                  className={`bg-gradient-to-r ${resultData.color} h-4 rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
            
            {/* Performance Analysis */}
            <div className={`bg-gradient-to-r ${resultData.bgColor} rounded-2xl p-6 mb-8 border ${resultData.color.includes('yellow') ? 'border-yellow-200' : resultData.color.includes('green') ? 'border-green-200' : resultData.color.includes('blue') ? 'border-blue-200' : 'border-red-200'}`}>
              <h4 className="font-bold text-gray-800 mb-3">📊 Phân tích kết quả</h4>
              <div className="text-sm text-gray-700">
                {percentage >= 90 && "Bạn có kiến thức từ vựng N5 rất xuất sắc! Hãy thử thách bản thân với N4."}
                {percentage >= 70 && percentage < 90 && "Bạn đã nắm vững phần lớn từ vựng N5. Ôn tập thêm một chút nữa là hoàn hảo!"}
                {percentage >= 50 && percentage < 70 && "Bạn đã có nền tảng tốt. Hãy dành thêm thời gian ôn tập từ vựng mỗi ngày."}
                {percentage < 50 && "Đừng nản lòng! Học từ vựng cần thời gian. Hãy bắt đầu với 5-10 từ mỗi ngày."}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={onRestart}
                className={`flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r ${resultData.color} text-white px-6 py-4 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 font-medium`}
              >
                <RotateCcw className="w-5 h-5" />
                <span>Làm lại Quiz</span>
              </button>
              <button
                onClick={onHome}
                className="flex-1 flex items-center justify-center space-x-2 bg-gray-500 text-white px-6 py-4 rounded-xl hover:bg-gray-600 transition-colors font-medium"
              >
                <Home className="w-5 h-5" />
                <span>Về trang chủ Quiz</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuizQuestion = ({ question, currentIndex, totalQuestions, score, onAnswer, selectedAnswer }) => {
  const progressPercentage = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        {/* Progress Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center space-x-6 mb-6">
            <div className="flex items-center space-x-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full font-medium">
              <Clock className="w-4 h-4" />
              <span>Câu {currentIndex + 1}/{totalQuestions}</span>
            </div>
            <div className="flex items-center space-x-2 bg-green-100 text-green-600 px-4 py-2 rounded-full font-medium">
              <Trophy className="w-4 h-4" />
              <span>Điểm: {score}</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {Math.round(progressPercentage)}% hoàn thành
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Question Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 text-center">
            <h3 className="text-xl font-medium mb-6 opacity-90">
              Nghĩa của từ này là gì?
            </h3>
            <div className="text-7xl font-bold mb-4 font-serif">
              {question.question}
            </div>
            <div className="text-2xl opacity-90 font-medium">
              {question.hiragana}
            </div>
          </div>

          {/* Answer Options */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {question.options.map((option, index) => {
                let buttonClass = "group relative w-full p-6 rounded-2xl border-2 font-medium text-lg transition-all duration-300 text-left ";
                
                if (selectedAnswer === null) {
                  buttonClass += "border-gray-200 hover:border-purple-400 hover:bg-purple-50 hover:shadow-lg transform hover:-translate-y-1 bg-white";
                } else if (option === question.correctAnswer) {
                  buttonClass += "border-green-500 bg-green-100 text-green-700 shadow-lg transform scale-105";
                } else if (option === selectedAnswer) {
                  buttonClass += "border-red-500 bg-red-100 text-red-700 shadow-lg";
                } else {
                  buttonClass += "border-gray-200 bg-gray-50 text-gray-500 opacity-60";
                }

                return (
                  <button
                    key={index}
                    onClick={() => selectedAnswer === null && onAnswer(option)}
                    disabled={selectedAnswer !== null}
                    className={buttonClass}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                        selectedAnswer === null 
                          ? 'border-purple-300 text-purple-600 group-hover:border-purple-500 group-hover:text-purple-700'
                          : option === question.correctAnswer 
                            ? 'border-green-500 bg-green-500 text-white'
                            : option === selectedAnswer
                              ? 'border-red-500 bg-red-500 text-white'
                              : 'border-gray-300 text-gray-400'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="flex-1">{option}</span>
                    </div>
                    
                    {selectedAnswer === null && (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Result Feedback */}
            {selectedAnswer && (
              <div className="mt-8 text-center">
                <div className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full font-semibold text-lg ${
                  selectedAnswer === question.correctAnswer 
                    ? 'bg-green-100 text-green-600 border-2 border-green-200' 
                    : 'bg-red-100 text-red-600 border-2 border-red-200'
                }`}>
                  <span className="text-2xl">
                    {selectedAnswer === question.correctAnswer ? '✅' : '❌'}
                  </span>
                  <span>
                    {selectedAnswer === question.correctAnswer 
                      ? 'Chính xác! Tuyệt vời!' 
                      : `Sai rồi! Đáp án đúng là: ${question.correctAnswer}`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const QuizPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizData, setQuizData] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);

  const generateQuiz = () => {
    const shuffled = [...vocabularyN5].sort(() => 0.5 - Math.random());
    const quiz = shuffled.slice(0, 10).map(word => {
      const wrongAnswers = vocabularyN5
        .filter(w => w.meaning !== word.meaning)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(w => w.meaning);
      
      const allAnswers = [word.meaning, ...wrongAnswers].sort(() => 0.5 - Math.random());
      
      return {
        question: word.japanese,
        hiragana: word.hiragana,
        correctAnswer: word.meaning,
        options: allAnswers
      };
    });
    
    setQuizData(quiz);
    setQuizStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
  };

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    if (answer === quizData[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
    
    setTimeout(() => {
      if (currentQuestion < quizData.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 2000);
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setQuizData([]);
  };

  if (!quizStarted) {
    return <QuizStartScreen onStart={generateQuiz} />;
  }

  if (showResult) {
    const percentage = Math.round((score / quizData.length) * 100);
    return (
      <QuizResultScreen
        score={score}
        totalQuestions={quizData.length}
        percentage={percentage}
        onRestart={generateQuiz}
        onHome={resetQuiz}
      />
    );
  }

  const question = quizData[currentQuestion];

  return (
    <QuizQuestion
      question={question}
      currentIndex={currentQuestion}
      totalQuestions={quizData.length}
      score={score}
      onAnswer={handleAnswer}
      selectedAnswer={selectedAnswer}
    />
  );
};

export default QuizPage;