'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, FileText, CheckCircle, Award, Users, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
// import Navbar from '@/components/Navbar'
import StatusModal from '@/components/ui/StatusModal'
import Modal from '@/components/ui/Modal' // Added
import { applyTraining } from '@/actions/training'

export default function TrainingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = createClient()
    const router = useRouter()

    const resolvedParams = use(params)
    const trainingId = resolvedParams.id

    const [training, setTraining] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [applying, setApplying] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false) // Added

    const [statusModal, setStatusModal] = useState<{
        isOpen: boolean, type: 'success' | 'error', message: string
    }>({ isOpen: false, type: 'success', message: '' })

    const [redirectOnClose, setRedirectOnClose] = useState<string | null>(null)

    useEffect(() => {
        const getData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/auth/login'); return }

            // Fetch Training
            const { data: t } = await supabase.from('blk_trainings').select('*').eq('id', trainingId).single()
            setTraining(t)

            // Fetch Profile (for Age Check & Validation)
            // V5.5 Fix: Fetch profile_pencaker to check NIK, DOB etc.
            const { data: p } = await supabase
                .from('profiles')
                .select('*, profile_pencaker(*)')
                .eq('id', user.id)
                .single()
            setProfile(p)

            setLoading(false)
        }
        getData()
    }, [trainingId])

    const calculateAge = (dob: string) => {
        if (!dob) return 0
        const birthDate = new Date(dob)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const m = today.getMonth() - birthDate.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        return age
    }

    const handleApplyClick = () => {
        if (!profile) return

        // 1. Check Profile Completeness (From profile_pencaker)
        const pencakerData = profile.profile_pencaker || {}

        // List mandatory fields
        const requiredFields = ['full_name', 'nik', 'date_of_birth', 'address_ktp', 'phone', 'gender', 'place_of_birth']

        // Merge base profile full_name if needed, but profile_pencaker usually has it too or we use profile.full_name
        const checkData = {
            ...pencakerData,
            full_name: profile.full_name || pencakerData.full_name // Ensure we check full_name
        }

        const missing = requiredFields.filter(field => !checkData[field])

        if (missing.length > 0) {
            setStatusModal({
                isOpen: true,
                type: 'error',
                message: `Profil Anda belum lengkap. Mohon lengkapi: ${missing.join(', ')}.`
            })
            // Optional: Redirect after delay or let user click manualy
            setTimeout(() => router.push('/dashboard/pencaker/profile?action=edit'), 2000)
            return
        }

        // If 'rejected', block them.
        if (profile.account_status === 'rejected') {
            setStatusModal({ isOpen: true, type: 'error', message: `Akun Anda ditolak: ${profile.rejection_message}. Silakan perbaiki profil.` })
            return
        }

        // Allow 'unverified' to proceed. The application status will be PENDING anyway.


        // 2. Age Check
        const dob = profile.profile_pencaker?.date_of_birth || profile.dob // V3 Fix: Use correct field
        const age = calculateAge(dob)

        if (training.min_age && age < training.min_age) {
            setStatusModal({ isOpen: true, type: 'error', message: `Maaf, umur Anda (${age} tahun) belum mencukupi. Minimal ${training.min_age} tahun.` })
            return
        }
        if (training.max_age && age > training.max_age) {
            setStatusModal({ isOpen: true, type: 'error', message: `Maaf, umur Anda (${age} tahun) melebihi batas maksimal ${training.max_age} tahun.` })
            return
        }

        // 3. Trigger Modal instead of Confirm
        setShowConfirm(true)
    }

    const executeApply = async () => { // New function called by Modal
        setShowConfirm(false)
        setApplying(true)
        const formData = new FormData()
        formData.append('trainingId', training.id)

        const result = await applyTraining(formData)

        setApplying(false)
        if (result.error) {
            setStatusModal({ isOpen: true, type: 'error', message: result.error })
            // V5.4-01: Redirect to Pelatihan Saya if error (likely duplicate) so user can check status
            setRedirectOnClose('/dashboard/pencaker/pelatihan-saya')
        } else {
            // V5.1-03: Redirect to "Pelatihan Saya"
            setStatusModal({ isOpen: true, type: 'success', message: result.success || 'Pendaftaran Berhasil! Mengalihkan...' })
            setTimeout(() => {
                router.push('/dashboard/pencaker/pelatihan-saya')
            }, 1500)
        }
    }

    if (loading) return <div className="p-10 text-center">Memuat...</div>
    if (!training) return <div className="p-10 text-center">Pelatihan tidak ditemukan</div>

    const dob = profile?.profile_pencaker?.date_of_birth || profile?.dob
    const userAge = dob ? calculateAge(dob) : 0
    const isAgeEligible = (!training.min_age || userAge >= training.min_age) && (!training.max_age || userAge <= training.max_age)

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* Navbar removed as it's provided by layout */}
            <StatusModal
                {...statusModal}
                onClose={() => {
                    setStatusModal({ ...statusModal, isOpen: false })
                    if (redirectOnClose) {
                        router.push(redirectOnClose)
                        setRedirectOnClose(null)
                    }
                }}
            />

            {/* CONFIRMATION MODAL */}
            <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Konfirmasi Pendaftaran">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">Anda akan mendaftar:</h4>
                            <p className="font-bold text-blue-700 text-lg">{training?.title}</p>
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                        Pastikan data profil Anda sudah benar. Data yang dikirim akan diverifikasi oleh Dinas.
                        Apakah Anda yakin ingin melanjutkan?
                    </p>
                    <div className="flex gap-3">
                        <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 text-sm">
                            Batal
                        </button>
                        <button onClick={executeApply} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 text-sm shadow-lg shadow-blue-200">
                            Ya, Daftar Sekarang
                        </button>
                    </div>
                </div>
            </Modal>


            <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
                {/* Header Nav */}
                <Link href="/dashboard/pencaker" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 font-bold text-sm">
                    <ArrowLeft size={16} /> Kembali ke Dashboard
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                    {/* Hero Image Area */}
                    <div className="h-64 bg-gray-800 relative">
                        {training.image_url ? (
                            <img src={training.image_url} className="w-full h-full object-cover opacity-80" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
                                <Users size={64} className="opacity-20" />
                            </div>
                        )}
                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-8">
                            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block">
                                {training.category || 'Umum'}
                            </span>
                            <h1 className="text-3xl font-extrabold text-white mb-1">{training.title}</h1>
                            <p className="text-gray-300 font-medium flex items-center gap-2">
                                <Users size={16} /> {training.provider}
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 p-8">

                        {/* LEFT COLUMN: Main Info */}
                        <div className="md:col-span-2 space-y-8">
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg mb-3 flex items-center gap-2">
                                    <FileText className="text-blue-600" size={20} /> Deskripsi Pelatihan
                                </h3>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                    {training.description}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-800 text-lg mb-3 flex items-center gap-2">
                                    <CheckCircle className="text-green-600" size={20} /> Persyaratan Peserta
                                </h3>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isAgeEligible ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {isAgeEligible ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-700 block text-sm">Usia {training.min_age} - {training.max_age} Tahun</span>
                                            <span className="text-xs text-gray-500">Usia Anda saat ini: {userAge} tahun</span>
                                        </div>
                                    </li>
                                    {training.requirements?.map((req: string, idx: number) => (
                                        <li key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <CheckCircle size={16} className="text-green-500 shrink-0" />
                                            <span className="text-sm text-gray-700">{req}</span>
                                        </li>
                                    ))}
                                    {(!training.requirements || training.requirements.length === 0) && (
                                        <li className="text-sm text-gray-400 italic pl-2">- Tidak ada syarat khusus lainnya.</li>
                                    )}
                                </ul>
                            </div>

                            {training.certification && (
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg mb-3 flex items-center gap-2">
                                        <Award className="text-purple-600" size={20} /> Sertifikasi
                                    </h3>
                                    <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-lg font-bold text-sm border border-purple-100">
                                        <Award size={16} /> {training.certification}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: Action Card */}
                        <div className="md:col-span-1">
                            <div className="bg-white border rounded-xl shadow-lg p-6 sticky top-24">
                                <h4 className="font-bold text-gray-400 text-xs uppercase mb-4 tracking-wider">Pendaftaran</h4>

                                <div className="mb-6">
                                    <p className="text-3xl font-extrabold text-blue-600 mb-1">{training.quota} <span className="text-sm font-normal text-gray-500">Kuota</span></p>
                                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((training.filled / training.quota) * 100, 100)}%` }}></div>
                                    </div>
                                    <p className="text-xs text-gray-500 flex justify-between">
                                        <span>Terisi: {training.filled}</span>
                                        <span>Sisa: {Math.max(0, training.quota - training.filled)}</span>
                                    </p>
                                </div>

                                {/* V5.1-04: Registration Dates */}
                                {(training.registration_start || training.registration_end) && (
                                    <div className="mb-6 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                        <h5 className="font-bold text-gray-700 text-xs mb-2 flex items-center gap-1"><Calendar size={12} /> Periode Pendaftaran</h5>
                                        <div className="text-sm space-y-1">
                                            {training.registration_start && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Mulai:</span>
                                                    <span className="font-bold text-gray-800">{new Date(training.registration_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                                </div>
                                            )}
                                            {training.registration_end && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Selesai:</span>
                                                    <span className="font-bold text-gray-800">{new Date(training.registration_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleApplyClick}
                                    disabled={applying}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
                                >
                                    {applying ? 'Memproses...' : 'Daftar Sekarang'}
                                </button>

                                <p className="text-[10px] text-gray-400 text-center mt-4 leading-tight">
                                    Dengan mendaftar, Anda menyetujui syarat & ketentuan yang berlaku di Disnaker.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
