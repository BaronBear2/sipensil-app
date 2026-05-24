-- Add admin timestamp columns
ALTER TABLE public.training_registrations
ADD COLUMN IF NOT EXISTS tanggal_verifikasi_pendaftaran timestamp with time zone,
ADD COLUMN IF NOT EXISTS tanggal_pengumuman_seleksi timestamp with time zone,
ADD COLUMN IF NOT EXISTS tanggal_pengumuman_kompetensi timestamp with time zone;

-- Trigger function for timestamps and validation
CREATE OR REPLACE FUNCTION trg_set_registration_timestamps()
RETURNS TRIGGER AS $$
DECLARE
  v_now timestamp with time zone;
  v_qa_exists boolean;
BEGIN
  -- 1. Default to current real time in Jakarta
  v_now := (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Jakarta';

  -- 2. Check if qa_system_time table exists (graceful fallback)
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE  table_schema = 'public'
    AND    table_name   = 'qa_system_time'
  ) INTO v_qa_exists;

  -- 3. Fetch overridden time if QA table exists
  IF v_qa_exists THEN
    EXECUTE 'SELECT overridden_time FROM public.qa_system_time WHERE id = 1 LIMIT 1' INTO v_now;
    IF v_now IS NULL THEN
      v_now := (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Jakarta';
    END IF;
  END IF;

  -- POPULATE TIMESTAMPS BASED ON PROGRESS STEP
  -- Step 2: Lulus Administrasi (Verifikasi Pendaftaran)
  IF NEW.progress_step = 2 AND OLD.progress_step < 2 THEN
    NEW.tanggal_verifikasi_pendaftaran = v_now;
  END IF;

  -- Step 4: Lolos Seleksi
  IF NEW.progress_step = 4 AND OLD.progress_step < 4 THEN
    NEW.tanggal_pengumuman_seleksi = v_now;
  END IF;

  -- Step 7: Lulus Penilaian Akhir (Kompetensi)
  IF NEW.progress_step = 7 AND OLD.progress_step < 7 THEN
    NEW.tanggal_pengumuman_kompetensi = v_now;
  END IF;

  -- VALIDATION RULES (Strict checks)
  -- 1. tanggal_pengumuman_kompetensi TIDAK BOLEH diisi jika tanggal_pengumuman_seleksi kosong
  IF NEW.tanggal_pengumuman_kompetensi IS NOT NULL AND NEW.tanggal_pengumuman_seleksi IS NULL THEN
    RAISE EXCEPTION 'tanggal_pengumuman_kompetensi tidak dapat diisi karena tanggal_pengumuman_seleksi masih kosong.';
  END IF;

  -- 2. Urutan Kronologi (tanggal_verifikasi_pendaftaran <= tanggal_pengumuman_seleksi <= tanggal_pengumuman_kompetensi)
  IF NEW.tanggal_pengumuman_seleksi IS NOT NULL AND NEW.tanggal_verifikasi_pendaftaran IS NOT NULL THEN
    IF NEW.tanggal_pengumuman_seleksi < NEW.tanggal_verifikasi_pendaftaran THEN
      RAISE EXCEPTION 'tanggal_pengumuman_seleksi tidak boleh lebih awal dari tanggal_verifikasi_pendaftaran.';
    END IF;
  END IF;

  IF NEW.tanggal_pengumuman_kompetensi IS NOT NULL AND NEW.tanggal_pengumuman_seleksi IS NOT NULL THEN
    IF NEW.tanggal_pengumuman_kompetensi < NEW.tanggal_pengumuman_seleksi THEN
      RAISE EXCEPTION 'tanggal_pengumuman_kompetensi tidak boleh lebih awal dari tanggal_pengumuman_seleksi.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trg_training_registrations_timestamps ON public.training_registrations;
CREATE TRIGGER trg_training_registrations_timestamps
BEFORE UPDATE ON public.training_registrations
FOR EACH ROW
EXECUTE FUNCTION trg_set_registration_timestamps();
