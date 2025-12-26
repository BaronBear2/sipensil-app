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
    .not('status', 'in', '("SELESAI","DITOLAK","REJECTED","DIBATALKAN")')
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

  // Masukkan data
  const { error: insertError } = await supabase
    .from('training_registrations')
    .insert({
      user_id: user.id,
      training_id: trainingId,
      status: initialStatus
    })

  if (insertError) {
    if (insertError.code === '23505') return { error: 'Anda sudah terdaftar.' }
    return { error: 'Gagal mendaftar: ' + insertError.message }
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