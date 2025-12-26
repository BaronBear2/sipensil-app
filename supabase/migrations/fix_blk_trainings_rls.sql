-- 1. Add Training Period Dates
ALTER TABLE public.blk_trainings
ADD COLUMN IF NOT EXISTS training_start_date DATE,
ADD COLUMN IF NOT EXISTS training_end_date DATE;

-- 2. Fix RLS Policies for BLK Trainings
ALTER TABLE public.blk_trainings ENABLE ROW LEVEL SECURITY;

-- Policy: Public can VIEW (SELECT)
DROP POLICY IF EXISTS "Public can view trainings" ON public.blk_trainings;
CREATE POLICY "Public can view trainings" ON public.blk_trainings
    FOR SELECT USING (true);

-- Policy: Admins can INSERT
DROP POLICY IF EXISTS "Admins can insert trainings" ON public.blk_trainings;
CREATE POLICY "Admins can insert trainings" ON public.blk_trainings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('ADMIN', 'ADMIN_DINAS')
        )
    );

-- Policy: Admins can UPDATE
DROP POLICY IF EXISTS "Admins can update trainings" ON public.blk_trainings;
CREATE POLICY "Admins can update trainings" ON public.blk_trainings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('ADMIN', 'ADMIN_DINAS')
        )
    );

-- Policy: Admins can DELETE
DROP POLICY IF EXISTS "Admins can delete trainings" ON public.blk_trainings;
CREATE POLICY "Admins can delete trainings" ON public.blk_trainings
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('ADMIN', 'ADMIN_DINAS')
        )
    );
