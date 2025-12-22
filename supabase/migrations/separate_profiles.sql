-- Migration: Separate Profiles into Role-Based Tables
-- Purpose: Normalization and cleaner data structure.

-- 1. Create table for PENCAKER (Pencari Kerja)
CREATE TABLE IF NOT EXISTS "public"."profile_pencaker" (
    "user_id" "uuid" NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
    "nik" "text",
    "gender" "text", -- 'L' or 'P'
    "place_of_birth" "text",
    "date_of_birth" "date",
    "address_ktp" "text",
    "address_dom" "text",
    "phone" "text",
    "religion" "text",
    "education" "text", -- Last education
    "major" "text", -- Jurusan
    "skills" "text",
    "field_of_work" "text", -- Bidang yang diminati
    "curriculum_vitae" "text", -- URL to CV
    "ktp_url" "text",
    "ijazah_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    PRIMARY KEY ("user_id")
);

-- Ensure columns exist (in case table existed from previous run without these columns)
ALTER TABLE "public"."profile_pencaker" ADD COLUMN IF NOT EXISTS "ktp_url" text;
ALTER TABLE "public"."profile_pencaker" ADD COLUMN IF NOT EXISTS "ijazah_url" text;

-- 2. Create table for LPK (Lembaga Pelatihan Kerja)
CREATE TABLE IF NOT EXISTS "public"."profile_lpk" (
    "user_id" "uuid" NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
    "nips" "text", -- Nomor Induk Peserta Sertifikasi (or NPSN/VIN)
    "lpk_name" "text", 
    "lpk_type" "text", -- Swasta/Pemerintah/Perusahaan
    "address_office" "text",
    "phone" "text",
    "fax" "text",
    "email_official" "text",
    
    -- Legalitas
    "license_number" "text",
    "license_date" "date",
    
    -- Penanggung Jawab
    "director_name" "text",
    "director_phone" "text",
    
    -- Operational PJ
    "operational_pj" "text",
    "operational_pj_title" "text",
    "operational_pj_phone" "text",
    "operational_pj_email" "text",
    
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    PRIMARY KEY ("user_id")
);

-- 3. Create table for PERUSAHAAN (Company)
CREATE TABLE IF NOT EXISTS "public"."profile_perusahaan" (
    "user_id" "uuid" NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
    "nib" "text", -- Nomor Induk Berusaha
    "company_name" "text",
    "sector" "text", -- Sektor Usaha
    "address_office" "text",
    "phone" "text",
    "email_official" "text",
    
    -- PIC / Contact Person
    "director_name" "text",
    "pic_name" "text",
    "pic_phone" "text",
    
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    PRIMARY KEY ("user_id")
);

-- 4. Enable RLS
ALTER TABLE "public"."profile_pencaker" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."profile_lpk" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."profile_perusahaan" ENABLE ROW LEVEL SECURITY;

-- 5. Policies (Basic: Users manage their own, Admins manage all)
-- Pencaker
DROP POLICY IF EXISTS "Users view own pencaker profile" ON "public"."profile_pencaker";
CREATE POLICY "Users view own pencaker profile" ON "public"."profile_pencaker" FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own pencaker profile" ON "public"."profile_pencaker";
CREATE POLICY "Users update own pencaker profile" ON "public"."profile_pencaker" FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own pencaker profile" ON "public"."profile_pencaker";
CREATE POLICY "Users insert own pencaker profile" ON "public"."profile_pencaker" FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins view all pencaker" ON "public"."profile_pencaker";
CREATE POLICY "Admins view all pencaker" ON "public"."profile_pencaker" FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins update all pencaker" ON "public"."profile_pencaker";
CREATE POLICY "Admins update all pencaker" ON "public"."profile_pencaker" FOR UPDATE USING (public.is_admin());

-- LPK
DROP POLICY IF EXISTS "Users view own lpk profile" ON "public"."profile_lpk";
CREATE POLICY "Users view own lpk profile" ON "public"."profile_lpk" FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own lpk profile" ON "public"."profile_lpk";
CREATE POLICY "Users update own lpk profile" ON "public"."profile_lpk" FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own lpk profile" ON "public"."profile_lpk";
CREATE POLICY "Users insert own lpk profile" ON "public"."profile_lpk" FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins view all lpk" ON "public"."profile_lpk";
CREATE POLICY "Admins view all lpk" ON "public"."profile_lpk" FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins update all lpk" ON "public"."profile_lpk";
CREATE POLICY "Admins update all lpk" ON "public"."profile_lpk" FOR UPDATE USING (public.is_admin());

-- Perusahaan
DROP POLICY IF EXISTS "Users view own perusahaan profile" ON "public"."profile_perusahaan";
CREATE POLICY "Users view own perusahaan profile" ON "public"."profile_perusahaan" FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own perusahaan profile" ON "public"."profile_perusahaan";
CREATE POLICY "Users update own perusahaan profile" ON "public"."profile_perusahaan" FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own perusahaan profile" ON "public"."profile_perusahaan";
CREATE POLICY "Users insert own perusahaan profile" ON "public"."profile_perusahaan" FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins view all perusahaan" ON "public"."profile_perusahaan";
CREATE POLICY "Admins view all perusahaan" ON "public"."profile_perusahaan" FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins update all perusahaan" ON "public"."profile_perusahaan";
CREATE POLICY "Admins update all perusahaan" ON "public"."profile_perusahaan" FOR UPDATE USING (public.is_admin());

-- 6. TRIGGER LOGIC UPDATES
-- Update (or Create) the Trigger Function to insert into both tables

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_role text;
BEGIN
  -- 1. Insert into Base Profile
  -- We extract role from metadata, default to 'PENCAKER'
  v_role := new.raw_user_meta_data->>'role';
  IF v_role IS NULL THEN
    v_role := 'PENCAKER';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, photo_url, account_status)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    v_role,
    new.raw_user_meta_data->>'avatar_url', -- Map avatar_url to photo_url
    CASE WHEN v_role = 'PENCAKER' THEN 'unverified' ELSE 'pending' END
  );

  -- 2. Insert into Specific Role Table based on Role
  IF v_role = 'PENCAKER' THEN
     INSERT INTO public.profile_pencaker (user_id, nik, phone)
     VALUES (
        new.id,
        new.raw_user_meta_data->>'nik',
        new.raw_user_meta_data->>'phone'
     );
  
  ELSIF v_role = 'ADMIN_LPK' THEN
     INSERT INTO public.profile_lpk (
        user_id, 
        lpk_name, 
        operational_pj, 
        operational_pj_title, 
        operational_pj_phone, 
        operational_pj_email
     )
     VALUES (
        new.id,
        new.raw_user_meta_data->>'company_name',
        new.raw_user_meta_data->>'operational_pj',
        new.raw_user_meta_data->>'operational_pj_title',
        new.raw_user_meta_data->>'operational_pj_phone',
        new.raw_user_meta_data->>'operational_pj_email'
     );

  ELSIF v_role = 'ADMIN_PERUSAHAAN' THEN
     INSERT INTO public.profile_perusahaan (
        user_id, 
        company_name, 
        nib, 
        phone
     )
     VALUES (
        new.id,
        new.raw_user_meta_data->>'company_name',
        new.raw_user_meta_data->>'nib',
        new.raw_user_meta_data->>'phone'
     );
  END IF;

  RETURN new;
END;
$function$;

-- Ensure the trigger is attached (It likely is, but safe to re-run)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END
$$;


-- 7. DATA MIGRATION (Move existing data)
-- 7. DATA MIGRATION (Move existing data)
-- Use DO blocks to check if source columns exist before migrating. 
-- This prevents errors if the script is re-run after columns are dropped.

-- Pencaker
DO $$
BEGIN
    -- Only run if 'nik' exists in profiles (meaning not yet dropped)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'nik') THEN
        INSERT INTO public.profile_pencaker (
            user_id, nik, phone, address_ktp, address_dom, education, gender,
            place_of_birth, date_of_birth, ktp_url, ijazah_url
        )
        SELECT 
            id, nik, phone, address_ktp, address_dom, education, gender,
            pob, dob, ktp_url, ijazah_url
        FROM public.profiles
        WHERE role = 'PENCAKER'
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
END $$;

-- LPK
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'company_name') THEN
        INSERT INTO public.profile_lpk (
            user_id, lpk_name, address_office, phone, email_official, 
            operational_pj, operational_pj_phone, operational_pj_title, 
            director_name, license_number, nips
        )
        SELECT 
            id, company_name, address_office, phone, email_official,
            operational_pj, operational_pj_phone, operational_pj_title,
            director_name, license_number, vin
        FROM public.profiles
        WHERE role IN ('ADMIN_LPK', 'LPK')
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
END $$;

-- Perusahaan
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'nib') THEN
        INSERT INTO public.profile_perusahaan (
            user_id, company_name, address_office, phone, email_official,
            nib, sector, pic_name, pic_phone, director_name
        )
        SELECT 
            id, company_name, address_office, phone, email_official,
            nib, sector, pic_name, pic_phone, director_name
        FROM public.profiles
        WHERE role IN ('ADMIN_PERUSAHAAN', 'PERUSAHAAN')
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
END $$;

-- 8. CLEANUP (Drop moved columns from profiles)
-- WARNING: This is destructive. Ensure data is migrated first.
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS nik,
  DROP COLUMN IF EXISTS phone,
  DROP COLUMN IF EXISTS pob,
  DROP COLUMN IF EXISTS dob,
  DROP COLUMN IF EXISTS gender,
  DROP COLUMN IF EXISTS education,
  DROP COLUMN IF EXISTS address_ktp,
  DROP COLUMN IF EXISTS address_dom,
  DROP COLUMN IF EXISTS vin,
  DROP COLUMN IF EXISTS nib,
  DROP COLUMN IF EXISTS company_name,
  DROP COLUMN IF EXISTS company_address,
  DROP COLUMN IF EXISTS operational_pj,
  DROP COLUMN IF EXISTS operational_pj_title,
  DROP COLUMN IF EXISTS operational_pj_phone,
  DROP COLUMN IF EXISTS operational_pj_email,
  DROP COLUMN IF EXISTS address_office,
  DROP COLUMN IF EXISTS fax,
  DROP COLUMN IF EXISTS email_official,
  DROP COLUMN IF EXISTS license_number,
  DROP COLUMN IF EXISTS license_date,
  DROP COLUMN IF EXISTS lpk_type,
  DROP COLUMN IF EXISTS director_name,
  DROP COLUMN IF EXISTS director_phone,
  DROP COLUMN IF EXISTS ktp_url,
  DROP COLUMN IF EXISTS ijazah_url,
  DROP COLUMN IF EXISTS sector,
  DROP COLUMN IF EXISTS pic_name,
  DROP COLUMN IF EXISTS pic_phone,
  DROP COLUMN IF EXISTS files; -- Assuming files was role-specific or redundant

