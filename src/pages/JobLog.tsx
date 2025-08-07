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
import { Plus, Edit, Trash2, ExternalLink, Filter, X, Search } from 'lucide-react';
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
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    job_title: '',
    date_applied: getCurrentLocalDate(),
    application_url: '',
    notes: '',
    status: 'Applied'
  });

  // Filter state
  const [globalSearch, setGlobalSearch] = useState('');
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: '',
    company: '',
    jobTitle: '',
    sortBy: 'date_desc'
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
      setFilteredApplications(data || []);
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

  // Filter and sort applications
  useEffect(() => {
    let filtered = [...applications];

    // Apply global search
    if (globalSearch) {
      const searchLower = globalSearch.toLowerCase();
      filtered = filtered.filter(app => 
        app.company_name.toLowerCase().includes(searchLower) ||
        app.job_title.toLowerCase().includes(searchLower) ||
        app.status.toLowerCase().includes(searchLower)
      );
    }

    // Apply filters
    if (filters.dateFrom) {
      filtered = filtered.filter(app => app.date_applied >= filters.dateFrom);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(app => app.date_applied <= filters.dateTo);
    }
    if (filters.status) {
      filtered = filtered.filter(app => app.status === filters.status);
    }
    if (filters.company) {
      filtered = filtered.filter(app => 
        app.company_name.toLowerCase().includes(filters.company.toLowerCase())
      );
    }
    if (filters.jobTitle) {
      filtered = filtered.filter(app => 
        app.job_title.toLowerCase().includes(filters.jobTitle.toLowerCase())
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'date_asc':
        filtered.sort((a, b) => new Date(a.date_applied).getTime() - new Date(b.date_applied).getTime());
        break;
      case 'date_desc':
        filtered.sort((a, b) => new Date(b.date_applied).getTime() - new Date(a.date_applied).getTime());
        break;
      case 'company_asc':
        filtered.sort((a, b) => a.company_name.localeCompare(b.company_name));
        break;
      case 'status_asc':
        filtered.sort((a, b) => a.status.localeCompare(b.status));
        break;
      default:
        break;
    }

    setFilteredApplications(filtered);
  }, [applications, filters, globalSearch]);

  const clearFilters = () => {
    setGlobalSearch('');
    setFilters({
      dateFrom: '',
      dateTo: '',
      status: '',
      company: '',
      jobTitle: '',
      sortBy: 'date_desc'
    });
  };

  const setDatePreset = (preset: string) => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    switch (preset) {
      case 'today':
        setFilters({...filters, dateFrom: formatDate(today), dateTo: formatDate(today)});
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        setFilters({...filters, dateFrom: formatDate(weekAgo), dateTo: formatDate(today)});
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        setFilters({...filters, dateFrom: formatDate(monthAgo), dateTo: formatDate(today)});
        break;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Applied': return 'default';
      case 'Interviewing': return 'secondary';
      case 'Rejected': return 'destructive';
      case 'Offer': return 'outline';
      case 'Assessment': return 'secondary';
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
      case 'Assessment':
        return 'bg-purple-500 text-white hover:bg-purple-600';
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
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
        </div>
      </div>

      {/* Global Search Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications (company, job title, status)..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Quick Date Presets */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDatePreset('today')}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDatePreset('week')}
              >
                Last 7 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDatePreset('month')}
              >
                This Month
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="ml-auto"
              >
                <X className="mr-1 h-4 w-4" />
                Clear All Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters Section */}
      {showFilters && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Advanced Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                <X className="mr-1 h-4 w-4" />
                Hide
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Date From</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Date To</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value === 'all' ? '' : value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="Applied">Applied</SelectItem>
                    <SelectItem value="Interviewing">Interviewing</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Offer">Offer</SelectItem>
                    <SelectItem value="Assessment">Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  placeholder="Search by company..."
                  value={filters.company}
                  onChange={(e) => setFilters({...filters, company: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input
                  placeholder="Search by job title..."
                  value={filters.jobTitle}
                  onChange={(e) => setFilters({...filters, jobTitle: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select value={filters.sortBy} onValueChange={(value) => setFilters({...filters, sortBy: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_desc">Date (Newest First)</SelectItem>
                    <SelectItem value="date_asc">Date (Oldest First)</SelectItem>
                    <SelectItem value="company_asc">Company (A-Z)</SelectItem>
                    <SelectItem value="status_asc">Status (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

      <Card>
        <CardHeader>
          <CardTitle>Your Applications</CardTitle>
          <CardDescription>
            {filteredApplications.length} of {applications.length} applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No applications found. Add your first application to get started!</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No applications match your current filters.</p>
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
                  {filteredApplications.map((app) => (
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