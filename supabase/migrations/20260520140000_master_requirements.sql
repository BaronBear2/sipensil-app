-- MIGRATION: Master Requirements & Notes Tables
-- DATE: 2026-05-20
-- 1. CREATE master_requirements
CREATE TABLE IF NOT EXISTS public.master_requirements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE master_notes
CREATE TABLE IF NOT EXISTS public.master_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default Persyaratan
INSERT INTO public.master_requirements (text) VALUES 
('Pria / Wanita'),
('Ber-KTP Kabupaten Bekasi'),
('Usia Minimal 18 Tahun'),
('Tidak Sedang Bersekolah / Bekerja'),
('Bersedia Mengikuti Pelatihan dan Menginap di BLK'),
('Sehat Jasmani dan Rohani')
ON CONFLICT (text) DO NOTHING;

-- Insert Default Catatan
INSERT INTO public.master_notes (text) VALUES 
('Sesudah mengisi formulir pendaftaran, bagi peserta yang LOLOS administrasi/sesuai kualifikasi akan bergabung ke grup Whatsapp untuk informasi selanjutnya'),
('Informasi selengkapnya hubungi: 0813-8983-5498')
ON CONFLICT (text) DO NOTHING;

-- Refresh Schema Cache
NOTIFY pgrst, 'reload schema';
