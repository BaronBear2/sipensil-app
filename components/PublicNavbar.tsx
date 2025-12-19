'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, Search, LogIn, Menu, ChevronDown } from 'lucide-react'
import logoSipensil from '@/assets/logo/logo-sipensil.jpeg'
import logoPemkab from '@/assets/logo/logo-pemkabbek.jpeg'
import Modal from '@/components/ui/Modal'
import AuthModalContent from '@/components/auth/AuthModalContent'

export default function PublicNavbar() {
    const [isAuthModalOpen, setAuthModalOpen] = useState(false)
    const [authView, setAuthView] = useState<'LOGIN' | 'REGISTER'>('LOGIN')

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

            {/* 1. TOP BAR */}
            <div className="bg-slate-900 text-slate-300 text-xs py-2 hidden md:block border-b border-slate-800">
                <div className="container mx-auto px-4 lg:px-8 flex justify-between items-center">
                    <div className="flex gap-6 font-medium">
                        <span className="flex items-center gap-2 hover:text-white transition">
                            <Phone size={14} /> (021) 889977
                        </span>
                        <span className="flex items-center gap-2 hover:text-white transition">
                            <Mail size={14} /> disnaker@bekasikab.go.id
                        </span>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/aksesibilitas" className="hover:text-white transition">Aksesibilitas</Link>
                        <span className="text-slate-600">|</span>
                        <Link href="#" className="hover:text-white transition">Peta Situs</Link>
                        <span className="text-slate-600">|</span>
                        <Link href="/faq" className="hover:text-white transition">FAQ</Link>
                    </div>
                </div>
            </div>

            {/* 2. NAVBAR */}
            <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-100">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex justify-between items-center h-20">

                        {/* Logo Area */}
                        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
                            <div className="flex items-center gap-3">
                                {/* Logo Pemkab */}
                                <Image
                                    src={logoPemkab}
                                    alt="Logo Pemkab Bekasi"
                                    className="h-10 w-auto"
                                    priority
                                />
                                <div className="border-l border-slate-300 h-8"></div>
                                {/* Logo Sipensil */}
                                <Image
                                    src={logoSipensil}
                                    alt="Logo Sipensil"
                                    className="h-10 w-auto"
                                    priority
                                />
                            </div>

                            <div className="flex flex-col">
                                <span className="font-bold text-xl text-slate-800 leading-none tracking-tight group-hover:text-blue-700 transition">SIPENSIL</span>
                                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1">Dinas Ketenagakerjaan</span>
                            </div>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600">
                            <Link href="/" className="px-4 py-2 rounded-md hover:bg-slate-50 hover:text-blue-700 transition">Beranda</Link>

                            <div className="relative group">
                                <button className="px-4 py-2 rounded-md hover:bg-slate-50 hover:text-blue-700 flex items-center gap-1 transition">
                                    Profil <ChevronDown size={14} />
                                </button>
                                {/* Dropdown */}
                                <div className="absolute top-full left-0 w-48 bg-white shadow-lg rounded-md border border-slate-100 hidden group-hover:block py-2 mt-1 origin-top-left animate-fade-in group-hover:opacity-100 transition-opacity z-50">
                                    <Link href="/profil/tentang-kami" className="block px-4 py-2 hover:bg-slate-50 text-slate-700">Tentang Kami</Link>
                                    <Link href="/profil/visi-misi" className="block px-4 py-2 hover:bg-slate-50 text-slate-700">Visi & Misi</Link>
                                    <Link href="/profil/struktur-organisasi" className="block px-4 py-2 hover:bg-slate-50 text-slate-700">Struktur Organisasi</Link>
                                </div>
                            </div>

                            <Link href="/pelatihan" className="px-4 py-2 rounded-md hover:bg-slate-50 hover:text-blue-700 transition">Pelatihan</Link>
                            <Link href="/pemagangan" className="px-4 py-2 rounded-md hover:bg-slate-50 hover:text-blue-700 transition">Pemagangan</Link>
                            <Link href="/berita" className="px-4 py-2 rounded-md hover:bg-slate-50 hover:text-blue-700 transition">Berita</Link>
                        </div>

                        {/* Action Button */}
                        <div className="flex items-center gap-3">
                            <button className="hidden md:flex p-2 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-full transition">
                                <Search size={20} />
                            </button>

                            {/* MODAL TRIGGER: LOGIN */}
                            <button
                                onClick={() => openAuth('LOGIN')}
                                className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-md font-medium text-sm transition shadow-sm flex items-center gap-2"
                            >
                                <LogIn size={16} /> Masuk
                            </button>

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
