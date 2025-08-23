const { initDatabase } = require('../database/database');
const express = require('express');
const weeklyChallenge = require('../routes/weekly-challenge');

async function testLeaderboardAPI() {
  try {
    await initDatabase();
    
    // Test for both weeks
    const weeks = ['2025-08-17', '2025-08-20'];
    
    for (const week of weeks) {
      console.log(`\n🗓️ Testing leaderboard for week: ${week}`);
      
      // Simulate API call
      const fetch = (await import('node-fetch')).default;
      
      try {
        const response = await fetch(`http://localhost:5001/api/weekly-challenge/leaderboard/N5?week=${week}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        console.log(`📊 API Response:`, JSON.stringify(data, null, 2));
        
      } catch (fetchError) {
        console.log('❌ API call failed, server might not be running:', fetchError.message);
      }
    }
    
    // Also test current week (without week parameter)
    console.log(`\n🗓️ Testing current week leaderboard (default):`);
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(`http://localhost:5001/api/weekly-challenge/leaderboard/N5`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log(`📊 Current week API Response:`, JSON.stringify(data, null, 2));
      
    } catch (fetchError) {
      console.log('❌ Current week API call failed:', fetchError.message);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testLeaderboardAPI();