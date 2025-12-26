-- Migration for Pencatatan Batches
-- Run this in Supabase SQL Editor

-- 1. Create Batches Table
CREATE TABLE IF NOT EXISTS public.pencatatan_batches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  status text DEFAULT 'SUBMITTED'::text, -- SUBMITTED, APPROVED, REJECTED
  submission_date timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  rejection_reason text,
  CONSTRAINT pencatatan_batches_pkey PRIMARY KEY (id),
  CONSTRAINT pencatatan_batches_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- 2. Add batch_id to magang_agreements
-- This links individual candidates to the batch
ALTER TABLE public.magang_agreements 
ADD COLUMN IF NOT EXISTS batch_id uuid REFERENCES public.pencatatan_batches(id);

-- 3. Add RLS Policies (Optional but recommended)
ALTER TABLE public.pencatatan_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own batches"
ON public.pencatatan_batches
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own batches"
ON public.pencatatan_batches
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
