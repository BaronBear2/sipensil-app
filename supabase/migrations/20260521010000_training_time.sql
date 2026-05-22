-- Migration: Add Training Time
-- Created at: 2026-05-21

ALTER TABLE public.blk_trainings
ADD COLUMN IF NOT EXISTS training_start_time TIME,
ADD COLUMN IF NOT EXISTS training_end_time TIME;
