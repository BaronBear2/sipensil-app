const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Load Environment Variables
const envPath = path.join(__dirname, '.env.local');
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

async function checkRoles() {
    console.log('--- Checking Current Roles ---');
    const { data, error } = await supabase.from('profiles').select('role');
    if (error) { console.error(error); return; }

    const counts = {};
    data.forEach(p => {
        const r = p.role || 'NULL';
        counts[r] = (counts[r] || 0) + 1;
    });

    console.log(counts);

    // Suggest Actions
    if (counts['ADMIN_PERUSAHAAN'] > 0) console.log(`[ACTION] Needs update: ${counts['ADMIN_PERUSAHAAN']} users from ADMIN_PERUSAHAAN -> PERUSAHAAN`);
    if (counts['ADMIN_LPK'] > 0) console.log(`[ACTION] Needs update: ${counts['ADMIN_LPK']} users from ADMIN_LPK -> LPK`);
}

checkRoles();
