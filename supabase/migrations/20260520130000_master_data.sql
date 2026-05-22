-- MIGRATION: Master Data Tables
-- DATE: 2026-05-20

-- 1. CREATE master_categories
CREATE TABLE IF NOT EXISTS public.master_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE master_locations
CREATE TABLE IF NOT EXISTS public.master_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default Values
INSERT INTO public.master_categories (name) VALUES 
('Las'), ('Otomotif'), ('Menjahit'), ('IT & Komputer'), ('Pariwisata'), ('Tata Boga')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.master_locations (name, address) VALUES 
('UPTD BLK Kabupaten Bekasi', 'Tambun Utara, Kab. Bekasi'),
('Balai Desa Cikarang Kota', 'Cikarang Utara, Kab. Bekasi')
ON CONFLICT DO NOTHING;
