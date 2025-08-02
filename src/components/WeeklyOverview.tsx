import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface ApplicationData {
  date: string;
  count: number;
}

interface WeeklyOverviewProps {
  weeklyData: ApplicationData[];
}

const WeeklyOverview: React.FC<WeeklyOverviewProps> = ({ weeklyData }) => {
  const weeklyTotal = weeklyData.reduce((sum, day) => sum + day.count, 0);
  
  return (
    <Card className="hover-lift">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Weekly Total</CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{weeklyTotal}</div>
        <p className="text-xs text-muted-foreground">
          Last 7 days
        </p>
        <div className="mt-4 flex justify-between">
          {weeklyData.map((day, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className="w-2 bg-primary rounded-t"
                style={{ height: `${Math.max(day.count * 8, 4)}px` }}
              />
              <span className="text-xs text-muted-foreground mt-1">
                {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyOverview;