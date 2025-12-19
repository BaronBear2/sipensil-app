-- SQL Migration to support Patch V5.1 & V5.4 Features
-- Run this in your Supabase SQL Editor

-- 1. Add missing URL columns for Profile Documents
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ktp_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ijazah_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 2. Add Registration Dates to Training Table (V5.1-04) if not exists
ALTER TABLE public.blk_trainings ADD COLUMN IF NOT EXISTS registration_start DATE;
ALTER TABLE public.blk_trainings ADD COLUMN IF NOT EXISTS registration_end DATE;

-- 3. Ensure RLS allows users to update their own profile (Standard, should exist, but confirming)
-- (No change needed if 'Users can update own profile' policy exists)
