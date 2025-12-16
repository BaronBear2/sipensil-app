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

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isSuccess ? 'Berhasil' : 'Gagal'}>
            <div className="p-6 text-center flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                    {isSuccess ? <CheckCircle size={32} /> : <XCircle size={32} />}
                </div>

                <h3 className={`text-xl font-bold mb-2 ${isSuccess ? 'text-gray-800' : 'text-red-700'}`}>
                    {title || (isSuccess ? 'Berhasil!' : 'Terjadi Kesalahan')}
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed">
                    {message}
                </p>

                <button
                    onClick={onClose}
                    className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-md active:scale-95 ${isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                        }`}
                >
                    {isSuccess ? 'Oke, Mengerti' : 'Tutup'}
                </button>
            </div>
        </Modal>
    )
}
