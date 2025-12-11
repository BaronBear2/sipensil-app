'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function verifyUser(formData: FormData) {
  const supabase = await createClient()
  const userId = formData.get('userId') as string

  // 1. Update the user's status to VERIFIED
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'VERIFIED' })
    .eq('id', userId)

  if (error) {
    // We log the error on the server console
    console.error('Verification failed:', error)
    // We throw an error so Next.js knows the action failed (shows an error boundary or toast)
    throw new Error('Failed to verify user')
  }

  // 2. Refresh the dashboard to remove the item from the list
  revalidatePath('/dashboard/dinas')
  
  // No return statement needed (returns Promise<void>)
}