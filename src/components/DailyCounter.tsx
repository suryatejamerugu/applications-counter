import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Target, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DailyCounterProps {
  todayCount: number;
  dailyGoal: number;
  onGoalUpdate: (newGoal: number) => void;
}

const DailyCounter: React.FC<DailyCounterProps> = ({ 
  todayCount, 
  dailyGoal, 
  onGoalUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState(dailyGoal);
  const { user } = useAuth();
  const { toast } = useToast();

  const progressPercentage = Math.min((todayCount / dailyGoal) * 100, 100);
  const goalAchieved = todayCount >= dailyGoal;

  const saveGoal = async () => {
    if (!user || tempGoal < 1) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({ daily_goal: tempGoal })
        .eq('user_id', user.id);

      if (error) throw error;

      onGoalUpdate(tempGoal);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Daily goal updated successfully"
      });
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Error",
        description: "Failed to update daily goal",
        variant: "destructive"
      });
    }
  };

  const getProgressText = () => {
    if (goalAchieved) return "🎉 Goal achieved! Amazing work!";
    if (progressPercentage >= 75) return "🔥 You're so close! Keep going!";
    if (progressPercentage >= 50) return "💪 Halfway there! You're doing great!";
    if (progressPercentage >= 25) return "⭐ Good start! Keep the momentum!";
    return "🚀 Let's get started on your goal!";
  };

  useEffect(() => {
    setTempGoal(dailyGoal);
  }, [dailyGoal]);

  return (
    <Card className="hover-lift">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-4 w-4" />
              Daily Progress
            </CardTitle>
            <CardDescription>
              {isEditing ? 'Set your daily goal' : `Goal: ${dailyGoal} applications per day`}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isEditing ? (
            <div className="space-y-3">
              <Label htmlFor="goal">Daily goal</Label>
              <div className="flex space-x-2">
                <Input
                  id="goal"
                  type="number"
                  min="1"
                  max="50"
                  value={tempGoal}
                  onChange={(e) => setTempGoal(parseInt(e.target.value) || 1)}
                  className="flex-1"
                />
                <Button onClick={saveGoal} size="sm">
                  Save
                </Button>
                <Button 
                  onClick={() => {
                    setIsEditing(false);
                    setTempGoal(dailyGoal);
                  }} 
                  variant="outline" 
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Progress 
                value={progressPercentage} 
                className="w-full h-3"
              />
              <div className="flex justify-between text-sm">
                <span className="font-medium">{todayCount} / {dailyGoal} applications</span>
                <span className="text-muted-foreground">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-primary">{getProgressText()}</p>
              </div>
              {goalAchieved && (
                <div className="flex justify-center py-4">
                  <img 
                    src="https://media1.tenor.com/m/xjvmoEYtjwEAAAAd/thumbs-up-double-thumbs-up.gif" 
                    alt="Goal achieved!" 
                    className="w-24 h-24 object-contain hover-rotate"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyCounter;