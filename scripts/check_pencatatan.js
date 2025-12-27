const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '../.env.local');
let env = {};
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim().replace(/"/g, '');
            env[key] = val;
        }
    });
}
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) { console.error('Missing env vars'); process.exit(1); }

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkStatus() {
    console.log('--- Checking Status Distribution ---');
    const { data, error } = await supabase.from('pencatatan_batches').select('status');
    if (error) { console.error(error); return; }

    data.forEach(p => {
        const s = p.status || 'NULL';
        counts[s] = (counts[s] || 0) + 1;
    });

    console.log('Status Counts:', counts);
    if (counts['PENDING'] > 0) {
        console.log('[ACTION] Found PENDING records. Needs migration or query update.');
    }
}

checkStatus();
