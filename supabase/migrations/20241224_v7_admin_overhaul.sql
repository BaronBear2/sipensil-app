-- 1. Add training_end_date to blk_trainings
ALTER TABLE "public"."blk_trainings" ADD COLUMN IF NOT EXISTS "training_end_date" date;

-- 2. Create im_japan_requirements table for dynamic configuration
CREATE TABLE IF NOT EXISTS "public"."im_japan_requirements" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "title" text NOT NULL,
    "description" text,
    "is_required" boolean DEFAULT true,
    "is_active" boolean DEFAULT true,
    "order_index" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Enable RLS
ALTER TABLE "public"."im_japan_requirements" ENABLE ROW LEVEL SECURITY;

-- Policies
-- Everyone can view active requirements (for Pencaker Dashboard)
DROP POLICY IF EXISTS "Public view requirements" ON "public"."im_japan_requirements";
CREATE POLICY "Public view requirements" ON "public"."im_japan_requirements" FOR SELECT USING (true);

-- Only Admin can CRUD
DROP POLICY IF EXISTS "Admins manage requirements" ON "public"."im_japan_requirements";
CREATE POLICY "Admins manage requirements" ON "public"."im_japan_requirements" FOR ALL USING (public.is_admin());

-- 3. Initial Seed for Requirements (To avoid empty table)
INSERT INTO "public"."im_japan_requirements" ("title", "description", "is_required", "order_index")
SELECT 'KTP', 'Scan Kartu Tanda Penduduk (Asli)', true, 1
WHERE NOT EXISTS (SELECT 1 FROM "public"."im_japan_requirements" WHERE title = 'KTP');

INSERT INTO "public"."im_japan_requirements" ("title", "description", "is_required", "order_index")
SELECT 'KK', 'Scan Kartu Keluarga (Asli)', true, 2
WHERE NOT EXISTS (SELECT 1 FROM "public"."im_japan_requirements" WHERE title = 'KK');

INSERT INTO "public"."im_japan_requirements" ("title", "description", "is_required", "order_index")
SELECT 'Ijazah', 'Scan Ijazah Terakhir (Asli)', true, 3
WHERE NOT EXISTS (SELECT 1 FROM "public"."im_japan_requirements" WHERE title = 'Ijazah');

INSERT INTO "public"."im_japan_requirements" ("title", "description", "is_required", "order_index")
SELECT 'Pas Foto', 'Pas Foto Terbaru (Latar Merah)', true, 4
WHERE NOT EXISTS (SELECT 1 FROM "public"."im_japan_requirements" WHERE title = 'Pas Foto');
