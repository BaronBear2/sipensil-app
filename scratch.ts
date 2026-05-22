import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('training_registrations').select('*, profiles(full_name, phone)')
  console.log("Registrations count:", data?.length)
  console.log("Error:", error)
  console.log("Data sample:", data?.slice(0, 2))
}
test()
