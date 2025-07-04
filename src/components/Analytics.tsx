
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
}

const Analytics = ({ applicationData }: AnalyticsProps) => {
  const [activeTab, setActiveTab] = useState('week');

  const getWeeklyData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toDateString();
      const dayData = applicationData.find(data => data.date === dateString);
      
      last7Days.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        applications: dayData ? dayData.count : 0,
        fullDate: dateString
      });
    }
    return last7Days;
  };

  const getMonthlyData = () => {
    const weeks = [];
    const today = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7) - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      let weekTotal = 0;
      for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
        const dayData = applicationData.find(data => data.date === d.toDateString());
        if (dayData) weekTotal += dayData.count;
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
    
    for (let i = 11; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      let monthTotal = 0;
      const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(month.getFullYear(), month.getMonth(), day);
        const dayData = applicationData.find(data => data.date === date.toDateString());
        if (dayData) monthTotal += dayData.count;
      }
      
      months.push({
        name: monthName,
        applications: monthTotal
      });
    }
    return months;
  };

  const weeklyData = getWeeklyData();
  const monthlyData = getMonthlyData();
  const yearlyData = getYearlyData();

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
      </CardContent>
    </Card>
  );
};

export default Analytics;
