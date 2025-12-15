'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// 1. Verifikasi Akun User (Pencaker)
export async function verifyUserAction(formData: FormData) {
  const supabase = await createClient()
  
  // Security Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Ambil data form
  const userId = formData.get('userId') as string
  const action = formData.get('action') as string
  const reason = formData.get('reason') as string

  if (action === 'approve') {
    await supabase.from('profiles').update({ 
      account_status: 'verified',
      rejection_message: null 
    }).eq('id', userId)
  } else {
    await supabase.from('profiles').update({ 
      account_status: 'rejected',
      rejection_message: reason 
    }).eq('id', userId)
  }

  revalidatePath('/dashboard/dinas')
}

// 2. Verifikasi Pendaftaran Pelatihan (BARU DITAMBAHKAN)
export async function verifyTrainingAction(formData: FormData) {
  const supabase = await createClient()
  
  // Security Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const regId = formData.get('regId') as string
  const action = formData.get('action') as string // 'approve' | 'reject'

  // Update status di tabel training_registrations
  const newStatus = action === 'approve' ? 'DITERIMA' : 'DITOLAK'
  
  await supabase
    .from('training_registrations')
    .update({ status: newStatus })
    .eq('id', regId)

  revalidatePath('/dashboard/dinas')
}