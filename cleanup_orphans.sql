-- CLEANUP SCRIPT: Delete "Zombie" Auth Users
-- This script deletes users from auth.users who do NOT have a corresponding record in public.profiles.
-- These are "orphaned" accounts that were left behind due to previous errors.

-- 1. (Optional) Check count before deleting
-- SELECT count(*) FROM auth.users WHERE id NOT IN (SELECT id FROM public.profiles);

-- 2. Delete Orphaned Users
DELETE FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- 3. (Verification) Should return 0
-- SELECT count(*) FROM auth.users WHERE id NOT IN (SELECT id FROM public.profiles);
