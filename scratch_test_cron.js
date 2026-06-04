import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:5432', 
  process.env.SUPABASE_SERVICE_ROLE_KEY || '123'
)

async function test() {
  const { data: trainings, error } = await supabase
    .from('blk_trainings')
    .select('id, title, status, tanggal_pengumuman_kelulusan_administrasi, tanggal_pengumuman_kelulusan_seleksi_awal')
    .in('status', ['OPEN', 'CLOSED'])
    
  console.log("Trainings:", trainings)
}

test()
