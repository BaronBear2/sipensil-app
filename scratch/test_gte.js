require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  const { data, error } = await supabase.from('blk_trainings').select('id, title, registration_end')
  console.log("ALL TRAININGS:")
  console.log(data)

  const { data: filtered } = await supabase.from('blk_trainings').select('id, title, registration_end').gte('registration_end', '2026-06-04')
  console.log("\nFILTERED gte '2026-06-04':")
  console.log(filtered)
}
run()
