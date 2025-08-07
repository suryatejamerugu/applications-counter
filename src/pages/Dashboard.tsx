import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { BarChart3, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TodaysApplicationsCard from '@/components/TodaysApplicationsCard';
import DaysAppliedCard from '@/components/DaysAppliedCard';
import WeeklyOverview from '@/components/WeeklyOverview';
import DailyCounter from '@/components/DailyCounter';
import HireSagePromoCard from '@/components/HireSagePromoCard';
import CelebrationModal from '@/components/CelebrationModal';
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
  const [showCelebration, setShowCelebration] = useState(false);
  const [previousTodayCount, setPreviousTodayCount] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    job_title: '',
    date_applied: getCurrentLocalDate(),
    application_url: '',
    notes: '',
    status: 'Applied'
  });

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

  const resetFormData = () => {
    setFormData({
      company_name: '',
      job_title: '',
      date_applied: getCurrentLocalDate(),
      application_url: '',
      notes: '',
      status: 'Applied'
    });
  };

  const handleAddApplication = () => {
    resetFormData();
    setIsAddDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('job_applications')
        .insert({
          user_id: user.id,
          company_name: formData.company_name,
          job_title: formData.job_title,
          date_applied: formData.date_applied,
          application_url: formData.application_url || null,
          notes: formData.notes || null,
          status: formData.status
        });

      if (error) throw error;

      await fetchDashboardData(); // Refresh all data
      toast({
        title: "Success",
        description: "Application added successfully",
      });

      resetFormData();
      setIsAddDialogOpen(false);
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

  // Check if celebration should be shown
  useEffect(() => {
    const today = getCurrentLocalDate();
    const celebrationShownKey = `celebration-shown-${today}`;
    const celebrationShown = localStorage.getItem(celebrationShownKey);
    
    // Check if goal was just achieved (count increased and now meets/exceeds goal)
    if (
      todayCount >= dailyGoal && 
      previousTodayCount < dailyGoal && 
      !celebrationShown &&
      todayCount > 0
    ) {
      setShowCelebration(true);
      localStorage.setItem(celebrationShownKey, 'true');
    }
    
    setPreviousTodayCount(todayCount);
  }, [todayCount, dailyGoal, previousTodayCount]);

  const handleCloseCelebration = () => {
    setShowCelebration(false);
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
          onAddApplication={handleAddApplication}
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

      {/* Add Application Modal */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Application</DialogTitle>
            <DialogDescription>
              Add a new job application to your tracker.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job_title">Job Title</Label>
                <Input
                  id="job_title"
                  value={formData.job_title}
                  onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_applied">Date Applied</Label>
                <Input
                  id="date_applied"
                  type="date"
                  value={formData.date_applied}
                  onChange={(e) => setFormData({...formData, date_applied: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Applied">Applied</SelectItem>
                    <SelectItem value="Interviewing">Interviewing</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Offer">Offer</SelectItem>
                    <SelectItem value="Assessment">Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="application_url">Application URL (Optional)</Label>
              <Input
                id="application_url"
                type="url"
                value={formData.application_url}
                onChange={(e) => setFormData({...formData, application_url: e.target.value})}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Additional notes about this application..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  resetFormData();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                Add Application
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Celebration Modal */}
      <CelebrationModal
        open={showCelebration}
        onClose={handleCloseCelebration}
        todayCount={todayCount}
        dailyGoal={dailyGoal}
      />
    </div>
  );
};

export default Dashboard;