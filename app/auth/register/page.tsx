'use client'
import Link from 'next/link'
import { User, School, Factory, ArrowRight } from 'lucide-react'

export default function RegisterSelection() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Buat Akun SIPENSIL</h2>
          <p className="text-gray-500 mt-2">Pilih jenis akun yang sesuai dengan kebutuhan Anda</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Pencaker */}
          <Link href="/auth/register/pencaker" className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-500 transition-all group text-center relative overflow-hidden">
             <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                <User className="w-8 h-8 text-blue-600 group-hover:text-white" />
             </div>
             <h3 className="text-xl font-bold text-gray-800 mb-2">Pencari Kerja</h3>
             <p className="text-sm text-gray-500">Masyarakat umum, pelatihan BLK, magang.</p>
          </Link>

          {/* Card 2: LPK */}
          <Link href="/auth/register/lpk" className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-green-500 transition-all group text-center relative overflow-hidden">
             <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-600 transition-colors">
                <School className="w-8 h-8 text-green-600 group-hover:text-white" />
             </div>
             <h3 className="text-xl font-bold text-gray-800 mb-2">Admin LPK</h3>
             <p className="text-sm text-gray-500">Lembaga Pelatihan Kerja swasta/negeri.</p>
          </Link>

          {/* Card 3: Perusahaan */}
          <Link href="/auth/register/perusahaan" className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-500 transition-all group text-center relative overflow-hidden">
             <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-600 transition-colors">
                <Factory className="w-8 h-8 text-orange-600 group-hover:text-white" />
             </div>
             <h3 className="text-xl font-bold text-gray-800 mb-2">Perusahaan</h3>
             <p className="text-sm text-gray-500">Penyelenggara pemagangan industri.</p>
          </Link>
        </div>
      </div>
    </div>
  )
}