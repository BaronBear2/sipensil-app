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
  facilities jsonb,
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
  admin_passed_pdf text,
  selection_passed_pdf text,
  final_passed_pdf text,
  training_start_time time without time zone,
  training_end_time time without time zone,
  additional_documents jsonb DEFAULT '[]'::jsonb,
  CONSTRAINT blk_trainings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.exam_results (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL,
  final_score numeric,
  status text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT exam_results_pkey PRIMARY KEY (id),
  CONSTRAINT exam_results_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES public.training_registrations(id)
);
CREATE TABLE public.im_japan_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  batch text,
  status text DEFAULT 'PENDING'::text,
  document_path text,
  admin_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  documents jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT im_japan_registrations_pkey PRIMARY KEY (id),
  CONSTRAINT im_japan_registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.im_japan_requirements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  is_required boolean DEFAULT true,
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  template_url text,
  CONSTRAINT im_japan_requirements_pkey PRIMARY KEY (id)
);
CREATE TABLE public.lpk_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  semester text,
  tahun text,
  nama_lpk text,
  no_reg text,
  data_karyawan jsonb,
  data_penyelenggaraan jsonb,
  data_uji_kompetensi jsonb,
  data_mitra jsonb,
  status text DEFAULT 'SUBMITTED'::text,
  created_at timestamp with time zone DEFAULT now(),
  data_akreditasi jsonb DEFAULT '{}'::jsonb,
  data_pengembangan_program jsonb DEFAULT '[]'::jsonb,
  data_tuk jsonb DEFAULT '{}'::jsonb,
  data_pengembangan_kelembagaan jsonb DEFAULT '[]'::jsonb,
  rejection_reason text,
  data_kendala jsonb DEFAULT '[]'::jsonb,
  CONSTRAINT lpk_reports_pkey PRIMARY KEY (id),
  CONSTRAINT lpk_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.magang_agreements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nik_pencaker text,
  nama_pencaker text,
  nama_perusahaan text,
  alamat_perusahaan text,
  penanggung_jawab text,
  jabatan_magang text,
  tgl_mulai date,
  tgl_selesai date,
  status_perjanjian text,
  document_url text,
  status text DEFAULT 'PENDING_VALIDATION'::text,
  created_at timestamp with time zone DEFAULT now(),
  phone text,
  email text,
  gender text,
  address text,
  place_of_birth text,
  date_of_birth date,
  division text,
  duration text,
  post_activity text,
  rejection_reason text,
  batch_id uuid,
  CONSTRAINT magang_agreements_pkey PRIMARY KEY (id),
  CONSTRAINT magang_agreements_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.pencatatan_batches(id),
  CONSTRAINT magang_agreements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.magang_permits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  start_date date,
  end_date date,
  participant_count integer,
  document_path text,
  status text DEFAULT 'PENDING'::text,
  letter_number text,
  rejection_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT magang_permits_pkey PRIMARY KEY (id),
  CONSTRAINT magang_permits_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.profiles(id)
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
CREATE TABLE public.master_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  text text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT master_notes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.master_requirements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  text text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT master_requirements_pkey PRIMARY KEY (id)
);
CREATE TABLE public.news (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date date DEFAULT now(),
  image_url text,
  summary text,
  content text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT news_pkey PRIMARY KEY (id)
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
CREATE TABLE public.pencatatan_batches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  status text DEFAULT 'SUBMITTED'::text,
  submission_date timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  rejection_reason text,
  CONSTRAINT pencatatan_batches_pkey PRIMARY KEY (id),
  CONSTRAINT pencatatan_batches_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profile_lpk (
  user_id uuid NOT NULL,
  nips text,
  lpk_name text,
  lpk_type text,
  address_office text,
  phone text,
  fax text,
  email_official text,
  license_number text,
  license_date date,
  director_name text,
  director_phone text,
  operational_pj text,
  operational_pj_title text,
  operational_pj_phone text,
  operational_pj_email text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profile_lpk_pkey PRIMARY KEY (user_id),
  CONSTRAINT profile_lpk_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
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
  major text,
  skills text,
  field_of_work text,
  curriculum_vitae text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  ktp_url text,
  ijazah_url text,
  photo_url text,
  CONSTRAINT profile_pencaker_pkey PRIMARY KEY (user_id),
  CONSTRAINT profile_pencaker_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profile_perusahaan (
  user_id uuid NOT NULL,
  nib text,
  company_name text,
  sector text,
  address_office text,
  phone text,
  email_official text,
  director_name text,
  pic_name text,
  pic_phone text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profile_perusahaan_pkey PRIMARY KEY (user_id),
  CONSTRAINT profile_perusahaan_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
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
CREATE TABLE public.qa_system_time (
  id integer NOT NULL DEFAULT 1 CHECK (id = 1),
  overridden_time timestamp with time zone,
  CONSTRAINT qa_system_time_pkey PRIMARY KEY (id)
);
CREATE TABLE public.training_classes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL,
  batch_number integer,
  name text NOT NULL,
  address text,
  start_date date,
  end_date date,
  time_schedule text,
  quota integer DEFAULT 0,
  whatsapp_group_link text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT training_classes_pkey PRIMARY KEY (id),
  CONSTRAINT training_classes_training_id_fkey FOREIGN KEY (training_id) REFERENCES public.blk_trainings(id)
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
  selection_id uuid,
  class_id uuid,
  exam_id uuid,
  additional_documents jsonb DEFAULT '{}'::jsonb,
  tanggal_verifikasi_pendaftaran timestamp with time zone,
  tanggal_pengumuman_seleksi timestamp with time zone,
  tanggal_pengumuman_kompetensi timestamp with time zone,
  CONSTRAINT training_registrations_pkey PRIMARY KEY (id),
  CONSTRAINT training_registrations_training_id_fkey FOREIGN KEY (training_id) REFERENCES public.blk_trainings(id),
  CONSTRAINT training_registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT fk_selection_id FOREIGN KEY (selection_id) REFERENCES public.training_selections(id),
  CONSTRAINT fk_class_id FOREIGN KEY (class_id) REFERENCES public.training_classes(id),
  CONSTRAINT fk_exam_id FOREIGN KEY (exam_id) REFERENCES public.training_exams(id)
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