import { useState, useEffect } from 'react';
import TodaysApplicationsCard from '@/components/TodaysApplicationsCard';
import DaysAppliedCard from '@/components/DaysAppliedCard';
import Analytics from '@/components/Analytics';
import WeeklyOverview from '@/components/WeeklyOverview';
import ProgressTracker from '@/components/ProgressTracker';
import { getStoredData, saveApplicationData, getTodaysCount, updateTodaysCount, clearDateData } from '@/lib/database';
import { Copyright, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const [todayCount, setTodayCount] = useState(0);
  const [applicationData, setApplicationData] = useState([]);
  const [manualDaysOffset, setManualDaysOffset] = useState(0);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  useEffect(() => {
    // Clear the incorrect Saturday data on first load
    const fixIncorrectData = () => {
      const saturdayDate = 'Sat Jul 05 2025';
      const storedData = getStoredData();
      const saturdayEntry = storedData.applications.find(app => app.date === saturdayDate);
      
      // If Saturday has data but it shouldn't (based on user's report), clear it
      if (saturdayEntry && saturdayEntry.count > 0) {
        console.log(`Clearing incorrect data for ${saturdayDate}: ${saturdayEntry.count} applications`);
        clearDateData(saturdayDate);
      }
    };
    
    fixIncorrectData();
    
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
        
        // Only save to historical data if there were actually applications yesterday
        // AND if the last reset was actually yesterday (not from an old session)
        if (yesterdayCount > 0 && lastResetDate) {
          const lastReset = new Date(lastResetDate);
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          
          // Only save if lastResetDate was actually yesterday
          if (lastReset.toDateString() === yesterday.toDateString()) {
            console.log(`Saving yesterday's count: ${yesterdayCount} for ${lastResetDate}`);
            saveApplicationData(yesterdayCount, lastResetDate);
          } else {
            console.log(`Not saving stale count. Last reset: ${lastResetDate}, Expected: ${yesterday.toDateString()}`);
          }
        }
        
        // Reset today's count
        setTodayCount(0);
        updateTodaysCount(0);
        localStorage.setItem('lastResetDate', today);
        
        // Reload data to reflect changes
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

  const handleLogoClick = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
              <div 
                className="flex items-center justify-center gap-3 cursor-pointer group transition-all duration-300 hover:scale-105"
                onClick={handleLogoClick}
              >
                <img 
                  src="/lovable-uploads/cffb4d01-9b58-44eb-9119-72b0b0aa25ca.png" 
                  alt="Applications Counter Logo" 
                  className="w-8 h-8 object-contain transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
                />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Applications Counter
                </h1>
              </div>
            </div>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-110 active:scale-95"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 transition-transform duration-300 hover:rotate-12" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Responsive Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Single column on all sizes */}
            <div className="space-y-6">
              {/* Today's Applications Card */}
              <TodaysApplicationsCard 
                count={todayCount} 
                onCountChange={handleCountChange} 
                applicationData={applicationData}
              />

              {/* Days Applied Card */}
              <DaysAppliedCard 
                applicationData={applicationData} 
                todayCount={todayCount}
                manualDaysOffset={manualDaysOffset}
                onManualDaysChange={handleManualDaysChange}
              />

              {/* Weekly Overview Card - Only on large screens in left column */}
              <div className="hidden lg:block">
                <WeeklyOverview 
                  applicationData={applicationData} 
                  todayCount={todayCount} 
                />
              </div>
            </div>

            {/* Middle Column - Analytics and Progress Tracker with matching heights */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Weekly Overview Card - Only on medium and small screens */}
              <div className="lg:hidden">
                <WeeklyOverview 
                  applicationData={applicationData} 
                  todayCount={todayCount} 
                />
              </div>

              {/* Analytics and Progress Tracker - Equal height flex container */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Analytics Card */}
                <Analytics 
                  applicationData={applicationData} 
                  todayCount={todayCount}
                />

                {/* Progress Tracker Card */}
                <ProgressTracker 
                  todayCount={todayCount}
                />
              </div>

            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-4 py-4 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300 hover:text-gray-800 dark:hover:text-gray-100">
            <Copyright className="w-4 h-4 mr-2 transition-transform duration-300 hover:rotate-12" />
            <span className="hover:scale-105 transition-transform duration-300 cursor-default">
              Developed by Surya Teja Merugu. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
