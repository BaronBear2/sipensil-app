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

  // 3. ATURAN VERIFIKASI (Admin verification, not email)
  if (profile?.account_status !== 'verified') {
    // Jika masih 'pending' atau 'unverified' atau 'rejected', tolak pendaftaran
    return { error: 'Data akun Anda belum diverifikasi oleh Admin Dinas. Silakan lengkapi profil dan tunggu verifikasi.' }
  }

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

  // 5. AUTO-ACCEPT LOGIC (Karena akun sudah Verified)
  // Cek Kuota dulu (Opsional, tapi sebaiknya ada)
  const { data: training } = await supabase.from('blk_trainings').select('quota, filled').eq('id', trainingId).single()
  
  if (training && training.filled >= training.quota) {
    return { error: 'Mohon maaf, kuota pelatihan ini sudah penuh.' }
  }

  // Masukkan data dengan status DITERIMA
  const { error: insertError } = await supabase
    .from('training_registrations')
    .insert({
      user_id: user.id,
      training_id: trainingId,
      status: 'DITERIMA' // <--- LANGSUNG DITERIMA TANPA VERIFIKASI ULANG
    })

  if (insertError) {
    if (insertError.code === '23505') return { error: 'Anda sudah terdaftar.' }
    return { error: 'Gagal mendaftar: ' + insertError.message }
  }

  // Update jumlah filled kuota (Simple increment)
  await supabase.rpc('increment_quota', { row_id: trainingId }) 
  // *Note: Kita perlu buat fungsi RPC SQL ini nanti, tapi untuk sekarang biarkan dulu, data masuk saja.

  revalidatePath('/dashboard/pencaker')
  return { success: 'Selamat! Karena akun Anda Terverifikasi, pendaftaran Anda OTOMATIS DITERIMA.' }
}