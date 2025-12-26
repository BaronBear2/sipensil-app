import { createClient } from '@/utils/supabase/server'
import { ArrowLeft, User, MessageCircle, Phone, MapPin, FileText, Calendar, Download, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ImJapanActionPanel from '@/components/admin/ImJapanActionPanel'

export default async function ImJapanDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    // Fetch Data
    const { data: reg } = await supabase
        .from('im_japan_registrations')
        .select(`
            *,
            profiles!inner(
                *,
                profile_pencaker(*)
            )
        `)
        .eq('id', id)
        .single()

    if (!reg) return notFound()

    const p = reg.profiles
    const pencakerRaw = p.profile_pencaker
    const details = Array.isArray(pencakerRaw) ? pencakerRaw[0] : (pencakerRaw || {})

    // Normalize Data
    const fullName = p.full_name
    const nik = details.nik || p.nik || '-'
    const phone = details.phone || p.phone || '-'
    // Fix: address -> address_dom
    const address = details.address_dom || '-'
    const education = details.education || '-'

    // Calculate Age
    const dobRaw = details.date_of_birth || p.dob
    const dob = dobRaw ? new Date(dobRaw).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'

    let age = '-'
    if (dobRaw) {
        const today = new Date()
        const birthDate = new Date(dobRaw)
        let ageNum = today.getFullYear() - birthDate.getFullYear()
        const m = today.getMonth() - birthDate.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            ageNum--
        }
        age = ageNum.toString()
    }

    const gender = details.gender ? (details.gender === 'L' ? 'Laki-laki' : 'Perempuan') : (p.gender || '-')

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header / Nav */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/dinas/im-japan" className="p-2 bg-white border rounded-full hover:bg-gray-50 text-gray-600 transition shadow-sm">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Verifikasi IM-Japan</h1>
                    <p className="text-xs text-gray-500">Detail permohonan rekomendasi</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT COL: Profile & Data */}
                <div className="lg:col-span-2 space-y-6">

                    {/* 1. Profile Info Card */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="border-b pb-4 mb-4 flex items-center gap-3">
                            <User className="text-blue-600" />
                            <h2 className="font-bold text-gray-800 text-lg">Informasi Pribadi</h2>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6 mb-6">
                            {/* Avatar */}
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm overflow-hidden mx-auto md:mx-0">
                                {p.avatar_url ? (
                                    <img src={p.avatar_url} alt={fullName} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={40} className="text-gray-300" />
                                )}
                            </div>

                            {/* Main Grid */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                                <div>
                                    <label className="text-xs text-gray-400 uppercase font-bold">Nama Lengkap</label>
                                    <p className="font-semibold text-gray-800">{fullName}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 uppercase font-bold">NIK</label>
                                    <p className="font-semibold text-gray-800">{nik}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 uppercase font-bold">Jenis Kelamin</label>
                                    <p className="font-semibold text-gray-800">{gender}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 uppercase font-bold">No HP / WA</label>
                                    <p className="font-semibold text-gray-800 flex items-center gap-2">
                                        <Phone size={14} className="text-gray-400" />
                                        {phone}
                                        <a href={`https://wa.me/${phone.replace(/^0/, '62')}`} target="_blank" className="ml-2 px-2 py-0.5 bg-green-50 text-green-600 rounded text-[10px] font-bold hover:bg-green-100 flex items-center gap-1">
                                            <MessageCircle size={10} /> Chat
                                        </a>
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 uppercase font-bold">Tempat, Tanggal Lahir</label>
                                    <p className="font-semibold text-gray-800 flex items-center gap-2">
                                        <Calendar size={14} className="text-gray-400" />
                                        {details.place_of_birth}, {dob}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 uppercase font-bold">Usia</label>
                                    <p className="font-semibold text-gray-800">{age} Tahun</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 uppercase font-bold">Pendidikan Terakhir</label>
                                    <p className="font-semibold text-gray-800">{education}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs text-gray-400 uppercase font-bold">Alamat Domisili</label>
                                    <p className="font-semibold text-gray-800 flex items-start gap-2">
                                        <MapPin size={14} className="mt-1 flex-shrink-0 text-gray-400" />
                                        {address}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Documents */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="border-b pb-4 mb-4 flex items-center gap-3">
                            <FileText className="text-blue-600" />
                            <h2 className="font-bold text-gray-800 text-lg">Berkas Persyaratan</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Legacy Document Path */}
                            {reg.document_path && (
                                <DocumentRow label="Dokumen Lengkap (Legacy)" url={reg.document_path} />
                            )}

                            {/* JSON Documents */}
                            {reg.documents && Object.entries(reg.documents).map(([key, url]) => (
                                <DocumentRow
                                    key={key}
                                    label={key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                    url={url as string}
                                />
                            ))}

                            {!reg.document_path && (!reg.documents || Object.keys(reg.documents).length === 0) && (
                                <div className="col-span-full text-center py-8 text-gray-400 italic text-sm border-2 border-dashed rounded-xl bg-gray-50">
                                    <FileText className="mx-auto mb-2 opacity-20" size={32} />
                                    Tidak ada dokumen diunggah.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COL: Actions */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Program Info */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                            <Briefcase size={18} className="text-blue-600" />
                            Program IM-Japan
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold block mb-1">Batch / Angkatan</label>
                                <div className="font-bold text-gray-800 text-lg">{reg.batch || '-'}</div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold block mb-1">Tanggal Daftar</label>
                                <div className="font-medium text-gray-700 text-sm flex items-center gap-2">
                                    <Calendar size={14} />
                                    {new Date(reg.created_at).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <ImJapanActionPanel id={reg.id} status={reg.status} />
                </div>
            </div>
        </div>
    )
}

function DocumentRow({ label, url }: { label: string, url: string }) {
    // Determine icon based on label or generic
    return (
        <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-blue-50 hover:border-blue-200 transition group bg-white">
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-red-100 text-red-500 flex items-center justify-center font-bold text-[10px] shrink-0">
                    PDF
                </div>
                <div className="overflow-hidden">
                    <span className="font-bold text-sm text-gray-700 truncate block group-hover:text-blue-700 transition">{label}</span>
                    <span className="text-[10px] text-gray-400 block">Klik untuk melihat</span>
                </div>
            </div>
            <a
                href={url}
                target="_blank"
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 rounded-lg transition"
                title="Buka File"
            >
                <Download size={16} />
            </a>
        </div>
    )
}
