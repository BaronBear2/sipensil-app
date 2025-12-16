'use client'

import { Building, AlertTriangle } from 'lucide-react'
import { applyTraining } from '@/actions/training'
import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TrainingCard({ item, userStatus }: { item: any, userStatus: string }) {
  const [loading, setLoading] = useState(false)
  const [isWarningOpen, setIsWarningOpen] = useState(false)
  const router = useRouter()

  const handleApply = async () => {
    if (!confirm('Apakah Anda yakin ingin mendaftar pelatihan ini?')) return

    setLoading(true)
    const formData = new FormData()
    formData.append('trainingId', item.id)

    const result = await applyTraining(formData)

    setLoading(false)
    if (result.error) {
      alert(result.error)
    } else {
      alert(result.success)
      window.location.reload()
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
        <div className="h-40 bg-gray-200 relative">
          {item.image_url ? (
            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
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
            <Building size={12} /> {item.provider}
          </p>
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{item.description}</p>

          <div className="mt-auto pt-4 border-t border-dashed">
            <Link
              href={`/dashboard/pencaker/training/${item.id}`}
              className="block text-center w-full text-sm font-bold text-white px-4 py-2 rounded-lg transition-colors bg-blue-600 hover:bg-blue-700"
            >
              Lihat Detail & Daftar
            </Link>
          </div>
        </div>
      </div>

      <Modal isOpen={isWarningOpen} onClose={() => setIsWarningOpen(false)} title="Peringatan Akun">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Akun Belum Terverifikasi</h3>
          <p className="text-gray-600 text-sm mb-6">
            Mohon maaf, Anda belum bisa mendaftar pelatihan karena akun Anda belum diverifikasi oleh Admin Dinas. Silakan lengkapi data profil Anda terlebih dahulu.
          </p>
          <button
            onClick={() => router.push('/dashboard/pencaker/profile')}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Oke, Lengkapi Profil
          </button>
        </div>
      </Modal>
    </>
  )
}