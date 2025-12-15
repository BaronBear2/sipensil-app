import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cek Email Anda</h2>
        <p className="text-gray-600 mb-6">
          Kami telah mengirimkan tautan konfirmasi ke email Anda. Silakan klik tautan tersebut untuk mengaktifkan akun.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800 text-left mb-6">
          <strong>Catatan:</strong> Jika tidak ada di Inbox, periksa folder Spam/Junk.
        </div>

        <Link href="/auth/login" className="block w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">
          Kembali ke Login
        </Link>
      </div>
    </div>
  )
}