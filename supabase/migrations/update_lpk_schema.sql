-- Add new columns to 'profiles' table for enhanced LPK data
-- Based on user requirements for "Halaman Register (LPK)" and "Halaman Edit Profil LPK"

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS operational_pj text,           -- Nama Penanggungjawab Operasional LPK
ADD COLUMN IF NOT EXISTS operational_pj_title text,     -- Jabatan Penanggungjawab Operasional LPK
ADD COLUMN IF NOT EXISTS operational_pj_phone text,     -- Nomor Kontak/HP Penanggungjawab Operasional LPK
ADD COLUMN IF NOT EXISTS operational_pj_email text,     -- Email Penanggungjawab Operasional LPK
ADD COLUMN IF NOT EXISTS address_office text,           -- Alamat Kantor
ADD COLUMN IF NOT EXISTS fax text,                      -- No. Fax
ADD COLUMN IF NOT EXISTS email_official text,           -- Email Resmi LPK
ADD COLUMN IF NOT EXISTS license_number text,           -- Nomor Izin / Tanda Daftar LPK / Sertifikat Standar
ADD COLUMN IF NOT EXISTS license_date date,             -- Tanggal Izin
ADD COLUMN IF NOT EXISTS lpk_type text,                 -- Jenis LPK (Swasta/Pemerintah/Perusahaan)
ADD COLUMN IF NOT EXISTS director_name text,            -- Nama Kepala/Direktur LPK
ADD COLUMN IF NOT EXISTS director_phone text;           -- Nomor Telepon Kepala/Direktur

-- Note: 'lpk_reports' table will use JSONB columns to store the flexible report sections.
-- No schema changes n
\


43't
[3 
/k
3oo'\
 3wq
 
 
 
 
 
 
 
 
 ftrlvo8 ;i7f 7f 7f f
 
 
  eeded for 'lpk_reports' as we will repurpose/expand the existing JSONB structure 
-- or rely on the fact that existing JSONB columns can hold new keys.
-- If strict column naming is desired for new sections, we can add them:

ALTER TABLE public.lpk_reports
ADD COLUMN IF NOT EXISTS data_akreditasi jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS data_pengembangan_program jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS data_tuk jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS data_pengembangan_kelembagaan jsonb DEFAULT '[]'::jsonb;
