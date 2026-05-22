-- MIGRATION: Pivot Pelatihan Kompetensi
-- DATE: 2026-05-20

-- 0. ALTER TABLE blk_trainings
ALTER TABLE public.blk_trainings
ADD COLUMN IF NOT EXISTS whatsapp_group_link TEXT;

-- 1. ALTER TABLE training_registrations
ALTER TABLE public.training_registrations
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS is_unemployed BOOLEAN,
ADD COLUMN IF NOT EXISTS has_sim_a BOOLEAN,
ADD COLUMN IF NOT EXISTS ktp_address TEXT,
ADD COLUMN IF NOT EXISTS ijazah_url TEXT,
ADD COLUMN IF NOT EXISTS ktp_url TEXT,
ADD COLUMN IF NOT EXISTS progress_step INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS selection_id UUID,
ADD COLUMN IF NOT EXISTS exam_id UUID;

-- 2. CREATE TABLE training_selections
CREATE TABLE IF NOT EXISTS public.training_selections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    training_id UUID NOT NULL REFERENCES public.blk_trainings(id) ON DELETE CASCADE,
    name TEXT,
    selection_date DATE,
    selection_time TIME,
    location_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE TABLE training_exams
CREATE TABLE IF NOT EXISTS public.training_exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    training_id UUID NOT NULL REFERENCES public.blk_trainings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    exam_date DATE,
    exam_time TIME,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREATE TABLE exam_results
CREATE TABLE IF NOT EXISTS public.exam_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    registration_id UUID NOT NULL REFERENCES public.training_registrations(id) ON DELETE CASCADE,
    final_score NUMERIC,
    status TEXT, -- 'Lulus' / 'Tidak Lulus'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Add Foreign Key Constraints for the new columns in training_registrations
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_selection_id') THEN
        ALTER TABLE public.training_registrations
        ADD CONSTRAINT fk_selection_id
        FOREIGN KEY (selection_id) REFERENCES public.training_selections(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_exam_id') THEN
        ALTER TABLE public.training_registrations
        ADD CONSTRAINT fk_exam_id
        FOREIGN KEY (exam_id) REFERENCES public.training_exams(id) ON DELETE SET NULL;
    END IF;
END $$;
