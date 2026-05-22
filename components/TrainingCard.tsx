'use client'

import { Building, AlertTriangle } from 'lucide-react'
import { applyTraining } from '@/actions/training'
import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TrainingCard({ item, userStatus, systemDateStr }: { item: any, userStatus: string, systemDateStr?: string }) {
  const [loading, setLoading] = useState(false)
  const [isWarningOpen, setIsWarningOpen] = useState(false)
  const [isClosedModalOpen, setIsClosedModalOpen] = useState(false)
  const router = useRouter()

  // Logic Check Closed
  let todayStr = systemDateStr
  if (!todayStr) {
      const d = new Date()
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      todayStr = `${yyyy}-${mm}-${dd}`
  }

  const regStart = item.registration_start // "YYYY-MM-DD"
  const regEnd = item.registration_end     // "YYYY-MM-DD"

  const isClosed = item.status === 'CLOSED' || (regEnd && todayStr > regEnd)
  const isUpcoming = regStart && todayStr < regStart

  const handleApply = async () => {
    // ... existing apply logic if we had it here ...
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if (isClosed || isUpcoming) {
      e.preventDefault()
      if (isClosed) setIsClosedModalOpen(true)
      // For isUpcoming we might not need a modal if we just disable the button, but good to prevent default.
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
          {isUpcoming && !isClosed && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
              <span className="bg-yellow-500 text-white px-3 py-1 rounded font-bold text-sm transform -rotate-6 shadow-lg border border-yellow-400">BELUM DIBUKA</span>
            </div>
          )}
          {isClosed && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
              <span className="bg-red-600 text-white px-3 py-1 rounded font-bold text-sm transform -rotate-6 shadow-lg border border-red-400">PENDAFTARAN TUTUP</span>
            </div>
          )}
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{item.title}</h3>
          <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
            <Building size={12} /> {item.provider}
          </p>
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{item.description}</p>

          <div className="mt-auto pt-4 border-t border-dashed">
            {isUpcoming ? (
              <button
                disabled
                className="block text-center w-full text-sm font-bold text-gray-500 bg-gray-100 px-4 py-2 rounded-lg cursor-not-allowed"
              >
                Pendaftaran Belum Dibuka
              </button>
            ) : isClosed ? (
              <button
                onClick={() => setIsClosedModalOpen(true)}
                className="block text-center w-full text-sm font-bold text-gray-500 bg-gray-100 px-4 py-2 rounded-lg cursor-not-allowed hover:bg-gray-200"
              >
                Pendaftaran Tutup
              </button>
            ) : (
              <Link
                href={`/dashboard/pencaker/training/${item.id}`}
                className="block text-center w-full text-sm font-bold text-white px-4 py-2 rounded-lg transition-colors bg-blue-600 hover:bg-blue-700"
              >
                Lihat Detail & Daftar
              </Link>
            )}
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

      <Modal isOpen={isClosedModalOpen} onClose={() => setIsClosedModalOpen(false)} title="Pendaftaran Tutup">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Pendaftaran Tidak Tersedia</h3>
          <p className="text-gray-600 text-sm mb-6">
            Mohon maaf, masa pendaftaran untuk pelatihan ini sudah berakhir. Anda tidak dapat mendaftar lagi.
          </p>
          <button
            onClick={() => setIsClosedModalOpen(false)}
            className="w-full bg-gray-200 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-300 transition"
          >
            Tutup
          </button>
        </div>
      </Modal>
    </>
  )
}