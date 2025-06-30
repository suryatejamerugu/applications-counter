
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StreakTrackerProps {
  streak: number;
  onStreakChange: (streak: number) => void;
}

const StreakTracker = ({ streak, onStreakChange }: StreakTrackerProps) => {
  const increment = () => {
    onStreakChange(streak + 1);
  };

  const decrement = () => {
    if (streak > 0) {
      onStreakChange(streak - 1);
    }
  };

  const reset = () => {
    onStreakChange(0);
  };

  const getStreakColor = () => {
    if (streak >= 30) return 'from-yellow-400 to-orange-500';
    if (streak >= 14) return 'from-green-400 to-blue-500';
    if (streak >= 7) return 'from-blue-400 to-purple-500';
    return 'from-gray-400 to-gray-600';
  };

  const getStreakText = () => {
    if (streak >= 30) return 'Amazing!';
    if (streak >= 14) return 'Great!';
    if (streak >= 7) return 'Good!';
    return 'Keep going!';
  };

  return (
    <Card className="h-full bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-semibold text-gray-800">
          Daily Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        {/* Streak Display */}
        <div className={`bg-gradient-to-r ${getStreakColor()} rounded-2xl p-8 text-white`}>
          <div className="text-6xl font-bold mb-2">
            {streak}
          </div>
          <div className="text-lg opacity-90">
            {streak === 1 ? 'Day' : 'Days'}
          </div>
          <div className="text-sm mt-2 opacity-80">
            {getStreakText()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-3">
          <Button
            onClick={decrement}
            disabled={streak <= 0}
            size="lg"
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Minus className="w-5 h-5" />
          </Button>

          <Button
            onClick={reset}
            variant="outline"
            size="lg"
            className="px-6 py-3 rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 hover:scale-105"
          >
            Reset
          </Button>

          <Button
            onClick={increment}
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        <div className="text-sm text-gray-500">
          Consecutive days with applications
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakTracker;
