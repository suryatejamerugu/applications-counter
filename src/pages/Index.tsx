import { useState, useEffect } from 'react';
import DailyCounter from '@/components/DailyCounter';
import DaysApplied from '@/components/DaysApplied';
import Analytics from '@/components/Analytics';
import WeeklyOverview from '@/components/WeeklyOverview';
import { getStoredData, saveApplicationData, getTodaysCount, updateTodaysCount } from '@/lib/database';
import { Copyright, Sun, Moon } from 'lucide-react';

const Index = () => {
  const [todayCount, setTodayCount] = useState(0);
  const [applicationData, setApplicationData] = useState([]);
  const [manualDaysOffset, setManualDaysOffset] = useState(0);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  useEffect(() => {
    // Update date/time every second
    const timeInterval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    // Load data on component mount
    const loadData = () => {
      const storedData = getStoredData();
      setTodayCount(getTodaysCount());
      setApplicationData(storedData.applications || []);
      
      // Load manual days offset
      const savedOffset = localStorage.getItem('manualDaysOffset');
      setManualDaysOffset(savedOffset ? parseInt(savedOffset, 10) : 0);
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
    // Apply theme to document and persist
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

  const handleManualDaysChange = (offset: number) => {
    setManualDaysOffset(offset);
    localStorage.setItem('manualDaysOffset', offset.toString());
  };

  const { date, time } = formatDateTime(currentDateTime);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-mono transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 px-4 py-4 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Applications Counter</h1>
            </div>
            
            {/* Theme Toggle - Icons Only */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Compact Layout */}
      <main className="flex-1 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Combined Days Applied & Today's Applications */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full">
                <div className="space-y-8">
                  {/* Days Applied Section - Now on top */}
                  <div className="text-center">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                      Days Applied
                    </h2>
                    <DaysApplied 
                      applicationData={applicationData} 
                      todayCount={todayCount}
                      manualDaysOffset={manualDaysOffset}
                      onManualDaysChange={handleManualDaysChange}
                    />
                  </div>

                  <div className="border-t dark:border-gray-700"></div>

                  {/* Today's Applications Section - Now below */}
                  <div className="text-center">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                      Today's Applications
                    </h2>
                    <DailyCounter 
                      count={todayCount} 
                      onCountChange={handleCountChange} 
                      applicationData={applicationData}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column - Weekly Overview */}
            <div className="lg:col-span-1">
              <WeeklyOverview 
                applicationData={applicationData} 
                todayCount={todayCount} 
              />
            </div>

            {/* Right Column - Analytics */}
            <div className="lg:col-span-1">
              <Analytics 
                applicationData={applicationData} 
                todayCount={todayCount}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-4 py-4 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
            <Copyright className="w-4 h-4 mr-2" />
            <span>Developed by Surya Teja Merugu. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
