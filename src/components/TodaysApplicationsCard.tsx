
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ApplicationData {
  date: string;
  count: number;
}

interface TodaysApplicationsCardProps {
  count: number;
  onCountChange: (count: number) => void;
  applicationData: ApplicationData[];
}

const TodaysApplicationsCard = ({ count, onCountChange, applicationData }: TodaysApplicationsCardProps) => {
  const increment = () => {
    if (count < 999) {
      onCountChange(count + 1);
    }
  };

  const decrement = () => {
    if (count > 0) {
      onCountChange(count - 1);
    }
  };

  const reset = () => {
    onCountChange(0);
  };

  const getCountColor = () => {
    if (count >= 50) return 'from-yellow-400 to-orange-500';
    if (count >= 25) return 'from-green-400 to-blue-500';
    if (count >= 10) return 'from-blue-400 to-purple-500';
    return 'from-gray-400 to-gray-600';
  };

  const getCountText = () => {
    if (count >= 50) return 'Excellent!';
    if (count >= 25) return 'Great job!';
    if (count >= 10) return 'Good work!';
    return 'Keep going!';
  };

  const getLastApplicationDate = () => {
    if (applicationData.length === 0) return null;
    
    const sortedData = [...applicationData].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const lastEntry = sortedData[0];
    if (lastEntry && lastEntry.count > 0) {
      const date = new Date(lastEntry.date);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
    
    return null;
  };

  const lastApplicationDate = getLastApplicationDate();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      <div className="space-y-4">
        {/* Header */}
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400">
          Today's Applications
        </h2>

        {/* Counter Display */}
        <div className={`bg-gradient-to-r ${getCountColor()} rounded-xl p-6 text-white transition-all duration-300 hover:scale-105`}>
          <div className="text-4xl font-bold mb-1 font-mono">
            {count}
          </div>
          <div className="text-sm opacity-90">
            {count === 1 ? 'Application' : 'Applications'}
          </div>
          <div className="text-xs mt-1 opacity-80">
            {getCountText()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-2">
          <Button
            onClick={decrement}
            disabled={count <= 0}
            size="sm"
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 font-mono hover:scale-110 active:scale-95"
          >
            <Minus className="w-4 h-4" />
          </Button>

          <Button
            onClick={reset}
            variant="outline"
            size="sm"
            className="px-3 py-2 rounded-lg border border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 transition-all duration-200 font-mono text-xs hover:scale-105"
          >
            Reset
          </Button>

          <Button
            onClick={increment}
            disabled={count >= 999}
            size="sm"
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 font-mono hover:scale-110 active:scale-95"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Info Section */}
        <div className="space-y-1 text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Applications submitted today
          </div>
          {lastApplicationDate && (
            <div className="text-xs text-gray-400 dark:text-gray-500">
              Last: {lastApplicationDate}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodaysApplicationsCard;
