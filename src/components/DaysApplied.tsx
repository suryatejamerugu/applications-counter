
interface ApplicationData {
  date: string;
  count: number;
}

interface DaysAppliedProps {
  applicationData: ApplicationData[];
  todayCount: number;
}

const DaysApplied = ({ applicationData, todayCount }: DaysAppliedProps) => {
  const calculateDaysApplied = () => {
    // Count unique days from historical data
    const historicalDays = applicationData.filter(app => app.count > 0).length;
    
    // Add today if there are applications today and it's not already in historical data
    const today = new Date().toDateString();
    const todayInHistory = applicationData.some(app => app.date === today);
    const shouldAddToday = todayCount > 0 && !todayInHistory;
    
    return historicalDays + (shouldAddToday ? 1 : 0);
  };

  const daysApplied = calculateDaysApplied();

  const getDaysAppliedColor = () => {
    if (daysApplied >= 30) return 'from-yellow-400 to-orange-500';
    if (daysApplied >= 14) return 'from-green-400 to-blue-500';
    if (daysApplied >= 7) return 'from-blue-400 to-purple-500';
    return 'from-gray-400 to-gray-600';
  };

  const getDaysAppliedText = () => {
    if (daysApplied >= 30) return 'Amazing consistency!';
    if (daysApplied >= 14) return 'Great progress!';
    if (daysApplied >= 7) return 'Good momentum!';
    return 'Keep it up!';
  };

  return (
    <div className="space-y-3">
      {/* Days Applied Display - Compact */}
      <div className={`bg-gradient-to-r ${getDaysAppliedColor()} rounded-xl p-6 text-white`}>
        <div className="text-4xl font-bold mb-1 font-mono">
          {daysApplied}
        </div>
        <div className="text-sm opacity-90">
          {daysApplied === 1 ? 'Day Applied' : 'Days Applied'}
        </div>
        <div className="text-xs mt-1 opacity-80">
          {getDaysAppliedText()}
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Total unique days you applied to jobs
      </div>
    </div>
  );
};

export default DaysApplied;
