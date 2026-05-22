-- Menambahkan kolom required_documents untuk menyimpan list JSON string persyaratan berkas tambahan
ALTER TABLE public.blk_trainings ADD COLUMN IF NOT EXISTS additional_documents jsonb DEFAULT '[]'::jsonb;

-- Menambahkan kolom documents untuk menyimpan list JSON object file yang diupload pencaker sesuai requirements tambahan
ALTER TABLE public.training_registrations ADD COLUMN IF NOT EXISTS additional_documents jsonb DEFAULT '{}'::jsonb;
