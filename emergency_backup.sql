


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role,
    nik,
    vin,
    nib,
    phone,
    company_name,
    account_status
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    -- Default role tetap PENCAKER jika tidak ada info lain
    COALESCE(new.raw_user_meta_data->>'role', 'PENCAKER'),
    new.raw_user_meta_data->>'nik',
    new.raw_user_meta_data->>'vin',
    new.raw_user_meta_data->>'nib',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'company_name',
    'unverified'
  );
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "supabase_admin";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role = 'ADMIN_DINAS'
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "supabase_admin";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."blk_trainings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "category" "text",
    "provider" "text" DEFAULT 'DISNAKER Kab. Bekasi'::"text",
    "quota" integer DEFAULT 0,
    "filled" integer DEFAULT 0,
    "image_url" "text",
    "start_date" "date",
    "duration" "text",
    "type" "text",
    "description" "text",
    "requirements" "text"[],
    "facilities" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."blk_trainings" OWNER TO "supabase_admin";


CREATE TABLE IF NOT EXISTS "public"."lpk_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "semester" "text",
    "tahun" "text",
    "nama_lpk" "text",
    "no_reg" "text",
    "data_karyawan" "jsonb",
    "data_penyelenggaraan" "jsonb",
    "data_uji_kompetensi" "jsonb",
    "data_mitra" "jsonb",
    "status" "text" DEFAULT 'SUBMITTED'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."lpk_reports" OWNER TO "supabase_admin";


CREATE TABLE IF NOT EXISTS "public"."magang_agreements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "nik_pencaker" "text",
    "nama_pencaker" "text",
    "nama_perusahaan" "text",
    "alamat_perusahaan" "text",
    "penanggung_jawab" "text",
    "jabatan_magang" "text",
    "tgl_mulai" "date",
    "tgl_selesai" "date",
    "status_perjanjian" "text",
    "document_url" "text",
    "status" "text" DEFAULT 'PENDING_VALIDATION'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."magang_agreements" OWNER TO "supabase_admin";


CREATE TABLE IF NOT EXISTS "public"."news" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "date" "date" DEFAULT "now"(),
    "image_url" "text",
    "summary" "text",
    "content" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."news" OWNER TO "supabase_admin";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "role" "text" DEFAULT 'PENCAKER'::"text",
    "full_name" "text",
    "nik" "text",
    "phone" "text",
    "pob" "text",
    "dob" "date",
    "gender" "text",
    "education" "text",
    "address_ktp" "text",
    "address_dom" "text",
    "files" "jsonb" DEFAULT '{"ktp": false, "photo": false, "ijazah": false}'::"jsonb",
    "vin" "text",
    "nib" "text",
    "company_name" "text",
    "company_address" "text",
    "account_status" "text" DEFAULT 'pending'::"text",
    "rejection_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."profiles" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" OWNER TO "supabase_admin";


CREATE TABLE IF NOT EXISTS "public"."training_registrations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "training_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'Menunggu Verifikasi'::"text",
    "applied_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."training_registrations" OWNER TO "supabase_admin";


ALTER TABLE ONLY "public"."blk_trainings"
    ADD CONSTRAINT "blk_trainings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lpk_reports"
    ADD CONSTRAINT "lpk_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."magang_agreements"
    ADD CONSTRAINT "magang_agreements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."news"
    ADD CONSTRAINT "news_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."training_registrations"
    ADD CONSTRAINT "training_registrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lpk_reports"
    ADD CONSTRAINT "lpk_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."magang_agreements"
    ADD CONSTRAINT "magang_agreements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."training_registrations"
    ADD CONSTRAINT "training_registrations_training_id_fkey" FOREIGN KEY ("training_id") REFERENCES "public"."blk_trainings"("id");



ALTER TABLE ONLY "public"."training_registrations"
    ADD CONSTRAINT "training_registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



CREATE POLICY "Admin read all agreements" ON "public"."magang_agreements" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admin read all profiles" ON "public"."profiles" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admin read all registrations" ON "public"."training_registrations" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admin read all reports" ON "public"."lpk_reports" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admin update all profiles" ON "public"."profiles" FOR UPDATE USING ("public"."is_admin"());



CREATE POLICY "Company manage own agreements" ON "public"."magang_agreements" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "LPK manage own reports" ON "public"."lpk_reports" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Pencaker manage own" ON "public"."training_registrations" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Public read news" ON "public"."news" FOR SELECT USING (true);



CREATE POLICY "Public read trainings" ON "public"."blk_trainings" FOR SELECT USING (true);



CREATE POLICY "Users read own profile" ON "public"."profiles" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Users update own profile" ON "public"."profiles" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



ALTER TABLE "public"."blk_trainings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lpk_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."magang_agreements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."news" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."training_registrations" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";































































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "postgres";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "postgres";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";


















GRANT ALL ON TABLE "public"."blk_trainings" TO "postgres";
GRANT ALL ON TABLE "public"."blk_trainings" TO "anon";
GRANT ALL ON TABLE "public"."blk_trainings" TO "authenticated";
GRANT ALL ON TABLE "public"."blk_trainings" TO "service_role";



GRANT ALL ON TABLE "public"."lpk_reports" TO "postgres";
GRANT ALL ON TABLE "public"."lpk_reports" TO "anon";
GRANT ALL ON TABLE "public"."lpk_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."lpk_reports" TO "service_role";



GRANT ALL ON TABLE "public"."magang_agreements" TO "postgres";
GRANT ALL ON TABLE "public"."magang_agreements" TO "anon";
GRANT ALL ON TABLE "public"."magang_agreements" TO "authenticated";
GRANT ALL ON TABLE "public"."magang_agreements" TO "service_role";



GRANT ALL ON TABLE "public"."news" TO "postgres";
GRANT ALL ON TABLE "public"."news" TO "anon";
GRANT ALL ON TABLE "public"."news" TO "authenticated";
GRANT ALL ON TABLE "public"."news" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "postgres";
GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."training_registrations" TO "postgres";
GRANT ALL ON TABLE "public"."training_registrations" TO "anon";
GRANT ALL ON TABLE "public"."training_registrations" TO "authenticated";
GRANT ALL ON TABLE "public"."training_registrations" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































