import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Award, Save, Edit3, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    age: user?.age || '',
    japaneseLevel: user?.japaneseLevel || 'N5'
  });

  const japaneseeLevels = [
    { value: 'N5', label: 'N5 - Cơ bản', description: 'Hiểu được tiếng Nhật cơ bản' },
    { value: 'N4', label: 'N4 - Sơ cấp', description: 'Hiểu được tiếng Nhật cơ bản' },
    { value: 'N3', label: 'N3 - Trung cấp', description: 'Hiểu được tiếng Nhật ở mức độ trung bình' },
    { value: 'N2', label: 'N2 - Trung cấp cao', description: 'Hiểu được tiếng Nhật khá tốt' },
    { value: 'N1', label: 'N1 - Cao cấp', description: 'Thành thạo tiếng Nhật' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Vui lòng nhập tên');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Vui lòng nhập email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email không hợp lệ');
      return false;
    }

    if (formData.age && (formData.age < 13 || formData.age > 100)) {
      setError('Tuổi phải từ 13 đến 100');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        age: formData.age ? parseInt(formData.age) : null,
        japaneseLevel: formData.japaneseLevel
      });

      if (result.success) {
        setSuccess('Cập nhật thông tin thành công!');
        setIsEditing(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      age: user?.age || '',
      japaneseLevel: user?.japaneseLevel || 'N5'
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không có thông tin';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getLevelColor = (level) => {
    const colors = {
      'N5': 'from-blue-500 to-cyan-600',
      'N4': 'from-orange-500 to-amber-600',
      'N3': 'from-purple-500 to-violet-600',
      'N2': 'from-green-500 to-emerald-600',
      'N1': 'from-red-500 to-pink-600'
    };
    return colors[level] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-white text-2xl font-bold mb-4 border-4 border-white shadow-lg">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Thông tin cá nhân
          </h1>
          <p className="text-gray-600">
            Quản lý thông tin tài khoản và cấp độ tiếng Nhật của bạn
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
                <p className="text-gray-600 text-sm">{user?.email}</p>
              </div>

              {/* Japanese Level Badge */}
              <div className="text-center mb-6">
                <div className={`inline-flex items-center space-x-2 bg-gradient-to-r ${getLevelColor(user?.japaneseLevel)} text-white px-4 py-2 rounded-full font-medium shadow-lg`}>
                  <Award className="w-5 h-5" />
                  <span>JLPT {user?.japaneseLevel || 'N5'}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {japaneseeLevels.find(l => l.value === user?.japaneseLevel)?.description || 'Cấp độ tiếng Nhật'}
                </p>
              </div>

              {/* Account Info */}
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span>Tài khoản tạo:</span>
                  <span className="font-medium">{formatDate(user?.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span>Cập nhật cuối:</span>
                  <span className="font-medium">{formatDate(user?.updatedAt)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span>ID người dùng:</span>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">#{user?.id}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa thông tin'}</span>
                </button>
                <button
                  onClick={() => window.location.hash = 'change-password'}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-gray-700 transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  <span>Đổi mật khẩu</span>
                </button>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              {success && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-green-800 text-sm font-medium">
                    {success}
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-red-800 text-sm font-medium">
                    {error}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên đầy đủ <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                            !isEditing ? 'bg-gray-50 text-gray-600' : ''
                          }`}
                          placeholder="Nhập tên đầy đủ"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                            !isEditing ? 'bg-gray-50 text-gray-600' : ''
                          }`}
                          placeholder="Nhập địa chỉ email"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tuổi
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          name="age"
                          value={formData.age}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                            !isEditing ? 'bg-gray-50 text-gray-600' : ''
                          }`}
                          placeholder="Nhập tuổi"
                          min="13"
                          max="100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                            !isEditing ? 'bg-gray-50 text-gray-600' : ''
                          }`}
                          placeholder="Nhập số điện thoại"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                          !isEditing ? 'bg-gray-50 text-gray-600' : ''
                        }`}
                        placeholder="Nhập địa chỉ"
                      />
                    </div>
                  </div>
                </div>

                {/* Japanese Level */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Cấp độ tiếng Nhật</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Cấp độ JLPT hiện tại
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      {japaneseeLevels.map((level) => (
                        <label
                          key={level.value}
                          className={`cursor-pointer ${!isEditing ? 'cursor-not-allowed' : ''}`}
                        >
                          <input
                            type="radio"
                            name="japaneseLevel"
                            value={level.value}
                            checked={formData.japaneseLevel === level.value}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="sr-only"
                          />
                          <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            formData.japaneseLevel === level.value
                              ? `border-transparent bg-gradient-to-r ${getLevelColor(level.value)} text-white shadow-lg`
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          } ${!isEditing ? 'opacity-60' : ''}`}>
                            <div className="text-center">
                              <div className="font-bold text-lg mb-1">{level.value}</div>
                              <div className={`text-xs ${formData.japaneseLevel === level.value ? 'text-white/90' : 'text-gray-600'}`}>
                                {level.label.split(' - ')[1]}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Chọn cấp độ JLPT hiện tại của bạn để nhận nội dung học phù hợp
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-600 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Đang cập nhật...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span>Lưu thay đổi</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Learning Progress Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">📊 Thống kê học tập</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-blue-900">Hiragana & Katakana</h4>
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-2">92/92</div>
              <div className="text-sm text-blue-700">Ký tự đã học</div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-green-900">Từ vựng N5</h4>
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600 mb-2">20/100</div>
              <div className="text-sm text-green-700">Từ đã học</div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-purple-900">Quiz hoàn thành</h4>
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-2">5</div>
              <div className="text-sm text-purple-700">Bài quiz</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;