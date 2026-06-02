-- =========================================================================
-- TAHAP 1: MENGHAPUS TABEL YANG TIDAK DIGUNAKAN (CLEANUP)
-- =========================================================================

-- Drop foreign keys dependencies first just in case
DROP TABLE IF EXISTS public.im_japan_registrations CASCADE;
DROP TABLE IF EXISTS public.im_japan_requirements CASCADE;
DROP TABLE IF EXISTS public.lpk_reports CASCADE;
DROP TABLE IF EXISTS public.magang_agreements CASCADE;
DROP TABLE IF EXISTS public.magang_permits CASCADE;
DROP TABLE IF EXISTS public.pencatatan_batches CASCADE;
DROP TABLE IF EXISTS public.profile_lpk CASCADE;
DROP TABLE IF EXISTS public.profile_perusahaan CASCADE;

-- 2. Hapus Kolom-kolom Usang di blk_trainings & training_registrations
ALTER TABLE public.blk_trainings 
  DROP COLUMN IF EXISTS admin_passed_pdf,
  DROP COLUMN IF EXISTS selection_passed_pdf,
  DROP COLUMN IF EXISTS final_passed_pdf,
  DROP COLUMN IF EXISTS facilities;

ALTER TABLE public.training_registrations
  DROP COLUMN IF EXISTS selection_id,
  DROP COLUMN IF EXISTS class_id,
  DROP COLUMN IF EXISTS exam_id,
  DROP COLUMN IF EXISTS tanggal_verifikasi_pendaftaran,
  DROP COLUMN IF EXISTS tanggal_pengumuman_seleksi,
  DROP COLUMN IF EXISTS tanggal_pengumuman_kompetensi;

ALTER TABLE public.profile_pencaker
  DROP COLUMN IF EXISTS major,
  DROP COLUMN IF EXISTS skills,
  DROP COLUMN IF EXISTS field_of_work,
  DROP COLUMN IF EXISTS curriculum_vitae;

DROP TABLE IF EXISTS public.exam_results CASCADE;
DROP TABLE IF EXISTS public.training_classes CASCADE;
DROP TABLE IF EXISTS public.news CASCADE;


-- =========================================================================
-- TAHAP 2: RLS (ROW LEVEL SECURITY) HARDENING
-- =========================================================================
-- Hal ini memastikan bahwa user biasa/hacker tidak bisa menyuntikkan data (API manipulasi)

-- 1. Enable RLS pada semua tabel penting yang tersisa
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_pencaker ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blk_trainings ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_exams ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts (Safe Policy Dropper)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END$$;

-- 3. Membuat Fungsi SECURITY DEFINER untuk mengecek role admin (Bypass RLS loop)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  RETURN user_role IN ('ADMIN', 'DINAS', 'admin', 'dinas');
END;
$$;

-- 4. Membuat Policy untuk [profiles] & [profile_pencaker]
-- Semua orang bisa melihat profilnya sendiri. Admin/Dinas bisa melihat semua.
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin/Dinas can do all on profiles" ON public.profiles FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view their own pencaker profile" ON public.profile_pencaker FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own pencaker profile" ON public.profile_pencaker FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own pencaker profile" ON public.profile_pencaker FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin/Dinas can do all on profile_pencaker" ON public.profile_pencaker FOR ALL USING (public.is_admin());

-- 5. Membuat Policy untuk [training_registrations]
-- SANGAT PENTING: Pencaker hanya bisa melihat dan menambah pendaftaran miliknya sendiri.
CREATE POLICY "Pencaker can view own registrations" ON public.training_registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Pencaker can insert own registrations" ON public.training_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Pencaker can update own registrations (e.g. upload pdf)" ON public.training_registrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Pencaker can delete own registrations (batal daftar)" ON public.training_registrations FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admin/Dinas can do all on registrations" ON public.training_registrations FOR ALL USING (public.is_admin());

-- 6. Membuat Policy untuk [blk_trainings, announcements, dll] (Publik bisa BACA, Admin bisa TULIS)
-- BLK Trainings
CREATE POLICY "Anyone can view trainings" ON public.blk_trainings FOR SELECT USING (true);
CREATE POLICY "Admin/Dinas can modify trainings" ON public.blk_trainings FOR ALL USING (public.is_admin());

-- Training Announcements
CREATE POLICY "Anyone can view announcements" ON public.training_announcements FOR SELECT USING (true);
CREATE POLICY "Admin/Dinas can modify announcements" ON public.training_announcements FOR ALL USING (public.is_admin());

-- Training Details (Exams, Selections)
CREATE POLICY "Anyone can view training_exams" ON public.training_exams FOR SELECT USING (true);
CREATE POLICY "Admin/Dinas can modify training_exams" ON public.training_exams FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can view training_selections" ON public.training_selections FOR SELECT USING (true);
CREATE POLICY "Admin/Dinas can modify training_selections" ON public.training_selections FOR ALL USING (public.is_admin());


-- 8. Membuat Policy untuk [notifications]
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admin/Dinas can insert notifications" ON public.notifications FOR INSERT WITH CHECK (public.is_admin());

-- 9. Membuat Policy untuk [master_*] tables dan [qa_system_time]
-- Mencegah hacker iseng mengubah master kategori atau lompat waktu QA
ALTER TABLE public.master_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_system_time ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view master_categories" ON public.master_categories FOR SELECT USING (true);
CREATE POLICY "Admin/Dinas can modify master_categories" ON public.master_categories FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can view master_locations" ON public.master_locations FOR SELECT USING (true);
CREATE POLICY "Admin/Dinas can modify master_locations" ON public.master_locations FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can view master_requirements" ON public.master_requirements FOR SELECT USING (true);
CREATE POLICY "Admin/Dinas can modify master_requirements" ON public.master_requirements FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can view master_notes" ON public.master_notes FOR SELECT USING (true);
CREATE POLICY "Admin/Dinas can modify master_notes" ON public.master_notes FOR ALL USING (public.is_admin());

-- qa_system_time sangat krusial, hanya Admin yang boleh melihat dan mengubah
CREATE POLICY "Admin/Dinas can view qa_system_time" ON public.qa_system_time FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin/Dinas can modify qa_system_time" ON public.qa_system_time FOR ALL USING (public.is_admin());
