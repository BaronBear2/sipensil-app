'use client'

import React from 'react'
import Image from 'next/image'
import logoSipensil from '@/assets/logo/logo-sipensil.jpeg'
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from 'lucide-react'

export default function PublicFooter() {
    return (
        <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 border-t border-slate-800 mt-auto">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    {/* Kolom 1 */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-white p-1 rounded">
                                <Image
                                    src={logoSipensil}
                                    alt="Logo Sipensil"
                                    className="h-8 w-auto" // Slightly smaller for footer
                                />
                            </div>
                            <div>
                                <span className="block font-bold text-xl text-white">SIPENSIL</span>
                                <span className="text-xs uppercase tracking-wider">Dinas Ketenagakerjaan</span>
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed mb-6 max-w-sm">
                            Sistem Informasi Pendaftaran dan Pencatatan Pelatihan Kompetensi, Wirausaha, dan Pengembangan Karir Terpadu.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-slate-400 hover:text-white transition"><Facebook size={20} /></a>
                            <a href="#" className="text-slate-400 hover:text-white transition"><Instagram size={20} /></a>
                            <a href="#" className="text-slate-400 hover:text-white transition"><Twitter size={20} /></a>
                            <a href="#" className="text-slate-400 hover:text-white transition"><Youtube size={20} /></a>
                        </div>
                    </div>

                    {/* Kolom 2 */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wide">Tautan Cepat</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="/" className="hover:text-white transition">Beranda</a></li>
                            <li><a href="/profil/tentang-kami" className="hover:text-white transition">Profil Dinas</a></li>
                            <li><a href="/pelatihan" className="hover:text-white transition">Pelatihan BLK</a></li>
                            <li><a href="/berita" className="hover:text-white transition">Pasar Kerja / Info</a></li>
                            <li><a href="#" className="hover:text-white transition">Unduhan</a></li>
                        </ul>
                    </div>

                    {/* Kolom 3 */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wide">Kontak Kami</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex gap-3 items-start">
                                <MapPin className="shrink-0 mt-1" size={16} />
                                <span>Komplek Perkantoran Pemkab Bekasi, Desa Sukamahi, Kec. Cikarang Pusat.</span>
                            </li>
                            <li className="flex gap-3 items-center">
                                <Phone className="shrink-0" size={16} />
                                <span>(021) 889977</span>
                            </li>
                            <li className="flex gap-3 items-center">
                                <Mail className="shrink-0" size={16} />
                                <span>disnaker@bekasikab.go.id</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
                    <p>&copy; 2025 Dinas Ketenagakerjaan Kabupaten Bekasi. Hak Cipta Dilindungi Undang-Undang.</p>
                </div>
            </div>
        </footer>
    )
}
