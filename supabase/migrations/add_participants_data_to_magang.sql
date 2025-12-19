-- Add JSONB column for Excel-like participant data
ALTER TABLE public.magang_permits 
ADD COLUMN IF NOT EXISTS participants_data JSONB DEFAULT '[]'::jsonb;
