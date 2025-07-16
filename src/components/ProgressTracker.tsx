
import { useState, useEffect } from 'react';
import { Target, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProgressTrackerProps {
  todayCount: number;
}

const ProgressTracker = ({ todayCount }: ProgressTrackerProps) => {
  const [dailyGoal, setDailyGoal] = useState(() => {
    const savedGoal = localStorage.getItem('dailyGoal');
    return savedGoal ? parseInt(savedGoal, 10) : 5;
  });

  const [inputValue, setInputValue] = useState(dailyGoal.toString());

  useEffect(() => {
    localStorage.setItem('dailyGoal', dailyGoal.toString());
  }, [dailyGoal]);

  const progressPercentage = Math.min((todayCount / dailyGoal) * 100, 100);

  const getProgressColor = () => {
    if (progressPercentage >= 76) return 'from-green-500 to-green-600';
    if (progressPercentage >= 26) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getProgressText = () => {
    if (progressPercentage >= 100) return 'Goal Achieved! 🎉';
    if (progressPercentage >= 76) return 'Almost there!';
    if (progressPercentage >= 26) return 'Good progress!';
    return 'Keep going!';
  };

  const handleGoalChange = (value: string) => {
    setInputValue(value);
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1) {
      setDailyGoal(numValue);
    }
  };

  const handleGoalBlur = () => {
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < 1) {
      setInputValue(dailyGoal.toString());
    }
  };

  const resetProgress = () => {
    setDailyGoal(5);
    setInputValue('5');
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500 transition-transform duration-300 hover:rotate-12" />
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400">
              Daily Progress
            </CardTitle>
          </div>
          <Button
            onClick={resetProgress}
            size="sm"
            variant="outline"
            className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
            aria-label="Reset daily goal"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pb-4">
        <div className="flex flex-col h-full space-y-4">
          {/* Progress Information */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-300">
                {todayCount} of {dailyGoal} applications
              </span>
              <span className="font-bold text-gray-800 dark:text-white">
                {Math.round(progressPercentage)}%
              </span>
            </div>

            {/* Custom Progress Bar */}
            <div className="relative">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500 ease-in-out rounded-full relative`}
                  style={{ width: `${progressPercentage}%` }}
                >
                  {progressPercentage > 15 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {progressPercentage <= 15 && progressPercentage > 0 && (
                <div className="absolute -top-6 text-xs font-bold text-gray-800 dark:text-white">
                  {Math.round(progressPercentage)}%
                </div>
              )}
            </div>

            <div className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">
              {getProgressText()}
            </div>
          </div>

          {/* Goal Setting */}
          <div className="space-y-2">
            <label 
              htmlFor="dailyGoal" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Daily Goal
            </label>
            <div className="flex items-center space-x-2">
              <Input
                id="dailyGoal"
                type="number"
                min="1"
                value={inputValue}
                onChange={(e) => handleGoalChange(e.target.value)}
                onBlur={handleGoalBlur}
                className="w-20 text-center font-mono transition-all duration-200 hover:scale-[1.02] focus:scale-[1.02]"
                aria-label="Set daily application goal"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                applications per day
              </span>
            </div>
          </div>

          {/* Motivational Message - Fixed height container */}
          <div className="h-12 flex items-center justify-center">
            {todayCount >= dailyGoal && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-2 text-center w-full">
                <span className="text-green-700 dark:text-green-300 text-sm font-medium">
                  🎯 Daily goal achieved! Keep up the great work!
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressTracker;
