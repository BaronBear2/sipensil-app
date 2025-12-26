-- FORCE DELETE RPC
-- A Nuclear Option to delete a user and ALL related data, bypassing RLS and Constraints.
-- Uses SECURITY DEFINER to run as Database Owner.

CREATE OR REPLACE FUNCTION force_delete_user(target_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Delete Storage Config (Manual Cascade for Storage)
  DELETE FROM storage.objects WHERE owner = target_user_id;

  -- 2. Delete Child Tables (Explicit Manual Cascade to be safe)
  -- Even if DB cascades exist, this ensures they are gone.
  DELETE FROM public.magang_agreements WHERE user_id = target_user_id;
  DELETE FROM public.magang_permits WHERE company_id = target_user_id;
  DELETE FROM public.training_registrations WHERE user_id = target_user_id;
  DELETE FROM public.im_japan_registrations WHERE user_id = target_user_id;
  DELETE FROM public.lpk_reports WHERE user_id = target_user_id;
  DELETE FROM public.notifications WHERE user_id = target_user_id;
  
  DELETE FROM public.profile_pencaker WHERE user_id = target_user_id;
  DELETE FROM public.profile_perusahaan WHERE user_id = target_user_id;
  DELETE FROM public.profile_lpk WHERE user_id = target_user_id;
  
  -- 3. Delete Batches (Middle Node)
  DELETE FROM public.pencatatan_batches WHERE user_id = target_user_id;

  -- 4. Delete Profile (Public)
  DELETE FROM public.profiles WHERE id = target_user_id;

  -- 5. Delete Auth User (System)
  DELETE FROM auth.users WHERE id = target_user_id;

  RETURN 'Success';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error: ' || SQLERRM;
END;
$$;
