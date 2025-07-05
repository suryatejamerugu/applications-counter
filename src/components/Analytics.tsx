
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface ApplicationData {
  date: string;
  count: number;
}

interface AnalyticsProps {
  applicationData: ApplicationData[];
  todayCount: number;
}

const Analytics = ({ applicationData, todayCount }: AnalyticsProps) => {
  const [activeTab, setActiveTab] = useState('week');

  const getWeeklyData = () => {
    const last7Days = [];
    const today = new Date().toDateString();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toDateString();
      
      let count = 0;
      if (dateString === today) {
        // For today, use the current todayCount
        count = todayCount;
      } else {
        // For other days, look in historical data
        const dayData = applicationData.find(data => data.date === dateString);
        count = dayData ? dayData.count : 0;
      }
      
      last7Days.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        applications: count,
        fullDate: dateString
      });
    }
    return last7Days;
  };

  const getMonthlyData = () => {
    const weeks = [];
    const today = new Date();
    const todayString = today.toDateString();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7) - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      let weekTotal = 0;
      for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
        const dayString = d.toDateString();
        if (dayString === todayString) {
          weekTotal += todayCount;
        } else {
          const dayData = applicationData.find(data => data.date === dayString);
          if (dayData) weekTotal += dayData.count;
        }
      }
      
      weeks.push({
        name: `Week ${4-i}`,
        applications: weekTotal,
        period: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      });
    }
    return weeks;
  };

  const getYearlyData = () => {
    const months = [];
    const today = new Date();
    const todayString = today.toDateString();
    
    for (let i = 11; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      let monthTotal = 0;
      const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(month.getFullYear(), month.getMonth(), day);
        const dayString = date.toDateString();
        
        if (dayString === todayString) {
          monthTotal += todayCount;
        } else {
          const dayData = applicationData.find(data => data.date === dayString);
          if (dayData) monthTotal += dayData.count;
        }
      }
      
      months.push({
        name: monthName,
        applications: monthTotal
      });
    }
    return months;
  };

  const getWeeklyTotal = () => {
    const today = new Date();
    const todayString = today.toDateString();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 6); // Last 7 days including today
    
    let weeklyTotal = todayCount; // Start with today's count
    
    // Add historical data from the past 6 days
    const weeklyFromHistory = applicationData
      .filter(app => {
        const appDate = new Date(app.date);
        return appDate >= oneWeekAgo && app.date !== todayString;
      })
      .reduce((total, app) => total + app.count, 0);
    
    return weeklyTotal + weeklyFromHistory;
  };

  const getMonthlyTotal = () => {
    const today = new Date();
    const todayString = today.toDateString();
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 29); // Last 30 days including today
    
    let monthlyTotal = todayCount; // Start with today's count
    
    // Add historical data from the past 29 days
    const monthlyFromHistory = applicationData
      .filter(app => {
        const appDate = new Date(app.date);
        return appDate >= oneMonthAgo && app.date !== todayString;
      })
      .reduce((total, app) => total + app.count, 0);
    
    return monthlyTotal + monthlyFromHistory;
  };

  const getOverallTotal = () => {
    const todayString = new Date().toDateString();
    const overallFromHistory = applicationData
      .filter(app => app.date !== todayString)
      .reduce((total, app) => total + app.count, 0);
    return overallFromHistory + todayCount;
  };

  const weeklyData = getWeeklyData();
  const monthlyData = getMonthlyData();
  const yearlyData = getYearlyData();

  const totals = {
    today: todayCount,
    week: getWeeklyTotal(),
    month: getMonthlyTotal(),
    overall: getOverallTotal()
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-medium text-xs">{label}</p>
          <p className="text-blue-600 dark:text-blue-400 text-xs">
            Apps: <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white text-center">
          Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 h-8">
            <TabsTrigger value="week" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-xs">
              7 Days
            </TabsTrigger>
            <TabsTrigger value="month" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-xs">
              4 Weeks
            </TabsTrigger>
            <TabsTrigger value="year" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-xs">
              12 Months
            </TabsTrigger>
          </TabsList>

          <TabsContent value="week" className="mt-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#666"
                    fontSize={10}
                  />
                  <YAxis stroke="#666" fontSize={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="applications" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 1, r: 3 }}
                    activeDot={{ r: 4, fill: '#1d4ed8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="month" className="mt-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#666"
                    fontSize={10}
                  />
                  <YAxis stroke="#666" fontSize={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="applications" 
                    fill="#3b82f6"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="year" className="mt-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#666"
                    fontSize={10}
                  />
                  <YAxis stroke="#666" fontSize={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="applications" 
                    fill="#8b5cf6"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>

        {/* Totals Section */}
        <div className="mt-4 pt-4 border-t dark:border-gray-600">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-center">
              <div className="font-bold text-blue-600 dark:text-blue-400 font-mono">{totals.today}</div>
              <div className="text-blue-700 dark:text-blue-300">Today</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded text-center">
              <div className="font-bold text-green-600 dark:text-green-400 font-mono">{totals.week}</div>
              <div className="text-green-700 dark:text-green-300">This Week</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded text-center">
              <div className="font-bold text-purple-600 dark:text-purple-400 font-mono">{totals.month}</div>
              <div className="text-purple-700 dark:text-purple-300">This Month</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded text-center">
              <div className="font-bold text-orange-600 dark:text-orange-400 font-mono">{totals.overall}</div>
              <div className="text-orange-700 dark:text-orange-300">Overall</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Analytics;
