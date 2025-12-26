-- Create a secure function to delete storage objects by owner
-- This bypasses the need to ALTER the system table storage.objects

CREATE OR REPLACE FUNCTION delete_storage_objects_by_owner(target_owner_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete all objects owned by this user
  DELETE FROM storage.objects WHERE owner = target_owner_id;
END;
$$;
