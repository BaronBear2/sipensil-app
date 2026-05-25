ALTER TABLE public.training_announcements
ADD COLUMN IF NOT EXISTS scheduled_date date;
