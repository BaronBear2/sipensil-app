import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
async function test() {
  const { data } = await supabase.from('blk_trainings').select('id, title, image_url').order('created_at', { ascending: false }).limit(5)
  console.log(data)
}
test()
