
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oouhzjqupejimoqibwhn.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vdWh6anF1cGVqaW1vcWlid2huIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc0MTM5MiwiZXhwIjoyMDgxMzE3MzkyfQ.-8sFOBkZgmFNWRNeDaeFfUb5o1pNd_niLs_lsV78yPQ";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStatus() {
    const { data, error } = await supabase
        .from('im_japan_registrations')
        .select('status, id')

    if (error) {
        console.error('Error:', error);
        return;
    }

    const counts = {};
    data.forEach(item => {
        counts[item.status] = (counts[item.status] || 0) + 1;
    });

    console.log('STATUS COUNTS:', counts);
    console.log('Sample IDs:', data.slice(0, 3).map(i => `${i.id}: ${i.status}`));
}

checkStatus();
