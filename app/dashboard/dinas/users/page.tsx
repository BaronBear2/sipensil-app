import { createClient } from '@/utils/supabase/server'
import UserManagement from '@/components/admin/UserManagement'
import SearchInput from '@/components/admin/SearchInput'
import Link from 'next/link'
import { Users } from 'lucide-react'

export default async function UsersAdminPage({ searchParams }: { searchParams: Promise<{ page?: string, q?: string, role?: string }> }) {
    const supabase = await createClient()

    const params = await searchParams
    const pPage = params.page ? parseInt(params.page) : 1
    const pQuery = params.q || ''
    const pRole = (params.role || 'PENCAKER').toUpperCase()
    const ITEMS_PER_PAGE = 10

    let totalUserCount = 0
    let totalUserPages = 0
    let dataTab7: any[] = []

    // 1. Base Query
    let query = supabase
        .from('profiles')
        .select(`
            *,
            profile_pencaker(*),
            profile_perusahaan(*),
            profile_lpk(*)
        `, { count: 'exact' })

    // 2. Role Filter
    // Map UI role to DB role if needed, but here they seem to match (PENCAKER, PERUSAHAAN, ADMIN_LPK?)
    // Wait, LPK role in DB is 'ADMIN_LPK' or 'LPK'? Previous code used 'ADMIN_LPK' in LPK page.
    let dbRole = pRole
    if (pRole === 'LPK') dbRole = 'ADMIN_LPK'

    query = query.eq('role', dbRole)

    // 3. Search Filter
    if (pQuery) {
        query = query.or(`full_name.ilike.%${pQuery}%,email.ilike.%${pQuery}%`)
    }

    // 4. Pagination
    const from = (pPage - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    const { data, count } = await query.range(from, to).order('created_at', { ascending: false })

    if (data) {
        dataTab7 = data.map((p: any) => ({
            ...p,
            // Merge specialized profiles based on role for easier display in table
            ...(pRole === 'PENCAKER' ? (p.profile_pencaker || {}) : {}),
            ...(pRole === 'PERUSAHAAN' ? (p.profile_perusahaan || {}) : {}),
            ...(pRole === 'LPK' ? (p.profile_lpk || {}) : {})
        }))
        totalUserCount = count || 0
        totalUserPages = Math.ceil(totalUserCount / ITEMS_PER_PAGE)
    }

    const tabs = [
        { id: 'PENCAKER', label: 'Pencaker' },
        { id: 'PERUSAHAAN', label: 'Perusahaan' },
        { id: 'LPK', label: 'LPK' },
    ]

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                        <Users className="text-purple-500" /> Manajemen User
                    </h1>
                    <p className="text-gray-500">
                        Kelola akun pengguna: Pencaker, Perusahaan, dan LPK.
                    </p>
                </div>
            </div>

            {/* Role Tabs */}
            <div className="flex gap-2 border-b">
                {tabs.map(tab => (
                    <Link
                        key={tab.id}
                        href={`/dashboard/dinas/users?role=${tab.id}&q=${pQuery}`}
                        className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${pRole === tab.id ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab.label}
                    </Link>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex justify-between items-center">
                <SearchInput placeholder={`Cari ${pRole.toLowerCase()}...`} />
                <div className="text-sm text-gray-500 font-bold">Total: {totalUserCount}</div>
            </div>

            <UserManagement
                users={dataTab7}
                currentPage={pPage}
                totalPages={totalUserPages}
                totalCount={totalUserCount}
                currentRole={pRole}
            />
        </div>
    )
}
