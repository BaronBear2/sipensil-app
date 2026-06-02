'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import path from 'path'
import fs from 'fs/promises'
import { sendWhatsApp } from '@/utils/notifications'


async function verifyAdminRole() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const role = profile?.role?.toLowerCase()
  if (role !== 'admin' && role !== 'admin_dinas' && role !== 'dinas') {
    throw new Error("Unauthorized: Admin access required")
  }
}

// Helper for Image Upload (using Supabase Storage)
async function uploadImage(file: File): Promise<string | null> {
  if (!file || file.size === 0 || file.name === 'undefined') return null

  // Validate Type
  if (!file.type.startsWith('image/')) return null

  const supabase = await createClient()
  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`

  try {
    const { data, error } = await supabase.storage.from('documents').upload(`posters/${filename}`, buffer)
    if (error) {
      console.error("Upload Failed:", error)
      return null
    }

    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(`posters/${filename}`)
    return urlData.publicUrl
  } catch (error) {
    console.error("Upload Failed:", error)
    return null
  }
}

// --- 1. VERIFIKASI PROFILE (Pencaker Gate) ---
// 1. VERIFIKASI AKUN PENCAKER (GATE PELATIHAN)
export async function verifyProfileAction(formData: FormData) {
  await verifyAdminRole();
  const supabase = await createClient()

  // Cek Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const userId = formData.get('userId') as string
  const action = formData.get('action') as string
  const reason = formData.get('reason') as string




  const newStatus = action === 'approve' ? 'verified' : 'rejected'
  // NOTE: Logic update status pelatihan
  // Jika approve profile -> approve pelatihan? 
  // User request: "Ketika menolak verifikasi pelatihan blk, kolomnya masih disitu."
  // This implies the item didn't move or status didn't update properly.
  // The query in Tab 1 likely filters by 'PENDING'. If we update to 'DITOLAK', it should disappear.

  // 1. Update Profile Status
  const { error } = await supabase
    .from('profiles')
    .update({
      account_status: newStatus,
      rejection_message: action === 'reject' ? reason : null
    })
    .eq('id', userId)

  if (error) return { error: error.message }

  let autoFailTriggered = false

  // 2. Update Status Pelatihan Specific Row (Reliable)
  const regId = formData.get('regId') as string
  if (regId) {
    const statusUpdate = action === 'approve' ? 'DITERIMA' : 'DITOLAK'
    
    // Fetch training_id and details for notifications
    const { data: regData } = await supabase.from('training_registrations').select('training_id, user_id, blk_trainings(title)').eq('id', regId).single()

    const { error: regError } = await supabase
      .from('training_registrations')
      .update({
        status: statusUpdate,
        progress_step: 1, // Keep at step 1 until quota is full
        admin_notes: action === 'reject' ? reason : null // Fix: Save the reason!
      })
      .eq('id', regId)

    if (regError) return { error: "Failed to update registration: " + regError.message }

    if (action === 'approve' && regData?.training_id) {
      // Handled automatically by Postgres DB Trigger `sync_training_quota`
      // await supabase.rpc('increment_quota', { row_id: regData.training_id })
      
      // Check Quota Logic
      const { data: trainingData } = await supabase.from('blk_trainings').select('quota').eq('id', regData.training_id).single()
      if (trainingData && trainingData.quota > 0) {
        const { count } = await supabase.from('training_registrations').select('*', { count: 'exact', head: true }).eq('training_id', regData.training_id).in('status', ['DITERIMA', 'LULUS', 'SELESAI'])
        if (count && count >= trainingData.quota) {
          const { error: bulkRejectError } = await supabase.from('training_registrations').update({ status: 'DITOLAK', admin_notes: 'Mohon maaf, kuota angkatan telah terpenuhi.' }).eq('training_id', regData.training_id).eq('status', 'PENDING')
          // Move all accepted to Step 2
          await supabase.from('training_registrations').update({ progress_step: 2 }).eq('training_id', regData.training_id).eq('status', 'DITERIMA').eq('progress_step', 1)
          if (!bulkRejectError) autoFailTriggered = true
        }
      }

      // Send WhatsApp Notification
      if (regData?.user_id) {
        const { data: profile } = await supabase.from('profile_pencaker').select('phone').eq('user_id', regData.user_id).single()
        if (profile?.phone) {
          const blkTraining = regData.blk_trainings as any;
          const title = blkTraining?.title || (Array.isArray(blkTraining) && blkTraining[0]?.title) || 'Pelatihan'
          const message = `Selamat! Pendaftaran Anda untuk pelatihan "${title}" telah Lulus Administrasi (Tahap 1). Silakan masuk ke dashboard SIPENSIL untuk melihat jadwal seleksi/ujian.`
          sendWhatsApp(profile.phone, message).catch(e => console.error('WA notification failed:', e))
        }
      }
    }
  } else {
    // Fallback if no regId provided (backward compatibility or error)
    console.error("No regId provided for training update")
  }

  revalidatePath('/dashboard/dinas/verifikasi-pencaker')
  revalidatePath('/dashboard/dinas', 'layout')
  return { success: true, autoFailTriggered }
}

// 1.5 VERIFIKASI TRAINING REGISTRATION (PER CLASS) - PHASE 5
export async function verifyTrainingRegistrationAction(formData: FormData) {
  await verifyAdminRole();
  const supabase = await createClient()

  // Cek Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const regId = formData.get('regId') as string
  const action = formData.get('action') as string
  const trainingId = formData.get('trainingId') as string
  const reason = formData.get('reason') as string

  let autoFailTriggered = false

  if (action === 'reject' || action === 'tidak_lulus') {
    const { error } = await supabase
      .from('training_registrations')
      .update({
        status: 'DITOLAK',
        admin_notes: reason || 'Ditolak oleh admin.'
      })
      .eq('id', regId)

    if (error) return { error: error.message }
    console.log('Mock API Notification Triggered for user:', regId, 'status: DITOLAK')
  } else if (action === 'approve_admin') {
    // Lolos Administrasi (Step 1 -> 2)
    const { error } = await supabase
      .from('training_registrations')
      .update({
        status: 'DITERIMA',
        progress_step: 1, // Keep at step 1 until quota is full
        admin_notes: null
      })
      .eq('id', regId)

    if (error) return { error: error.message }
    console.log('Mock API Notification Triggered for user:', regId, 'new_step: 2')

    // Increment quota in blk_trainings
    // Handled automatically by Postgres DB Trigger `sync_training_quota`
    // await supabase.rpc('increment_quota', { row_id: trainingId })

    // Check Quota Logic for Step 2 if you want to limit early
    const { data: trainingData } = await supabase.from('blk_trainings').select('quota, title').eq('id', trainingId).single()
    if (trainingData && trainingData.quota > 0) {
      const { count } = await supabase.from('training_registrations').select('*', { count: 'exact', head: true }).eq('training_id', trainingId).in('status', ['DITERIMA', 'LULUS', 'SELESAI'])
      if (count && count >= trainingData.quota) {
        const { error: bulkRejectError } = await supabase.from('training_registrations').update({ status: 'DITOLAK', admin_notes: 'Mohon maaf, kuota angkatan telah terpenuhi.' }).eq('training_id', trainingId).eq('status', 'PENDING')
        // Move all accepted to Step 2
        await supabase.from('training_registrations').update({ progress_step: 2 }).eq('training_id', trainingId).eq('status', 'DITERIMA').eq('progress_step', 1)
        if (!bulkRejectError) autoFailTriggered = true
      }
    }

    // Send WhatsApp Notification
    const { data: regData } = await supabase.from('training_registrations').select('user_id').eq('id', regId).single()
    if (regData?.user_id) {
      const { data: profile } = await supabase.from('profile_pencaker').select('phone').eq('user_id', regData.user_id).single()
      if (profile?.phone) {
        const title = trainingData?.title || 'Pelatihan'
        const message = `Selamat! Pendaftaran Anda untuk pelatihan "${title}" telah Lulus Administrasi (Tahap 1). Silakan masuk ke dashboard SIPENSIL untuk melihat jadwal seleksi/ujian.`
        sendWhatsApp(profile.phone, message).catch(e => console.error('WA notification failed:', e))
      }
    }
  } else if (action === 'approve_seleksi') {
    // Lolos Seleksi (Step 2 -> 3)
    const { error } = await supabase
      .from('training_registrations')
      .update({
        progress_step: 3,
        admin_notes: null
      })
      .eq('id', regId)

    if (error) return { error: error.message }
    console.log('Mock API Notification Triggered for user:', regId, 'new_step: 3')
  } else if (action === 'lulus') {
    // Lulus Penilaian Akhir (Step 6 -> 7)
    const { error } = await supabase
      .from('training_registrations')
      .update({
        status: 'LULUS',
        progress_step: 4,
        admin_notes: null
      })
      .eq('id', regId)

    if (error) return { error: error.message }
    console.log('Mock API Notification Triggered for user:', regId, 'new_step: 7', 'status: LULUS')
  }

  revalidatePath(`/dashboard/dinas/pelatihan/${trainingId}`)
  return { success: true, autoFailTriggered }
}
export async function revertTrainingRegistrationAction(formData: FormData) {
  await verifyAdminRole();
  const supabase = await createClient()

  const regId = formData.get('regId') as string

  // Get current state
  const { data: reg, error: fetchError } = await supabase
    .from('training_registrations')
    .select(`
        status, 
        progress_step, 
        updated_at, 
        training_id,
        blk_trainings(
            tanggal_pengumuman_kelulusan_administrasi,
            tanggal_pengumuman_kelulusan_seleksi_awal,
            tanggal_pengumuman_hasil_uji_kompetensi
        )
    `)
    .eq('id', regId)
    .single()

  if (fetchError || !reg) return { error: "Registrasi tidak ditemukan" }

  // Restrict revert only if DITOLAK
  if (reg.status !== 'DITOLAK') {
      return { error: "Hanya peserta yang ditolak yang bisa dibatalkan penolakannya." }
  }

  // Time Constraint Check 1: 24 Hours
  if (reg.updated_at) {
    const updatedAt = new Date(reg.updated_at)
    const now = new Date()
    const diffHours = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60)
    if (diffHours > 24) {
      return { error: "Batas waktu untuk membatalkan penolakan (24 jam) telah habis." }
    }
  }

  // Time Constraint Check 2: Announcement Date (Bulk Update Date)
  const training = Array.isArray(reg.blk_trainings) ? reg.blk_trainings[0] : reg.blk_trainings
  if (training) {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' })
    const parts = formatter.formatToParts(now)
    const y = parts.find(p => p.type === 'year')?.value
    const m = parts.find(p => p.type === 'month')?.value
    const d = parts.find(p => p.type === 'day')?.value
    const todayStr = `${y}-${m}-${d}`

    let announcementDateStr = null
    if (reg.progress_step === 1) {
      announcementDateStr = training.tanggal_pengumuman_kelulusan_administrasi
    } else if (reg.progress_step === 2) {
      announcementDateStr = training.tanggal_pengumuman_kelulusan_seleksi_awal
    } else if (reg.progress_step === 3) {
      announcementDateStr = training.tanggal_pengumuman_hasil_uji_kompetensi
    }

    if (announcementDateStr) {
      const scheduledDateStr = new Date(announcementDateStr).toISOString().split('T')[0]
      if (todayStr >= scheduledDateStr) {
         return { error: "Gagal membatalkan penolakan: Masa pengumuman untuk tahap ini telah dimulai atau berlalu." }
      }
    }
  }

  // Determine original status based on step
  const originalStatus = reg.progress_step > 1 ? 'DITERIMA' : 'PENDING'

  const { error } = await supabase.from('training_registrations').update({
      status: originalStatus,
      admin_notes: null
  }).eq('id', regId)

  if (error) return { error: error.message }

  // Revalidate paths
  revalidatePath(`/dashboard/dinas/pelatihan/${reg.training_id}`)
  revalidatePath('/dashboard/dinas', 'layout')
  return { success: true }
}



// --- 2. VERIFIKASI IM JAPAN ---


// --- 3. VERIFIKASI LAPORAN LPK ---


// --- 4. VERIFIKASI MAGANG PERMIT ---


// --- 5. MANAJEMEN PELATIHAN (CRUD) ---

export async function createTrainingAction(formData: FormData) {
  await verifyAdminRole();
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const title = formData.get('title') as string
  const provider = formData.get('provider') as string
  const category = formData.get('category') as string
  const description = formData.get('description') as string
  const quota = parseInt(formData.get('quota') as string)
  const min_age = parseInt(formData.get('min_age') as string) || 17
  const max_age = parseInt(formData.get('max_age') as string) || 60
  const certification = formData.get('certification') as string
  const requirements = (formData.get('requirements') as string)?.split('\n').filter(r => r.trim() !== '') || []

  // Date Handling
  const registration_start = formData.get('registration_start') ? formData.get('registration_start') : null
  const registration_end = formData.get('registration_end') ? formData.get('registration_end') : null
  const training_start_date = formData.get('training_start_date') ? formData.get('training_start_date') : null
  const training_end_date = formData.get('training_end_date') ? formData.get('training_end_date') : null
  const training_start_time = formData.get('training_start_time') ? formData.get('training_start_time') : null
  const training_end_time = formData.get('training_end_time') ? formData.get('training_end_time') : null
  const tanggal_pengumuman_kelulusan_administrasi = formData.get('tanggal_pengumuman_kelulusan_administrasi') ? formData.get('tanggal_pengumuman_kelulusan_administrasi') : null
  const tanggal_pengumuman_kelulusan_seleksi_awal = formData.get('tanggal_pengumuman_kelulusan_seleksi_awal') ? formData.get('tanggal_pengumuman_kelulusan_seleksi_awal') : null
  const tanggal_pengumuman_hasil_uji_kompetensi = formData.get('tanggal_pengumuman_hasil_uji_kompetensi') ? formData.get('tanggal_pengumuman_hasil_uji_kompetensi') : null


  const whatsapp_group_link = formData.get('whatsapp_group_link') as string
  const additional_documents = JSON.parse(formData.get('additional_documents_json') as string || '[]')

  // Image Handing
  const imageFile = formData.get('image') as File
  let image_url = null
  if (imageFile) {
    image_url = await uploadImage(imageFile)
  }

  const { data, error } = await supabase.from('blk_trainings').insert({
    title, provider, category, description, quota, min_age, max_age, certification, requirements, status: 'OPEN', image_url,
    registration_start, registration_end, training_start_date, training_end_date, training_start_time, training_end_time, whatsapp_group_link, additional_documents,
    tanggal_pengumuman_kelulusan_administrasi, tanggal_pengumuman_kelulusan_seleksi_awal, tanggal_pengumuman_hasil_uji_kompetensi
  }).select('id').single()

  if (error || !data) return { error: error?.message || "Failed to create training" }

  const trainingId = data.id

  // 1.5 Create Default Announcements (Drafts)
  try {
    const defaultAnnouncements = [
      {
        training_id: trainingId,
        type: 'administrasi',
        content: 'Pengumuman Kelulusan Seleksi Administrasi\n\nBerdasarkan hasil evaluasi, berikut adalah daftar peserta yang dinyatakan lulus seleksi administrasi dan berhak mengikuti tahap selanjutnya:\n\n',
        is_published: false
      },
      {
        training_id: trainingId,
        type: 'seleksi_awal',
        content: 'Pengumuman Kelulusan Seleksi Awal (Wawancara)\n\nBerdasarkan hasil evaluasi, berikut adalah daftar peserta yang dinyatakan lulus seleksi awal dan berhak mengikuti tahap selanjutnya:\n\n',
        is_published: false
      },
      {
        training_id: trainingId,
        type: 'uji_kompetensi',
        content: 'Pengumuman Hasil Uji Kompetensi (Kelulusan Akhir)\n\nBerdasarkan hasil ujian kompetensi, berikut adalah daftar peserta yang dinyatakan lulus:\n\n',
        is_published: false
      }
    ];
    await supabase.from('training_announcements').insert(defaultAnnouncements);
  } catch (e: any) {
    console.error("Gagal membuat draf pengumuman default:", e);
  }

  // 2. Insert Selections
  try {
    const selections = JSON.parse(formData.get('selections_json') as string || '[]')
    const validSelections = selections.filter((s: any) => s.selection_date && s.selection_time)
    if (validSelections.length > 0) {
      const selectionsData = validSelections.map((s: any) => ({
        training_id: trainingId,
        name: s.name || null,
        selection_date: s.selection_date,
        selection_time: s.selection_time,
        location_address: s.location_address || null
      }))
      const { error: selError } = await supabase.from('training_selections').insert(selectionsData)
      if (selError) return { error: "Gagal menyimpan jadwal seleksi: " + selError.message }
    }
  } catch (e: any) {
    return { error: "Gagal memproses jadwal seleksi: " + e.message }
  }

  // 4. Insert Exams
  try {
    const exams = JSON.parse(formData.get('exams_json') as string || '[]')
    const validExams = exams.filter((e: any) => e.exam_date && e.exam_time)
    if (validExams.length > 0) {
      const examsData = validExams.map((e: any) => ({
        training_id: trainingId,
        name: e.name || 'Ujian Kompetensi',
        exam_date: e.exam_date,
        exam_time: e.exam_time,
        address: e.address || null
      }))
      const { error: examError } = await supabase.from('training_exams').insert(examsData)
      if (examError) return { error: "Gagal menyimpan jadwal ujian: " + examError.message }
    }
  } catch (e: any) {
    return { error: "Gagal memproses jadwal ujian: " + e.message }
  }

  revalidatePath('/dashboard/dinas', 'layout')
  return { success: true }
}

export async function updateTrainingAction(formData: FormData) {
  await verifyAdminRole();
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const min_age = parseInt(formData.get('min_age') as string)
  const max_age = parseInt(formData.get('max_age') as string)

  const registration_start = formData.get('registration_start') ? formData.get('registration_start') : null
  const registration_end = formData.get('registration_end') ? formData.get('registration_end') : null
  const training_start_date = formData.get('training_start_date') ? formData.get('training_start_date') : null
  const training_end_date = formData.get('training_end_date') ? formData.get('training_end_date') : null
  const training_start_time = formData.get('training_start_time') ? formData.get('training_start_time') : null
  const training_end_time = formData.get('training_end_time') ? formData.get('training_end_time') : null
  const tanggal_pengumuman_kelulusan_administrasi = formData.get('tanggal_pengumuman_kelulusan_administrasi') ? formData.get('tanggal_pengumuman_kelulusan_administrasi') : null
  const tanggal_pengumuman_kelulusan_seleksi_awal = formData.get('tanggal_pengumuman_kelulusan_seleksi_awal') ? formData.get('tanggal_pengumuman_kelulusan_seleksi_awal') : null
  const tanggal_pengumuman_hasil_uji_kompetensi = formData.get('tanggal_pengumuman_hasil_uji_kompetensi') ? formData.get('tanggal_pengumuman_hasil_uji_kompetensi') : null

  // Image Handling
  const imageFile = formData.get('image') as File
  let imageUpdate = {}
  if (imageFile && imageFile.size > 0) {
    const url = await uploadImage(imageFile)
    if (url) imageUpdate = { image_url: url }
  }

  // --- ROLLBACK LOGIC START ---
  const { data: currentTraining } = await supabase.from('blk_trainings')
    .select('tanggal_pengumuman_kelulusan_seleksi_awal, tanggal_pengumuman_hasil_uji_kompetensi')
    .eq('id', id).single()
  
  let targetRollbackStep: number | null = null;
  if (currentTraining) {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' })
    const parts = formatter.formatToParts(now)
    const y = parts.find(p => p.type === 'year')?.value
    const m = parts.find(p => p.type === 'month')?.value
    const d = parts.find(p => p.type === 'day')?.value
    const todayStr = `${y}-${m}-${d}`

    const oldSeleksi = currentTraining.tanggal_pengumuman_kelulusan_seleksi_awal
    const newSeleksi = tanggal_pengumuman_kelulusan_seleksi_awal as string
    if (oldSeleksi && newSeleksi) {
      const oldSeleksiStr = new Date(oldSeleksi).toISOString().split('T')[0]
      const newSeleksiStr = new Date(newSeleksi).toISOString().split('T')[0]
      if (oldSeleksiStr <= todayStr && newSeleksiStr > todayStr) {
        targetRollbackStep = 2
      }
    }

    if (targetRollbackStep === null) {
      const oldUji = currentTraining.tanggal_pengumuman_hasil_uji_kompetensi
      const newUji = tanggal_pengumuman_hasil_uji_kompetensi as string
      if (oldUji && newUji) {
        const oldUjiStr = new Date(oldUji).toISOString().split('T')[0]
        const newUjiStr = new Date(newUji).toISOString().split('T')[0]
        if (oldUjiStr <= todayStr && newUjiStr > todayStr) {
          targetRollbackStep = 3
        }
      }
    }
  }
  // --- ROLLBACK LOGIC END ---

  // 1. Update Data
  const additional_documents = JSON.parse(formData.get('additional_documents_json') as string || '[]')
  
  const { error } = await supabase.from('blk_trainings').update({
    title, min_age, max_age,
    provider: formData.get('provider'),
    category: formData.get('category'),
    description: formData.get('description'),
    quota: parseInt(formData.get('quota') as string),
    certification: formData.get('certification'),
    requirements: (formData.get('requirements') as string)?.split('\n').filter(r => r.trim() !== '') || [],
    registration_start, registration_end, training_start_date, training_end_date, training_start_time, training_end_time,
    tanggal_pengumuman_kelulusan_administrasi, tanggal_pengumuman_kelulusan_seleksi_awal, tanggal_pengumuman_hasil_uji_kompetensi,
    whatsapp_group_link: formData.get('whatsapp_group_link') as string,
    additional_documents,
    ...imageUpdate
  }).eq('id', id)

  if (error) return { error: error.message }

  // --- EXECUTE ROLLBACK ---
  if (targetRollbackStep !== null) {
    const { error: rollbackError } = await supabase.from('training_registrations')
      .update({ progress_step: targetRollbackStep })
      .eq('training_id', id)
      .gt('progress_step', targetRollbackStep)
      .neq('status', 'LULUS')
      .neq('status', 'DITOLAK')

    if (rollbackError) console.error("Rollback step error:", rollbackError)
  }

  // 1.5 Replace Selections, Exams
  // Delete existing ones
  await supabase.from('training_selections').delete().eq('training_id', id)
  await supabase.from('training_exams').delete().eq('training_id', id)

  // Insert new ones
  try {
    const selections = JSON.parse(formData.get('selections_json') as string || '[]')
    const validSelections = selections.filter((s: any) => s.selection_date && s.selection_time)
    if (validSelections.length > 0) {
      const selectionsData = validSelections.map((s: any) => ({
        training_id: id,
        name: s.name || null,
        selection_date: s.selection_date,
        selection_time: s.selection_time,
        location_address: s.location_address || null
      }))
      const { error: selError } = await supabase.from('training_selections').insert(selectionsData)
      if (selError) return { error: "Gagal menyimpan jadwal seleksi: " + selError.message }
    }
  } catch (e: any) {
    return { error: "Gagal memproses jadwal seleksi: " + e.message }
  }

  try {
    const exams = JSON.parse(formData.get('exams_json') as string || '[]')
    const validExams = exams.filter((e: any) => e.exam_date && e.exam_time)
    if (validExams.length > 0) {
      const examsData = validExams.map((e: any) => ({
        training_id: id,
        name: e.name || 'Ujian Kompetensi',
        exam_date: e.exam_date,
        exam_time: e.exam_time,
        address: e.address || null
      }))
      const { error: examError } = await supabase.from('training_exams').insert(examsData)
      if (examError) return { error: "Gagal menyimpan jadwal ujian: " + examError.message }
    }
  } catch (e: any) {
    return { error: "Gagal memproses jadwal ujian: " + e.message }
  }

  // 2. AUTO-KICK LOGIC
  const { data: participants } = await supabase.from('training_registrations').select('*, profiles(*)').eq('training_id', id).eq('status', 'DITERIMA')

  if (participants) {
    for (const p of participants) {
      if (!p.profiles) continue;
      const dob = new Date(p.profiles.dob)
      const today = new Date()
      let age = today.getFullYear() - dob.getFullYear()
      if (age < min_age || age > max_age) {
        await supabase.from('training_registrations').delete().eq('id', p.id)
        await supabase.from('notifications').insert({
          user_id: p.user_id,
          title: 'Pendaftaran Dibatalkan Otomatis',
          message: `Mohon maaf, pendaftaran Anda di "${title}" dibatalkan karena perubahan syarat usia (Min: ${min_age}, Max: ${max_age}).`
        })
      }
    }
  }

  revalidatePath('/dashboard/dinas', 'layout')
  return { success: true }
}

export async function deleteTrainingAction(formData: FormData) {
  await verifyAdminRole();
  const supabase = await createClient()
  const id = formData.get('id') as string

  // 1. Check for dependency (Safe Guard)
  const { count, error: countError } = await supabase
    .from('training_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('training_id', id)

  if (countError) return { error: "Gagal memeriksa peserta: " + countError.message }

  if (count && count > 0) {
    return { error: `Gagal menghapus: Masih ada ${count} peserta yang terdaftar di pelatihan ini. Harap kosongkan peserta terlebih dahulu.` }
  }

  // 1.5 Delete associated announcements
  const { error: annError } = await supabase.from('training_announcements').delete().eq('training_id', id)
  if (annError) return { error: "Gagal menghapus draf pengumuman: " + annError.message }

  // 2. Safe Delete
  const { error } = await supabase.from('blk_trainings').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/dinas', 'layout')
  return { success: true }
}

export async function archiveTrainingAction(formData: FormData) {
  await verifyAdminRole();
  const supabase = await createClient()
  const id = formData.get('id') as string

  // 1. Force status to FINISHED regardless of date
  const { error } = await supabase.from('blk_trainings').update({ status: 'FINISHED' }).eq('id', id)

  if (error) return { error: error.message }

  // 2. Also Complete all Accepted Registrations (DITERIMA -> SELESAI)
  await supabase
    .from('training_registrations')
    .update({ status: 'SELESAI' })
    .eq('training_id', id)
    .eq('status', 'DITERIMA')

  revalidatePath('/dashboard/dinas', 'layout')
  revalidatePath('/dashboard/dinas/pelatihan')
  revalidatePath('/dashboard/dinas/pelatihan/riwayat')
  return { success: true }
}

export async function unarchiveTrainingAction(formData: FormData) {
  await verifyAdminRole();
  const supabase = await createClient()
  const id = formData.get('id') as string

  // 1. Restore status to OPEN
  const { error } = await supabase.from('blk_trainings').update({ status: 'OPEN' }).eq('id', id)

  if (error) return { error: error.message }

  // 2. Note: We do NOT automatically revert participants from SELESAI to DITERIMA.
  // This is because we don't know if they truly finished or not.
  // The admin can manually manage participants if needed.

  revalidatePath('/dashboard/dinas', 'layout')
  revalidatePath('/dashboard/dinas/pelatihan')
  revalidatePath('/dashboard/dinas/pelatihan/riwayat')
  return { success: true }
}


// --- 6. MANAJEMEN PESERTA (KICK) ---
export async function kickParticipantAction(formData: FormData) {
  await verifyAdminRole();
  const supabase = await createClient()
  const regId = formData.get('regId') as string
  const reason = formData.get('reason') as string

  const { data: reg } = await supabase.from('training_registrations').select('*, blk_trainings(title)').eq('id', regId).single()

  if (reg) {
    // Change status to 'DITOLAK' (Kick) instead of hard delete, so history is preserved if needed (though excluded from active view)
    // Or we can use a new status 'DIKELUARKAN'. Let's stick to 'DITOLAK' or 'DROPPED' based on user preference "mengeluarkan".
    // "DITOLAK" usually implies rejected at registration. "DIKELUARKAN" implies during training.
    // Let's use 'DITOLAK' to keep it simple and consistent with "Not in DITERIMA list".
    await supabase.from('training_registrations').update({ status: 'DITOLAK' }).eq('id', regId)

    await supabase.from('notifications').insert({
      user_id: reg.user_id,
      title: 'Anda Dikeluarkan dari Pelatihan',
      message: `Admin telah mengeluarkan Anda dari pelatihan "${reg.blk_trainings?.title}". Alasan: ${reason}`
    })
  }
  revalidatePath('/dashboard/dinas', 'layout')
}

// --- 7. MANAJEMEN USER (ADMIN EDIT) ---
export async function adminUpdateUserAction(formData: FormData) {
  await verifyAdminRole();
  const supabase = await createAdminClient()
  const userId = formData.get('userId') as string
  let targetRole = formData.get('role') as string // 'PENCAKER', 'PERUSAHAAN', 'LPK' ('ADMIN_LPK')



  const fullName = formData.get('full_name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. Update Authentication (Email & Password)
  // Only update if provided and different. 
  // Note: Updating email requires email ownership verification flow usually, but 'updateUserById' as admin *might* bypass or send confirm.
  // For now, let's allow password reset. Email update serves logic complexity (confirmations), let's stick to Profile updates unless critical.
  if (password && password.trim() !== '') {
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, { password: password })
    if (authError) return { error: "Gagal update password: " + authError.message }
  }

  // 2. Update Base Profile
  const { error } = await supabase.from('profiles').update({
    full_name: fullName,
    account_status: formData.get('account_status') as string,
    // verification_status: formData.get('verification_status') 
  }).eq('id', userId)

  if (error) return { error: error.message }

  // 3. Update Details based on Role
  // 3. Update Details based on Role
  if (targetRole === 'PENCAKER') {
    const { error: detailError } = await supabase.from('profile_pencaker').upsert({
      user_id: userId,
      nik: formData.get('nik') as string,
      phone: formData.get('phone') as string,
      gender: formData.get('gender') as string,
      place_of_birth: formData.get('place_of_birth') as string,
      date_of_birth: formData.get('date_of_birth') ? formData.get('date_of_birth') : null,
      address_ktp: formData.get('address_ktp') as string,
      address_dom: formData.get('address_dom') as string,
      religion: formData.get('religion') as string,
      education: formData.get('education') as string,
      ktp_url: formData.get('ktp_url') as string,
      ijazah_url: formData.get('ijazah_url') as string,
      photo_url: formData.get('photo_url') as string,
    }, { onConflict: 'user_id' })
    if (detailError) return { error: detailError.message }

    // Also update main profile photo if provided
    if (formData.get('photo_url')) {
      await supabase.from('profiles').update({ photo_url: formData.get('photo_url') as string }).eq('id', userId)
    }

  } else if (targetRole === 'PERUSAHAAN') {
    const { error: detailError } = await supabase.from('profile_perusahaan').upsert({
      user_id: userId,
      company_name: formData.get('company_name') as string,
      nib: formData.get('nib') as string,
      phone: formData.get('phone') as string, // Official Phone
      address_office: formData.get('address') as string, // Mapped to address_office
      email_official: formData.get('email_official') as string,
      sector: formData.get('sector') as string,
      director_name: formData.get('director_name') as string,
      pic_name: formData.get('pic_name') as string,
      pic_phone: formData.get('pic_phone') as string,
    }, { onConflict: 'user_id' })
    if (detailError) return { error: detailError.message }

  } else if (targetRole === 'LPK') {
    const { error: detailError } = await supabase.from('profile_lpk').upsert({
      user_id: userId,
      lpk_name: formData.get('lpk_name') as string,
      phone: formData.get('phone') as string, // General Phone
      address_office: formData.get('address') as string, // Mapped to address_office
      lpk_type: formData.get('lpk_type') as string,
      fax: formData.get('fax') as string,
      email_official: formData.get('email_official') as string,
      nips: formData.get('nips') as string,
      license_number: formData.get('license_number') as string,
      license_date: formData.get('license_date') ? formData.get('license_date') : null,
      director_name: formData.get('director_name') as string,
      director_phone: formData.get('director_phone') as string,
      operational_pj: formData.get('operational_pj') as string,
      operational_pj_title: formData.get('operational_pj_title') as string,
      operational_pj_phone: formData.get('operational_pj_phone') as string,
      operational_pj_email: formData.get('operational_pj_email') as string,
    }, { onConflict: 'user_id' })
    if (detailError) return { error: detailError.message }
  }

  revalidatePath('/dashboard/dinas', 'layout')
  revalidatePath(`/dashboard/dinas/users`)
  return { success: true }
}

// --- 8. CLEANUP (DELETE HISTORY) ---
export async function deleteRegistrationHistoryAction(formData: FormData) {
  await verifyAdminRole();
  const supabase = await createClient()
  const regId = formData.get('regId') as string

  await supabase.from('training_registrations').delete().eq('id', regId) // Hard delete for cleanup
  revalidatePath('/dashboard/dinas', 'layout')
}



// Helper for Document Upload
async function uploadDocument(file: File): Promise<string | null> {
  if (!file || file.size === 0 || file.name === 'undefined') return null

  // Validate Type (PDF, DOC, DOCX, Images)
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
  if (!allowedTypes.includes(file.type)) return null 

  const buffer = Buffer.from(await file.arrayBuffer())
  
  // Prevent Path Traversal by removing all slashes and restricted characters
  const safeOriginalName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')
  const filename = `${Date.now()}-${safeOriginalName}`
  const publicPath = path.join(process.cwd(), 'public', 'uploads', 'documents')

  try {
    await fs.mkdir(publicPath, { recursive: true })
    await fs.writeFile(path.join(publicPath, filename), buffer)
    return `/uploads/documents/${filename}`
  } catch (error) {
    console.error("Document Upload Failed:", error)
    return null
  }
}

// --- 9. IM JAPAN REQUIREMENTS CRUD ---






// --- 10. LPK ACTIONS ---


// Data LPK CRUD






// --- 11. ADMIN USER MANAGEMENT ---

export async function adminCreateUserAction(formData: FormData) {
  await verifyAdminRole();
  const supabase = await createAdminClient()

  // Common Fields
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const full_name = formData.get('full_name') as string
  let role = formData.get('role') as string // PENCAKER, PERUSAHAAN, LPK



  if (!email || !password || !full_name || !role) {
    return { error: 'Semua field wajib diisi.' }
  }

  // 1. Create Auth User
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, full_name }
  })

  if (authError) return { error: authError.message }
  const userId = authData.user.id

  // Determine Verification Status based on Profile Data
  // If optional fields (NIK/NIB/License) are filled, assume verified. Else unverified.
  const nik = formData.get('nik') as string
  const nib = formData.get('nib') as string
  const license_number = formData.get('license_number') as string

  let account_status = 'unverified'
  if (role === 'PENCAKER' && nik && nik.length > 5) account_status = 'verified'
  if (role === 'PERUSAHAAN' && nib && nib.length > 5) account_status = 'verified'
  if (role === 'LPK' && license_number && license_number.length > 3) account_status = 'verified'

  // 2. Update Profile (Base)
  const { error: profileError } = await supabase.from('profiles').update({
    full_name,
    role,
    account_status: account_status
  }).eq('id', userId)

  if (profileError) return { error: profileError.message }

  // 3. Create Role Specific Data
  if (role === 'PENCAKER') {
    const phone = formData.get('phone') as string
    const gender = formData.get('gender') as string
    const place_of_birth = formData.get('place_of_birth') as string
    const date_of_birth = formData.get('date_of_birth') as string
    const address_ktp = formData.get('address_ktp') as string
    const address_dom = formData.get('address_dom') as string
    const religion = formData.get('religion') as string
    const education = formData.get('education') as string

    // Insert empty or partial data. Trigger might handle creation, so let's use Upsert.
    const { error } = await supabase.from('profile_pencaker').upsert({
      user_id: userId,
      nik: nik || null,
      phone: phone || null,
      gender: gender || null,
      place_of_birth: place_of_birth || null,
      date_of_birth: date_of_birth || null,
      address_ktp: address_ktp || null,
      address_dom: address_dom || null,
      religion: religion || null,
      education: education || null
    })
    if (error) return { error: 'Gagal membuat data pencaker: ' + error.message }

  } else if (role === 'PERUSAHAAN') {
    const sector = formData.get('sector') as string
    const address_office = formData.get('address_office') as string
    const phone = formData.get('phone') as string
    const pic_name = formData.get('pic_name') as string
    const pic_phone = formData.get('pic_phone') as string
    const email_official = formData.get('email_official') as string
    const director_name = formData.get('director_name') as string

    const { error } = await supabase.from('profile_perusahaan').upsert({
      user_id: userId,
      company_name: full_name, // Default to same name
      nib: nib || null,
      sector: sector || null,
      address_office: address_office || null,
      phone: phone || null,
      pic_name: pic_name || null,
      pic_phone: pic_phone || null,
      email_official: email_official || null,
      director_name: director_name || null
    })
    if (error) return { error: 'Gagal membuat data perusahaan: ' + error.message }

  } else if (role === 'LPK') {
    const nips = formData.get('nips') as string
    const lpk_type = formData.get('lpk_type') as string
    const address_office = formData.get('address_office') as string
    const phone = formData.get('phone') as string
    // license_number already extracted
    const license_date = formData.get('license_date') as string
    const fax = formData.get('fax') as string
    const email_official = formData.get('email_official') as string
    const director_name = formData.get('director_name') as string
    const director_phone = formData.get('director_phone') as string

    // Mandatory for Auth but also saved in profile
    const operational_pj = formData.get('operational_pj') as string
    const operational_pj_title = formData.get('operational_pj_title') as string
    const operational_pj_phone = formData.get('operational_pj_phone') as string

    const { error } = await supabase.from('profile_lpk').upsert({
      user_id: userId,
      lpk_name: full_name,
      nips: nips || null,
      lpk_type: lpk_type || 'Swasta',
      address_office: address_office || null,
      phone: phone || null,
      license_number: license_number || null,
      license_date: license_date || null,
      fax: fax || null,
      email_official: email_official || null,
      director_name: director_name || null,
      director_phone: director_phone || null,
      operational_pj: operational_pj || null,
      operational_pj_title: operational_pj_title || null,
      operational_pj_phone: operational_pj_phone || null
    })
    if (error) return { error: 'Gagal membuat data LPK: ' + error.message }
  }

  revalidatePath('/dashboard/dinas/users')
  return { success: true }
}

// --- 12. PERUSAHAAN ACTIONS ---






// Data Perusahaan CRUD






export async function deleteUserAction(formData: FormData) {
  await verifyAdminRole();
  // 1. Verify Caller Identity & Role (Security Check)
  const supabase = await createClient() // Standard client (RLS)
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized: Harap login terlebih dahulu' }
  }

  // Check if caller is truly an admin (Dinas) by checking public.profiles or metadata
  // Role matches app/dashboard/dinas/layout.tsx
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'ADMIN_DINAS') {
    return { error: 'Forbidden: Hubungi administrator dikarenakan anda tidak memiliki akses (Role Mismatch).' }
  }

  // 2. Perform Privileged Deletion
  const adminClient = await createAdminClient()
  const userId = formData.get('userId') as string

  console.log(`[deleteUserAction] Admin ${user.email} initiating FORCE DELETION for ${userId}`)

  const { data: result, error: rpcError } = await adminClient.rpc('force_delete_user', {
    target_user_id: userId
  })

  if (rpcError) {
    console.error(`[deleteUserAction] RPC Call Failed: ${rpcError.message}`)
    return { error: `Gagal memproses permintaan (RPC Error): ${rpcError.message}` }
  }

  if (result && result.startsWith('Error')) {
    console.error(`[deleteUserAction] DB Error: ${result}`)
    return { error: `Gagal menghapus user (DB): ${result}` }
  }

  revalidatePath('/dashboard/dinas/users')
  return { success: true }
}




// --- 12. MAINTENANCE / CRON SIMULATION ---
// --- 12. MAINTENANCE / CRON SIMULATION ---
export async function autoUpdateTrainingStatusAction() {
  await verifyAdminRole();
  const supabase = await createAdminClient()
  const todayDate = new Date()
  const today = todayDate.toISOString().split('T')[0]

  const sevenDaysAgoDate = new Date()
  sevenDaysAgoDate.setDate(todayDate.getDate() - 7)
  const sevenDaysAgo = sevenDaysAgoDate.toISOString().split('T')[0]

  // 1. Close Registration
  // Update status 'OPEN' -> 'CLOSED' if registration_end < today
  await supabase
    .from('blk_trainings')
    .update({ status: 'CLOSED' })
    .eq('status', 'OPEN')
    .lt('registration_end', today)

  // 2. Complete Training (Archive/Legacy)
  // Update training status 'OPEN' OR 'CLOSED' -> 'FINISHED' if training_end_date < 7 days ago
  // This effectively removes them from Catalog and moves them to Legacy View.
  await supabase
    .from('blk_trainings')
    .update({ status: 'FINISHED' })
    .in('status', ['OPEN', 'CLOSED'])
    .lt('training_end_date', sevenDaysAgo)

  // 3. Complete Registrations (SELESAI)
  // Find trainings that have ENDED (status FINISHED or training_end_date passed)
  const { data: endedTrainings } = await supabase
    .from('blk_trainings')
    .select('id')
    .lt('training_end_date', today)

  if (endedTrainings && endedTrainings.length > 0) {
    const ids = endedTrainings.map(t => t.id)
    await supabase
      .from('training_registrations')
      .update({ status: 'SELESAI' })
      .eq('status', 'DITERIMA')
      .in('training_id', ids)
  }
}

export async function bulkRejectPendingAction(trainingId: string) {
  await verifyAdminRole();
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from('training_registrations')
    .update({ 
      status: 'DITOLAK', 
      admin_notes: 'Mohon maaf, kuota angkatan telah terpenuhi.' 
    })
    .eq('training_id', trainingId)
    .eq('status', 'PENDING')

  // Move all accepted to Step 2
  await supabase.from('training_registrations').update({ progress_step: 2 }).eq('training_id', trainingId).eq('status', 'DITERIMA')

  if (error) return { error: error.message }
  revalidatePath(`/dashboard/dinas/pelatihan/${trainingId}`)
  return { success: true }
}

