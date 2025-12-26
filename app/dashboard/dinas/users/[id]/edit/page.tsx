import { createClient } from '@/utils/supabase/server'
import { ArrowLeft, User, Building, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import EditUserForm from '@/components/admin/EditUserForm'

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    // Fetch Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select(`
            *,
            profile_pencaker(*),
            profile_perusahaan(*),
            profile_lpk(*)
        `)
        .eq('id', id)
        .single()

    if (!profile) notFound()

    const role = profile.role

    // Determine Role Specific Data
    let roleData: any = {}
    let roleName = ''
    let RoleIcon = User

    if (role === 'PENCAKER') {
        const pencakerRaw = profile.profile_pencaker
        roleData = Array.isArray(pencakerRaw) ? pencakerRaw[0] : (pencakerRaw || {})
        roleName = 'Pencaker'
        RoleIcon = User
    } else if (role === 'PERUSAHAAN') {
        const perusahaanRaw = profile.profile_perusahaan
        roleData = Array.isArray(perusahaanRaw) ? perusahaanRaw[0] : (perusahaanRaw || {})
        roleName = 'Perusahaan'
        RoleIcon = Briefcase
    } else if (role === 'ADMIN_LPK' || role === 'LPK') {
        const lpkRaw = profile.profile_lpk
        roleData = Array.isArray(lpkRaw) ? lpkRaw[0] : (lpkRaw || {})
        roleName = 'LPK'
        RoleIcon = Building
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/dinas/users" className="p-2 bg-white border rounded-xl hover:bg-gray-50 text-gray-600 transition">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Edit Data User</h1>
                    <p className="text-gray-500 text-sm">Update informasi akun dan profil pengguna.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <RoleIcon size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-800">{profile.full_name}</h2>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100/50 text-blue-600 uppercase tracking-wide">
                            {roleName}
                        </span>
                    </div>
                </div>

                <EditUserForm profile={profile} role={role} roleData={roleData} />
            </div>
        </div>
    )
}
