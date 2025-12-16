-- Create new tables and columns for Admin Dashboard Refactor

-- 1. IM JAPAN REGISTRATIONS
CREATE TABLE IF NOT EXISTS "public"."im_japan_registrations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "batch" "text",
    "status" "text" DEFAULT 'PENDING'::"text", -- PENDING, VERIFIED, REJECTED
    "document_path" "text", -- URL to uploaded PDF/ZIP
    "admin_notes" "text", -- Rejection logic
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id")
);

-- 2. MAGANG PERMITS
CREATE TABLE IF NOT EXISTS "public"."magang_permits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "start_date" "date",
    "end_date" "date",
    "participant_count" "int4",
    "document_path" "text", -- Uploaded request letter
    "status" "text" DEFAULT 'PENDING'::"text", -- PENDING, APPROVED, REJECTED
    "letter_number" "text", -- Generated SK number
    "rejection_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("company_id") REFERENCES "public"."profiles"("id")
);

-- 3. UPDATE PROFILES
-- Add column if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'verification_status') THEN
        ALTER TABLE "public"."profiles" ADD COLUMN "verification_status" "text" DEFAULT 'UNVERIFIED'::"text";
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_data_update') THEN
        ALTER TABLE "public"."profiles" ADD COLUMN "last_data_update" timestamp with time zone;
    END IF;
END $$;

-- 4. POLICIES (Simple RLS for now)
ALTER TABLE "public"."im_japan_registrations" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own IM Japan" ON "public"."im_japan_registrations" FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can view their own IM Japan" ON "public"."im_japan_registrations" FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Admins can view all IM Japan" ON "public"."im_japan_registrations" FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update IM Japan" ON "public"."im_japan_registrations" FOR UPDATE USING (public.is_admin());

ALTER TABLE "public"."magang_permits" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Companies can insert their own Magang" ON "public"."magang_permits" FOR INSERT WITH CHECK ((auth.uid() = company_id));
CREATE POLICY "Companies can view their own Magang" ON "public"."magang_permits" FOR SELECT USING ((auth.uid() = company_id));
CREATE POLICY "Admins can view all Magang" ON "public"."magang_permits" FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update Magang" ON "public"."magang_permits" FOR UPDATE USING (public.is_admin());
