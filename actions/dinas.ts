'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
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
      rejection_message: action === 'reject' ? reason : null
    })
    .eq('id', userId)

  if (error) return { error: error.message }

  // 2. Update Status Pelatihan Specific Row (Reliable)
  const regId = formData.get('regId') as string
  if (regId) {
    const statusUpdate = action === 'approve' ? 'DITERIMA' : 'DITOLAK'
    const { error: regError } = await supabase
      .from('training_registrations')
      .update({
        status: statusUpdate,
        admin_notes: action === 'reject' ? reason : null // Fix: Save the reason!
      })
      .eq('id', regId)

    if (regError) return { error: "Failed to update registration: " + regError.message }
  } else {
    // Fallback if no regId provided (backward compatibility or error)
    console.error("No regId provided for training update")
  }

  revalidatePath('/dashboard/dinas/verifikasi-pencaker')
  revalidatePath('/dashboard/dinas')
  return { success: true }
}

// --- 2. VERIFIKASI IM JAPAN ---
export async function verifyImJapanAction(formData: FormData) {
  // 1. Verify Perms with User Client
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // You might want to check Role here too if strictly needed, but let's assume Middleware covers it or check profile.
  // const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  // if (profile?.role !== 'ADMIN_DINAS') throw new Error("Unauthorized Role")

  // 2. Perform Write with Admin Client
  const adminClient = await createAdminClient()

  const regId = formData.get('regId') as string
  const action = formData.get('action') as string
  const reason = formData.get('reason') as string

  if (action === 'approve') {
    const { error } = await adminClient.from('im_japan_registrations').update({ status: 'VERIFIED', admin_notes: null }).eq('id', regId)
    if (error) console.error("VERIFY ERROR:", error)
  } else {
    const { error } = await adminClient.from('im_japan_registrations').update({ status: 'REJECTED', admin_notes: reason }).eq('id', regId)
    if (error) console.error("REJECT ERROR:", error)
  }
  revalidatePath('/dashboard/dinas')
  revalidatePath('/dashboard/dinas/im-japan')
}

// --- 3. VERIFIKASI LAPORAN LPK ---
export async function verifyLpkReportAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const adminSupabase = await createAdminClient()

  const reportId = formData.get('reportId') as string
  const userId = formData.get('userId') as string // ID LPK Owner
  const action = formData.get('action') as string
  const reason = formData.get('reason') as string

  const { data, error } = await adminSupabase.rpc('verify_lpk_report', {
    p_report_id: reportId,
    p_user_id: userId,
    p_action: action,
    p_reason: reason || null
  })

  if (error) {
    console.error("❌ RPC Error:", error)
    return { error: "Gagal memproses verifikasi: " + error.message }
  }

  // RPC returns JSONB: { success: boolean, message: string, error: string }
  if (data && !data.success) {
    console.error("❌ RPC Logic Error:", data.error)
    return { error: data.error }
  }

  revalidatePath('/dashboard/dinas/lpk')

  if (action === 'approve') {
    redirect('/dashboard/dinas/lpk?status=approved')
  } else {
    redirect('/dashboard/dinas/lpk?status=rejected')
  }
  // revalidatePath('/dashboard/dinas/lpk') // Moved inside to prevent unreachable code after redirect
  // return { success: true }
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

  // Date Handling
  const registration_start = formData.get('registration_start') ? formData.get('registration_start') : null
  const registration_end = formData.get('registration_end') ? formData.get('registration_end') : null
  const training_start_date = formData.get('training_start_date') ? formData.get('training_start_date') : null
  const training_end_date = formData.get('training_end_date') ? formData.get('training_end_date') : null


  // Image Handing
  const imageFile = formData.get('image') as File
  let image_url = null
  if (imageFile) {
    image_url = await uploadImage(imageFile)
  }

  const { error } = await supabase.from('blk_trainings').insert({
    title, provider, category, description, quota, min_age, max_age, certification, requirements, status: 'OPEN', image_url,
    registration_start, registration_end, training_start_date, training_end_date
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

  const registration_start = formData.get('registration_start') ? formData.get('registration_start') : null
  const registration_end = formData.get('registration_end') ? formData.get('registration_end') : null
  const training_start_date = formData.get('training_start_date') ? formData.get('training_start_date') : null
  const training_end_date = formData.get('training_end_date') ? formData.get('training_end_date') : null

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
    registration_start, registration_end, training_start_date, training_end_date,
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

  // 1. Check for dependency (Safe Guard)
  const { count, error: countError } = await supabase
    .from('training_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('training_id', id)

  if (countError) return { error: "Gagal memeriksa peserta: " + countError.message }

  if (count && count > 0) {
    return { error: `Gagal menghapus: Masih ada ${count} peserta yang terdaftar di pelatihan ini. Harap kosongkan peserta terlebih dahulu.` }
  }

  // 2. Safe Delete
  const { error } = await supabase.from('blk_trainings').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/dinas')
  return { success: true }
}

export async function archiveTrainingAction(formData: FormData) {
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
  revalidatePath('/dashboard/dinas')
}

// --- 7. MANAJEMEN USER (ADMIN EDIT) ---
export async function adminUpdateUserAction(formData: FormData) {
  const supabase = await createAdminClient()
  const userId = formData.get('userId') as string
  const targetRole = formData.get('role') as string // 'PENCAKER', 'PERUSAHAAN', 'LPK' ('ADMIN_LPK')

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
    // Allow status updates if needed
    // account_status: formData.get('account_status'), 
    // verification_status: formData.get('verification_status') 
  }).eq('id', userId)

  if (error) return { error: error.message }

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
      major: formData.get('major') as string,
      skills: formData.get('skills') as string,
      field_of_work: formData.get('field_of_work') as string,
      curriculum_vitae: formData.get('curriculum_vitae') as string,
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

  } else if (targetRole === 'LPK' || targetRole === 'ADMIN_LPK') {
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

  revalidatePath('/dashboard/dinas')
  revalidatePath(`/dashboard/dinas/users`)
  return { success: true }
}

// --- 8. CLEANUP (DELETE HISTORY) ---
export async function deleteRegistrationHistoryAction(formData: FormData) {
  const supabase = await createClient()
  const regId = formData.get('regId') as string

  await supabase.from('training_registrations').delete().eq('id', regId) // Hard delete for cleanup
  revalidatePath('/dashboard/dinas')
}

export async function deleteImJapanHistoryAction(formData: FormData) {
  const supabase = await createClient()
  const regId = formData.get('regId') as string

  await supabase.from('im_japan_registrations').delete().eq('id', regId)
  revalidatePath('/dashboard/dinas')
}

// Helper for Document Upload
async function uploadDocument(file: File): Promise<string | null> {
  if (!file || file.size === 0 || file.name === 'undefined') return null

  // Validate Type (PDF, DOC, DOCX, Images)
  // Allow broadly for now
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
  // if (!allowedTypes.includes(file.type)) return null 

  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`
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
export async function createImJapanRequirementAction(formData: FormData) {
  const supabase = await createAdminClient()
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const is_required = formData.get('is_required') === 'on'
  const is_active = formData.get('is_active') === 'on'

  // Handle Template Upload
  const templateFile = formData.get('template') as File
  let template_url = null
  if (templateFile && templateFile.size > 0) {
    template_url = await uploadDocument(templateFile)
  }

  await supabase.from('im_japan_requirements').insert({ title, description, is_required, is_active, template_url })
  revalidatePath('/dashboard/dinas/im-japan/requirements')
  redirect('/dashboard/dinas/im-japan/requirements')
}

export async function updateImJapanRequirementAction(formData: FormData) {
  const supabase = await createAdminClient()
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const is_required = formData.get('is_required') === 'on'
  const is_active = formData.get('is_active') === 'on'

  // Handle Template Upload
  const templateFile = formData.get('template') as File
  let templateUpdate = {}
  if (templateFile && templateFile.size > 0) {
    const url = await uploadDocument(templateFile)
    if (url) templateUpdate = { template_url: url }
  }

  await supabase.from('im_japan_requirements').update({ title, description, is_required, is_active, ...templateUpdate }).eq('id', id)
  revalidatePath('/dashboard/dinas/im-japan/requirements')
}

export async function deleteImJapanRequirementAction(formData: FormData) {
  const supabase = await createAdminClient()
  const id = formData.get('id') as string
  await supabase.from('im_japan_requirements').delete().eq('id', id)
  revalidatePath('/dashboard/dinas/im-japan/requirements')
}

// --- 10. LPK ACTIONS ---
export async function deleteLpkReportAction(formData: FormData) {
  const supabase = await createAdminClient()
  const id = formData.get('id') as string
  await supabase.from('lpk_reports').delete().eq('id', id)
  revalidatePath('/dashboard/dinas')
}

// Data LPK CRUD
export async function createLpkAction(formData: FormData) {
  const supabase = await createAdminClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string // LPK Name
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string

  // 1. Create Auth User
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'lpk', full_name: name }
  })

  if (authError) return { error: authError.message }
  const userId = authData.user.id

  // 2. Create Profile (Trigger might handle this, but let's be safe/explicit if trigger only sets basic info)
  // Trigger `handle_new_user` usually creates profile. We update it.
  const { error: profileError } = await supabase.from('profiles').update({
    full_name: name,
    role: 'lpk',
    account_status: 'verified'
  }).eq('id', userId)

  if (profileError) return { error: profileError.message }

  // 3. Update profile_lpk
  const { error: lpkError } = await supabase.from('profile_lpk').upsert({
    user_id: userId,
    lpk_name: name,
    phone_number: phone,
    address: address
  })

  if (lpkError) return { error: lpkError.message }

  revalidatePath('/dashboard/dinas/lpk/data')
  return { success: true }
}

export async function updateLpkAction(formData: FormData) {
  const supabase = await createAdminClient()
  const userId = formData.get('userId') as string
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string

  await supabase.from('profiles').update({ full_name: name }).eq('id', userId)
  await supabase.from('profile_lpk').update({ lpk_name: name, phone_number: phone, address }).eq('user_id', userId)

  revalidatePath('/dashboard/dinas/lpk/data')
  return { success: true }
}

export async function deleteLpkAction(formData: FormData) {
  const supabase = await createAdminClient()
  const userId = formData.get('userId') as string

  // Delete auth user (cascades to profiles usually, if configured)
  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/dinas/lpk/data')
  return { success: true }
}

// --- 11. PERUSAHAAN ACTIONS ---
export async function deleteMagangPermitAction(formData: FormData) {
  const supabase = await createAdminClient()
  const id = formData.get('id') as string
  await supabase.from('magang_permits').delete().eq('id', id)
  revalidatePath('/dashboard/dinas')
}

export async function deletePencatatanBatchAction(formData: FormData) {
  const supabase = await createAdminClient()
  const id = formData.get('id') as string
  await supabase.from('pencatatan_batches').delete().eq('id', id)
  revalidatePath('/dashboard/dinas/pemagangan')
}

// Data Perusahaan CRUD
export async function createPerusahaanAction(formData: FormData) {
  const supabase = await createAdminClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string // Company Name
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string

  // 1. Create Auth User
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'perusahaan', full_name: name }
  })

  if (authError) return { error: authError.message }
  const userId = authData.user.id

  // 2. Create Profile
  const { error: profileError } = await supabase.from('profiles').update({
    full_name: name,
    role: 'perusahaan',
    account_status: 'verified'
  }).eq('id', userId)

  if (profileError) return { error: profileError.message }

  // 3. Update profile_perusahaan
  const { error: compError } = await supabase.from('profile_perusahaan').upsert({
    user_id: userId,
    company_name: name,
    phone: phone,
    address: address
  })

  if (compError) return { error: compError.message }

  revalidatePath('/dashboard/dinas/perusahaan/data')
  return { success: true }
}

export async function updatePerusahaanAction(formData: FormData) {
  const supabase = await createAdminClient()
  const userId = formData.get('userId') as string
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string

  await supabase.from('profiles').update({ full_name: name }).eq('id', userId)
  await supabase.from('profile_perusahaan').update({ company_name: name, phone, address }).eq('user_id', userId)

  revalidatePath('/dashboard/dinas/perusahaan/data')
  return { success: true }
}

export async function deletePerusahaanAction(formData: FormData) {
  const supabase = await createAdminClient()
  const userId = formData.get('userId') as string

  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/dinas/perusahaan/data')
  return { success: true }
}

export async function deleteUserAction(formData: FormData) {
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
  const supabase = await createAdminClient()
  // Use Date string YYYY-MM-DD for comparison
  const today = new Date().toISOString().split('T')[0]

  // 1. Close Registration
  // Update status 'OPEN' -> 'CLOSED' if registration_end < today
  await supabase
    .from('blk_trainings')
    .update({ status: 'CLOSED' })
    .eq('status', 'OPEN')
    .lt('registration_end', today)

  // 2. Complete Training (Archive/Legacy)
  // Update training status 'OPEN' OR 'CLOSED' -> 'FINISHED' if training_end_date < today
  // This effectively removes them from Catalog (which typically shows OPEN/CLOSED) and moves them to Legacy View.
  await supabase
    .from('blk_trainings')
    .update({ status: 'FINISHED' })
    .in('status', ['OPEN', 'CLOSED'])
    .lt('training_end_date', today)

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
