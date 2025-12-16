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
  const { data: activeTraining } = await supabase
    .from('training_registrations')
    .select('status')
    .eq('user_id', user.id)
    .not('status', 'in', '("SELESAI","DITOLAK","DIBATALKAN")')
    .maybeSingle()

  if (activeTraining) {
    return { error: 'Anda sedang terdaftar di pelatihan lain. Selesaikan dulu.' }
  }

  // 5. AUTO-ACCEPT vs MANUAL VERIFICATION LOGIC
  // Cek Kuota
  const { data: training } = await supabase.from('blk_trainings').select('quota, filled').eq('id', trainingId).single()

  if (training && training.filled >= training.quota) {
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