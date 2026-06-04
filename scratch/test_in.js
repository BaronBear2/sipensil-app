const { createClient } = require('@supabase/supabase-js')
const supabase = createClient("https://giguqjsvccfjpwvkpxvb.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpZ3VxanN2Y2NmanB3dmtweHZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTIxNzYwMywiZXhwIjoyMDk0NzkzNjAzfQ.PrBXjVGoYAmp-Gimuv2jarcUVsKZSoAbIXFqnXSX3ZU")

async function run() {
  const { data, error } = await supabase
    .from('training_registrations')
    .select('status')
    .not('status', 'in', '("SELESAI","DITOLAK","REJECTED","DIBATALKAN","LULUS")')
    .limit(5)
  console.log("STRING LIST:", data)
  
  const { data: data2 } = await supabase
    .from('training_registrations')
    .select('status')
    .not('status', 'in', ['SELESAI','DITOLAK','REJECTED','DIBATALKAN','LULUS'])
    .limit(5)
  console.log("ARRAY:", data2)
}
run()
