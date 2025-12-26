-- SECURITY HARDENING
-- Revoke execution rights from 'public' (anon, authenticated) for sensitive RPCs.
-- Grant execution rights ONLY to 'service_role' (which our Admin Client uses).

-- 1. Secure Storage RPC
REVOKE EXECUTE ON FUNCTION delete_storage_objects_by_owner(uuid) FROM public;
REVOKE EXECUTE ON FUNCTION delete_storage_objects_by_owner(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION delete_storage_objects_by_owner(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION delete_storage_objects_by_owner(uuid) TO service_role;

-- 2. Secure Force Delete RPC
REVOKE EXECUTE ON FUNCTION force_delete_user(uuid) FROM public;
REVOKE EXECUTE ON FUNCTION force_delete_user(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION force_delete_user(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION force_delete_user(uuid) TO service_role;
