
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DailyCounterProps {
  count: number;
  onCountChange: (count: number) => void;
}

const DailyCounter = ({ count, onCountChange }: DailyCounterProps) => {
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

  return (
    <Card className="h-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 font-mono">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
          Today's Applications
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        {/* Counter Display */}
        <div className={`bg-gradient-to-r ${getCountColor()} rounded-2xl p-8 text-white`}>
          <div className="text-6xl font-bold mb-2 font-mono">
            {count}
          </div>
          <div className="text-lg opacity-90">
            {count === 1 ? 'Application' : 'Applications'}
          </div>
          <div className="text-sm mt-2 opacity-80">
            {getCountText()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-3">
          <Button
            onClick={decrement}
            disabled={count <= 0}
            size="lg"
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 font-mono"
          >
            <Minus className="w-5 h-5" />
          </Button>

          <Button
            onClick={reset}
            variant="outline"
            size="lg"
            className="px-6 py-3 rounded-xl border-2 border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 transition-all duration-200 hover:scale-105 font-mono"
          >
            Reset
          </Button>

          <Button
            onClick={increment}
            disabled={count >= 999}
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 font-mono"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Applications submitted today
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyCounter;
