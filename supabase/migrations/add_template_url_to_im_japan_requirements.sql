-- Add template_url column to im_japan_requirements table
ALTER TABLE im_japan_requirements
ADD COLUMN IF NOT EXISTS template_url TEXT;

-- Enable RLS for storage if not already enabled (assuming storage bucket 'templates' or generally 'public' is used)
-- For this app, we likely use a 'documents' bucket or similar. We will verify bucket usage later.
