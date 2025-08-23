import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, Star, Clock, Target, Home, RotateCcw } from 'lucide-react';

const WeeklyChallengeResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { result, level } = location.state || {};

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy kết quả</h1>
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

  const { 
    score, 
    total_questions, 
    completion_time, 
    rank_position,
    correct_answers,
    incorrect_answers 
  } = result;

  const scorePercentage = (score / total_questions) * 100;
  const minutes = Math.floor(completion_time / 60);
  const seconds = completion_time % 60;

  // Determine result styling based on score
  let resultData = {};
  if (scorePercentage >= 90) {
    resultData = { 
      message: 'Xuất sắc!', 
      emoji: '🏆', 
      color: 'from-yellow-400 to-orange-500', 
      bgColor: 'from-yellow-50 to-orange-50',
      textColor: 'text-yellow-600'
    };
  } else if (scorePercentage >= 70) {
    resultData = { 
      message: 'Tốt lắm!', 
      emoji: '🎉', 
      color: 'from-green-400 to-emerald-500', 
      bgColor: 'from-green-50 to-emerald-50',
      textColor: 'text-green-600'
    };
  } else if (scorePercentage >= 50) {
    resultData = { 
      message: 'Khá ổn!', 
      emoji: '👍', 
      color: 'from-blue-400 to-indigo-500', 
      bgColor: 'from-blue-50 to-indigo-50',
      textColor: 'text-blue-600'
    };
  } else {
    resultData = { 
      message: 'Cần cố gắng hơn!', 
      emoji: '💪', 
      color: 'from-red-400 to-pink-500', 
      bgColor: 'from-red-50 to-pink-50',
      textColor: 'text-red-600'
    };
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${resultData.bgColor} px-4 py-8`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center space-x-2 bg-gradient-to-r ${resultData.color} text-white px-6 py-2 rounded-full text-sm font-medium mb-6`}>
            <Trophy className="w-4 h-4" />
            <span>Kết quả Thử thách tuần - JLPT {level}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Hoàn thành thử thách!
          </h1>
          <p className="text-xl text-gray-600">
            Xem kết quả chi tiết và xếp hạng của bạn
          </p>
        </div>

        {/* Main Result Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mb-8">
          {/* Result Header */}
          <div className={`bg-gradient-to-r ${resultData.color} text-white p-8 text-center`}>
            <div className="text-8xl mb-4">{resultData.emoji}</div>
            <h2 className="text-3xl font-bold mb-2">{resultData.message}</h2>
            <p className="text-xl opacity-90">Bạn đã hoàn thành thử thách tuần!</p>
          </div>
          
          {/* Score Summary */}
          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center bg-gray-50 rounded-2xl p-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {correct_answers}
                </div>
                <div className="text-sm text-gray-600">Câu đúng</div>
              </div>
              
              <div className="text-center bg-gray-50 rounded-2xl p-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {incorrect_answers}
                </div>
                <div className="text-sm text-gray-600">Câu sai</div>
              </div>
              
              <div className="text-center bg-gray-50 rounded-2xl p-6">
                <div className={`text-3xl font-bold bg-gradient-to-r ${resultData.color} bg-clip-text text-transparent mb-2`}>
                  {scorePercentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Độ chính xác</div>
              </div>
              
              <div className="text-center bg-gray-50 rounded-2xl p-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  #{rank_position}
                </div>
                <div className="text-sm text-gray-600">Xếp hạng</div>
              </div>
            </div>

            {/* Completion Time */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-6 h-6 text-gray-600" />
                <span className="text-lg text-gray-600">Thời gian hoàn thành:</span>
                <span className="text-2xl font-bold text-gray-900">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-8 overflow-hidden">
              <div 
                className={`bg-gradient-to-r ${resultData.color} h-4 rounded-full transition-all duration-2000 ease-out`}
                style={{ width: `${scorePercentage}%` }}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => navigate('/weekly-challenge')}
                className={`flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r ${resultData.color} text-white px-8 py-4 rounded-2xl hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 font-medium`}
              >
                <Trophy className="w-5 h-5" />
                <span>Xem bảng xếp hạng</span>
              </button>
              
              <button
                onClick={() => navigate('/home')}
                className="flex-1 flex items-center justify-center space-x-2 bg-gray-500 text-white px-8 py-4 rounded-2xl hover:bg-gray-600 transition-colors font-medium"
              >
                <Home className="w-5 h-5" />
                <span>Về trang chủ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Performance Analysis */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Target className="w-6 h-6 mr-2 text-blue-500" />
            Phân tích kết quả
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Đánh giá tổng quan:</h4>
              <div className={`p-4 rounded-lg ${resultData.bgColor} ${resultData.textColor}`}>
                {scorePercentage >= 90 && (
                  <p>Bạn có kiến thức từ vựng {level} rất xuất sắc! Hãy thử thách bản thân với cấp độ cao hơn.</p>
                )}
                {scorePercentage >= 70 && scorePercentage < 90 && (
                  <p>Bạn đã nắm vững phần lớn từ vựng {level}. Ôn tập thêm một chút nữa là hoàn hảo!</p>
                )}
                {scorePercentage >= 50 && scorePercentage < 70 && (
                  <p>Bạn đã có nền tảng tốt. Hãy dành thêm thời gian ôn tập từ vựng mỗi ngày.</p>
                )}
                {scorePercentage < 50 && (
                  <p>Đừng nản lòng! Học từ vựng cần thời gian. Hãy bắt đầu với 5-10 từ mỗi ngày.</p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Gợi ý cải thiện:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Ôn tập 10-15 từ mỗi ngày</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Sử dụng từ trong câu để nhớ lâu hơn</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Tham gia thử thách tuần thường xuyên</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Luyện tập với flashcard và quiz</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Weekly Challenge Info */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              🗓️ Thử thách tuần tiếp theo
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Thử thách mới sẽ được cập nhật vào <strong>Thứ 2 lúc 00:00</strong>
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>• Cùng câu hỏi cho tất cả users</span>
              <span>• Xếp hạng theo điểm và thời gian</span>
              <span>• Chỉ được làm 1 lần</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyChallengeResult;