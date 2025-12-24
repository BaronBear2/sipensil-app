'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function LoginForm({ onRegisterClick, onSuccess }: { onRegisterClick: () => void, onSuccess: () => void }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        // 1. Proses Login Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (authError) {
            setError('Email atau password salah. Pastikan akun sudah diverifikasi.')
            setLoading(false)
            return
        }

        if (authData.user) {
            // 2. CEK ROLE DARI DATABASE
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', authData.user.id)
                .single()

            // 3. LOGIC REDIRECT
            const role = profile?.role || 'PENCAKER'

            if (role === 'ADMIN_DINAS') {
                router.push('/dashboard/dinas')
            } else if (role === 'ADMIN_LPK') {
                router.push('/dashboard/lpk')
            } else if (role === 'ADMIN_PERUSAHAAN' || role === 'PERUSAHAAN') {
                // Handle both role names just in case
                router.push('/dashboard/perusahaan')
            } else {
                router.push('/dashboard/pencaker')
            }

            onSuccess()
        }
    }

    return (
        <div className="p-8">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Selamat Datang</h2>
                <p className="text-sm text-gray-500">Silakan masuk untuk melanjutkan</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                    <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-200 flex items-center gap-2">
                        <AlertCircle size={14} /> {error}
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                        <input
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            placeholder="nama@email.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                        <input
                            required
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-9 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 rounded-lg shadow-md transition disabled:bg-blue-400 mt-2"
                >
                    {loading ? 'Memproses...' : 'Masuk'}
                </button>
            </form>

            <div className="text-center mt-6 pt-4 border-t">
                <p className="text-sm text-gray-600">
                    Belum punya akun? <button type="button" onClick={onRegisterClick} className="text-blue-600 font-bold hover:underline">Daftar Sekarang</button>
                </p>
            </div>
        </div>
    )
}
