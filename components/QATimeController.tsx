'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Calendar, RefreshCw, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { getSystemTime, setSystemTime } from '@/actions/qa'
import { SwalToast } from '@/utils/swal'

export default function QATimeController() {
    const router = useRouter()
    const [overriddenDate, setOverriddenDate] = useState<string | null>(null)
    const [inputDate, setInputDate] = useState('')
    const [loading, setLoading] = useState(false)
    const [currentTime, setCurrentTime] = useState('')
    const [isCollapsed, setIsCollapsed] = useState(true)

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
        <div className="bg-white/95 backdrop-blur-md border border-red-100 rounded-2xl p-4 shadow-sm transition-all duration-300 hover:shadow-md">
            {/* Header bar (Collapsible Toggle) */}
            <div
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="flex items-center justify-between cursor-pointer select-none"
            >
                <div className="flex items-center gap-3">
                    <span className={`p-2 rounded-xl transition-colors ${overriddenDate ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                        <Clock className={`h-4 w-4 ${overriddenDate ? 'animate-pulse text-amber-500' : 'text-red-500'}`} />
                    </span>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs md:text-sm tracking-wide text-slate-800">PANEL QA TIME TRAVEL</h4>
                            {overriddenDate ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                                    Simulasi: {new Date(overriddenDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                    Waktu Nyata
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition">
                        {isCollapsed ? 'Buka Panel' : 'Sembunyikan'}
                    </span>
                    <button className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition">
                        {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </button>
                </div>
            </div>

            {/* Collapsible Content */}
            {!isCollapsed && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
                    <p className="text-xs text-slate-500">
                        Atur simulasi tanggal sistem untuk menguji urutan progress otomatis.
                    </p>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="relative">
                            <input
                                type="date"
                                value={inputDate}
                                onChange={(e) => setInputDate(e.target.value)}
                                className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent pr-8"
                            />
                            <Calendar className="absolute right-2.5 top-2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                        </div>

                        <button
                            onClick={handleApply}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition duration-200 shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                            {loading ? 'Proses...' : 'Terapkan'}
                        </button>

                        {overriddenDate && (
                            <button
                                onClick={handleReset}
                                disabled={loading}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-xl text-xs transition duration-200 border border-slate-200 flex items-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50"
                            >
                                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                                Reset
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
