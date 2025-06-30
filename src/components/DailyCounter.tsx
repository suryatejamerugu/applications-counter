
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
    <Card className="h-full bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-semibold text-gray-800">
          Today's Applications
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        {/* Counter Display */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
          <div className="text-6xl font-bold mb-2">
            {count.toString().padStart(3, '0')}
          </div>
          <div className="text-lg opacity-90">Applications</div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-3">
          <Button
            onClick={decrement}
            disabled={count <= 0}
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
            disabled={count >= 999}
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        <div className="text-sm text-gray-500">
          Maximum: 999 applications
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyCounter;
