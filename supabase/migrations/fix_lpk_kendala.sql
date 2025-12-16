-- Add missing column data_kendala to lpk_reports table
ALTER TABLE lpk_reports 
ADD COLUMN IF NOT EXISTS data_kendala JSONB DEFAULT '[]'::jsonb;
