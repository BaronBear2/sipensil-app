-- Add ON DELETE CASCADE to foreign keys referencing auth.users and public.profiles

-- 1. profiles -> auth.users
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. im_japan_registrations -> profiles
ALTER TABLE public.im_japan_registrations
DROP CONSTRAINT IF EXISTS im_japan_registrations_user_id_fkey;

ALTER TABLE public.im_japan_registrations
ADD CONSTRAINT im_japan_registrations_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. lpk_reports -> profiles
ALTER TABLE public.lpk_reports
DROP CONSTRAINT IF EXISTS lpk_reports_user_id_fkey;

ALTER TABLE public.lpk_reports
ADD CONSTRAINT lpk_reports_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 4. magang_agreements -> profiles
ALTER TABLE public.magang_agreements
DROP CONSTRAINT IF EXISTS magang_agreements_user_id_fkey;

ALTER TABLE public.magang_agreements
ADD CONSTRAINT magang_agreements_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 5. magang_permits -> profiles (company_id)
ALTER TABLE public.magang_permits
DROP CONSTRAINT IF EXISTS magang_permits_company_id_fkey;

ALTER TABLE public.magang_permits
ADD CONSTRAINT magang_permits_company_id_fkey
FOREIGN KEY (company_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 6. notifications -> profiles
ALTER TABLE public.notifications
DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

ALTER TABLE public.notifications
ADD CONSTRAINT notifications_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 7. pencatatan_batches -> profiles
ALTER TABLE public.pencatatan_batches
DROP CONSTRAINT IF EXISTS pencatatan_batches_user_id_fkey;

ALTER TABLE public.pencatatan_batches
ADD CONSTRAINT pencatatan_batches_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 8. profile_lpk -> profiles
ALTER TABLE public.profile_lpk
DROP CONSTRAINT IF EXISTS profile_lpk_user_id_fkey;

ALTER TABLE public.profile_lpk
ADD CONSTRAINT profile_lpk_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 9. profile_pencaker -> profiles
ALTER TABLE public.profile_pencaker
DROP CONSTRAINT IF EXISTS profile_pencaker_user_id_fkey;

ALTER TABLE public.profile_pencaker
ADD CONSTRAINT profile_pencaker_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 10. profile_perusahaan -> profiles
ALTER TABLE public.profile_perusahaan
DROP CONSTRAINT IF EXISTS profile_perusahaan_user_id_fkey;

ALTER TABLE public.profile_perusahaan
ADD CONSTRAINT profile_perusahaan_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 11. training_registrations -> profiles
ALTER TABLE public.training_registrations
DROP CONSTRAINT IF EXISTS training_registrations_user_id_fkey;

ALTER TABLE public.training_registrations
ADD CONSTRAINT training_registrations_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
