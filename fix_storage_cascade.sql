-- Add ON DELETE CASCADE to storage.objects foreign key (owner -> auth.users)
-- This fixes "Database error loading user" when deleting users who have uploaded files.

ALTER TABLE storage.objects
DROP CONSTRAINT IF EXISTS objects_owner_fkey;

ALTER TABLE storage.objects
ADD CONSTRAINT objects_owner_fkey
FOREIGN KEY (owner) REFERENCES auth.users(id) ON DELETE CASCADE;
