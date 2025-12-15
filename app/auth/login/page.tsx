'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Building, Lock, User, ArrowLeft, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // 1. Proses Login Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('Email atau password salah, jika sudah benar pastikan email sudah diverifikasi lewat link yang dikirimkan.')
      setLoading(false)
      return
    }

    if (authData.user) {
      // 2. CEK ROLE DARI DATABASE (Langkah Kunci!)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      // 3. LOGIC REDIRECT BERDASARKAN ROLE
      const role = profile?.role || 'PENCAKER'
      
      if (role === 'ADMIN_DINAS') {
        router.push('/dashboard/dinas')
      } else if (role === 'ADMIN_LPK') {
        router.push('/dashboard/lpk') // Pastikan halaman ini nanti dibuat
      } else if (role === 'ADMIN_PERUSAHAAN') {
        router.push('/dashboard/perusahaan') // Pastikan halaman ini nanti dibuat
      } else {
        router.push('/dashboard/pencaker')
      }
      
      // Refresh agar Navbar update state
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
        
        {/* Header Biru */}
        <div className="bg-blue-900 p-8 text-center text-white relative">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <Building className="w-12 h-12 mx-auto mb-4 opacity-90 relative z-10" />
          <h2 className="text-2xl font-bold relative z-10">Login SIPENSIL</h2>
          <p className="text-blue-100 text-sm mt-1 relative z-10">Masuk ke akun Anda</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
             <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200 flex items-center gap-2">
                <AlertCircle size={16} /> {error}
             </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <div className="relative">
               <User className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
               <input 
                 required 
                 type="email" 
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                 placeholder="nama@email.com"
               />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
               <Lock className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
               <input 
                 required 
                 type="password" 
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                 placeholder="••••••••"
               />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded-lg shadow-md transition-transform hover:scale-[1.02] disabled:bg-blue-700"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>

          <div className="text-center pt-2">
             <p className="text-sm text-gray-600">
                 Belum punya akun? <Link href="/auth/register" className="text-blue-600 font-bold hover:underline">Daftar Disini</Link>
             </p>
          </div>
          
          <div className="text-center mt-4">
             <Link href="/" className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition">
                <ArrowLeft size={14} /> Kembali ke Beranda
             </Link>
          </div>

        </form>
      </div>
    </div>
  )
}