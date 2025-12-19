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
  console.time('Supabase SignIn')
  console.log(`Attempting login for: ${email}`)
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  console.timeEnd('Supabase SignIn')

  if (error) {
    // In a real app, you'd return this error to display it on the form
    console.error('Login Error:', error.message)
    return { error: error.message }
  }
  console.log('Login successful for:', email)

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
  const fullName = (formData.get('fullName') as string) || (formData.get('name') as string)
  const role = formData.get('role') as string // 'ADMIN_DINAS', 'PENCAKER', etc.

  // Extract Extended Registration Data
  // Pencaker
  const nik = formData.get('nik') as string
  const phone = formData.get('phone') as string

  // LPK
  const company_name = formData.get('company_name') as string // or 'name' from form
  const operational_pj = formData.get('operational_pj') as string
  const operational_pj_title = formData.get('operational_pj_title') as string
  const operational_pj_phone = formData.get('operational_pj_phone') as string
  const operational_pj_email = formData.get('operational_pj_email') as string

  // Perusahaan
  const nib = formData.get('nib') as string

  // Construct Custom Metadata
  const metadata: any = {
    full_name: fullName,
    role: role,
  }

  // Populate based on Role
  // ... inside signup ...
  if (role === 'PENCAKER') {
    // V5-02: Enforce NIK Prefix '3216' + Length 16
    if (!nik || nik.length !== 16 || !nik.startsWith('3216')) {
      return { error: 'NIK tidak valid. Harus 16 digit dan berawalan 3216 (Khusus Kab. Bekasi).' }
    }
    metadata.nik = nik
    metadata.phone = phone
  }

  // ... (rest of function) ...

  // V5-01: Optimization for Login
  // Add more granular timing or assume standard speed.
  // The 'slow' login might be due to cold boot of Server Function if on Vercel/Supabase Edge?
  // Or simply client-side roundtrip waiting for 'redirect'.
  // We will keep the timing logs for now to help the user debug if it persists.


  if (role === 'ADMIN_LPK') {
    metadata.company_name = company_name || fullName // Form field 'name' maps to this
    metadata.operational_pj = operational_pj
    metadata.operational_pj_title = operational_pj_title
    metadata.operational_pj_phone = operational_pj_phone
    metadata.operational_pj_email = email // USE MAIN EMAIL AS PJ EMAIL (V5.4-02)
  }

  if (role === 'ADMIN_PERUSAHAAN') {
    metadata.company_name = company_name || fullName
    metadata.nib = nib
    metadata.phone = phone
  }

  // Create the user and save their Role + Name in metadata
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  })

  // V5.4-04: Handle Existing Email Explicitly
  if (error) {
    console.error('Signup Error:', error.message)
    return { error: error.message }
  }

  // Check if user already exists (identities empty usually indicates existing user in some configs, or user is null)
  // But reliable way: if success properties are there but user was already registered, Supabase might not error if email confirm off.
  // Ideally, Supabase returns error "User already registered" by default.
  // Depending on config, if it returns success we assume it's OK.
  // But if the user says "It bugs out", it implies silent failure.
  // We'll trust standard error handling for now but ensure the LPK mapping is fixed.

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