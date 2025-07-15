
import { Plus, Minus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ApplicationData {
  date: string;
  count: number;
}

interface DaysAppliedCardProps {
  applicationData: ApplicationData[];
  todayCount: number;
  manualDaysOffset: number;
  onManualDaysChange: (offset: number) => void;
}

const DaysAppliedCard = ({ applicationData, todayCount, manualDaysOffset, onManualDaysChange }: DaysAppliedCardProps) => {
  const calculateDaysApplied = () => {
    const historicalDays = applicationData.filter(app => app.count > 0).length;
    const today = new Date().toDateString();
    const todayInHistory = applicationData.some(app => app.date === today);
    const shouldAddToday = todayCount > 0 && !todayInHistory;
    
    return historicalDays + (shouldAddToday ? 1 : 0) + manualDaysOffset;
  };

  const daysApplied = Math.max(0, calculateDaysApplied());

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

  const incrementDays = () => {
    onManualDaysChange(manualDaysOffset + 1);
  };

  const decrementDays = () => {
    onManualDaysChange(manualDaysOffset - 1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-500 transition-transform duration-300 hover:rotate-12" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400">
            Days Applied
          </h2>
        </div>

        {/* Days Applied Display */}
        <div className={`bg-gradient-to-r ${getDaysAppliedColor()} rounded-xl p-6 text-white transition-all duration-300 hover:scale-105`}>
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

        {/* Manual Adjustment Buttons */}
        <div className="flex justify-center space-x-2">
          <Button
            onClick={decrementDays}
            size="sm"
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-all duration-200 font-mono hover:scale-110 active:scale-95"
          >
            <Minus className="w-4 h-4" />
          </Button>

          <Button
            onClick={incrementDays}
            size="sm"
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition-all duration-200 font-mono hover:scale-110 active:scale-95"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Total unique days you applied to jobs
        </div>
      </div>
    </div>
  );
};

export default DaysAppliedCard;
