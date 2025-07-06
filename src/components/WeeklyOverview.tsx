
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
    
    // Get current day of week (0 = Sunday, 1 = Monday, etc.)
    const currentDay = now.getDay();
    
    // Calculate days since Monday (0 if today is Monday)
    const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;
    
    // Start from Monday of current week
    const mondayOfCurrentWeek = new Date(now);
    mondayOfCurrentWeek.setDate(now.getDate() - daysSinceMonday);
    
    // Generate 7 days starting from Monday
    for (let i = 0; i < 7; i++) {
      const date = new Date(mondayOfCurrentWeek);
      date.setDate(mondayOfCurrentWeek.getDate() + i);
      days.push({
        dateString: date.toDateString(),
        date: date
      });
    }
    return days;
  };

  const getWeeklyData = () => {
    const last7Days = getLast7Days();
    const now = new Date();
    const todayDateString = now.toDateString();
    
    return last7Days.map(({ dateString, date }) => {
      let count = 0;
      
      // Check if this date is actually today (same year, month, and day)
      const isActuallyToday = date.getFullYear() === now.getFullYear() &&
                              date.getMonth() === now.getMonth() &&
                              date.getDate() === now.getDate();
      
      if (isActuallyToday) {
        // Only use todayCount if this is actually today
        count = todayCount;
        console.log(`Using todayCount (${todayCount}) for today: ${dateString}`);
      } else {
        // For all other days, look in historical data only
        const dayData = applicationData.find(data => data.date === dateString);
        count = dayData ? dayData.count : 0;
        console.log(`Using historical data for ${dateString}: ${count}`);
      }
      
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count: count,
        isToday: isActuallyToday,
        fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dateString: dateString
      };
    });
  };

  const weeklyData = getWeeklyData();
  const weeklyTotal = weeklyData.reduce((sum, day) => sum + day.count, 0);
  const weeklyAvg = weeklyTotal > 0 ? Math.round(weeklyTotal / 7 * 10) / 10 : 0;

  // Add debug logging
  console.log('Weekly Overview Debug:', {
    todayCount,
    weeklyData: weeklyData.map(d => ({ day: d.day, count: d.count, isToday: d.isToday, dateString: d.dateString })),
    weeklyTotal,
    applicationData: applicationData.slice(0, 3) // First 3 entries for debugging
  });

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

        {/* Daily Breakdown - Monday to Sunday */}
        <div className="space-y-2">
          {weeklyData.map((day, index) => (
            <div 
              key={day.dateString} 
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
