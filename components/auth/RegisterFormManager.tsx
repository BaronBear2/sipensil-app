'use client'

import { useState, ChangeEvent, FormEvent } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User, School, Factory, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react'

// --- SUB-COMPONENTS ---
// RoleSelection removed since only Pencaker can register

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
        phone: ''
    })

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        console.log("Submitting registration...") // Debug log
        setLoading(true)

        // VALIDASI PASSWORD COMPLEXITY
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.])[A-Za-z\d@$!%*#?&.]{6,}$/
        if (!passwordRegex.test(formData.password)) {
            alert("Password minimal 6 karakter, mengandung huruf, angka, dan simbol (@$!%*#?&.).")
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

        const dbRole = 'PENCAKER'
        const metadata: any = {
            full_name: formData.name,
            role: dbRole,
            phone: formData.phone,
        }

        if (role === 'pencaker') {
            metadata.nik = formData.nik
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
            <h2 className="text-xl font-bold text-gray-800 mb-4 capitalize">Daftar Akun Pencaker</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {role === 'pencaker' && (
                    <>
                        <div><label className="text-xs font-bold block mb-1">NIK</label><input required name="nik" type="number" onChange={handleChange} className="w-full border rounded p-2 text-sm" placeholder="16 Digit NIK" /></div>
                        <div><label className="text-xs font-bold block mb-1">Nama Lengkap</label><input required name="name" onChange={handleChange} className="w-full border rounded p-2 text-sm" placeholder="Nama KTP" /></div>
                    </>
                )}

                <div className="border-t pt-3 mt-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><label className="text-xs font-bold block mb-1">Email</label><input required name="email" type="email" onChange={handleChange} className="w-full border rounded p-2 text-sm" /></div>
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
    return (
        <>
            <RegisterFormImpl role={'pencaker'} onBack={() => {}} onSuccess={onSuccess} />
            <div className="text-center pb-6 border-t pt-4">
                <p className="text-sm text-gray-600">
                    Sudah punya akun? <button type="button" onClick={onLoginClick} className="text-blue-600 font-bold hover:underline">Masuk</button>
                </p>
            </div>
        </>
    )
}
