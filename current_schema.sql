-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.blk_trainings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text,
  provider text DEFAULT 'DISNAKER Kab. Bekasi'::text,
  quota integer DEFAULT 0,
  filled integer DEFAULT 0,
  image_url text,
  start_date date,
  duration text,
  type text,
  description text,
  requirements ARRAY,
  created_at timestamp with time zone DEFAULT now(),
  min_age integer DEFAULT 17,
  max_age integer DEFAULT 60,
  certification text,
  status text DEFAULT 'OPEN'::text,
  registration_start date,
  registration_end date,
  training_end_date date,
  training_start_date date,
  whatsapp_group_link text,
  training_start_time time without time zone,
  training_end_time time without time zone,
  additional_documents jsonb DEFAULT '[]'::jsonb,
  tanggal_pengumuman_kelulusan_administrasi date,
  tanggal_pengumuman_kelulusan_seleksi_awal date,
  tanggal_pengumuman_hasil_uji_kompetensi date,
  CONSTRAINT blk_trainings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profile_pencaker (
  user_id uuid NOT NULL,
  nik text,
  gender text,
  place_of_birth text,
  date_of_birth date,
  address_ktp text,
  address_dom text,
  phone text,
  religion text,
  education text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  ktp_url text,
  ijazah_url text,
  photo_url text,
  CONSTRAINT profile_pencaker_pkey PRIMARY KEY (user_id),
  CONSTRAINT profile_pencaker_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text,
  role text DEFAULT 'PENCAKER'::text,
  full_name text,
  account_status text DEFAULT 'pending'::text,
  rejection_message text,
  created_at timestamp with time zone DEFAULT now(),
  verification_status text DEFAULT 'UNVERIFIED'::text,
  last_data_update timestamp with time zone,
  photo_url text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.training_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  training_id uuid NOT NULL,
  status text DEFAULT 'Menunggu Verifikasi'::text,
  applied_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  admin_notes text,
  age integer,
  is_unemployed boolean,
  has_sim_a boolean,
  ktp_address text,
  ijazah_url text,
  ktp_url text,
  progress_step integer DEFAULT 1,
  additional_documents jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT training_registrations_pkey PRIMARY KEY (id),
  CONSTRAINT training_registrations_training_id_fkey FOREIGN KEY (training_id) REFERENCES public.blk_trainings(id),
  CONSTRAINT training_registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.training_selections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL,
  selection_date date,
  selection_time time without time zone,
  location_address text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  name text,
  CONSTRAINT training_selections_pkey PRIMARY KEY (id),
  CONSTRAINT training_selections_training_id_fkey FOREIGN KEY (training_id) REFERENCES public.blk_trainings(id)
);
CREATE TABLE public.training_exams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL,
  name text NOT NULL,
  address text,
  exam_date date,
  exam_time time without time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT training_exams_pkey PRIMARY KEY (id),
  CONSTRAINT training_exams_training_id_fkey FOREIGN KEY (training_id) REFERENCES public.blk_trainings(id)
);
CREATE TABLE public.master_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT master_categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.master_locations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT master_locations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.master_requirements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  text text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT master_requirements_pkey PRIMARY KEY (id)
);
CREATE TABLE public.master_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  text text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT master_notes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.qa_system_time (
  id integer NOT NULL DEFAULT 1 CHECK (id = 1),
  overridden_time timestamp with time zone,
  CONSTRAINT qa_system_time_pkey PRIMARY KEY (id)
);
CREATE TABLE public.training_announcements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL,
  type text NOT NULL,
  document_url text,
  content text,
  is_published boolean DEFAULT false,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  scheduled_date date,
  CONSTRAINT training_announcements_pkey PRIMARY KEY (id),
  CONSTRAINT training_announcements_training_id_fkey FOREIGN KEY (training_id) REFERENCES public.blk_trainings(id)
);