
import { useState, useEffect } from 'react';
import DailyCounter from '@/components/DailyCounter';
import StreakTracker from '@/components/StreakTracker';
import Analytics from '@/components/Analytics';
import WeeklyOverview from '@/components/WeeklyOverview';
import { getStoredData, saveApplicationData, getTodaysCount, updateTodaysCount } from '@/lib/database';

const Index = () => {
  const [todayCount, setTodayCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [applicationData, setApplicationData] = useState([]);

  useEffect(() => {
    // Load data on component mount
    const loadData = () => {
      const storedData = getStoredData();
      setTodayCount(getTodaysCount());
      setStreak(storedData.streak || 0);
      setApplicationData(storedData.applications || []);
    };

    loadData();

    // Check for midnight reset
    const checkMidnightReset = () => {
      const now = new Date();
      const lastResetDate = localStorage.getItem('lastResetDate');
      const today = now.toDateString();

      if (lastResetDate !== today) {
        // It's a new day, save yesterday's count and reset
        const yesterdayCount = getTodaysCount();
        if (yesterdayCount > 0) {
          saveApplicationData(yesterdayCount);
          // Update streak if applications were made yesterday
          const storedData = getStoredData();
          const newStreak = (storedData.streak || 0) + 1;
          setStreak(newStreak);
          localStorage.setItem('streak', newStreak.toString());
        } else {
          // Break streak if no applications yesterday
          setStreak(0);
          localStorage.setItem('streak', '0');
        }
        
        // Reset today's count
        setTodayCount(0);
        updateTodaysCount(0);
        localStorage.setItem('lastResetDate', today);
        
        // Reload application data
        const updatedData = getStoredData();
        setApplicationData(updatedData.applications || []);
      }
    };

    checkMidnightReset();

    // Set up interval to check for midnight every minute
    const interval = setInterval(checkMidnightReset, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleCountChange = (newCount: number) => {
    setTodayCount(newCount);
    updateTodaysCount(newCount);
  };

  const handleStreakChange = (newStreak: number) => {
    setStreak(newStreak);
    localStorage.setItem('streak', newStreak.toString());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Job Application Tracker
          </h1>
          <p className="text-gray-600">
            Track your daily applications and visualize your progress
          </p>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Today's Counter */}
          <div className="lg:col-span-1">
            <DailyCounter 
              count={todayCount} 
              onCountChange={handleCountChange}
            />
          </div>

          {/* Streak Tracker */}
          <div className="lg:col-span-1">
            <StreakTracker 
              streak={streak} 
              onStreakChange={handleStreakChange}
            />
          </div>

          {/* Weekly Overview */}
          <div className="lg:col-span-1">
            <WeeklyOverview applicationData={applicationData} />
          </div>
        </div>

        {/* Analytics Section */}
        <div className="mb-8">
          <Analytics applicationData={applicationData} />
        </div>
      </div>
    </div>
  );
};

export default Index;
