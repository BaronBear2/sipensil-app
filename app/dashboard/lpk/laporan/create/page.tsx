import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LpkReportForm from '@/components/lpk/LpkReportForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function CreateReportPage({ searchParams }: { searchParams: Promise<{ id?: string, type?: string }> }) {
    const supabase = await createClient()
    const { id } = await searchParams

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    // 2. Profile Check
    const { data: profile } = await supabase.from('profiles').select('*, profile_lpk(*)').eq('id', user.id).single()
    if (!profile) redirect('/auth/login')

    // Ensure LPK Specific data is merged or passed correctly
    const finalProfile = {
        ...profile,
        ...(profile.profile_lpk || {})
    }

    // Check for profile completeness (Same logic as Dashboard)
    const isProfileIncomplete = !finalProfile?.license_number || !finalProfile?.address_office

    if (finalProfile.account_status !== 'verified' && finalProfile.account_status !== 'pending') {
        // Redirect to profile if not ready
        redirect('/dashboard/lpk/profile?alert=complete_profile')
    }

    if (isProfileIncomplete) {
        redirect('/dashboard/lpk/profile?alert=complete_profile')
    }

    // 3. Check Revision ID
    let initialData = null
    if (id) {
        const { data: report } = await supabase.from('lpk_reports').select('*').eq('id', id).eq('user_id', user.id).single()
        if (report) {
            initialData = report
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8 animate-fade-in pb-24">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/dashboard/lpk" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-4 transition">
                        <ArrowLeft size={16} className="mr-1" /> Kembali ke Dashboard
                    </Link>
                    <h1 className="text-2xl font-extrabold text-gray-800">
                        {initialData ? 'Revisi Laporan' : 'Buat Laporan Baru'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {initialData
                            ? `Perbaiki laporan Semester ${initialData.semester} ${initialData.tahun}.`
                            : 'Isi formulir laporan periodik semester LPK Anda.'}
                    </p>
                </div>

                {/* Form Component */}
                <LpkReportForm profile={finalProfile} initialData={initialData} />
            </div>
        </div>
    )
}
