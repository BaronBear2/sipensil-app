const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:5432', 
  process.env.SUPABASE_SERVICE_ROLE_KEY || '123'
);

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
        .limit(1);
  console.log("Error:", error);
  console.log("Data length:", data ? data.length : 0);
}
test();
