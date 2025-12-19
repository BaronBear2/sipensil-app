-- SQL Migration for Patch V5.5 (Perusahaan Dashboard Enhancements)
-- Run this in Supabase SQL Editor

-- 1. Add specific columns for Perusahaan Profile
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nib TEXT;          -- Nomor Induk Berusaha
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sector TEXT;       -- Sektor Usaha
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pic_name TEXT;     -- Nama PIC HRD / Pemagangan
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pic_phone TEXT;    -- No HP PIC

-- Note: 'address_office', 'email_official', 'director_name' might already exist from LPK updates.
-- If not, creating them here to be safe (idempotent).
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address_office TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_official TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS director_name TEXT;
