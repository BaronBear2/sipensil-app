-- Migration: Add name column to training_selections
-- Created at: 2026-05-21

ALTER TABLE public.training_selections ADD COLUMN IF NOT EXISTS name TEXT;

-- Refresh PostgREST schema cache so the API immediately recognizes the new column
NOTIFY pgrst, 'reload_schema';
