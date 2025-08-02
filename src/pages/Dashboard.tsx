import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { BarChart3, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TodaysApplicationsCard from '@/components/TodaysApplicationsCard';
import DaysAppliedCard from '@/components/DaysAppliedCard';
import WeeklyOverview from '@/components/WeeklyOverview';
import DailyCounter from '@/components/DailyCounter';
import HireSagePromoCard from '@/components/HireSagePromoCard';
import { getCurrentLocalDate, getLocalDateWithOffset, formatDateLocal } from '@/lib/dateUtils';

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
      const today = getCurrentLocalDate();
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
      const sevenDaysAgo = getLocalDateWithOffset(-6);
      const { data: weeklyApps, error: weeklyError } = await supabase
        .from('job_applications')
        .select('date_applied')
        .eq('user_id', user.id)
        .gte('date_applied', sevenDaysAgo);

      if (weeklyError) throw weeklyError;

      // Process weekly data
      const weeklyCount: { [key: string]: number } = {};
      weeklyApps?.forEach(app => {
        weeklyCount[app.date_applied] = (weeklyCount[app.date_applied] || 0) + 1;
      });

      const weeklyArray: ApplicationData[] = [];
      for (let i = 6; i >= 0; i--) {
        const dateStr = getLocalDateWithOffset(-i);
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

  const addQuickApplication = async () => {
    if (!user) return;

    try {
      const today = getCurrentLocalDate();
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

      await fetchDashboardData(); // Refresh all data
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

  const handleGoalUpdate = (newGoal: number) => {
    setDailyGoal(newGoal);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Track your job application progress</p>
      </div>

      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <TodaysApplicationsCard 
          todayCount={todayCount}
          onAddApplication={addQuickApplication}
        />
        <DaysAppliedCard daysApplied={daysApplied} />
        <WeeklyOverview weeklyData={weeklyData} />
      </div>

      {/* Daily Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DailyCounter 
          todayCount={todayCount}
          dailyGoal={dailyGoal}
          onGoalUpdate={handleGoalUpdate}
        />
        <HireSagePromoCard />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/log">
          <Button className="w-full hover-glow" size="lg">
            <FileText className="mr-2 h-4 w-4" />
            Go to Job Log
          </Button>
        </Link>
        <Link to="/analytics">
          <Button className="w-full hover-glow" size="lg" variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            View Analytics
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;