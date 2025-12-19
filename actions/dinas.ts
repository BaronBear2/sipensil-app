'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import path from 'path'
import fs from 'fs/promises'

// Helper for Image Upload (Local Mock -> public/uploads)
// In production, use Supabase Storage. Here we demonstrate functionality.
async function uploadImage(file: File): Promise<string | null> {
  if (!file || file.size === 0 || file.name === 'undefined') return null

  // Validate Type
  if (!file.type.startsWith('image/')) return null

  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`
  const publicPath = path.join(process.cwd(), 'public', 'uploads')

  try {
    await fs.mkdir(publicPath, { recursive: true })
    await fs.writeFile(path.join(publicPath, filename), buffer)
    return `/uploads/${filename}`
  } catch (error) {
    console.error("Upload Failed:", error)
    return null
  }
}

// --- 1. VERIFIKASI PROFILE (Pencaker Gate) ---
// 1. VERIFIKASI AKUN PENCAKER (GATE PELATIHAN)
export async function verifyProfileAction(formData: FormData) {
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
      rejection_message: action === 'reject' ? reason : null,
      admin_notes: action === 'reject' ? reason : null
    })
    .eq('id', userId)

  if (error) return { error: error.message }

  // 2. Update Status Pelatihan yang PENDING
  if (action === 'approve') {
    await supabase
      .from('training_registrations')
      .update({ status: 'DITERIMA' })
      .eq('user_id', userId)
      .eq('status', 'PENDING')
      .eq('status', 'PENDING')
  } else {
    // REJECT
    const { error: regError } = await supabase
      .from('training_registrations')
      .update({ status: 'DITOLAK' })
      .eq('user_id', userId)
      .eq('status', 'PENDING')

    if (regError) return { error: "Failed to update registrations: " + regError.message }
  }

  revalidatePath('/dashboard/dinas')
  return { success: true }
}

// --- 2. VERIFIKASI IM JAPAN ---
export async function verifyImJapanAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const regId = formData.get('regId') as string
  const action = formData.get('action') as string
  const reason = formData.get('reason') as string

  // Update im_japan_registrations
  if (action === 'approve') {
    await supabase.from('im_japan_registrations').update({ status: 'VERIFIED', admin_notes: null }).eq('id', regId)
  } else {
    await supabase.from('im_japan_registrations').update({ status: 'REJECTED', admin_notes: reason }).eq('id', regId)
  }
  revalidatePath('/dashboard/dinas')
}

// --- 3. VERIFIKASI LAPORAN LPK ---
export async function verifyLpkReportAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const reportId = formData.get('reportId') as string
  const userId = formData.get('userId') as string // ID LPK Owner
  const action = formData.get('action') as string
  const reason = formData.get('reason') as string

  if (action === 'approve') {
    // 1. Accept Report
    const { error } = await supabase.from('lpk_reports').update({ status: 'APPROVED' }).eq('id', reportId) // Was 'ACCEPTED' -> Schema enum usually 'APPROVED' or 'VERIFIED'? Let's stick to 'APPROVED' as per UI.

    // 2. Auto Identify LPK Account as Verified
    if (!error) {
      await supabase.from('profiles').update({ account_status: 'verified', rejection_message: null }).eq('id', userId)
    } else {
      return { error: error.message }
    }

  } else {
    // Reject Report
    // User reported: "Laporan lpk saat terima atau tolak tidak bisa" -> likely due to missing return or error.
    const { error: lpkError } = await supabase.from('lpk_reports').update({ status: 'REJECTED', rejection_reason: reason }).eq('id', reportId)
    if (lpkError) return { error: lpkError.message }

    // Also notify profile?
    await supabase.from('profiles').update({ rejection_message: `Laporan Anda Ditolak: ${reason}` }).eq('id', userId)
  }
  revalidatePath('/dashboard/dinas')
  return { success: true }
}

// --- 4. VERIFIKASI MAGANG PERMIT ---
export async function verifyMagangPermitAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const permitId = formData.get('permitId') as string
  const action = formData.get('action') as string
  const reason = formData.get('reason') as string

  if (action === 'approve') {
    const letterNum = `SK-MGG/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000)}`
    await supabase.from('magang_permits').update({ status: 'APPROVED', letter_number: letterNum, rejection_reason: null }).eq('id', permitId)
  } else {
    await supabase.from('magang_permits').update({ status: 'REJECTED', rejection_reason: reason }).eq('id', permitId)
  }
  revalidatePath('/dashboard/dinas')
  return { success: true }
}

// --- 5. MANAJEMEN PELATIHAN (CRUD) ---

export async function createTrainingAction(formData: FormData) {
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

  // Image Handing
  const imageFile = formData.get('image') as File
  let image_url = null
  if (imageFile) {
    image_url = await uploadImage(imageFile)
  }

  const { error } = await supabase.from('blk_trainings').insert({
    title, provider, category, description, quota, min_age, max_age, certification, requirements, status: 'OPEN', image_url
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/dinas')
  return { success: true }
}

export async function updateTrainingAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const min_age = parseInt(formData.get('min_age') as string)
  const max_age = parseInt(formData.get('max_age') as string)

  // Image Handling
  const imageFile = formData.get('image') as File
  let imageUpdate = {}
  if (imageFile && imageFile.size > 0) {
    const url = await uploadImage(imageFile)
    if (url) imageUpdate = { image_url: url }
  }

  // 1. Update Data
  const { error } = await supabase.from('blk_trainings').update({
    title, min_age, max_age,
    provider: formData.get('provider'),
    category: formData.get('category'),
    description: formData.get('description'),
    quota: parseInt(formData.get('quota') as string),
    certification: formData.get('certification'),
    requirements: (formData.get('requirements') as string)?.split('\n').filter(r => r.trim() !== '') || [],
    ...imageUpdate
  }).eq('id', id)

  if (error) return { error: error.message }

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

  revalidatePath('/dashboard/dinas')
  return { success: true }
}

export async function deleteTrainingAction(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  // User reported "tidak bisa dihapus". Usually due to foreign key constraints (registrations).
  // We must delete registrations first or use CASCADE.
  // SQL usually handles cascade if configured, but let's be safe and delete registrations manually or handle error.

  // Try delete.
  const { error } = await supabase.from('blk_trainings').delete().eq('id', id)

  if (error) {
    // If FK error, delete children first
    if (error.message.includes('foreign key')) {
      await supabase.from('training_registrations').delete().eq('training_id', id)
      await supabase.from('blk_trainings').delete().eq('id', id)
    } else {
      return { error: error.message }
    }
  }

  revalidatePath('/dashboard/dinas')
  return { success: true }
}


// --- 6. MANAJEMEN PESERTA (KICK) ---
export async function kickParticipantAction(formData: FormData) {
  const supabase = await createClient()
  const regId = formData.get('regId') as string
  const reason = formData.get('reason') as string

  const { data: reg } = await supabase.from('training_registrations').select('*, blk_trainings(title)').eq('id', regId).single()

  if (reg) {
    await supabase.from('training_registrations').delete().eq('id', regId)
    await supabase.from('notifications').insert({
      user_id: reg.user_id,
      title: 'Anda Dikeluarkan dari Pelatihan',
      message: `Admin telah mengeluarkan Anda dari pelatihan "${reg.blk_trainings?.title}". Alasan: ${reason}`
    })
  }
  revalidatePath('/dashboard/dinas')
}

// --- 7. MANAJEMEN USER (ADMIN EDIT) ---
export async function adminUpdateUserAction(formData: FormData) {
  const supabase = await createClient()
  const userId = formData.get('userId') as string

  const updates = {
    full_name: formData.get('full_name'),
    nik: formData.get('nik'),
    phone: formData.get('phone'),
    account_status: 'verified', // Auto verify
    verification_status: 'VERIFIED'
  }

  const { error } = await supabase.from('profiles').update(updates).eq('id', userId)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/dinas')
  return { success: true }
}