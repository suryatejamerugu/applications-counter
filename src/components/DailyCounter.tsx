
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

  return (
    <Card className="h-full font-mono">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-lg font-medium text-gray-800">
          Today's Applications
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {/* Counter Display */}
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="text-4xl font-bold text-blue-600 mb-1 font-mono">
            {count}
          </div>
          <div className="text-sm text-blue-700">Applications</div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-2">
          <Button
            onClick={decrement}
            disabled={count <= 0}
            size="sm"
            className="bg-red-500 hover:bg-red-600 text-white font-mono"
          >
            <Minus className="w-4 h-4" />
          </Button>

          <Button
            onClick={reset}
            variant="outline"
            size="sm"
            className="text-gray-600 border-gray-300 font-mono"
          >
            Reset
          </Button>

          <Button
            onClick={increment}
            disabled={count >= 999}
            size="sm"
            className="bg-green-500 hover:bg-green-600 text-white font-mono"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyCounter;
