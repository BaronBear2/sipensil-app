-- Enable RLS on training_registrations
ALTER TABLE "public"."training_registrations" ENABLE ROW LEVEL SECURITY;

-- 1. ADMINS: Full Access
DROP POLICY IF EXISTS "Admins full access training_registrations" ON "public"."training_registrations";
CREATE POLICY "Admins full access training_registrations"
ON "public"."training_registrations"
FOR ALL
USING (
  public.is_admin()
);

-- 2. USERS: View Own
DROP POLICY IF EXISTS "Users view own training_registrations" ON "public"."training_registrations";
CREATE POLICY "Users view own training_registrations"
ON "public"."training_registrations"
FOR SELECT
USING (
  auth.uid() = user_id
);

-- 3. USERS: Insert Own
DROP POLICY IF EXISTS "Users insert own training_registrations" ON "public"."training_registrations";
CREATE POLICY "Users insert own training_registrations"
ON "public"."training_registrations"
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

-- 4. USERS: Update Own (Maybe for cancelling? Optional but good to have constraint)
DROP POLICY IF EXISTS "Users update own training_registrations" ON "public"."training_registrations";
CREATE POLICY "Users update own training_registrations"
ON "public"."training_registrations"
FOR UPDATE
USING (
  auth.uid() = user_id
);
