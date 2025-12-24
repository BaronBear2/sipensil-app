'use client'


import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, LogIn, Menu, ChevronDown, LayoutDashboard, LogOut } from 'lucide-react'
import logoSipensil from '@/assets/logo/logo-sipensil.jpeg'
import logoPemkab from '@/assets/logo/logo-pemkabbek.jpeg'
import Modal from '@/components/ui/Modal'
import AuthModalContent from '@/components/auth/AuthModalContent'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function PublicNavbar() {
    const router = useRouter()
    const supabase = createClient()
    const [isAuthModalOpen, setAuthModalOpen] = useState(false)
    const [authView, setAuthView] = useState<'LOGIN' | 'REGISTER'>('LOGIN')

    const [profile, setProfile] = useState<any>(null)
    const [sessionUser, setSessionUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            const user = session?.user
            setSessionUser(user)

            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (data) setProfile(data)
            }
            setLoading(false)
        }
        fetchProfile()
    }, [])

    // Logout removed as requested


    const getDashboardLink = (role: string) => {
        if (!role) return '/'
        const r = role.toUpperCase()
        if (r === 'ADMIN_DINAS') return '/dashboard/dinas'
        if (r === 'ADMIN_LPK') return '/dashboard/lpk'
        if (r === 'ADMIN_PERUSAHAAN') return '/dashboard/perusahaan'
        return '/dashboard/pencaker'
    }

    const openAuth = (view: 'LOGIN' | 'REGISTER') => {
        setAuthView(view)
        setAuthModalOpen(true)
    }

    return (
        <>
            {/* AUTH MODAL */}
            <Modal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} title={authView === 'LOGIN' ? 'Masuk' : 'Daftar'}>
                <AuthModalContent
                    initialView={authView}
                    onSwitch={(view) => {
                        if (view === 'LOGIN' || view === 'REGISTER') setAuthView(view)
                    }}
                    onClose={() => setAuthModalOpen(false)}
                />
            </Modal>



            {/* NAVBAR (Minimalist) */}
            <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-[60] border-b border-slate-100 h-20">
                <div className="container mx-auto px-4 lg:px-8 h-full">
                    <div className="flex justify-between items-center h-full">

                        {/* Logo Area */}
                        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
                            <div className="flex items-center gap-3">
                                <Image src={logoPemkab} alt="Logo Pemkab Bekasi" className="h-9 w-auto" priority />
                                <div className="border-l border-slate-300 h-6"></div>
                                <Image src={logoSipensil} alt="Logo Sipensil" className="h-9 w-auto" priority />
                            </div>

                            <div className="flex flex-col">
                                <span className="font-bold text-lg text-slate-800 leading-none tracking-tight group-hover:text-blue-700 transition">SIPENSIL</span>
                                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Dinas Ketenagakerjaan</span>
                            </div>
                        </Link>

                        {/* Desktop Menu - Removed Beranda */}
                        <div className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600">
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">

                            {/* AUTH BUTTONS */}
                            {loading ? (
                                <span className="text-xs text-slate-400">Loading...</span>
                            ) : profile || sessionUser ? (
                                <Link
                                    href={getDashboardLink(profile?.role)}
                                    className="bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-600 hover:text-blue-600 px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wide transition-all flex items-center gap-2 group"
                                >
                                    <span className="bg-slate-100 text-slate-500 p-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                        <LayoutDashboard size={14} />
                                    </span>
                                    <span>Kembali ke Dashboard</span>
                                </Link>
                            ) : (
                                <button
                                    onClick={() => openAuth('LOGIN')}
                                    className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-full font-bold text-sm transition shadow-lg shadow-blue-200 flex items-center gap-2 hover:-translate-y-0.5"
                                >
                                    <LogIn size={16} /> Masuk
                                </button>
                            )}

                            <button className="lg:hidden text-slate-600 p-2">
                                <Menu size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    )
}
