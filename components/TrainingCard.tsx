'use client'

import { Building } from 'lucide-react'
import { applyTraining } from '@/actions/training'
import { useState } from 'react'

export default function TrainingCard({ item, userStatus }: { item: any, userStatus: string }) {
  const [loading, setLoading] = useState(false)

  const handleApply = async () => {
    // Validasi Cepat di Client (UX Better)
    if (userStatus !== 'verified') {
      alert("AKSES DITOLAK: Akun Anda belum diverifikasi oleh Admin Dinas.")
      return
    }

    if (!confirm(`Apakah Anda yakin ingin mendaftar pelatihan "${item.title}"?`)) return

    setLoading(true)
    const formData = new FormData()
    formData.append('trainingId', item.id)

    const result = await applyTraining(formData)
    
    if (result?.error) {
      alert("GAGAL: " + result.error)
    } else {
      alert("SUKSES: " + result.success)
      // Opsional: Reload halaman untuk update status tombol
      window.location.reload()
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
        <div className="h-40 bg-gray-200 relative">
          {item.image_url ? (
             <img src={item.image_url} alt={item.title} className="w-full h-full object-cover"/>
          ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
          )}
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-blue-600 shadow-sm">
            {item.category || 'Umum'}
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{item.title}</h3>
          <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
            <Building size={12}/> {item.provider}
          </p>
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{item.description}</p>
          
          <div className="mt-auto pt-4 border-t border-dashed">
            <button 
              onClick={handleApply}
              disabled={loading}
              className={`w-full text-sm font-bold text-white px-4 py-2 rounded-lg transition-colors ${
                userStatus === 'verified' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? 'Memproses...' : (userStatus === 'verified' ? 'Daftar Sekarang' : 'Verifikasi Akun Dulu')}
            </button>
          </div>
        </div>
    </div>
  )
}