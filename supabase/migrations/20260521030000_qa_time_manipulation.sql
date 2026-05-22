-- Migration: QA Time Manipulation
-- Created at: 2026-05-21

CREATE TABLE IF NOT EXISTS public.qa_system_time (
    id integer PRIMARY KEY DEFAULT 1,
    overridden_time timestamp with time zone,
    CONSTRAINT single_row CHECK (id = 1)
);

-- Seed single row if not exists
INSERT INTO public.qa_system_time (id, overridden_time) 
VALUES (1, NULL) 
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.get_system_date()
RETURNS date AS $$
BEGIN
    RETURN COALESCE((SELECT overridden_time::date FROM public.qa_system_time WHERE id = 1), (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::DATE);
END;
$$ LANGUAGE plpgsql;

-- Recreate update_time_based_progress to use public.get_system_date() instead of CURRENT_DATE
CREATE OR REPLACE FUNCTION public.update_time_based_progress()
RETURNS void AS $$
BEGIN
    -- Move to Step 4 (Class Placement) if today > MAX(selection_date) OR today >= training_start_date
    -- This handles Step 3 (Lulus Seleksi) and Step 4 simultaneously
    UPDATE public.training_registrations tr
    SET progress_step = 4
    FROM public.blk_trainings bt
    LEFT JOIN (
        SELECT training_id, MAX(selection_date) as last_selection_date
        FROM public.training_selections
        GROUP BY training_id
    ) ts ON ts.training_id = bt.id
    WHERE tr.training_id = bt.id
      AND tr.progress_step IN (2, 3)
      AND tr.status = 'DITERIMA'
      AND (
          (ts.last_selection_date IS NOT NULL AND public.get_system_date() >= (ts.last_selection_date + INTERVAL '2 days'))
          OR
          (ts.last_selection_date IS NULL AND bt.training_start_date IS NOT NULL AND public.get_system_date() >= bt.training_start_date)
      );

    -- Move to Step 5 (Exam / Evaluation) if today >= exam_date OR (today >= training_end_date - 2 days if no exam)
    UPDATE public.training_registrations tr
    SET progress_step = 5
    FROM public.blk_trainings bt
    LEFT JOIN public.training_exams te ON te.id = tr.exam_id
    WHERE tr.training_id = bt.id
      AND tr.progress_step = 4
      AND tr.status = 'DITERIMA'
      AND (
          (te.exam_date IS NOT NULL AND public.get_system_date() >= te.exam_date)
          OR
          (te.exam_date IS NULL AND bt.training_end_date IS NOT NULL AND public.get_system_date() >= (bt.training_end_date - INTERVAL '2 days'))
      );

    -- Move to Step 7 (Lulus) if today > (exam_date OR training_end_date) and no manual failure
    -- We assume Step 6 (Evaluasi Nilai) is bypassed or implicitly completed if they reach this date without being set to failed.
    UPDATE public.training_registrations tr
    SET progress_step = 7, status = 'LULUS'
    FROM public.blk_trainings bt
    LEFT JOIN public.training_exams te ON te.id = tr.exam_id
    LEFT JOIN public.exam_results er ON er.registration_id = tr.id
    WHERE tr.training_id = bt.id
      AND tr.progress_step IN (4, 5, 6)
      AND tr.status = 'DITERIMA'
      AND (er.status IS NULL OR er.status != 'TIDAK LULUS') -- Not manually failed
      AND (
          (te.exam_date IS NOT NULL AND public.get_system_date() > te.exam_date)
          OR
          (te.exam_date IS NULL AND bt.training_end_date IS NOT NULL AND public.get_system_date() > bt.training_end_date)
      );
END;
$$ LANGUAGE plpgsql;
