import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';

interface DaysAppliedCardProps {
  daysApplied: number;
}

const DaysAppliedCard: React.FC<DaysAppliedCardProps> = ({ daysApplied }) => {
  return (
    <Card className="hover-lift">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Days Applied</CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{daysApplied}</div>
        <p className="text-xs text-muted-foreground">
          Total unique days
        </p>
      </CardContent>
    </Card>
  );
};

export default DaysAppliedCard;