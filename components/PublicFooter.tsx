'use client'

import React from 'react'
import Image from 'next/image'
import logoSipensil from '@/assets/logo/logo-sipensil.jpeg'
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail, ExternalLink, Heart } from 'lucide-react'
import Link from 'next/link'

export default function PublicFooter() {
    return (
        <footer className="bg-slate-950 text-slate-400 pt-20 pb-10 border-t border-slate-900 mt-auto relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600"></div>
            <div className="absolute -top-[500px] -left-[500px] w-[1000px] h-[1000px] bg-blue-900/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="container mx-auto px-4 lg:px-8 relative z-10">
                <div className="grid md:grid-cols-12 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="md:col-span-5 space-y-6">
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
                        <p className="text-slate-400 leading-relaxed max-w-md">
                            Portal layanan terpadu untuk pengembangan kompetensi, perluasan kesempatan kerja, dan pelayanan ketenagakerjaan yang transparan dan akuntabel.
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

                    {/* Links Section */}
                    <div className="md:col-span-3">
                        <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-blue-600 inline-block"></span> Tautan
                        </h4>
                        <ul className="space-y-4">
                            {[
                                { label: 'Beranda', href: '/' },
                                { label: 'Profil Dinas', href: '/profil/tentang-kami' },
                                { label: 'Pelatihan BLK', href: '/pelatihan' },
                                { label: 'Info Pasar Kerja', href: '/berita' },
                                { label: 'Regulasi & Unduhan', href: '#' }
                            ].map((link, idx) => (
                                <li key={idx}>
                                    <Link href={link.href} className="flex items-center gap-2 hover:text-blue-400 transition-colors group">
                                        <ExternalLink size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div className="md:col-span-4">
                        <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-blue-600 inline-block"></span> Kontak
                        </h4>
                        <ul className="space-y-5">
                            <li className="flex gap-4 items-start group">
                                <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-blue-500 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                    <MapPin size={18} />
                                </div>
                                <div className="text-sm leading-relaxed">
                                    <span className="block text-white font-semibold mb-1">Alamat Kantor</span>
                                    Komplek Perkantoran Pemkab Bekasi,<br />Desa Sukamahi, Kec. Cikarang Pusat.
                                </div>
                            </li>
                            <li className="flex gap-4 items-center group">
                                <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-blue-500 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                    <Phone size={18} />
                                </div>
                                <div className="text-sm">
                                    <span className="block text-white font-semibold mb-1">Telepon</span>
                                    (021) 889977
                                </div>
                            </li>
                            <li className="flex gap-4 items-center group">
                                <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-blue-500 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                    <Mail size={18} />
                                </div>
                                <div className="text-sm">
                                    <span className="block text-white font-semibold mb-1">Email</span>
                                    disnaker@bekasikab.go.id
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
                    <p className="text-slate-500">&copy; 2025 Dinas Ketenagakerjaan Kabupaten Bekasi. All rights reserved.</p>
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
