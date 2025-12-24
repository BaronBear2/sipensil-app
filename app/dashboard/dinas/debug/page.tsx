
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function DebugPage() {
    const supabase = await createClient()
    const { data: regs } = await supabase
        .from('training_registrations')
        .select('id, user_id, status, created_at')
        .order('created_at', { ascending: false })
        .limit(20)

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Debug Training Registrations</h1>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(regs, null, 2)}
            </pre>
        </div>
    )
}
