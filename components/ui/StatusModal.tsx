'use client'

import Modal from './Modal'
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react'

interface StatusModalProps {
    isOpen: boolean
    onClose: () => void
    type: 'success' | 'error'
    title?: string
    message: string
}

export default function StatusModal({ isOpen, onClose, type, title, message }: StatusModalProps) {
    const isSuccess = type === 'success'

    // Prevent rendering if not open to keep DOM clean
    if (!isOpen) return null

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isSuccess ? 'Berhasil' : 'Perhatian'}>
            <div className="p-8 text-center flex flex-col items-center">
                {/* Animated Icon Ring */}
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-bounce-slow shadow-lg border-4 border-white ${isSuccess ? 'bg-gradient-to-br from-green-100 to-emerald-200 text-green-600' : 'bg-gradient-to-br from-red-100 to-rose-200 text-red-600'
                    }`}>
                    {isSuccess ? <CheckCircle size={40} strokeWidth={3} /> : <AlertCircle size={40} strokeWidth={3} />}
                </div>

                <h3 className={`text-2xl font-extrabold mb-3 tracking-tight ${isSuccess ? 'text-gray-900' : 'text-red-600'}`}>
                    {title || (isSuccess ? 'Berhasil!' : 'Terjadi Kesalahan')}
                </h3>

                <p className="text-gray-500 mb-8 leading-relaxed max-w-xs mx-auto text-sm font-medium">
                    {message}
                </p>

                <button
                    onClick={onClose}
                    className={`w-full py-4 rounded-xl font-extrabold text-white transition-all shadow-lg active:scale-95 text-sm uppercase tracking-wider ${isSuccess
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-200'
                        : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-red-200'
                        }`}
                >
                    {isSuccess ? 'Lanjutkan' : 'Tutup'}
                </button>
            </div>
        </Modal>
    )
}
