'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { updateUserPassword } from '@/actions/auth'
import Swal from 'sweetalert2'

export default function UpdatePasswordForm() {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Password tidak sama.')
            return
        }

        if (password.length < 6) {
            setError('Password minimal 6 karakter.')
            return
        }

        setLoading(true)

        const res = await updateUserPassword(password)

        if (res?.error) {
            setError(res.error)
            setLoading(false)
        } else {
            Swal.fire({
                title: 'Password Berhasil Diubah!',
                text: 'Silakan login kembali dengan password baru Anda.',
                icon: 'success',
                confirmButtonColor: '#1d4ed8'
            }).then(() => {
                router.push('/') // Redirect to home/login
            })
        }
    }

    return (
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
                <p className="text-sm text-gray-500">Masukkan password baru Anda.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-200 flex items-center gap-2">
                        <AlertCircle size={14} /> {error}
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Password Baru</label>
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

                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Konfirmasi Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                        <input
                            required
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-9 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 rounded-lg shadow-md transition disabled:bg-blue-400 mt-4"
                >
                    {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
                </button>
            </form>
        </div>
    )
}
