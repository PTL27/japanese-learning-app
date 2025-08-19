import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('message');
      
      if (error) {
        setStatus('error');
        switch (error) {
          case 'google_auth_failed':
            setMessage('Google authentication failed. Please try again.');
            break;
          case 'microsoft_auth_failed':
            setMessage('Microsoft authentication failed. Please try again.');
            break;
          default:
            setMessage('Authentication failed. Please try again.');
        }
        return;
      }
      
      if (token) {
        try {
          // Store token in localStorage
          localStorage.setItem('jwt_token', token);
          
          // Verify token with backend
          const response = await fetch('http://localhost:5001/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          const data = await response.json();
          
          if (data.success) {
            setStatus('success');
            setMessage(`Welcome back, ${data.user.name}!`);
            
            // Redirect to main app after 2 seconds
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
          } else {
            throw new Error('Invalid token');
          }
        } catch (error) {
          console.error('OAuth callback error:', error);
          setStatus('error');
          setMessage('Authentication verification failed. Please try logging in again.');
          localStorage.removeItem('jwt_token');
        }
      } else {
        setStatus('error');
        setMessage('No authentication token received.');
      }
    };
    
    handleCallback();
  }, [searchParams, login, navigate]);

  const handleRetry = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
          {status === 'loading' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Processing Login...
              </h1>
              <p className="text-gray-600">
                Please wait while we complete your authentication.
              </p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Login Successful! 🎉
              </h1>
              <p className="text-gray-600 mb-4">
                {message}
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to your dashboard...
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Authentication Failed
              </h1>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <button
                onClick={handleRetry}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;