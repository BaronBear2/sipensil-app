import { createClient } from '@/utils/supabase/server'
import UserManagement from '@/components/admin/UserManagement'

export default async function UsersAdminPage({ searchParams }: { searchParams: Promise<{ page?: string, q?: string, role?: string }> }) {
    const supabase = await createClient()

    const params = await searchParams
    const currentPage = params.page ? parseInt(params.page) : 1
    const query = params.q || ''
    const currentRole = (params.role || 'PENCAKER').toUpperCase()
    const ITEMS_PER_PAGE = 10

    let dbRole = currentRole
    if (currentRole === 'LPK') dbRole = 'ADMIN_LPK'

    // 1. Base Query
    let dbQuery = supabase
        .from('profiles')
        .select(`
            *,
            profile_pencaker(*),
            profile_perusahaan(*),
            profile_lpk(*)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1)

    // 2. Role Filter
    if (currentRole !== 'ALL') {
        dbQuery = dbQuery.eq('role', dbRole)
    }

    // 3. Search Filter
    if (query) {
        dbQuery = dbQuery.or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
    }

    const { data, count } = await dbQuery

    const users = data ? data.map((p: any) => {
        const pencakerData = Array.isArray(p.profile_pencaker) ? p.profile_pencaker[0] : p.profile_pencaker;
        const perusahaanData = Array.isArray(p.profile_perusahaan) ? p.profile_perusahaan[0] : p.profile_perusahaan;
        const lpkData = Array.isArray(p.profile_lpk) ? p.profile_lpk[0] : p.profile_lpk;

        return {
            ...p,
            // Merge specialized profiles based on role for easier display in table
            ...(currentRole === 'PENCAKER' ? (pencakerData || {}) : {}),
            ...(currentRole === 'PERUSAHAAN' ? (perusahaanData || {}) : {}),
            ...(currentRole === 'LPK' ? (lpkData || {}) : {})
        }
    }) : []

    const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1

    return (
        <UserManagement
            users={users}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={count || 0}
            currentRole={currentRole}
        />
    )
}
