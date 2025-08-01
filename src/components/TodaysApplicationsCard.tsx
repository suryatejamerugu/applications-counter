import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface TodaysApplicationsCardProps {
  todayCount: number;
  onAddApplication: () => void;
}

const TodaysApplicationsCard: React.FC<TodaysApplicationsCardProps> = ({
  todayCount,
  onAddApplication
}) => {
  return (
    <Card className="hover-lift">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Today's Applications</CardTitle>
        <Plus className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{todayCount}</div>
        <Button
          onClick={onAddApplication}
          className="mt-2 w-full hover-glow"
          size="sm"
        >
          Add Application
        </Button>
      </CardContent>
    </Card>
  );
};

export default TodaysApplicationsCard;
