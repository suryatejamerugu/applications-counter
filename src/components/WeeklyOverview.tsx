
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ApplicationData {
  date: string;
  count: number;
}

interface WeeklyOverviewProps {
  applicationData: ApplicationData[];
}

const WeeklyOverview = ({ applicationData }: WeeklyOverviewProps) => {
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toDateString());
    }
    return days;
  };

  const getWeeklyData = () => {
    const last7Days = getLast7Days();
    return last7Days.map(day => {
      const dayData = applicationData.find(data => data.date === day);
      return {
        day: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
        count: dayData ? dayData.count : 0,
        isToday: day === new Date().toDateString()
      };
    });
  };

  const weeklyData = getWeeklyData();
  const weeklyTotal = weeklyData.reduce((sum, day) => sum + day.count, 0);
  const weeklyAvg = Math.round(weeklyTotal / 7 * 10) / 10;

  return (
    <Card className="h-full bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 font-mono">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-semibold text-gray-800">
          Weekly Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weekly Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 font-mono">{weeklyTotal}</div>
            <div className="text-sm text-blue-700">Total This Week</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 font-mono">{weeklyAvg}</div>
            <div className="text-sm text-green-700">Daily Average</div>
          </div>
        </div>

        {/* Daily Breakdown */}
        <div className="space-y-2">
          {weeklyData.map((day, index) => (
            <div 
              key={index} 
              className={`flex justify-between items-center p-3 rounded-lg ${
                day.isToday ? 'bg-purple-50 border-2 border-purple-200' : 'bg-gray-50'
              }`}
            >
              <span className={`font-medium ${day.isToday ? 'text-purple-700' : 'text-gray-700'}`}>
                {day.day} {day.isToday && '(Today)'}
              </span>
              <span className={`font-bold font-mono ${
                day.count > 10 ? 'text-green-600' : 
                day.count > 5 ? 'text-blue-600' : 
                day.count > 0 ? 'text-yellow-600' : 'text-gray-400'
              }`}>
                {day.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyOverview;
