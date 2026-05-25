-- Migration: Simplify Progress Steps from 8 to 4
-- Map:
-- 1 -> 1 (Administrasi)
-- 2, 3 -> 2 (Seleksi)
-- 4, 5, 6 -> 3 (Jadwal Pelatihan)
-- 7, 8 -> 4 (Hasil Uji Kompetensi)

BEGIN;

UPDATE training_registrations
SET progress_step = CASE
    WHEN progress_step IN (2, 3) THEN 2
    WHEN progress_step IN (4, 5, 6) THEN 3
    WHEN progress_step IN (7, 8) THEN 4
    ELSE progress_step
END
WHERE progress_step > 1;

-- Update the RPC to avoid messing with the steps automatically based on time since cron does it now.
-- We can simply redefine update_time_based_progress to do nothing, or just leave it.
-- We will redefine it to return VOID and do nothing to prevent it from bumping steps.
CREATE OR REPLACE FUNCTION update_time_based_progress()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This function intentionally left blank
    -- Progress steps are now handled entirely by the automated cron job / process announcements logic
    -- or manually via the Announcement Manager.
END;
$$;

COMMIT;
