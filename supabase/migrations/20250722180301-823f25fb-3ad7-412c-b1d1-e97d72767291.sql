-- Create job applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  date_applied DATE NOT NULL DEFAULT CURRENT_DATE,
  application_url TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'Applied' CHECK (status IN ('Applied', 'Interviewing', 'Rejected', 'Offer')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for job applications
CREATE POLICY "Users can view their own applications" 
ON public.job_applications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications" 
ON public.job_applications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications" 
ON public.job_applications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applications" 
ON public.job_applications 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create user preferences table
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  daily_goal INTEGER NOT NULL DEFAULT 5,
  theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  notifications_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for user preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user preferences
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" 
ON public.user_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX idx_job_applications_date_applied ON public.job_applications(date_applied);
CREATE INDEX idx_job_applications_status ON public.job_applications(status);
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);