'use client'

import { useState, FormEvent } from 'react'
import { Mail, AlertCircle, ArrowLeft } from 'lucide-react'
import { requestPasswordReset } from '@/actions/auth'
import Swal from 'sweetalert2'

export default function ForgotPasswordForm({ onBackClick }: { onBackClick: () => void }) {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const res = await requestPasswordReset(email)

        setLoading(false)

        if (res?.error) {
            setError(res.error)
        } else {
            Swal.fire({
                title: 'Email Terkirim!',
                text: 'Silakan cek email Anda untuk instruksi reset password.',
                icon: 'success',
                confirmButtonColor: '#1d4ed8'
            }).then(() => {
                onBackClick() // Go back to login
            })
        }
    }

    return (
        <div className="p-8">
            <button
                onClick={onBackClick}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors"
            >
                <ArrowLeft size={16} /> Kembali
            </button>

            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Lupa Password?</h2>
                <p className="text-sm text-gray-500">Masukkan email Anda untuk mereset password.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-200 flex items-center gap-2">
                        <AlertCircle size={14} /> {error}
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Email Terdaftar</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
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

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 rounded-lg shadow-md transition disabled:bg-blue-400 mt-2"
                >
                    {loading ? 'Mengirim...' : 'Kirim Link Reset'}
                </button>
            </form>
        </div>
    )
}
