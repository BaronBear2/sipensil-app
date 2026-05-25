import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Circle, CheckCircle, ExternalLink, MapPin, Calendar, Clock, AlertCircle, FileText, Info, XCircle } from 'lucide-react'

export default async function PelatihanSayaDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    // Evaluate time-based progression
    await supabase.rpc('update_time_based_progress')

    // Fetch Registration Details with Joins
    const { data: reg, error } = await supabase
        .from('training_registrations')
        .select(`
            *,
            blk_trainings(
                *,
                training_selections(*),
                training_exams(*)
            ),
            training_classes(*),
            exam_results(*)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (error || !reg) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 text-center flex flex-col items-center justify-center">
                <AlertCircle size={48} className="text-gray-400 mb-4" />
                <h2 className="text-xl font-bold text-gray-700 mb-2">Data Tidak Ditemukan</h2>
                <p className="text-gray-500 mb-6">Pendaftaran pelatihan tidak ditemukan atau Anda tidak memiliki akses.</p>
                <Link href="/dashboard/pencaker/pelatihan-saya" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
                    Kembali
                </Link>
            </div>
        )
    }

    let computedStep = reg.progress_step || 1

    const todayStr = new Date().toISOString().split('T')[0]
    const trainingData = reg.blk_trainings || {}
    const seleksiDate = trainingData?.tanggal_pengumuman_kelulusan_seleksi_awal ? new Date(trainingData.tanggal_pengumuman_kelulusan_seleksi_awal).toISOString().split('T')[0] : null
    const ujiDate = trainingData?.tanggal_pengumuman_hasil_uji_kompetensi ? new Date(trainingData.tanggal_pengumuman_hasil_uji_kompetensi).toISOString().split('T')[0] : null

    // Time-based progression evaluation for the UI
    if (computedStep === 2 && seleksiDate && todayStr >= seleksiDate) {
        computedStep = 3
    }
    if (computedStep === 3 && ujiDate && todayStr >= ujiDate) {
        computedStep = 4
    }

    const currentStep = computedStep
    const status = reg.status
    const training = reg.blk_trainings || {}
    const selection = training.training_selections?.[0]
    const cls = reg.training_classes
    const exam = training.training_exams?.[0]
    
    // Exam results can be multiple if there are multiple attempts? Usually single.
    const examResult = Array.isArray(reg.exam_results) ? reg.exam_results[0] : reg.exam_results

    const isRejected = status === 'DITOLAK' || status === 'REJECTED'
    const isFinished = status === 'SELESAI' || status === 'LULUS'

    // Helper to format date
    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    }

    const formatTime = (timeString: string | null) => {
        if (!timeString) return '-'
        return timeString.substring(0, 5) // HH:mm
    }

    const steps = [
        {
            num: 1,
            title: 'Administrasi',
            desc: `Menunggu admin mengecek dokumen Anda. Pengumuman dijadwalkan pada: ${formatDate(training?.tanggal_pengumuman_kelulusan_administrasi)}.`,
            content: null
        },
        {
            num: 2,
            title: 'Seleksi',
            desc: `Tahap seleksi dan penggabungan grup WhatsApp. Hasil seleksi akan diumumkan pada: ${formatDate(training?.tanggal_pengumuman_kelulusan_seleksi_awal)}.`,
            content: (
                <div className="mt-3 space-y-4">
                    {training.whatsapp_group_link && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <h4 className="font-bold text-green-800 text-sm mb-2">Grup WhatsApp Peserta</h4>
                            <p className="text-sm text-green-700 mb-3">Silakan bergabung ke grup WA untuk mendapatkan informasi terbaru.</p>
                            <a href={training.whatsapp_group_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition">
                                <ExternalLink size={16} /> Gabung Grup WA
                            </a>
                        </div>
                    )}
                    
                    {training.training_selections && training.training_selections.length > 0 ? (
                        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4">
                            <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center justify-between">
                                Jadwal Seleksi
                            </h4>
                            <div className="space-y-4">
                                {training.training_selections.map((sel: any, idx: number) => (
                                    <div key={idx} className="border-l-2 border-blue-200 pl-3">
                                        <div className="font-bold text-sm text-gray-700 mb-2">{sel.name || 'Seleksi'}</div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-2"><Calendar size={16} className="text-blue-500" /> {formatDate(sel.selection_date)}</div>
                                            <div className="flex items-center gap-2"><Clock size={16} className="text-blue-500" /> {formatTime(sel.selection_time)} WIB</div>
                                            <div className="flex items-start gap-2 sm:col-span-2"><MapPin size={16} className="text-blue-500 shrink-0 mt-0.5" /> <span>{sel.location_address || '-'}</span></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-500 italic flex items-start gap-2">
                            <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                            Belum ada jadwal seleksi atau pelatihan ini tidak memerlukan tes masuk.
                        </div>
                    )}
                </div>
            )
        },
        {
            num: 3,
            title: 'Jadwal Pelatihan',
            desc: `Jadwal pelatihan dan uji kompetensi. Hasil kelulusan akan diumumkan pada: ${formatDate(training?.tanggal_pengumuman_hasil_uji_kompetensi)}.`,
            content: (
                <div className="mt-3 space-y-4">
                    {cls ? (
                        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4">
                            <h4 className="font-bold text-gray-800 mb-4">{cls.name || 'Kelas Pelatihan'}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Mulai Kelas</span>
                                    <div className="flex items-center gap-2 font-medium text-gray-700"><Calendar size={14} className="text-teal-500" /> {formatDate(cls.start_date)}</div>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Selesai Kelas</span>
                                    <div className="flex items-center gap-2 font-medium text-gray-700"><Calendar size={14} className="text-orange-500" /> {formatDate(cls.end_date)}</div>
                                </div>
                                <div className="sm:col-span-2">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Lokasi & Jam Kumpul</span>
                                    <div className="flex items-start gap-2 font-medium text-gray-700">
                                        <MapPin size={14} className="text-blue-500 mt-1 shrink-0" />
                                        <span>{cls.location_address || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4">
                            <h4 className="font-bold text-gray-800 mb-4">Pelatihan Offline</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Mulai Pelatihan</span>
                                    <div className="flex items-center gap-2 font-medium text-gray-700">
                                        <Calendar size={14} className="text-teal-500" /> {formatDate(training?.training_start_date)}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Selesai Pelatihan</span>
                                    <div className="flex items-center gap-2 font-medium text-gray-700">
                                        <Calendar size={14} className="text-orange-500" /> {formatDate(training?.training_end_date)}
                                    </div>
                                </div>
                                <div className="sm:col-span-2">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Jam Pelatihan</span>
                                    <div className="flex items-center gap-2 font-medium text-gray-700">
                                        <Clock size={14} className="text-blue-500" /> {training?.training_start_time ? formatTime(training.training_start_time) : '-'} - {training?.training_end_time ? formatTime(training.training_end_time) : '-'} WIB
                                    </div>
                                </div>
                                <div className="sm:col-span-2">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Lokasi Pelatihan</span>
                                    <div className="flex items-start gap-2 font-medium text-gray-700">
                                        <MapPin size={14} className="text-blue-500 mt-1 shrink-0" />
                                        <span>{training?.location || training?.provider || 'Sesuai arahan panitia'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {exam ? (
                        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 mt-4">
                            <h4 className="font-bold text-gray-800 text-sm mb-3">{exam.name || 'Uji Kompetensi'}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                                <div className="flex items-center gap-2"><Calendar size={16} className="text-purple-500" /> {formatDate(exam.exam_date)}</div>
                                <div className="flex items-center gap-2"><Clock size={16} className="text-purple-500" /> {formatTime(exam.exam_time)} WIB</div>
                                <div className="flex items-start gap-2 sm:col-span-2"><MapPin size={16} className="text-purple-500 shrink-0 mt-0.5" /> <span>{exam.address || '-'}</span></div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 mt-4">
                            <h4 className="font-bold text-gray-800 text-sm mb-3">Evaluasi Akhir</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                                <div className="flex items-center gap-2"><Calendar size={16} className="text-purple-500" /> {formatDate(training?.training_end_date)} (Estimasi)</div>
                                <div className="flex items-center gap-2"><Clock size={16} className="text-purple-500" /> - </div>
                                <div className="flex items-start gap-2 sm:col-span-2"><MapPin size={16} className="text-purple-500 shrink-0 mt-0.5" /> <span>{training?.location || training?.provider || '-'}</span></div>
                            </div>
                        </div>
                    )}
                </div>
            )
        },
        {
            num: 4,
            title: 'Hasil Uji Kompetensi',
            desc: 'Proses penilaian dan penyelesaian pelatihan.',
            content: (
                <div className="mt-3 space-y-4">
                    {examResult ? (
                        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 flex justify-between items-center">
                            <div>
                                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Nilai Ujian</span>
                                <span className="text-2xl font-black text-blue-600">{examResult.final_score || '-'}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Status</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${examResult.status?.toLowerCase() === 'lulus' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {examResult.status || 'Menunggu'}
                                </span>
                            </div>
                        </div>
                    ) : null}

                    {status === 'LULUS' ? (
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 rounded-xl shadow-lg relative overflow-hidden mt-4">
                            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                                <FileText size={100} />
                            </div>
                            <div className="relative z-10">
                                <h4 className="font-bold text-lg mb-2 flex items-center gap-2"><CheckCircle size={20} className="text-green-300" /> Selamat, Anda Lulus!</h4>
                                <p className="text-blue-100 text-sm">Anda telah berhasil menyelesaikan program pelatihan kompetensi ini.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500 italic mt-4">Selesaikan seluruh tahapan untuk melihat hasil akhir.</div>
                    )}
                </div>
            )
        }
    ]

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-24 animate-fade-in">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/pencaker/pelatihan-saya" className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-600 border border-gray-200 bg-white">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-lg md:text-xl font-bold text-gray-800 leading-tight tracking-tight">Status Pendaftaran</h1>
                            <p className="text-xs text-gray-500 font-medium">Lacak perjalanan pelatihan Anda</p>
                        </div>
                    </div>
                    <div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                
                {/* Hero Training Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-10 relative">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">Program Pelatihan</span>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{training.title}</h2>
                            <p className="text-gray-500 flex items-center gap-2 text-sm font-medium">
                                <MapPin size={16} className="text-gray-400" /> {training.provider || 'UPTD BLK Kabupaten Bekasi'}
                            </p>
                        </div>
                        <Link href={`/dashboard/pencaker/pelatihan-saya/${id}/pengumuman`} className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition flex items-center gap-2 transform hover:-translate-y-0.5">
                            <FileText size={18} />
                            Lihat Pengumuman
                        </Link>
                    </div>
                    
                    {isRejected && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 items-start">
                            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                            <div>
                                <h4 className="font-bold text-red-800">Pendaftaran Ditolak</h4>
                                <p className="text-red-600 text-sm mt-1">{reg.admin_notes || 'Silakan cek kembali kelengkapan profil Anda atau hubungi admin.'}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* VISUAL STEPPER */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10">
                    <h3 className="font-bold text-gray-800 text-lg mb-8 flex items-center gap-2">
                        <Clock className="text-blue-600" />
                        Perjalanan Pendaftaran
                    </h3>

                    <div className="relative">
                        {/* Vertical Line */}
                        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200 hidden md:block"></div>
                        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200 md:hidden"></div>

                        <div className="space-y-8">
                            {steps.map((step, index) => {
                                let isCompleted = currentStep > step.num || (currentStep === step.num && (isFinished || isRejected))
                                let isCurrent = currentStep === step.num && !isRejected && !isFinished
                                let isPending = currentStep < step.num

                                let statusColor = 'bg-white border-gray-300 text-gray-600' // Pending
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
                                            
                                            {/* Extra Content (Cards, Buttons) - Only show if current or completed, but maybe only if it has content */}
                                            {step.content && (isCurrent || isCompleted) && (
                                                <div className="mt-4 animate-fade-in-up">
                                                    {step.content}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
