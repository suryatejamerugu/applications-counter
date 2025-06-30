import { useState, useEffect } from 'react';
import DailyCounter from '@/components/DailyCounter';
import StreakTracker from '@/components/StreakTracker';
import Analytics from '@/components/Analytics';
import WeeklyOverview from '@/components/WeeklyOverview';
import { getStoredData, saveApplicationData, getTodaysCount, updateTodaysCount } from '@/lib/database';
import { Copyright } from 'lucide-react';

const Index = () => {
  const [todayCount, setTodayCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [applicationData, setApplicationData] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    // Update date/time every second
    const timeInterval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

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

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const handleCountChange = (newCount: number) => {
    setTodayCount(newCount);
    updateTodaysCount(newCount);
  };

  const handleStreakChange = (newStreak: number) => {
    setStreak(newStreak);
    localStorage.setItem('streak', newStreak.toString());
  };

  const formatDateTime = (date: Date) => {
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      })
    };
  };

  const { date, time } = formatDateTime(currentDateTime);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Job Application Tracker
            </h1>
            <div className="text-sm text-gray-600">
              <div className="font-medium">{date}</div>
              <div className="font-mono">{time}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Counters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DailyCounter 
              count={todayCount} 
              onCountChange={handleCountChange}
            />
            <StreakTracker 
              streak={streak} 
              onStreakChange={handleStreakChange}
            />
            <WeeklyOverview applicationData={applicationData} />
          </div>

          {/* Analytics */}
          <Analytics applicationData={applicationData} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center text-sm text-gray-600">
            <Copyright className="w-4 h-4 mr-2" />
            <span>Developed by Surya Teja. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
