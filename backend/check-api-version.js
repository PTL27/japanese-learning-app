const express = require('express');
const jwt = require('jsonwebtoken');

// Create a test token for user 3
const testToken = jwt.sign({ userId: 3 }, 'your-super-secret-jwt-key-change-this-in-production');

console.log('Test token:', testToken);

// Test the API endpoint
const testAPI = async () => {
  try {
    const response = await fetch('http://localhost:5001/api/quiz/stats/N5', {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.stats.quiz_progress) {
      console.log('Quiz progress first item keys:', Object.keys(data.stats.quiz_progress[0] || {}));
    }
  } catch (error) {
    console.error('Error testing API:', error);
  }
};

testAPI();