-- Re-apply Trigger Function to ensure it exists and matches current schema requirements
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
  )
  ON CONFLICT (id) DO NOTHING; -- Safety to prevent errors if profile already exists

  -- 2. Insert into Specific Role Table based on Role
  -- We check if the entry exists first to avoid duplicates if re-running on existing user
  IF v_role = 'PENCAKER' THEN
     INSERT INTO public.profile_pencaker (user_id, nik, phone)
     VALUES (
        new.id,
        new.raw_user_meta_data->>'nik',
        new.raw_user_meta_data->>'phone'
     )
     ON CONFLICT (user_id) DO NOTHING;
  
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
     )
     ON CONFLICT (user_id) DO NOTHING;

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
     )
     ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN new;
END;
$function$;

-- Ensure the trigger is attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
