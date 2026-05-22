import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
    const { data, error } = await supabase.from('training_registrations').select('id, user_id, training_id, status, progress_step').order('created_at', { ascending: false }).limit(5)
    console.log(JSON.stringify(data, null, 2))
    if (error) console.error(error)
}

main()
