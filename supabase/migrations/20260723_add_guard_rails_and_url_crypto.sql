-- =========================================================================
-- MIGRATION: Guard Rails for profiles <-> profile_pencaker & Schema Support
-- =========================================================================

-- 1. Ensure foreign key on profile_pencaker has ON DELETE CASCADE
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profile_pencaker_user_id_fkey'
    ) THEN
        ALTER TABLE public.profile_pencaker 
        DROP CONSTRAINT profile_pencaker_user_id_fkey;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        ALTER TABLE public.profile_pencaker
        ADD CONSTRAINT profile_pencaker_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Create PostgreSQL Trigger Function to auto-create profile_pencaker if missing
CREATE OR REPLACE FUNCTION public.ensure_profile_pencaker_exists()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.role = 'PENCAKER' THEN
        INSERT INTO public.profile_pencaker (user_id)
        VALUES (NEW.id)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$;

-- Attach trigger to profiles
DROP TRIGGER IF EXISTS tr_ensure_profile_pencaker ON public.profiles;
CREATE TRIGGER tr_ensure_profile_pencaker
    AFTER INSERT OR UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.ensure_profile_pencaker_exists();

-- 3. Compatibility View in case profiles table is renamed to profile_profiles
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profile_profiles') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        EXECUTE 'CREATE OR REPLACE VIEW public.profiles AS SELECT * FROM public.profile_profiles;';
    END IF;
END $$;
