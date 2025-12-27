'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import logoSipensil from '@/assets/logo/logo-sipensil.jpeg'
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail, ExternalLink, Heart, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { getPublicActiveTrainings } from '@/actions/public'

export default function PublicFooter() {
    const [trainings, setTrainings] = useState<any[]>([])

    useEffect(() => {
        const fetchTrainings = async () => {
            const data = await getPublicActiveTrainings()
            if (data) setTrainings(data)
        }
        fetchTrainings()
    }, [])

    return (
        <footer className="bg-slate-950 text-slate-400 pt-20 pb-10 border-t border-slate-900 mt-auto relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600"></div>
            <div className="absolute -top-[500px] -left-[500px] w-[1000px] h-[1000px] bg-blue-900/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="container mx-auto px-4 lg:px-8 relative z-10">
                <div className="grid md:grid-cols-12 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="md:col-span-4 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-1.5 rounded-lg shadow-lg shadow-blue-900/20">
                                <Image
                                    src={logoSipensil}
                                    alt="Logo Sipensil"
                                    className="h-10 w-auto"
                                />
                            </div>
                            <div>
                                <h3 className="font-bold text-2xl text-white tracking-tight">SIPENSIL</h3>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Dinas Ketenagakerjaan</p>
                            </div>
                        </div>
                        <p className="text-slate-400 leading-relaxed max-w-sm">
                            Portal layanan terpadu untuk pengembangan kompetensi, perluasan kesempatan kerja, dan pelayanan ketenagakerjaan yang transparan dan akuntabel di Kabupaten Bekasi.
                        </p>
                        <div className="flex gap-4 pt-2">
                            {[
                                { icon: Facebook, href: '#' },
                                { icon: Instagram, href: '#' },
                                { icon: Twitter, href: '#' },
                                { icon: Youtube, href: '#' }
                            ].map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.href}
                                    className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-300 hover:scale-110 shadow-lg shadow-black/20"
                                >
                                    <social.icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Section: Profil Dinas */}
                    <div className="md:col-span-2">
                        <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-blue-600 inline-block"></span> Menu
                        </h4>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/profil/tentang-kami" className="flex items-center gap-2 hover:text-blue-400 transition-colors group text-sm">
                                    <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-blue-500" />
                                    Profil Dinas
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Links Section: Pelatihan BLK (Dynamic) */}
                    <div className="md:col-span-3">
                        <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-green-500 inline-block"></span> Pelatihan Aktif
                        </h4>
                        {trainings.length > 0 ? (
                            <ul className="space-y-4">
                                {trainings.map((t) => (
                                    <li key={t.id}>
                                        <Link href={`/pelatihan/${t.id}`} className="flex items-start gap-2 hover:text-green-400 transition-colors group text-sm leading-tight">
                                            <ChevronRight size={14} className="mt-0.5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-green-500 shrink-0" />
                                            <span className="line-clamp-2">{t.title}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-600 italic">Belum ada pelatihan aktif saat ini.</p>
                        )}
                        <Link href="/pelatihan" className="inline-block mt-4 text-xs font-bold text-blue-500 hover:text-blue-400 uppercase tracking-wider">
                            Lihat Semua Katalog &rarr;
                        </Link>
                    </div>

                    {/* Contact & Legal Section */}
                    <div className="md:col-span-3">
                        <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-orange-500 inline-block"></span> Kebijakan
                        </h4>
                        <ul className="space-y-3 mb-8">
                            {[
                                { label: 'Kebijakan Privasi', href: '#' },
                                { label: 'Syarat & Ketentuan', href: '#' },
                            ].map((link, idx) => (
                                <li key={idx}>
                                    <Link href={link.href} className="flex items-center gap-2 hover:text-orange-400 transition-colors group text-sm">
                                        <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-orange-500" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <div className="space-y-4">
                            <div className="flex gap-3 items-start group">
                                <MapPin size={16} className="text-slate-500 mt-1 shrink-0 group-hover:text-blue-500 transition-colors" />
                                <div className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors">
                                    Komplek Perkantoran Pemkab Bekasi,<br />Desa Sukamahi, Kec. Cikarang Pusat.
                                </div>
                            </div>
                            <div className="flex gap-3 items-center group">
                                <Phone size={16} className="text-slate-500 shrink-0 group-hover:text-blue-500 transition-colors" />
                                <span className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors">(021) 889977</span>
                            </div>
                            <div className="flex gap-3 items-center group">
                                <Mail size={16} className="text-slate-500 shrink-0 group-hover:text-blue-500 transition-colors" />
                                <span className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors">disnaker@bekasikab.go.id</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
                    <p className="text-slate-500">&copy; 2025 Dinas Ketenagakerjaan Kabupaten Bekasi. Hak Cipta Dilindungi Undang-Undang.</p>
                    <div className="flex items-center gap-1 text-slate-600">
                        <span>Made with</span>
                        <Heart size={10} className="text-red-600 fill-red-600 animate-pulse" />
                        <span>for Bekasi</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
