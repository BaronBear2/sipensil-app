-- Add admin_notes column to training_registrations table
-- This allows specific rejection reasons to be stored for each training application history

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'training_registrations' AND column_name = 'admin_notes') THEN
        ALTER TABLE public.training_registrations ADD COLUMN admin_notes text;
    END IF;
END $$;
