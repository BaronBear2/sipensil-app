-- Enable pgcrypto for password hashing if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- CLEANUP (Optional: Remove comment to clear data first)
-- TRUNCATE TABLE public.magang_permits CASCADE;
-- TRUNCATE TABLE public.im_japan_registrations CASCADE;
-- TRUNCATE TABLE public.lpk_reports CASCADE;
-- DELETE FROM public.profiles WHERE email LIKE '%@example.com';
-- DELETE FROM auth.users WHERE email LIKE '%@example.com';

-- VARIABLES
-- We will use hardcoded UUIDs to maintain relationships easily in this script

-- 1. SEED USERS (auth.users and public.profiles)

-- A. PENCAKER (Verified)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
VALUES (
    'a1111111-1111-1111-1111-111111111111', 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated', 
    'authenticated', 
    'pencaker_verified@example.com', 
    crypt('password123', gen_salt('bf')), 
    now(), 
    '{"full_name": "Budi Santoso", "role": "PENCAKER"}', 
    now(), now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, role, email, full_name, nik, phone, account_status, verification_status, created_at)
VALUES (
    'a1111111-1111-1111-1111-111111111111',
    'PENCAKER',
    'pencaker_verified@example.com',
    'Budi Santoso',
    '3216000000000001',
    '08120000001',
    'verified',
    'VERIFIED',
    now()
) ON CONFLICT (id) DO NOTHING;

-- B. PENCAKER (Pending / Baru Daftar)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
VALUES (
    'a2222222-2222-2222-2222-222222222222', 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated', 
    'authenticated', 
    'pencaker_pending@example.com', 
    crypt('password123', gen_salt('bf')), 
    now(), 
    '{"full_name": "Siti Aminah", "role": "PENCAKER"}', 
    now(), now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, role, email, full_name, nik, phone, account_status, verification_status, created_at)
VALUES (
    'a2222222-2222-2222-2222-222222222222',
    'PENCAKER',
    'pencaker_pending@example.com',
    'Siti Aminah',
    '3216000000000002',
    '08120000002',
    'pending',
    'UNVERIFIED',
    now()
) ON CONFLICT (id) DO NOTHING;

-- C. PENCAKER (Rejected)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
VALUES (
    'a3333333-3333-3333-3333-333333333333', 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated', 
    'authenticated', 
    'pencaker_rejected@example.com', 
    crypt('password123', gen_salt('bf')), 
    now(), 
    '{"full_name": "Rudi Gagal", "role": "PENCAKER"}', 
    now(), now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, role, email, full_name, nik, phone, account_status, verification_status, rejection_message, created_at)
VALUES (
    'a3333333-3333-3333-3333-333333333333',
    'PENCAKER',
    'pencaker_rejected@example.com',
    'Rudi Gagal',
    '3216000000000003',
    '08120000003',
    'rejected',
    'REJECTED',
    'Scan KTP tidak terbaca, mohon upload ulang dengan resolusi tinggi.',
    now()
) ON CONFLICT (id) DO NOTHING;

-- D. LPK ADMIN (Verified)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
VALUES (
    'b1111111-1111-1111-1111-111111111111', 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated', 
    'authenticated', 
    'lpk_majujaya@example.com', 
    crypt('password123', gen_salt('bf')), 
    now(), 
    '{"full_name": "LPK Maju Jaya", "role": "ADMIN_LPK"}', 
    now(), now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, role, email, full_name, company_name, phone, address_office, account_status, created_at)
VALUES (
    'b1111111-1111-1111-1111-111111111111',
    'ADMIN_LPK',
    'lpk_majujaya@example.com',
    'LPK Maju Jaya',
    'LPK Maju Jaya',
    '0218888888',
    'Jl. Industri Jababeka No. 1',
    'verified',
    now()
) ON CONFLICT (id) DO NOTHING;

-- E. PERUSAHAAN (Verified / Admin Perusahaan)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
VALUES (
    'c1111111-1111-1111-1111-111111111111', 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated', 
    'authenticated', 
    'pt_yamaha@example.com', 
    crypt('password123', gen_salt('bf')), 
    now(), 
    '{"full_name": "PT Yamaha Music", "role": "ADMIN_PERUSAHAAN"}', 
    now(), now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, role, email, full_name, company_name, nib, phone, address_office, account_status, created_at)
VALUES (
    'c1111111-1111-1111-1111-111111111111',
    'ADMIN_PERUSAHAAN',
    'pt_yamaha@example.com',
    'PT Yamaha Music',
    'PT Yamaha Music',
    '1234567890123',
    '0219999999',
    'Kawasan Industri MM2100',
    'verified',
    now()
) ON CONFLICT (id) DO NOTHING;


-- 2. SEED APPLICATION DATA

-- A. IM JAPAN (Pending) - from Verified Pencaker
INSERT INTO public.im_japan_registrations (user_id, batch, status, document_path, created_at)
VALUES (
    'a1111111-1111-1111-1111-111111111111',
    'Batch 1/2025',
    'PENDING',
    'https://example.com/dummy.pdf',
    now()
);

-- A. IM JAPAN (Rejected) - from Rejected Pencaker
INSERT INTO public.im_japan_registrations (user_id, batch, status, document_path, admin_notes, created_at)
VALUES (
    'a3333333-3333-3333-3333-333333333333',
    'Batch 1/2025',
    'REJECTED',
    'https://example.com/dummy.pdf',
    'Dokumen fisik tidak lengkap',
    now() - interval '2 days'
);

-- B. LPK REPORT (Submitted)
INSERT INTO public.lpk_reports (user_id, nama_lpk, no_reg, semester, tahun, data_karyawan, data_penyelenggaraan, status, created_at)
VALUES (
    'b1111111-1111-1111-1111-111111111111',
    'LPK Maju Jaya',
    '11.22.33.44',
    'Ganjil',
    '2024',
    '{"peserta_l": 50, "peserta_p": 40}',
    '[{"kode_program": "TI01", "nama_program": "Teknik Komputer", "jml_peserta": 30, "jml_lulus": 25}]',
    'SUBMITTED',
    now()
);

-- C. MAGANG PERMIT (Pending)
INSERT INTO public.magang_permits (company_id, start_date, end_date, participant_count, status, created_at)
VALUES (
    'c1111111-1111-1111-1111-111111111111',
    '2025-02-01',
    '2025-08-01',
    10,
    'PENDING',
    now()
);

-- C. MAGANG PERMIT (Approved)
INSERT INTO public.magang_permits (company_id, start_date, end_date, participant_count, status, letter_number, created_at)
VALUES (
    'c1111111-1111-1111-1111-111111111111',
    '2024-01-01',
    '2024-06-01',
    5,
    'APPROVED',
    '566/123/DISNAKER-MAGANG/2024',
    now() - interval '6 months'
);

-- 3. SEED TRAININGS (Optional extra)
INSERT INTO public.blk_trainings (title, provider, description, category, quota, created_at)
VALUES
    ('Pelatihan Las Listrik 3G', 'UPTD BLK Kabupaten Bekasi', 'Pelatihan las profesional bersertifikat BNSP.', 'Teknik Las', 20, now()),
    ('Pelatihan Barista Coffee', 'LPK Barista Muda', 'Belajar menjadi barista profesional dari nol.', 'Pariwisata', 15, now()),
    ('Pelatihan Graphic Design', 'UPTD BLK Kabupaten Bekasi', 'Menguasai Adobe Photoshop & Illustrator.', 'IT & Desain', 25, now())
ON CONFLICT DO NOTHING;
