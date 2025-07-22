import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Plus, BarChart3, FileText, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApplicationData {
  date: string;
  count: number;
}

interface UserPreferences {
  daily_goal: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [todayCount, setTodayCount] = useState(0);
  const [daysApplied, setDaysApplied] = useState(0);
  const [weeklyData, setWeeklyData] = useState<ApplicationData[]>([]);
  const [dailyGoal, setDailyGoal] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch user preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('daily_goal')
        .eq('user_id', user.id)
        .single();

      if (preferences) {
        setDailyGoal(preferences.daily_goal);
      }

      // Fetch today's applications count
      const today = new Date().toISOString().split('T')[0];
      const { data: todayApps, error: todayError } = await supabase
        .from('job_applications')
        .select('id')
        .eq('user_id', user.id)
        .eq('date_applied', today);

      if (todayError) throw todayError;
      setTodayCount(todayApps?.length || 0);

      // Fetch unique days applied
      const { data: uniqueDays, error: daysError } = await supabase
        .from('job_applications')
        .select('date_applied')
        .eq('user_id', user.id);

      if (daysError) throw daysError;
      const uniqueDaysSet = new Set(uniqueDays?.map(app => app.date_applied) || []);
      setDaysApplied(uniqueDaysSet.size);

      // Fetch weekly data
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      const { data: weeklyApps, error: weeklyError } = await supabase
        .from('job_applications')
        .select('date_applied')
        .eq('user_id', user.id)
        .gte('date_applied', sevenDaysAgo.toISOString().split('T')[0]);

      if (weeklyError) throw weeklyError;

      // Process weekly data
      const weeklyCount: { [key: string]: number } = {};
      weeklyApps?.forEach(app => {
        weeklyCount[app.date_applied] = (weeklyCount[app.date_applied] || 0) + 1;
      });

      const weeklyArray: ApplicationData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        weeklyArray.push({
          date: dateStr,
          count: weeklyCount[dateStr] || 0
        });
      }
      setWeeklyData(weeklyArray);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const incrementTodayCount = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('job_applications')
        .insert({
          user_id: user.id,
          company_name: 'Quick Application',
          job_title: 'Application',
          date_applied: today,
          status: 'Applied'
        });

      if (error) throw error;

      setTodayCount(prev => prev + 1);
      toast({
        title: "Success",
        description: "Application added successfully",
      });
    } catch (error) {
      console.error('Error adding application:', error);
      toast({
        title: "Error",
        description: "Failed to add application",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const progressPercentage = Math.min((todayCount / dailyGoal) * 100, 100);
  const goalAchieved = todayCount >= dailyGoal;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Track your job application progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Today's Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Applications</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCount}</div>
            <Button
              onClick={incrementTodayCount}
              className="mt-2 w-full"
              size="sm"
            >
              Add Application
            </Button>
          </CardContent>
        </Card>

        {/* Days Applied */}
        <Card>
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

        {/* Weekly Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Total</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weeklyData.reduce((sum, day) => sum + day.count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Goal Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Daily Goal Progress</CardTitle>
          <CardDescription>
            Goal: {dailyGoal} applications per day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progressPercentage} className="w-full" />
            <div className="flex justify-between text-sm">
              <span>{todayCount} / {dailyGoal} applications</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            {goalAchieved && (
              <div className="flex items-center justify-center py-4">
                <img 
                  src="https://media1.tenor.com/m/xjvmoEYtjwEAAAAd/thumbs-up-double-thumbs-up.gif" 
                  alt="Goal achieved!" 
                  className="w-32 h-32 object-contain"
                />
              </div>
            )}
            {goalAchieved && (
              <div className="text-center">
                <p className="text-green-600 font-semibold">🎉 Goal achieved! Great work!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/log">
          <Button className="w-full" size="lg">
            <FileText className="mr-2 h-4 w-4" />
            Go to Job Log
          </Button>
        </Link>
        <Link to="/analytics">
          <Button className="w-full" size="lg" variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            View Analytics
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;