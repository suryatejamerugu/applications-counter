import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { getCurrentLocalDate } from '@/lib/dateUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JobApplication {
  id: string;
  company_name: string;
  job_title: string;
  date_applied: string;
  application_url?: string;
  notes?: string;
  status: string;
  created_at: string;
}

const JobLog: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    job_title: '',
    date_applied: getCurrentLocalDate(),
    application_url: '',
    notes: '',
    status: 'Applied'
  });

  // Reset form data helper
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
        description: "Failed to load applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingApp) {
        // Update existing application
        const { error } = await supabase
          .from('job_applications')
          .update({
            company_name: formData.company_name,
            job_title: formData.job_title,
            date_applied: formData.date_applied,
            application_url: formData.application_url || null,
            notes: formData.notes || null,
            status: formData.status
          })
          .eq('id', editingApp.id);

        if (error) throw error;
        
        // Show modal if status changed to Interviewing
        if (formData.status === 'Interviewing' && editingApp.status !== 'Interviewing') {
          setShowInterviewModal(true);
        }
        
        toast({
          title: "Success",
          description: "Application updated successfully"
        });
      } else {
        // Create new application
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
        toast({
          title: "Success",
          description: "Application added successfully"
        });
      }

      // Reset form and close dialog
      resetFormData();
      setIsAddDialogOpen(false);
      setEditingApp(null);
      fetchApplications();
    } catch (error) {
      console.error('Error saving application:', error);
      toast({
        title: "Error",
        description: "Failed to save application",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (app: JobApplication) => {
    setFormData({
      company_name: app.company_name,
      job_title: app.job_title,
      date_applied: app.date_applied,
      application_url: app.application_url || '',
      notes: app.notes || '',
      status: app.status
    });
    setEditingApp(app);
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Application deleted successfully"
      });
      fetchApplications();
    } catch (error) {
      console.error('Error deleting application:', error);
      toast({
        title: "Error",
        description: "Failed to delete application",
        variant: "destructive"
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Applied': return 'default';
      case 'Interviewing': return 'secondary';
      case 'Rejected': return 'destructive';
      case 'Offer': return 'outline';
      default: return 'default';
    }
  };

  const getStatusBadgeClassName = (status: string) => {
    switch (status) {
      case 'Offer':
        return 'bg-green-500 text-white hover:bg-green-600';
      case 'Rejected':
        return 'bg-red-500 text-white hover:bg-red-600';
      case 'Interviewing':
        return 'bg-blue-500 text-white hover:bg-blue-600';
      default:
        return '';
    }
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Job Application Log</h1>
          <p className="text-muted-foreground">Track and manage your job applications</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Application
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingApp ? 'Edit Application' : 'Add New Application'}
              </DialogTitle>
              <DialogDescription>
                {editingApp ? 'Update your job application details.' : 'Add a new job application to your log.'}
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
                    setEditingApp(null);
                    resetFormData();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingApp ? 'Update' : 'Add'} Application
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Interview Preparation Modal */}
        <Dialog open={showInterviewModal} onOpenChange={setShowInterviewModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">🎯 Get Ready!</DialogTitle>
              <DialogDescription className="text-center text-lg">
                Use HireSage AI for Interview Preparation — It's Free!
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center space-x-4 pt-4">
              <Button
                onClick={() => {
                  window.open('https://hiresageai.netlify.app/', '_blank');
                  setShowInterviewModal(false);
                }}
                className="w-full"
              >
                Launch HireSage AI
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Applications</CardTitle>
          <CardDescription>
            {applications.length} total applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No applications found. Add your first application to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Date Applied</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.company_name}</TableCell>
                      <TableCell>{app.job_title}</TableCell>
                      <TableCell>{new Date(app.date_applied + 'T00:00:00').toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusBadgeVariant(app.status)}
                          className={getStatusBadgeClassName(app.status)}
                        >
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {app.application_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(app.application_url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(app)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(app.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JobLog;