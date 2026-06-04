import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function test() {
  const { data, error } = await supabase
        .from('profiles')
        .select(`
            *,
            profile_pencaker(*),
            profile_perusahaan(*),
            profile_lpk(*),
            training_registrations(*, blk_trainings(title, status))
        `, { count: 'exact' })
        .limit(5)
        
  console.log("Error:", error)
  console.log("Data length:", data?.length)
}

test()
