// actions/auth.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

// 1. LOGIN ACTION
export async function login(formData: FormData) {
  const supabase = await createClient()

  // Extract data from the HTML form
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Attempt to sign in
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // In a real app, you'd return this error to display it on the form
    console.error('Login Error:', error.message)
    return { error: error.message }
  }

  // Login successful! Now let's decide where to send them.
  // We check the role inside the user's metadata to redirect correctly.
  const role = data.user?.user_metadata?.role || 'PENCAKER'
  
  let redirectUrl = '/dashboard/pencaker' // Default
  if (role === 'SUPER_ADMIN') redirectUrl = '/dashboard/super-admin'
  if (role === 'ADMIN_DINAS') redirectUrl = '/dashboard/dinas'
  if (role === 'ADMIN_LPK') redirectUrl = '/dashboard/lpk'
  if (role === 'ADMIN_PERUSAHAAN') redirectUrl = '/dashboard/perusahaan'

  revalidatePath('/', 'layout')
  redirect(redirectUrl)
}

// 2. SIGNUP ACTION
export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as string // 'ADMIN_DINAS', 'PENCAKER', etc.

  // Create the user and save their Role + Name in metadata
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role, 
      },
    },
  })

  if (error) {
    console.error('Signup Error:', error.message)
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/auth/login?message=Check email to continue sign in process')
}

// 3. LOGOUT ACTION
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}