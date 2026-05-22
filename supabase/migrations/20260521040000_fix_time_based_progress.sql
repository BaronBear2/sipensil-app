-- Migration: Fix QA Time Progression Bug for Step 5 and 7
-- Created at: 2026-05-21

DROP FUNCTION IF EXISTS public.update_time_based_progress();

CREATE OR REPLACE FUNCTION public.update_time_based_progress()
RETURNS TABLE (
    registration_id uuid,
    user_id uuid,
    new_step integer,
    training_title text,
    whatsapp_group_link text,
    status text
) AS $$
DECLARE
BEGIN
    -- Create a temp table to hold updated records
    CREATE TEMP TABLE IF NOT EXISTS temp_updated_progress (
        registration_id uuid,
        user_id uuid,
        new_step integer,
        training_title text,
        whatsapp_group_link text,
        status text
    ) ON COMMIT DROP;

    -- Clear temp table if it exists from previous run in same transaction
    TRUNCATE temp_updated_progress;

    -- Step 4 updates
    WITH updated AS (
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
              (ts.last_selection_date IS NOT NULL AND public.get_system_date() > ts.last_selection_date)
              OR
              (ts.last_selection_date IS NULL AND bt.training_start_date IS NOT NULL AND public.get_system_date() > (bt.training_start_date - INTERVAL '1 day'))
          )
        RETURNING tr.id, tr.user_id, 4 as new_step, bt.title as training_title, bt.whatsapp_group_link, tr.status::text
    )
    INSERT INTO temp_updated_progress SELECT * FROM updated;

    -- Step 5 updates
    WITH updated AS (
        UPDATE public.training_registrations tr
        SET progress_step = 5
        FROM public.blk_trainings bt
        LEFT JOIN (
            SELECT training_id, MAX(exam_date) as last_exam_date
            FROM public.training_exams
            GROUP BY training_id
        ) te ON te.training_id = bt.id
        WHERE tr.training_id = bt.id
          AND tr.progress_step = 4
          AND tr.status = 'DITERIMA'
          AND (
              (te.last_exam_date IS NOT NULL AND public.get_system_date() >= te.last_exam_date)
              OR
              (te.last_exam_date IS NULL AND bt.training_end_date IS NOT NULL AND public.get_system_date() >= (bt.training_end_date - INTERVAL '2 days'))
          )
        RETURNING tr.id, tr.user_id, 5 as new_step, bt.title as training_title, bt.whatsapp_group_link, tr.status::text
    )
    INSERT INTO temp_updated_progress SELECT * FROM updated;

    -- Step 7 updates
    WITH updated AS (
        UPDATE public.training_registrations tr
        SET progress_step = 7, status = 'LULUS'
        FROM public.blk_trainings bt
        LEFT JOIN (
            SELECT training_id, MAX(exam_date) as last_exam_date
            FROM public.training_exams
            GROUP BY training_id
        ) te ON te.training_id = bt.id
        WHERE tr.training_id = bt.id
          AND tr.progress_step IN (4, 5, 6)
          AND tr.status = 'DITERIMA'
          AND NOT EXISTS (
              SELECT 1 FROM public.exam_results er 
              WHERE er.registration_id = tr.id AND er.status = 'TIDAK LULUS'
          )
          AND (
              (te.last_exam_date IS NOT NULL AND public.get_system_date() > te.last_exam_date)
              OR
              (te.last_exam_date IS NULL AND bt.training_end_date IS NOT NULL AND public.get_system_date() > bt.training_end_date)
          )
        RETURNING tr.id, tr.user_id, 7 as new_step, bt.title as training_title, bt.whatsapp_group_link, 'LULUS'::text as status
    )
    INSERT INTO temp_updated_progress SELECT * FROM updated;

    RETURN QUERY SELECT * FROM temp_updated_progress;
END;
$$ LANGUAGE plpgsql;
