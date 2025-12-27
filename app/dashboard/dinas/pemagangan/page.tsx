import Link from 'next/link'
import { createAdminClient } from '@/utils/supabase/server'
import { FileText, Building, CheckCircle, XCircle } from 'lucide-react'
import PencatatanTable from '@/components/admin/PencatatanTable'
import { deletePencatatanBatchAction } from '@/actions/dinas'

export const dynamic = 'force-dynamic'

export default async function PemaganganAdminPage({ searchParams }: { searchParams: Promise<{ status: string }> }) {
    const supabase = await createAdminClient()

    const params = await searchParams
    // Filter Status (Default: PENDING)
    const status = (params?.status || 'PENDING').toUpperCase()

    // DB Mapping
    // UI: PENDING, APPROVED, REJECTED
    // DB: SUBMITTED, APPROVED, REJECTED
    let dbStatus = status === 'PENDING' ? 'SUBMITTED' : status

    // Fetch Data (Now fetching Batches from pencatatan_batches)
    let permits: any[] = []
    try {
        const { data } = await supabase
            .from('pencatatan_batches')
            .select(`
                *,
                profiles!inner(
                   *,
                   profile_perusahaan(*)
                ),
                magang_agreements(count)
            `)
            .eq('status', dbStatus)
            .order('created_at', { ascending: false })

        if (data) {
            permits = data.map((item: any) => {
                const p = item.profiles
                const comp = p?.profile_perusahaan || {}
                // Flatten for easier access or just ensure company_name is correct
                if (p) {
                    p.company_name = comp.company_name || p.company_name
                    p.nib = comp.nib || p.nib
                    p.phone = comp.phone || p.phone
                }

                // Map Batch to "Permit-like" structure for Table
                return {
                    ...item,
                    start_date: new Date(item.created_at).toLocaleDateString('id-ID'), // Use Submission Date as "Start"
                    end_date: '-', // No End Date in Batch
                    participant_count: item.magang_agreements?.[0]?.count || 0,
                    document_path: `/api/export/batch-excel/${item.id}`, // Link to Excel Generation
                    is_batch: true // Flag to tell Table it's a batch
                }
            })
        }
    } catch (e) {
        console.error("FETCH ERROR:", e)
    }

    // Dynamic UI
    let title = "Verifikasi Pencatatan Peserta Magang"
    // let desc = "Daftar permohonan pencatatan peserta magang dalam negeri."

    if (status === 'APPROVED') {
        title = "Pencatatan Diterima"
    } else if (status === 'REJECTED') {
        title = "Pencatatan Ditolak"
    }

    return (
        <div className="font-sans min-h-screen bg-gray-50/50 pb-20">
            {/* HERO SECTION - RED THEME */}
            <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white pt-8 pb-20 px-6 md:px-12 relative overflow-hidden rounded-b-3xl shadow-lg mb-8">
                <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                    <Building size={300} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                                <FileText size={24} className="text-white" />
                            </div>
                            <span className="font-bold tracking-wider text-red-100 uppercase text-sm">Modul Pemagangan</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight text-white">
                            {title}
                        </h1>
                        <p className="text-red-100 font-medium text-lg max-w-xl">
                            Kelola pencatatan peserta magang dalam negeri dari perusahaan.
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-4">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-center">
                            <h3 className="text-2xl font-bold text-white">{permits.length}</h3>
                            <p className="text-xs text-red-100 uppercase font-bold tracking-wider">Total Data</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT SECTION - Floating Up */}
            <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 space-y-6">

                {/* Tab Navigation Card */}
                <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
                    <div className="flex p-1 bg-gray-50 rounded-xl w-full md:w-auto overflow-x-auto">
                        <Link href="/dashboard/dinas/pemagangan?status=pending" className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${status === 'PENDING' ? 'bg-white text-red-600 shadow-md ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                            <FileText size={18} /> Menunggu Verifikasi
                        </Link>
                        <Link href="/dashboard/dinas/pemagangan?status=approved" className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${status === 'APPROVED' ? 'bg-white text-red-600 shadow-md ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                            <CheckCircle size={18} /> Diterima
                        </Link>
                        <Link href="/dashboard/dinas/pemagangan?status=rejected" className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${status === 'REJECTED' ? 'bg-white text-red-600 shadow-md ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                            <XCircle size={18} /> Ditolak / Revisi
                        </Link>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="">
                        <PencatatanTable permits={permits} viewOnly={status !== 'PENDING'} onDelete={deletePencatatanBatchAction} />
                    </div>
                </div>
            </div>
        </div>
    )
}
