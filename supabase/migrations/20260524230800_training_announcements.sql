-- Drop the previous trigger and function for timestamp automation
DROP TRIGGER IF EXISTS trg_training_registrations_timestamps ON public.training_registrations;
DROP FUNCTION IF EXISTS trg_set_registration_timestamps();

-- Add scheduled announcement dates to blk_trainings
ALTER TABLE public.blk_trainings
ADD COLUMN IF NOT EXISTS tanggal_pengumuman_kelulusan_administrasi date,
ADD COLUMN IF NOT EXISTS tanggal_pengumuman_kelulusan_seleksi_awal date,
ADD COLUMN IF NOT EXISTS tanggal_pengumuman_hasil_uji_kompetensi date;

-- Create training_announcements table
CREATE TABLE public.training_announcements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL,
  type text NOT NULL, -- 'administrasi', 'seleksi_awal', 'uji_kompetensi'
  document_url text,
  content text,
  is_published boolean DEFAULT false,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT training_announcements_pkey PRIMARY KEY (id),
  CONSTRAINT training_announcements_training_id_fkey FOREIGN KEY (training_id) REFERENCES public.blk_trainings(id)
);

-- Note: We intentionally leave the old timestamp columns on training_registrations 
-- (tanggal_verifikasi_pendaftaran, dll) for now to avoid data loss from past records,
-- or they can be dropped later if completely unnecessary.

-- Enable RLS and Policies for training_announcements
ALTER TABLE public.training_announcements ENABLE ROW LEVEL SECURITY;

-- Public can view published announcements
CREATE POLICY "Public can view announcements" ON public.training_announcements
    FOR SELECT USING (is_published = true);

-- Admins can view all announcements
CREATE POLICY "Admins can view all announcements" ON public.training_announcements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('ADMIN', 'ADMIN_DINAS', 'dinas', 'admin')
        )
    );

-- Admins can insert announcements
CREATE POLICY "Admins can insert announcements" ON public.training_announcements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('ADMIN', 'ADMIN_DINAS', 'dinas', 'admin')
        )
    );

-- Admins can update announcements
CREATE POLICY "Admins can update announcements" ON public.training_announcements
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('ADMIN', 'ADMIN_DINAS', 'dinas', 'admin')
        )
    );

-- Admins can delete announcements
CREATE POLICY "Admins can delete announcements" ON public.training_announcements
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('ADMIN', 'ADMIN_DINAS', 'dinas', 'admin')
        )
    );
