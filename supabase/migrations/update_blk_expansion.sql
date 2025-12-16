-- Migration: BLK Expansion & Notifications
-- Created at: 2025-12-16

-- 1. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('ADMIN_DINAS', 'ADMIN')
        )
    );

-- 2. Expand BLK Trainings Table
ALTER TABLE public.blk_trainings 
ADD COLUMN IF NOT EXISTS min_age INTEGER DEFAULT 17,
ADD COLUMN IF NOT EXISTS max_age INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS requirements TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS certification TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'OPEN'; -- OPEN, CLOSED, DRAFT

-- 3. Add Rejection Reason to LPK Reports (for feedback)
ALTER TABLE public.lpk_reports
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
