
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ApplicationData {
  date: string;
  count: number;
}

interface WeeklyOverviewProps {
  applicationData: ApplicationData[];
  todayCount: number;
}

const WeeklyOverview = ({ applicationData, todayCount }: WeeklyOverviewProps) => {
  const getLast7Days = () => {
    const days = [];
    const now = new Date();
    
    // Get Monday of current week
    const currentDay = now.getDay();
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Sunday = 0, so 6 days from Monday
    
    // Start from Monday of current week and go back 6 days to get full week
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - daysFromMonday - i);
      days.push({
        dateString: date.toDateString(),
        date: date
      });
    }
    return days;
  };

  const getWeeklyData = () => {
    const last7Days = getLast7Days();
    const today = new Date().toDateString();
    
    return last7Days.map(({ dateString, date }) => {
      const isToday = dateString === today;
      let count = 0;
      
      if (isToday) {
        // For today, use the current todayCount
        count = todayCount;
      } else {
        // For other days, look in historical data
        const dayData = applicationData.find(data => data.date === dateString);
        count = dayData ? dayData.count : 0;
      }
      
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count: count,
        isToday: isToday,
        fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
    });
  };

  const weeklyData = getWeeklyData();
  const weeklyTotal = weeklyData.reduce((sum, day) => sum + day.count, 0);
  const weeklyAvg = weeklyTotal > 0 ? Math.round(weeklyTotal / 7 * 10) / 10 : 0;

  return (
    <Card className="h-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 font-mono">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
          Weekly Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weekly Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">{weeklyTotal}</div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Total This Week</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 font-mono">{weeklyAvg}</div>
            <div className="text-sm text-green-700 dark:text-green-300">Daily Average</div>
          </div>
        </div>

        {/* Daily Breakdown */}
        <div className="space-y-2">
          {weeklyData.map((day, index) => (
            <div 
              key={index} 
              className={`flex justify-between items-center p-3 rounded-lg ${
                day.isToday 
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-700' 
                  : 'bg-gray-50 dark:bg-gray-700'
              }`}
            >
              <div className="flex flex-col">
                <span className={`font-medium ${
                  day.isToday 
                    ? 'text-purple-700 dark:text-purple-300' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {day.day} {day.isToday && '(Today)'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {day.fullDate}
                </span>
              </div>
              <span className={`font-bold font-mono text-lg ${
                day.count > 10 ? 'text-green-600 dark:text-green-400' : 
                day.count > 5 ? 'text-blue-600 dark:text-blue-400' : 
                day.count > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400 dark:text-gray-500'
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
