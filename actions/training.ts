'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function applyTraining(formData: FormData) {
  const supabase = await createClient()

  // 1. Cek User Login
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const trainingId = formData.get('trainingId') as string

  // 2. AMBIL DATA PROFILE
  const { data: profile } = await supabase
    .from('profiles')
    .select('account_status, nik, full_name')
    .eq('id', user.id)
    .single()

  // 3. ATURAN VERIFIKASI (Flow Baru: Boleh daftar, tapi status jadi PENDING untuk diverifikasi Admin)
  const isVerified = profile?.account_status === 'verified'

  // 4. CEK ATURAN "1-ON-1" (Tidak boleh daftar jika ada pelatihan belum selesai)
  // Status Aktif = PENDING, DITERIMA, APPROVED, VERIFIED
  // Status Non-Aktif = SELESAI, DITOLAK, REJECTED, DIBATALKAN
  const { data: activeTraining } = await supabase
    .from('training_registrations')
    .select('status')
    .eq('user_id', user.id)
    .not('status', 'in', '("SELESAI","DITOLAK","REJECTED","DIBATALKAN","LULUS")')
    .maybeSingle()

  if (activeTraining) {
    return { error: 'Anda sedang berada di pelatihan. Selesaikan dulu, atau kontak admin untuk mengeluarkan anda dari pelatihan' }
  }

  // 5. VALIDASI SLOT & TANGGAL
  const { data: training } = await supabase
    .from('blk_trainings')
    .select('quota, filled, registration_end')
    .eq('id', trainingId)
    .single()

  if (!training) return { error: 'Pelatihan tidak ditemukan.' }

  // Cek Tanggal Pendaftaran
  if (training.registration_end) {
    const today = new Date()
    const endDate = new Date(training.registration_end)
    // Set end date to end of day
    endDate.setHours(23, 59, 59, 999)

    if (today > endDate) {
      return { error: 'Masa pendaftaran pelatihan ini sudah berakhir.' }
    }
  }

  // Cek Kuota
  if (training.filled >= training.quota) {
    return { error: 'Mohon maaf, kuota pelatihan ini sudah penuh.' }
  }

  // Tentukan Status Awal
  // Jika verified -> DITERIMA
  // Jika belum -> PENDING (Masuk antrian Admin Dashboard)
  const initialStatus = isVerified ? 'DITERIMA' : 'PENDING'

  const age = parseInt(formData.get('age') as string || '0')
  const is_unemployed = formData.get('is_unemployed') === 'true'
  const has_sim_a = formData.get('has_sim_a') === 'true'
  const ktp_address = formData.get('ktp_address') as string
  const ijazah_url = formData.get('ijazah_url') as string
  const ktp_url = formData.get('ktp_url') as string
  const class_id = formData.get('class_id') as string
  const additional_documents = JSON.parse(formData.get('additional_documents_json') as string || '{}')

  // Cek apakah pernah DITOLAK di pelatihan yang SAMA
  const { data: rejectedRegistration } = await supabase
    .from('training_registrations')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('training_id', trainingId)
    .eq('status', 'DITOLAK')
    .maybeSingle()

  if (rejectedRegistration) {
    const { error: updateError } = await supabase
      .from('training_registrations')
      .update({
        status: initialStatus,
        progress_step: 1, // Reset Step
        age: age,
        is_unemployed: is_unemployed,
        has_sim_a: has_sim_a,
        ktp_address: ktp_address,
        ijazah_url: ijazah_url,
        ktp_url: ktp_url,
        class_id: class_id || null,
        additional_documents: additional_documents,
        admin_notes: null // Clear previous rejection note
      })
      .eq('id', rejectedRegistration.id)

    if (updateError) return { error: 'Gagal mendaftar ulang: ' + updateError.message }
  } else {
    // Masukkan data baru
    const { error: insertError } = await supabase
      .from('training_registrations')
      .insert({
        user_id: user.id,
        training_id: trainingId,
        status: initialStatus,
        progress_step: 1, // Default Step 1
        age: age,
        is_unemployed: is_unemployed,
        has_sim_a: has_sim_a,
        ktp_address: ktp_address,
        ijazah_url: ijazah_url,
        ktp_url: ktp_url,
        class_id: class_id || null,
        additional_documents: additional_documents
      })

    if (insertError) {
      if (insertError.code === '23505') return { error: 'Anda sudah terdaftar.' }
      return { error: 'Gagal mendaftar: ' + insertError.message }
    }
  }

  // Update jumlah filled kuota HANYA jika langsung diterima
  if (initialStatus === 'DITERIMA') {
    await supabase.rpc('increment_quota', { row_id: trainingId })
  }

  revalidatePath('/dashboard/pencaker')

  if (initialStatus === 'DITERIMA') {
    return { success: 'Selamat! Karena akun Anda Terverifikasi, pendaftaran Anda OTOMATIS DITERIMA.' }
  } else {
    return { success: 'Pendaftaran Berhasil! Menunggu Verifikasi Admin Dinas (Profil & Pelatihan).' }
  }
}