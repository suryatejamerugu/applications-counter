import { useState, useEffect } from 'react';
import DailyCounter from '@/components/DailyCounter';
import StreakTracker from '@/components/StreakTracker';
import Analytics from '@/components/Analytics';
import WeeklyOverview from '@/components/WeeklyOverview';
import { getStoredData, saveApplicationData, getTodaysCount, updateTodaysCount } from '@/lib/database';
import { Copyright, Sun, Moon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
const Index = () => {
  const [todayCount, setTodayCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [applicationData, setApplicationData] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(true);
  useEffect(() => {
    // Load theme preference or set default to dark
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }

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
    const checkMidnightReset = () => {
      const now = new Date();
      const lastResetDate = localStorage.getItem('lastResetDate');
      const today = now.toDateString();
      if (lastResetDate !== today) {
        const yesterdayCount = getTodaysCount();
        if (yesterdayCount > 0) {
          saveApplicationData(yesterdayCount);
          const storedData = getStoredData();
          const newStreak = (storedData.streak || 0) + 1;
          setStreak(newStreak);
          localStorage.setItem('streak', newStreak.toString());
        } else {
          setStreak(0);
          localStorage.setItem('streak', '0');
        }
        setTodayCount(0);
        updateTodaysCount(0);
        localStorage.setItem('lastResetDate', today);
        const updatedData = getStoredData();
        setApplicationData(updatedData.applications || []);
      }
    };
    checkMidnightReset();
    const interval = setInterval(checkMidnightReset, 60000);
    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);
  useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  const handleCountChange = (newCount: number) => {
    setTodayCount(newCount);
    updateTodaysCount(newCount);
  };
  const handleStreakChange = (newStreak: number) => {
    setStreak(newStreak);
    localStorage.setItem('streak', newStreak.toString());
  };
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
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
  const {
    date,
    time
  } = formatDateTime(currentDateTime);
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-mono transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 px-4 py-6 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Job Application Counter</h1>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                
                
              </div>
            </div>
            
            {/* Theme Toggle */}
            <div className="flex items-center space-x-2">
              <Sun className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              <Switch checked={isDarkMode} onCheckedChange={toggleTheme} className="data-[state=checked]:bg-blue-600" />
              <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Counters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DailyCounter count={todayCount} onCountChange={handleCountChange} />
            <StreakTracker streak={streak} onStreakChange={handleStreakChange} />
            <WeeklyOverview applicationData={applicationData} />
          </div>

          {/* Analytics */}
          <Analytics applicationData={applicationData} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-4 py-6 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
            <Copyright className="w-4 h-4 mr-2" />
            <span>Developed by Surya Teja Merugu. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;