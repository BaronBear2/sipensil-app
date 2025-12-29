'use client'

import { useState, ChangeEvent, FormEvent } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User, School, Factory, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react'

// --- SUB-COMPONENTS ---
function RoleSelection({ onSelect }: { onSelect: (role: string) => void }) {
    return (
        <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 text-center mb-2">Pilih Jenis Akun</h2>
            <p className="text-sm text-gray-500 text-center mb-6">Siapa Anda?</p>

            <div className="grid gap-4">
                <button onClick={() => onSelect('pencaker')} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition group text-left">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition"><User size={20} /></div>
                    <div>
                        <h4 className="font-bold text-gray-800">Pencari Kerja</h4>
                        <p className="text-xs text-gray-500">Masyarakat umum.</p>
                    </div>
                </button>
                <button onClick={() => onSelect('lpk')} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-green-500 hover:bg-green-50 transition group text-left">
                    <div className="bg-green-100 p-2 rounded-full text-green-600 group-hover:bg-green-600 group-hover:text-white transition"><School size={20} /></div>
                    <div>
                        <h4 className="font-bold text-gray-800">LPK</h4>
                        <p className="text-xs text-gray-500">Lembaga Pelatihan Kerja.</p>
                    </div>
                </button>
                <button onClick={() => onSelect('perusahaan')} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-orange-500 hover:bg-orange-50 transition group text-left">
                    <div className="bg-orange-100 p-2 rounded-full text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition"><Factory size={20} /></div>
                    <div>
                        <h4 className="font-bold text-gray-800">Perusahaan</h4>
                        <p className="text-xs text-gray-500">Penyelenggara magang.</p>
                    </div>
                </button>
            </div>
        </div>
    )
}

function RegisterFormImpl({ role, onBack, onSuccess }: { role: string, onBack: () => void, onSuccess: () => void }) {
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        nik: '',
        email: '',
        password: '',
        confirmPassword: '',
        nib: '',
        phone: '',
        operational_pj: '',
        operational_pj_title: '',
        operational_pj_phone: '',
        operational_pj_email: ''
    })

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        console.log("Submitting registration...") // Debug log
        setLoading(true)

        // VALIDASI PASSWORD COMPLEXITY
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/
        if (!passwordRegex.test(formData.password)) {
            alert("Password minimal 6 karakter, mengandung huruf, angka, dan simbol (@$!%*#?&).")
            setLoading(false)
            return
        }

        if (formData.password !== formData.confirmPassword) {
            alert("Password tidak sama!")
            setLoading(false)
            return
        }

        // VALIDASI NIK (KHUSUS PENCAKER)
        if (role === 'pencaker') {
            const nikRegex = /^3216\d{12}$/
            if (!nikRegex.test(formData.nik)) {
                alert("NIK harus 16 digit dan diawali dengan '3216' (KTP Kabupaten Bekasi).")
                setLoading(false)
                return
            }
        }

        const dbRole = role === 'lpk' ? 'LPK' : role === 'perusahaan' ? 'PERUSAHAAN' : 'PENCAKER'
        const metadata: any = {
            full_name: formData.name,
            role: dbRole,
            phone: formData.phone,
        }

        if (role === 'pencaker') {
            metadata.nik = formData.nik
        } else if (role === 'lpk') {
            metadata.company_name = formData.name
            metadata.operational_pj = formData.operational_pj
            metadata.operational_pj_title = formData.operational_pj_title
            metadata.operational_pj_phone = formData.operational_pj_phone
            metadata.operational_pj_email = formData.email
        } else if (role === 'perusahaan') {
            metadata.nib = formData.nib
            metadata.company_name = formData.name
        }

        const { error: authError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: { data: metadata },
        })

        if (authError) {
            alert("Gagal: " + authError.message)
        } else {
            onSuccess()
        }
        setLoading(false)
    }

    return (
        <div className="p-6">
            <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-4 font-bold">
                <ArrowLeft size={14} /> Kembali
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-4 capitalize">Daftar {role === 'lpk' ? 'LPK' : role}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {role === 'pencaker' && (
                    <>
                        <div><label className="text-xs font-bold block mb-1">NIK</label><input required name="nik" type="number" onChange={handleChange} className="w-full border rounded p-2 text-sm" placeholder="16 Digit NIK" /></div>
                        <div><label className="text-xs font-bold block mb-1">Nama Lengkap</label><input required name="name" onChange={handleChange} className="w-full border rounded p-2 text-sm" placeholder="Nama KTP" /></div>
                    </>
                )}
                {role === 'lpk' && (
                    <>
                        <div><label className="text-xs font-bold block mb-1">Nama LPK</label><input required name="name" onChange={handleChange} className="w-full border rounded p-2 text-sm" /></div>
                        <div><label className="text-xs font-bold block mb-1">Nama Penanggung Jawab Operasional</label><input required name="operational_pj" onChange={handleChange} className="w-full border rounded p-2 text-sm" /></div>
                        <div><label className="text-xs font-bold block mb-1">Jabatan Penanggung Jawab</label><input required name="operational_pj_title" onChange={handleChange} className="w-full border rounded p-2 text-sm" /></div>
                        <div><label className="text-xs font-bold block mb-1">No HP Penanggung Jawab</label><input required name="operational_pj_phone" onChange={handleChange} className="w-full border rounded p-2 text-sm" /></div>
                    </>
                )}
                {role === 'perusahaan' && (
                    <>
                        <div><label className="text-xs font-bold block mb-1">Nama Perusahaan</label><input required name="name" onChange={handleChange} className="w-full border rounded p-2 text-sm" /></div>
                        <div><label className="text-xs font-bold block mb-1">NIB</label><input required name="nib" onChange={handleChange} className="w-full border rounded p-2 text-sm" /></div>
                        <div><label className="text-xs font-bold block mb-1">Telepon HRD</label><input required name="phone" onChange={handleChange} className="w-full border rounded p-2 text-sm" /></div>
                    </>
                )}

                <div className="border-t pt-3 mt-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><label className="text-xs font-bold block mb-1">{role === 'lpk' ? 'Email Penanggung Jawab' : 'Email'}</label><input required name="email" type="email" onChange={handleChange} className="w-full border rounded p-2 text-sm" /></div>
                        <div>
                            <label className="text-xs font-bold block mb-1">Password</label>
                            <div className="relative">
                                <input required name="password" type={showPassword ? 'text' : 'password'} onChange={handleChange} className="w-full border rounded p-2 pr-10 text-sm" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-3">
                        <label className="text-xs font-bold block mb-1">Confirm Password</label>
                        <div className="relative">
                            <input required name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} onChange={handleChange} className="w-full border rounded p-2 pr-10 text-sm" />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg mt-2 hover:bg-blue-700 transition disabled:bg-blue-300">
                    {loading ? 'Mendaftar...' : 'Buat Akun'}
                </button>
            </form>
        </div>
    )
}

// --- MAIN MANAGER ---
export default function RegisterFormManager({ onLoginClick, onSuccess }: { onLoginClick: () => void, onSuccess: () => void }) {
    const [step, setStep] = useState<'SELECTION' | 'FORM'>('SELECTION')
    const [role, setRole] = useState('')

    const handleSelectRole = (r: string) => {
        setRole(r)
        setStep('FORM')
    }

    if (step === 'SELECTION') {
        return (
            <>
                <RoleSelection onSelect={handleSelectRole} />
                <div className="text-center pb-6 border-t pt-4">
                    <p className="text-sm text-gray-600">
                        Sudah punya akun? <button type="button" onClick={onLoginClick} className="text-blue-600 font-bold hover:underline">Masuk</button>
                    </p>
                </div>
            </>
        )
    }

    return <RegisterFormImpl role={role} onBack={() => setStep('SELECTION')} onSuccess={onSuccess} />
}
