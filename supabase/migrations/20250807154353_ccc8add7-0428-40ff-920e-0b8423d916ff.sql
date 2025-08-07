-- Drop the existing check constraint
ALTER TABLE public.job_applications 
DROP CONSTRAINT job_applications_status_check;

-- Add the updated check constraint with "Assessment" included
ALTER TABLE public.job_applications 
ADD CONSTRAINT job_applications_status_check 
CHECK (status = ANY (ARRAY['Applied'::text, 'Interviewing'::text, 'Rejected'::text, 'Offer'::text, 'Assessment'::text]));