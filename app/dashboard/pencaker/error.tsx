'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Pencaker Dashboard Crash:', error)
    }, [error])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-sans text-center">
            <div className="bg-red-50 p-6 rounded-full mb-6 animate-bounce">
                <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Terjadi Kesalahan!</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
                Maaf, sistem mengalami kendala saat memuat dashboard Anda. Silakan coba muat ulang halaman.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-2"
                >
                    <RefreshCcw size={18} /> Refresh Halaman
                </button>
                <button
                    onClick={
                        // Attempt to recover by trying to re-render the segment
                        () => reset()
                    }
                    className="px-6 py-3 bg-blue-600 rounded-xl font-bold text-white hover:bg-blue-700 transition"
                >
                    Coba Lagi
                </button>
            </div>
            <p className="mt-8 text-xs text-slate-400 font-mono">Error Digest: {error.digest || 'Unknown'}</p>
        </div>
    )
}
