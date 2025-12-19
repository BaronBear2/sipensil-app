import { createClient } from '@/utils/supabase/server'
import UserManagement from '@/components/admin/UserManagement'

export default async function UsersAdminPage({ searchParams }: { searchParams: Promise<{ page?: string, q?: string }> }) {
    const supabase = await createClient()
    const params = await searchParams

    const pPage = params.page ? parseInt(params.page) : 1
    const pQuery = params.q || ''
    const ITEMS_PER_PAGE = 10

    let totalUserCount = 0
    let totalUserPages = 0
    let dataTab7: any[] = []

    // 1. Base Query
    let query = supabase.from('profiles').select('*', { count: 'exact' }).eq('role', 'PENCAKER')

    // 2. Search Filter
    if (pQuery) {
        query = query.or(`full_name.ilike.%${pQuery}%,nik.ilike.%${pQuery}%`)
    }

    // 3. Pagination
    const from = (pPage - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    const { data, count } = await query.range(from, to).order('created_at', { ascending: false })

    if (data) {
        dataTab7 = data
        totalUserCount = count || 0
        totalUserPages = Math.ceil(totalUserCount / ITEMS_PER_PAGE)
    }

    return (
        <div className="space-y-6">
            <UserManagement
                users={dataTab7}
                currentPage={pPage}
                totalPages={totalUserPages}
                totalCount={totalUserCount}
            />
        </div>
    )
}
