'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Calendar, RefreshCw, AlertTriangle } from 'lucide-react'
import { getSystemTime, setSystemTime } from '@/actions/qa'
import { SwalToast } from '@/utils/swal'

export default function QATimeController() {
    const router = useRouter()
    const [overriddenDate, setOverriddenDate] = useState<string | null>(null)
    const [inputDate, setInputDate] = useState('')
    const [loading, setLoading] = useState(false)
    const [currentTime, setCurrentTime] = useState('')

    useEffect(() => {
        const fetchTime = async () => {
            const time = await getSystemTime()
            setOverriddenDate(time)
            if (time) {
                setInputDate(time)
            } else {
                setInputDate(new Date().toISOString().split('T')[0])
            }
        }
        fetchTime()

        const now = new Date()
        setCurrentTime(now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
    }, [])

    const handleApply = async () => {
        if (!inputDate) return
        setLoading(true)
        const res = await setSystemTime(inputDate)
        setLoading(false)

        if (res?.error) {
            SwalToast.fire({ icon: 'error', title: 'Gagal mengatur waktu QA' })
        } else {
            setOverriddenDate(inputDate)
            SwalToast.fire({ icon: 'success', title: `Waktu QA disimulasikan ke: ${inputDate}` })
            router.refresh()
        }
    }

    const handleReset = async () => {
        setLoading(true)
        const res = await setSystemTime(null)
        setLoading(false)

        if (res?.error) {
            SwalToast.fire({ icon: 'error', title: 'Gagal mereset waktu QA' })
        } else {
            setOverriddenDate(null)
            setInputDate(new Date().toISOString().split('T')[0])
            SwalToast.fire({ icon: 'success', title: 'Waktu QA dikembalikan ke waktu nyata' })
            router.refresh()
        }
    }

    return (
        <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl p-4 md:p-6 shadow-2xl relative overflow-hidden transition-all duration-300 hover:shadow-slate-950">
            {/* Background Glow */}
            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none -mr-20 -mt-20 transition-colors duration-500 ${overriddenDate ? 'bg-amber-500' : 'bg-blue-500'}`}></div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="p-2 bg-slate-800/80 rounded-lg text-slate-300">
                            <Clock className={`h-5 w-5 animate-pulse ${overriddenDate ? 'text-amber-400' : 'text-blue-400'}`} />
                        </span>
                        <div>
                            <h4 className="font-bold text-sm tracking-wide text-slate-200">PANEL DEBUGGING QA TIME TRAVEL</h4>
                            <p className="text-xs text-slate-400">Gunakan panel ini untuk mensimulasikan waktu sistem untuk pengujian progress otomatis.</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-xs text-slate-400">Status Waktu:</span>
                        {overriddenDate ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
                                <AlertTriangle className="h-3 w-3" />
                                Terpantau Teroverride: {new Date(overriddenDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                                Waktu Asli: {currentTime}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <input
                            type="date"
                            value={inputDate}
                            onChange={(e) => setInputDate(e.target.value)}
                            className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8 shadow-inner"
                        />
                        <Calendar className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    </div>

                    <button
                        onClick={handleApply}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition duration-200 shadow-lg shadow-blue-500/20 active:translate-y-0.5 cursor-pointer"
                    >
                        {loading ? 'Processing...' : 'Simulasikan Waktu'}
                    </button>

                    {overriddenDate && (
                        <button
                            onClick={handleReset}
                            disabled={loading}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold px-4 py-2 rounded-lg text-xs transition duration-200 border border-slate-750 flex items-center gap-1.5 active:translate-y-0.5 cursor-pointer"
                        >
                            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                            Reset Waktu
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
