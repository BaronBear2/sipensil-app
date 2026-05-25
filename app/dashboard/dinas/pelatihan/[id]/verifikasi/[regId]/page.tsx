import { createAdminClient } from '@/utils/supabase/server'
import { ArrowLeft, User, MapPin, Calendar, Phone, Briefcase, FileText, CheckCircle, XCircle, Clock, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import VerificationActionPanelV2 from '@/components/admin/VerificationActionPanelV2'

export default async function VerificationDetailPage({ params }: { params: Promise<{ id: string, regId: string }> }) {
    const supabase = await createAdminClient()
    const { id, regId } = await params // 'id' is training, 'regId' is registration ID

    // Evaluate time-based progression
    await supabase.rpc('update_time_based_progress')

    // Fetch Registration + Profile
    const { data: reg, error } = await supabase
        .from('training_registrations')
        .select(`
            *,
            profiles!inner(*, profile_pencaker(*)),
            blk_trainings(*)
        `)
        .eq('id', regId)
        .single()

    if (error || !reg) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500">Data tidak ditemukan.</p>
                <Link href={`/dashboard/dinas/pelatihan/${id}/verifikasi`} className="text-blue-500 hover:underline">Kembali</Link>
            </div>
        )
    }

    const profile = reg.profiles
    const pencakerRaw = profile.profile_pencaker
    const details = Array.isArray(pencakerRaw) ? pencakerRaw[0] : (pencakerRaw || {})
    const training = reg.blk_trainings

    const userForAction = {
        id: profile.id, // User ID
        training_reg_id: reg.id,
        training_id: id, // Use reliable URL param instead of nested training data
        full_name: profile.full_name,
        email: profile.email
    }

    const dobRaw = details.date_of_birth || profile.dob
    const dob = dobRaw ? new Date(dobRaw).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'

    // Calculate Age
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

    const gender = details.gender || profile.gender || '-'

    let computedStep = reg.progress_step || 1

    const todayStr = new Date().toISOString().split('T')[0]
    const seleksiDate = training?.tanggal_pengumuman_kelulusan_seleksi_awal ? new Date(training.tanggal_pengumuman_kelulusan_seleksi_awal).toISOString().split('T')[0] : null
    const ujiDate = training?.tanggal_pengumuman_hasil_uji_kompetensi ? new Date(training.tanggal_pengumuman_hasil_uji_kompetensi).toISOString().split('T')[0] : null

    // Time-based progression evaluation for the UI
    if (computedStep === 2 && seleksiDate && todayStr >= seleksiDate) {
        computedStep = 3
    }
    if (computedStep === 3 && ujiDate && todayStr >= ujiDate) {
        computedStep = 4
    }

    const currentStep = computedStep
    const status = reg.status
    const isRejected = status === 'DITOLAK' || status === 'REJECTED'
    const isFinished = status === 'SELESAI' || status === 'LULUS'

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    }

    const steps = [
        {
            num: 1,
            title: 'Administrasi',
            desc: `Verifikasi dokumen pencaker. Pengumuman: ${formatDate(training?.tanggal_pengumuman_kelulusan_administrasi)}.`,
        },
        {
            num: 2,
            title: 'Seleksi',
            desc: `Tahap seleksi. Hasil seleksi akan diumumkan pada: ${formatDate(training?.tanggal_pengumuman_kelulusan_seleksi_awal)}.`,
        },
        {
            num: 3,
            title: 'Jadwal Pelatihan',
            desc: `Jadwal pelatihan dan uji kompetensi. Hasil kelulusan: ${formatDate(training?.tanggal_pengumuman_hasil_uji_kompetensi)}.`,
        },
        {
            num: 4,
            title: 'Hasil Uji Kompetensi',
            desc: 'Proses penilaian dan penyelesaian pelatihan.',
        }
    ]

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/dinas/pelatihan/${id}`} className="p-2 rounded-full hover:bg-gray-100 transition">
                    <ArrowLeft size={24} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Detail Verifikasi Pencaker</h1>
                    <p className="text-gray-500 text-sm">Tinjau data dan berkas sebelum menyetujui.</p>
                </div>
            </div>

            <hr className="border-gray-200" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT: DATA DIRI */}
                <div className="lg:col-span-2 space-y-6">
                    {/* INFO CARD */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="border-b pb-4 mb-4 flex items-center gap-3">
                            <User className="text-blue-600" />
                            <h2 className="font-bold text-gray-800 text-lg">Informasi Pribadi</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold">Nama Lengkap</label>
                                <p className="font-semibold text-gray-800">{profile.full_name}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold">NIK</label>
                                <p className="font-semibold text-gray-800">{details.nik || '-'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold">Jenis Kelamin</label>
                                <p className="font-semibold text-gray-800">{details.gender === 'L' ? 'Laki-laki' : details.gender === 'P' ? 'Perempuan' : (details.gender || '-')}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold">No HP / WA</label>
                                <p className="font-semibold text-gray-800 flex items-center gap-2">
                                    <Phone size={14} /> {details.phone || '-'}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold">Tempat, Tanggal Lahir</label>
                                <p className="font-semibold text-gray-800 flex items-center gap-2">
                                    <Calendar size={14} /> {details.place_of_birth || '-'}, {dob}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold">Usia</label>
                                <p className="font-semibold text-gray-800">{age} Tahun</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold">Pendidikan Terakhir</label>
                                <p className="font-semibold text-gray-800">{details.education || '-'}</p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs text-gray-400 uppercase font-bold">Alamat Domisili</label>
                                <p className="font-semibold text-gray-800 flex items-start gap-2">
                                    <MapPin size={14} className="mt-1 flex-shrink-0" />
                                    {details.address_dom || '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* BERKAS */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="border-b pb-4 mb-4 flex items-center gap-3">
                            <FileText className="text-blue-600" />
                            <h2 className="font-bold text-gray-800 text-lg">Berkas Persyaratan</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { label: 'KTP', url: reg.ktp_url || details.ktp_url },
                                { label: 'Ijazah', url: reg.ijazah_url || details.ijazah_url },
                                { label: 'Pas Foto', url: profile.photo_url || details.photo_url },
                                ...(reg.additional_documents ? Object.entries(reg.additional_documents).map(([key, value]) => ({ label: key, url: value as string })) : [])
                            ].map((doc, i) => (
                                <div key={i} className="border rounded-lg p-4 flex flex-col items-center text-center gap-2 hover:bg-gray-50 bg-gray-50/50">
                                    <FileText className="text-gray-400" size={32} />
                                    <span className="font-bold text-sm text-gray-700">{doc.label}</span>
                                    {doc.url ? (
                                        <a href={doc.url} target="_blank" className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold hover:bg-blue-200 transition">
                                            Lihat File
                                        </a>
                                    ) : (
                                        <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold">
                                            Belum Upload
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* VISUAL STEPPER */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2">
                            <Clock className="text-blue-600" />
                            Perjalanan Pendaftaran
                        </h3>

                        <div className="relative">
                            {/* Vertical Line */}
                            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200 hidden md:block"></div>
                            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200 md:hidden"></div>

                            <div className="space-y-6">
                                {steps.map((step) => {
                                    let isCompleted = currentStep > step.num || (currentStep === step.num && (isFinished || isRejected))
                                    let isCurrent = currentStep === step.num && !isRejected && !isFinished
                                    let isPending = currentStep < step.num

                                    let statusColor = 'bg-white border-gray-300 text-gray-600'
                                    let contentColor = 'text-gray-500'
                                    
                                    if (isCompleted) {
                                        if (isRejected && currentStep === step.num) {
                                            statusColor = 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-200'
                                            contentColor = 'text-gray-800'
                                        } else {
                                            statusColor = 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-200'
                                            contentColor = 'text-gray-800'
                                        }
                                    } else if (isCurrent) {
                                        statusColor = 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 ring-4 ring-blue-50'
                                        contentColor = 'text-gray-900'
                                    }

                                    return (
                                        <div key={step.num} className={`relative flex items-start gap-4 md:gap-6 ${isPending ? 'opacity-60' : ''}`}>
                                            {/* Indicator Circle */}
                                            <div className="relative z-10 shrink-0 mt-1">
                                                <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center font-bold text-sm md:text-lg transition-all duration-300 ${statusColor}`}>
                                                    {isCompleted ? (
                                                        isRejected && currentStep === step.num ? <XCircle size={20} className="md:w-6 md:h-6" /> : <CheckCircle2 size={20} className="md:w-6 md:h-6" />
                                                    ) : (
                                                        step.num
                                                    )}
                                                </div>
                                            </div>

                                            {/* Step Content */}
                                            <div className={`flex-1 min-w-0 transition-all duration-300 ${isCurrent ? 'transform translate-x-1' : ''}`}>
                                                <h4 className={`font-bold text-base md:text-lg mb-1 ${isCurrent ? 'text-blue-700' : isCompleted ? (isRejected && currentStep === step.num ? 'text-red-700' : 'text-gray-900') : 'text-gray-500'}`}>
                                                    {step.title}
                                                </h4>
                                                <p className={`text-sm ${contentColor} font-medium`}>{step.desc}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: ACTION PANEL & TRAINING INFO */}
                <div className="space-y-6">
                    {/* TRAINING INFO */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Briefcase size={18} className="text-blue-600" />
                            Pelatihan Dipilih
                        </h3>
                        <div className="space-y-3">
                            <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block mb-1">Judul Pelatihan</span>
                                <p className="font-bold text-gray-900 text-sm leading-tight">{training?.title}</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm flex-1">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Tanggal Daftar</span>
                                    <p className="font-bold text-gray-700 text-xs">{new Date(reg.created_at).toLocaleDateString('id-ID')}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm flex-1">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Status</span>
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${reg.status === 'PENDING' ? 'bg-orange-100 text-orange-600' : reg.status === 'DITERIMA' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {reg.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ACTION PANEL (Client Component) */}
                    <VerificationActionPanelV2 user={userForAction} status={reg.status} />
                </div>

            </div>
        </div>
    )
}
