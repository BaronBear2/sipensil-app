const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8');
let supabaseUrl = '';
let supabaseKey = '';

envFile.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) supabaseKey = line.split('=')[1].trim();
});

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fixing database: Reverting users incorrectly bumped to progress_step = 4 (Sedang Pelatihan in old schema) back to 3...");

  // In the new schema, step 4 is LULUS. If they are DITERIMA, they should be at step 3.
  const { data, error } = await supabase
    .from('training_registrations')
    .update({ progress_step: 3 })
    .eq('progress_step', 4)
    .eq('status', 'DITERIMA')
    .select('id, progress_step, status');

  if (error) {
    console.error("Error updating registrations:", error);
  } else {
    console.log(`Successfully reverted ${data ? data.length : 0} users back to progress_step 3!`);
  }
}

run();
