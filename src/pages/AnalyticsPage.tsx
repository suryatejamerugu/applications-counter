import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { getLocalDateWithOffset } from '@/lib/dateUtils';

interface JobApplication {
  id: string;
  company_name: string;
  job_title: string;
  date_applied: string;
  status: string;
}

interface ChartData {
  name: string;
  value: number;
}

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('date_applied', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getLast7DaysData = (): ChartData[] => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const dateStr = getLocalDateWithOffset(-i);
      const date = new Date();
      date.setDate(date.getDate() - i);
      const count = applications.filter(app => app.date_applied === dateStr).length;
      last7Days.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        value: count
      });
    }
    return last7Days;
  };

  const getStatusDistribution = (): ChartData[] => {
    const statusCount: { [key: string]: number } = {};
    applications.forEach(app => {
      statusCount[app.status] = (statusCount[app.status] || 0) + 1;
    });

    return Object.entries(statusCount).map(([status, count]) => ({
      name: status,
      value: count
    }));
  };

  const getStreakData = () => {
    const dates = applications.map(app => app.date_applied);
    const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    if (uniqueDates.length === 0) {
      return { currentStreak: 0, maxStreak: 0 };
    }

    let maxStreak = 0;
    let tempStreak = 0;
    let currentStreak = 0;
    
    // Calculate max streak by checking all consecutive sequences
    for (let i = 0; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i]);
      
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(uniqueDates[i - 1]);
        const daysDiff = Math.round((currentDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000));
        
        if (daysDiff === 1) {
          tempStreak++;
        } else {
          maxStreak = Math.max(maxStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak);
    
    // Calculate current streak (must end with today or yesterday)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Start from the most recent date and work backwards
    if (uniqueDates.length > 0) {
      const mostRecentDate = uniqueDates[uniqueDates.length - 1];
      
      // Current streak only counts if the most recent application was today or yesterday
      if (mostRecentDate === todayStr || mostRecentDate === yesterdayStr) {
        currentStreak = 1;
        
        // Work backwards to find consecutive days
        for (let i = uniqueDates.length - 2; i >= 0; i--) {
          const currentDate = new Date(uniqueDates[i + 1]);
          const prevDate = new Date(uniqueDates[i]);
          const daysDiff = Math.round((currentDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000));
          
          if (daysDiff === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    return { currentStreak, maxStreak };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Offer': return '#22C55E'; // Green
      case 'Rejected': return '#EF4444'; // Red
      case 'Interviewing': return '#3B82F6'; // Blue
      case 'Applied': return '#EAB308'; // Yellow
      default: return '#8884D8'; // Fallback
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const last7DaysData = getLast7DaysData();
  const statusData = getStatusDistribution();
  const streakData = getStreakData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Insights into your job application activity</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {last7DaysData.reduce((sum, day) => sum + day.value, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streakData.currentStreak}</div>
            <p className="text-xs text-muted-foreground">days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streakData.maxStreak}</div>
            <p className="text-xs text-muted-foreground">days</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="weekly">Weekly Activity</TabsTrigger>
          <TabsTrigger value="status">Status Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Applications per Day (Last 7 Days)</CardTitle>
              <CardDescription>
                Your application activity over the past week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={last7DaysData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Status Distribution</CardTitle>
              <CardDescription>
                Breakdown of your applications by current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No data available. Add some applications to see status distribution.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;