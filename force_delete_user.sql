-- Force delete user from auth.users
-- Replace 'USER_ID_HERE' with the actual User ID if running manually.
-- This script is intended to be run in the Supabase SQL Editor.

-- 1. Ensure profiles is gone (just in case)
DELETE FROM public.profiles WHERE id = 'USER_ID_HERE';

-- 2. Delete from auth.users
DELETE FROM auth.users WHERE id = 'USER_ID_HERE';

-- NOTE: If this fails, the error message will be the exact Constraint Name.
-- A common hidden blocker is 'objects' in 'storage' schema.
-- To check for storage objects:
-- SELECT * FROM storage.objects WHERE owner = 'USER_ID_HERE';
