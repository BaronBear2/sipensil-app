-- Fix Nested Cascade: Magang Agreements -> Pencatatan Batches
-- This fixes the error where deleting a User fails because their Batches cannot be deleted due to linked Agreements.

ALTER TABLE public.magang_agreements
DROP CONSTRAINT IF EXISTS magang_agreements_batch_id_fkey;

ALTER TABLE public.magang_agreements
ADD CONSTRAINT magang_agreements_batch_id_fkey
FOREIGN KEY (batch_id) REFERENCES public.pencatatan_batches(id) ON DELETE CASCADE;
