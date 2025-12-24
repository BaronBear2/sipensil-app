-- Add 'documents' column to im_japan_registrations to store individual file URLs/Statuses
ALTER TABLE public.im_japan_registrations ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '{}'::jsonb;
