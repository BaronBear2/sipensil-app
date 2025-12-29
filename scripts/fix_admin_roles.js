
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.resolve(__dirname, '../.env.local');
let envVars = {};

try {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envVars = envConfig.split('\n').reduce((acc, line) => {
        const firstEquals = line.indexOf('=');
        if (firstEquals === -1) return acc;

        const key = line.substring(0, firstEquals).trim();
        let val = line.substring(firstEquals + 1).trim();

        // Remove quotes if present
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
        }

        if (key && val) acc[key] = val;
        return acc;
    }, {});
} catch (e) {
    console.error("Could not read .env.local, assuming env vars are set manually.");
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRoles() {
    console.log('Starting Role Correction (Standardizing to PERUSAHAAN and LPK)...');

    // 1. Fix ADMIN_PERUSAHAAN -> PERUSAHAAN
    const { data: per, error: err1 } = await supabase
        .from('profiles')
        .update({ role: 'PERUSAHAAN' })
        .eq('role', 'ADMIN_PERUSAHAAN')
        .select();

    if (err1) {
        console.error('Error updating ADMIN_PERUSAHAAN:', err1.message);
    } else {
        console.log(`✅ Fixed ${per.length} ADMIN_PERUSAHAAN users.`);
    }

    // 2. Fix ADMIN_LPK -> LPK
    const { data: lpk, error: err2 } = await supabase
        .from('profiles')
        .update({ role: 'LPK' })
        .eq('role', 'ADMIN_LPK')
        .select();

    if (err2) {
        console.error('Error updating ADMIN_LPK:', err2.message);
    } else {
        console.log(`✅ Fixed ${lpk.length} ADMIN_LPK users.`);
    }
}

fixRoles();
