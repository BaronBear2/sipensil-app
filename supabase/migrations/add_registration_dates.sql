-- Add Registration Window Dates to BLK Trainings
ALTER TABLE public.blk_trainings
ADD COLUMN IF NOT EXISTS registration_start DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS registration_end DATE DEFAULT (CURRENT_DATE + INTERVAL '14 days');

-- Comment: Default registration window is 2 weeks from creation
