-- Migration: Update Magang Agreements Schema
-- Purpose: Support detailed internship recording fields

ALTER TABLE public.magang_agreements
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS place_of_birth text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS division text,
ADD COLUMN IF NOT EXISTS duration text,
ADD COLUMN IF NOT EXISTS post_activity text,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Update status constraint/default if needed (keeping 'PENDING_VALIDATION' as default is fine)
-- We might want to standardize on 'SUBMITTED' or 'PENDING' later, but let's just interpret 'PENDING_VALIDATION' as Pending.
-- UI statuses: PENDING, ACCEPTED, REJECTED.
-- DB statuses: PENDING_VALIDATION, VALID (or APPROVED), REJECTED.

DO $$
BEGIN
    -- Rename status 'PENDING_VALIDATION' to 'PENDING' for consistency if desired, or just map in UI.
    -- Let's keep it simple and just add columns for now.
    -- Maybe adding an index on user_id and status for faster lookups
    CREATE INDEX IF NOT EXISTS idx_magang_agreements_user_id ON public.magang_agreements(user_id);
    CREATE INDEX IF NOT EXISTS idx_magang_agreements_status ON public.magang_agreements(status);
END $$;
