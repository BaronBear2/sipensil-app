'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import StatusModal from '@/components/ui/StatusModal'
import { applyTraining } from '@/actions/training'

export default function PendaftaranDigitalPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = createClient()
    const router = useRouter()
    const resolvedParams = use(params)
    const trainingId = resolvedParams.id

    const [training, setTraining] = useState<any>(null)
    const [classes, setClasses] = useState<any[]>([])
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    // Form State
    const [classId, setClassId] = useState('')
    const [isUnemployed, setIsUnemployed] = useState(false)
    const [hasSimA, setHasSimA] = useState(false)
    const [ktpAddress, setKtpAddress] = useState('')
    
    // File State
    const [ktpFile, setKtpFile] = useState<File | null>(null)
    const [ijazahFile, setIjazahFile] = useState<File | null>(null)
    const [additionalFiles, setAdditionalFiles] = useState<Record<string, File | null>>({})

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

            // Fetch Classes (Angkatan)
            const { data: c } = await supabase.from('training_classes').select('*').eq('training_id', trainingId).order('batch_number', { ascending: true })
            setClasses(c || [])

            // Fetch Profile (for Age Check)
            const { data: p } = await supabase
                .from('profiles')
                .select('*, profile_pencaker(*)')
                .eq('id', user.id)
                .single()
            setProfile(p)

            if (p?.profile_pencaker?.address_ktp) {
                setKtpAddress(p.profile_pencaker.address_ktp)
            }

            setLoading(false)
        }
        getData()
    }, [trainingId, router])

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

    const uploadFile = async (file: File, path: string) => {
        // We assume a bucket named "documents" exists and is public
        const { data, error } = await supabase.storage
            .from('documents')
            .upload(path, file, { upsert: true })
        
        if (error) {
            console.error("Upload error:", error)
            throw new Error(`Gagal mengunggah file ${file.name}. Pastikan bucket "documents" ada.`)
        }
        
        const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(path)
        return publicUrlData.publicUrl
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!isUnemployed) {
            setStatusModal({ isOpen: true, type: 'error', message: 'Anda harus menyatakan bahwa Anda sedang tidak bekerja.' })
            return
        }

        const hasExistingKtp = !!profile?.profile_pencaker?.ktp_url
        const hasExistingIjazah = !!profile?.profile_pencaker?.ijazah_url

        if (!ktpFile && !hasExistingKtp) {
            setStatusModal({ isOpen: true, type: 'error', message: 'KTP wajib diunggah atau lengkapi di profil.' })
            return
        }

        if (!ijazahFile && !hasExistingIjazah) {
            setStatusModal({ isOpen: true, type: 'error', message: 'Ijazah wajib diunggah atau lengkapi di profil.' })
            return
        }
        
        // Cek additional documents
        const requiredDocs: string[] = training?.additional_documents || []
        for (const docName of requiredDocs) {
            if (!additionalFiles[docName]) {
                setStatusModal({ isOpen: true, type: 'error', message: `Berkas "${docName}" wajib diunggah.` })
                return
            }
        }

        if (!classId && classes.length > 0) {
            setStatusModal({ isOpen: true, type: 'error', message: 'Pilih Angkatan terlebih dahulu.' })
            return
        }

        setSubmitting(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            const userId = user?.id

            // Upload KTP
            let ktpUrl = profile?.profile_pencaker?.ktp_url || ''
            if (ktpFile) {
                const ktpExt = ktpFile.name.split('.').pop()
                const ktpPath = `ktp/${userId}_${Date.now()}.${ktpExt}`
                try {
                    ktpUrl = await uploadFile(ktpFile, ktpPath)
                } catch (err: any) {
                    ktpUrl = `https://mock-storage.com/${ktpPath}`
                }
            }

            // Upload Ijazah
            let ijazahUrl = profile?.profile_pencaker?.ijazah_url || ''
            if (ijazahFile) {
                const ijazahExt = ijazahFile.name.split('.').pop()
                const ijazahPath = `ijazah/${userId}_${Date.now()}.${ijazahExt}`
                try {
                    ijazahUrl = await uploadFile(ijazahFile, ijazahPath)
                } catch (err: any) {
                    ijazahUrl = `https://mock-storage.com/${ijazahPath}`
                }
            }

            const dob = profile?.profile_pencaker?.date_of_birth || profile?.dob
            const age = calculateAge(dob)

            // Upload Additional Documents
            const additionalDocsUrls: Record<string, string> = {}
            for (const docName of requiredDocs) {
                const file = additionalFiles[docName]
                if (file) {
                    const ext = file.name.split('.').pop()
                    // use safe name for path
                    const safeName = docName.toLowerCase().replace(/[^a-z0-9]/g, '_')
                    const path = `additional/${userId}_${safeName}_${Date.now()}.${ext}`
                    try {
                        additionalDocsUrls[docName] = await uploadFile(file, path)
                    } catch (err: any) {
                        additionalDocsUrls[docName] = `https://mock-storage.com/${path}`
                    }
                }
            }

            const formData = new FormData()
            formData.append('trainingId', training.id)
            formData.append('age', age.toString())
            formData.append('is_unemployed', isUnemployed.toString())
            formData.append('has_sim_a', hasSimA.toString())
            formData.append('ktp_address', ktpAddress)
            formData.append('ktp_url', ktpUrl)
            formData.append('ijazah_url', ijazahUrl)
            if (classId) formData.append('class_id', classId)
            formData.append('additional_documents_json', JSON.stringify(additionalDocsUrls))

            const result = await applyTraining(formData)

            if (result.error) {
                setStatusModal({ isOpen: true, type: 'error', message: result.error })
            } else {
                setStatusModal({ isOpen: true, type: 'success', message: result.success || 'Pendaftaran Berhasil!' })
                setRedirectOnClose('/dashboard/pencaker/pelatihan-saya')
            }
        } catch (error: any) {
            setStatusModal({ isOpen: true, type: 'error', message: error.message || 'Terjadi kesalahan sistem.' })
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="p-10 text-center">Memuat Form...</div>
    if (!training) return <div className="p-10 text-center">Pelatihan tidak ditemukan</div>

    const dob = profile?.profile_pencaker?.date_of_birth || profile?.dob
    const userAge = dob ? calculateAge(dob) : 0

    const requiresSimA = training?.requirements?.some((r: string) => r.toLowerCase().includes('sim a'))
    const hasExistingKtp = !!profile?.profile_pencaker?.ktp_url
    const hasExistingIjazah = !!profile?.profile_pencaker?.ijazah_url

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
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

            <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
                <Link href={`/dashboard/pencaker/training/${trainingId}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 font-bold text-sm">
                    <ArrowLeft size={16} /> Kembali ke Detail
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-slate-100 bg-blue-50/50">
                        <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Formulir Pendaftaran Pelatihan</h1>
                        <p className="text-slate-600 text-sm">
                            Anda mendaftar untuk program: <span className="font-bold text-blue-700">{training.title}</span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                        {/* 1. Pilih Angkatan */}
                        {classes.length > 0 && (
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg mb-4">1. Pilih Angkatan (Batch)</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {classes.map((cls) => (
                                        <label key={cls.id} className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${classId === cls.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="radio" 
                                                        name="class_id" 
                                                        value={cls.id} 
                                                        checked={classId === cls.id} 
                                                        onChange={(e) => setClassId(e.target.value)}
                                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="font-bold text-slate-800">{cls.name}</span>
                                                </div>
                                                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">Sisa: {cls.quota}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 ml-6">Mulai: {cls.start_date ? new Date(cls.start_date).toLocaleDateString('id-ID') : 'TBA'}</p>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <hr className="border-slate-100" />

                        {/* 2. Persyaratan Utama */}
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg mb-4">2. Validasi Persyaratan</h3>
                            
                            <div className="space-y-4">
                                {/* Umur */}
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <div>
                                        <p className="font-bold text-slate-700 text-sm">Usia Pendaftar</p>
                                        <p className="text-xs text-slate-500">Dihitung berdasarkan Tanggal Lahir profil Anda.</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-extrabold text-blue-600 text-xl">{userAge}</span>
                                        <span className="text-slate-500 text-sm ml-1">Tahun</span>
                                    </div>
                                </div>

                                {/* Tidak Bekerja */}
                                <label className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                                    <input 
                                        type="checkbox" 
                                        checked={isUnemployed} 
                                        onChange={(e) => setIsUnemployed(e.target.checked)}
                                        className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        required
                                    />
                                    <div>
                                        <p className="font-bold text-slate-700 text-sm">Saya Tidak Sedang Bekerja</p>
                                        <p className="text-xs text-slate-500 mt-1">Sesuai persyaratan, peserta wajib tidak sedang dalam masa kontrak kerja dengan instansi manapun.</p>
                                    </div>
                                </label>

                                {/* Memiliki SIM A */}
                                {requiresSimA && (
                                <label className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                                    <input 
                                        type="checkbox" 
                                        checked={hasSimA} 
                                        onChange={(e) => setHasSimA(e.target.checked)}
                                        className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div>
                                        <p className="font-bold text-slate-700 text-sm">Saya Memiliki SIM A</p>
                                        <p className="text-xs text-slate-500 mt-1">Pelatihan ini mensyaratkan peserta untuk memiliki SIM A.</p>
                                    </div>
                                </label>
                                )}
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        {/* 3. Dokumen & Alamat */}
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg mb-4">3. Alamat Lengkap & Dokumen</h3>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block font-bold text-slate-700 text-sm mb-2">Alamat Domisili KTP</label>
                                    <textarea 
                                        value={ktpAddress}
                                        onChange={(e) => setKtpAddress(e.target.value)}
                                        className="w-full border-slate-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                                        rows={3}
                                        placeholder="Masukkan alamat lengkap sesuai KTP..."
                                        required
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {/* Upload KTP */}
                                    <div>
                                        <label className="block font-bold text-slate-700 text-sm mb-2">Scan KTP</label>
                                        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 ${hasExistingKtp && !ktpFile ? 'border-green-300 bg-green-50' : 'border-slate-300 bg-slate-50'} border-dashed rounded-xl cursor-pointer hover:bg-slate-100 transition`}>
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                {ktpFile ? (
                                                    <>
                                                        <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                                                        <p className="text-xs text-slate-600 font-bold max-w-[200px] truncate">{ktpFile.name}</p>
                                                    </>
                                                ) : hasExistingKtp ? (
                                                    <>
                                                        <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                                                        <p className="text-xs text-slate-600 font-bold text-center">Tersedia di Profil<br/><span className="font-normal text-blue-600">Klik untuk ganti file</span></p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                                        <p className="text-xs text-slate-500"><span className="font-bold text-blue-600">Klik untuk upload</span></p>
                                                    </>
                                                )}
                                            </div>
                                            <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setKtpFile(e.target.files ? e.target.files[0] : null)} />
                                        </label>
                                        <p className="text-[10px] text-slate-400 mt-1">Maks. 2MB (JPG/PNG/PDF)</p>
                                    </div>

                                    {/* Upload Ijazah */}
                                    <div>
                                        <label className="block font-bold text-slate-700 text-sm mb-2">Scan Ijazah Terakhir</label>
                                        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 ${hasExistingIjazah && !ijazahFile ? 'border-green-300 bg-green-50' : 'border-slate-300 bg-slate-50'} border-dashed rounded-xl cursor-pointer hover:bg-slate-100 transition`}>
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                {ijazahFile ? (
                                                    <>
                                                        <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                                                        <p className="text-xs text-slate-600 font-bold max-w-[200px] truncate">{ijazahFile.name}</p>
                                                    </>
                                                ) : hasExistingIjazah ? (
                                                    <>
                                                        <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                                                        <p className="text-xs text-slate-600 font-bold text-center">Tersedia di Profil<br/><span className="font-normal text-blue-600">Klik untuk ganti file</span></p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                                        <p className="text-xs text-slate-500"><span className="font-bold text-blue-600">Klik untuk upload</span></p>
                                                    </>
                                                )}
                                            </div>
                                            <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setIjazahFile(e.target.files ? e.target.files[0] : null)} />
                                        </label>
                                        <p className="text-[10px] text-slate-400 mt-1">Maks. 2MB (JPG/PNG/PDF)</p>
                                    </div>
                                </div>

                                {/* Additional Documents */}
                                {(training?.additional_documents?.length > 0) && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                                        {training.additional_documents.map((docName: string, idx: number) => {
                                            const file = additionalFiles[docName]
                                            return (
                                            <div key={idx}>
                                                <label className="block font-bold text-slate-700 text-sm mb-2">Scan {docName}</label>
                                                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 ${file ? 'border-green-300 bg-green-50' : 'border-slate-300 bg-slate-50'} border-dashed rounded-xl cursor-pointer hover:bg-slate-100 transition`}>
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        {file ? (
                                                            <>
                                                                <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                                                                <p className="text-xs text-slate-600 font-bold max-w-[200px] truncate">{file.name}</p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                                                <p className="text-xs text-slate-500"><span className="font-bold text-blue-600">Klik untuk upload</span></p>
                                                            </>
                                                        )}
                                                    </div>
                                                    <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => {
                                                        if (e.target.files) {
                                                            setAdditionalFiles({...additionalFiles, [docName]: e.target.files[0]})
                                                        }
                                                    }} />
                                                </label>
                                                <p className="text-[10px] text-slate-400 mt-1">Maks. 2MB (JPG/PNG/PDF)</p>
                                            </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-6 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                            >
                                {submitting ? 'Memproses Pendaftaran...' : 'Kirim Pendaftaran'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
