-- Auto-Sync Quota Trigger
-- This ensures blk_trainings.filled is ALWAYS exactly the number of participants
-- with status DITERIMA, LULUS, or SELESAI, regardless of where the update happens
-- (Server Actions, Cron Jobs, Manual Deletions, Pencaker Cancellations).

CREATE OR REPLACE FUNCTION trg_sync_training_quota()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.blk_trainings
    SET filled = (
      SELECT count(*) FROM public.training_registrations 
      WHERE training_id = NEW.training_id AND status IN ('DITERIMA', 'LULUS', 'SELESAI')
    )
    WHERE id = NEW.training_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.blk_trainings
    SET filled = (
      SELECT count(*) FROM public.training_registrations 
      WHERE training_id = OLD.training_id AND status IN ('DITERIMA', 'LULUS', 'SELESAI')
    )
    WHERE id = OLD.training_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_training_quota ON public.training_registrations;
CREATE TRIGGER sync_training_quota
AFTER INSERT OR UPDATE OF status OR DELETE ON public.training_registrations
FOR EACH ROW EXECUTE FUNCTION trg_sync_training_quota();
