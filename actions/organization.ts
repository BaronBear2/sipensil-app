'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- 1. LOGIC LPK (SIMPAN/UPDATE LAPORAN) ---
export async function submitLpkReport(data: any) {
  const supabase = await createClient()
  
  // 1. Cek User
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // 2. Cek Status Profil
  const { data: profile } = await supabase.from('profiles').select('account_status').eq('id', user.id).single()
  
  // LOGIC BARU: Boleh submit jika Verified ATAU Pending (artinya sudah isi profil)
  if (profile?.account_status === 'unverified') {
    return { error: 'Profil Lembaga belum lengkap. Silakan edit profil terlebih dahulu sebelum mengisi laporan.' }
  }

  // 3. Simpan ke Database (Upsert Logic)
  // Kita cari dulu apakah laporan untuk Semester & Tahun ini sudah ada?
  const { data: existing } = await supabase
    .from('lpk_reports')
    .select('id')
    .eq('user_id', user.id)
    .eq('semester', data.semester)
    .eq('tahun', data.tahun)
    .single()

  let error;
  
  if (existing) {
    // UPDATE (Revisi/Draft)
    const { error: err } = await supabase
      .from('lpk_reports')
      .update({
        nama_lpk: data.namaLpk,
        no_reg: data.noReg,
        data_karyawan: data.karyawan,
        data_penyelenggaraan: data.penyelenggaraan,
        data_uji_kompetensi: data.ujiKompetensi,
        data_mitra: data.mitra,
        data_kendala: data.kendala,
        status: 'SUBMITTED', // Status kembali ke Submitted agar Admin notif
        updated_at: new Date() // Trigger update timestamp
      })
      .eq('id', existing.id)
    error = err;
  } else {
    // INSERT BARU
    const { error: err } = await supabase.from('lpk_reports').insert({
      user_id: user.id,
      semester: data.semester,
      tahun: data.tahun,
      nama_lpk: data.namaLpk,
      no_reg: data.noReg,
      data_karyawan: data.karyawan,
      data_penyelenggaraan: data.penyelenggaraan,
      data_uji_kompetensi: data.ujiKompetensi,
      data_mitra: data.mitra,
      data_kendala: data.kendala,
      status: 'SUBMITTED'
    })
    error = err;
  }

  if (error) return { error: 'Gagal mengirim laporan: ' + error.message }
  
  revalidatePath('/dashboard/lpk')
  return { success: 'Laporan berhasil disimpan & dikirim ke Dinas!' }
}

// --- 2. LOGIC PERUSAHAAN (Untuk nanti) ---
export async function submitMagangAgreement(formData: FormData) {
    // ... (Akan kita update nanti sesuai request revisi perusahaan)
    return { error: "Fitur sedang dalam pengembangan revisi" }
}