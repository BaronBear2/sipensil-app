-- Migration to add PDF storage fields to blk_trainings for Phase 5

ALTER TABLE public.blk_trainings
ADD COLUMN IF NOT EXISTS admin_passed_pdf TEXT,
ADD COLUMN IF NOT EXISTS selection_passed_pdf TEXT,
ADD COLUMN IF NOT EXISTS final_passed_pdf TEXT;
