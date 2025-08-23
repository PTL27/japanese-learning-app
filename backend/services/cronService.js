const cron = require('node-cron');
const { rotateWeeklyChallenges, getChallengeStats } = require('./weeklyChallengeService');

class CronService {
  constructor() {
    this.jobs = {};
    this.isRunning = false;
  }

  // Start all cron jobs
  start() {
    if (this.isRunning) {
      console.log('⚠️ Cron service is already running');
      return;
    }

    console.log('🚀 Starting Cron Service...');
    this.setupWeeklyChallengeRotation();
    this.isRunning = true;
    console.log('✅ Cron Service started successfully');
  }

  // Stop all cron jobs
  stop() {
    console.log('🛑 Stopping Cron Service...');
    
    Object.keys(this.jobs).forEach(jobName => {
      if (this.jobs[jobName]) {
        this.jobs[jobName].stop();
        console.log(`  ✅ Stopped job: ${jobName}`);
      }
    });
    
    this.jobs = {};
    this.isRunning = false;
    console.log('✅ Cron Service stopped');
  }

  // Setup weekly challenge rotation job
  setupWeeklyChallengeRotation() {
    // Run every Monday at 00:00 (midnight)
    // Cron expression: '0 0 * * 1' 
    // Second Minute Hour Day Month DayOfWeek
    //   0      0     *   *    *       1 (Monday)
    
    const cronExpression = '0 0 * * 1'; // Every Monday at midnight
    
    console.log(`📅 Scheduling Weekly Challenge rotation: ${cronExpression} (every Monday at 00:00)`);
    
    this.jobs.weeklyChallengeRotation = cron.schedule(cronExpression, async () => {
      console.log(`\n🕛 [${new Date().toISOString()}] Running Weekly Challenge rotation...`);
      
      try {
        const result = await rotateWeeklyChallenges();
        
        if (result.success) {
          console.log(`✅ Weekly Challenge rotation completed successfully`);
          console.log(`📊 Summary: ${result.createdCount} challenges created for ${result.nextWeek}`);
        } else {
          console.error(`❌ Weekly Challenge rotation failed: ${result.error}`);
        }
      } catch (error) {
        console.error('❌ Unexpected error during Weekly Challenge rotation:', error);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Ho_Chi_Minh" // Vietnam timezone
    });

    console.log('✅ Weekly Challenge rotation job scheduled');
    
    // For testing/demo purposes, also run a daily check at 09:00
    // This helps ensure the system is working and provides daily logs
    this.jobs.dailyHealthCheck = cron.schedule('0 9 * * *', async () => {
      try {
        console.log(`\n🔍 [${new Date().toISOString()}] Daily health check for Weekly Challenges`);
        const stats = await getChallengeStats();
        
        console.log('📊 Current challenge statistics:');
        stats.forEach(stat => {
          const status = stat.is_active ? '🟢 ACTIVE' : '🔴 ARCHIVED';
          console.log(`  ${stat.week_start_date} ${stat.jlpt_level}: ${status} (${Math.floor(stat.data_size/1000)}KB)`);
        });
        
        // Check if current week has challenges
        const today = new Date();
        const currentMonday = new Date(today.setDate(today.getDate() - today.getDay() + 1)).toISOString().split('T')[0];
        const currentWeekChallenges = stats.filter(s => s.week_start_date === currentMonday && s.is_active);
        
        if (currentWeekChallenges.length === 0) {
          console.log(`⚠️ No active challenges found for current week (${currentMonday})`);
        } else {
          console.log(`✅ Current week (${currentMonday}) has ${currentWeekChallenges.length} active challenges`);
        }
        
      } catch (error) {
        console.error('❌ Error during daily health check:', error);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Ho_Chi_Minh"
    });
    
    console.log('✅ Daily health check job scheduled (09:00 every day)');
  }

  // Manual trigger for testing
  async triggerWeeklyChallengeRotation() {
    console.log('🔧 Manually triggering Weekly Challenge rotation...');
    
    try {
      const result = await rotateWeeklyChallenges();
      console.log('📊 Manual rotation result:', result);
      return result;
    } catch (error) {
      console.error('❌ Manual rotation failed:', error);
      throw error;
    }
  }

  // Get job status
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: Object.keys(this.jobs).length,
      jobs: Object.keys(this.jobs).map(jobName => ({
        name: jobName,
        running: this.jobs[jobName] ? this.jobs[jobName].running : false
      }))
    };
  }
}

// Export singleton instance
const cronService = new CronService();

module.exports = cronService;