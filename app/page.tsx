'use client'

import React, { useState } from 'react'
import Link from 'next/link';
import {
  GraduationCap, Briefcase, Plane, FileCheck2,
  Calendar, ArrowRight
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import AuthModalContent from '@/components/auth/AuthModalContent';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

export default function LandingPage() {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false)
  const [authView, setAuthView] = useState<'LOGIN' | 'REGISTER'>('LOGIN')

  const openAuth = (view: 'LOGIN' | 'REGISTER') => {
    setAuthView(view)
    setAuthModalOpen(true)
  }

  return (
    <div className="bg-white text-slate-800 antialiased min-h-screen flex flex-col font-sans">

      {/* 
         NOTE: PublicNavbar handles its own Auth Modal for the navbar Login button.
         However, the LANDING PAGE has a "Daftar Sekarang" button in the HERO section.
         We still need a way to open the Auth Modal from HERE.
         Ideally PublicNavbar could share state, but for now we can duplicate the Modal 
         OR just use the PublicNavbar import and passing props? 
         PublicNavbar as created does NOT accept props for external control.
         
         Workaround: We keep the Modal here LOCALLY for the Hero button usage.
         PublicNavbar will have its own independent Modal instance.
         This is fine for Client Components.
      */}

      {/* Local Auth Modal for Hero Button */}
      <Modal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} title={authView === 'LOGIN' ? 'Masuk' : 'Daftar'}>
        <AuthModalContent
          initialView={authView}
          onSwitch={(view) => {
            if (view === 'LOGIN' || view === 'REGISTER') setAuthView(view)
          }}
          onClose={() => setAuthModalOpen(false)}
        />
      </Modal>

      <PublicNavbar />

      {/* 3. HERO SECTION */}
      <header className="relative h-[500px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1920&q=80"
            alt="Background Office"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/70"></div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block py-1 px-3 rounded bg-blue-600/20 border border-blue-400/30 text-blue-100 text-xs font-semibold mb-4 backdrop-blur-sm">
              PORTAL PELAYANAN SATU PINTU
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
              Membangun SDM Kompeten <br />
              <span className="text-blue-400">Siap Kerja & Berdaya Saing</span>
            </h1>
            <p className="text-lg text-slate-200 mb-8 max-w-2xl font-light leading-relaxed">
              Akses mudah pendaftaran pelatihan kerja, sertifikasi kompetensi, dan informasi lowongan magang resmi dari Dinas Ketenagakerjaan.
            </p>

            <div className="flex flex-wrap gap-4">
              {/* MODAL TRIGGER: REGISTER */}
              <button
                onClick={() => openAuth('REGISTER')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-semibold transition shadow-md border border-transparent"
              >
                Daftar Sekarang
              </button>

              <Link href="/faq" className="bg-transparent hover:bg-white/10 text-white px-8 py-3 rounded-md font-semibold transition border border-white">
                Panduan Layanan
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 4. LAYANAN PUBLIK */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">Layanan Utama</h2>
            <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full"></div>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">Kami menyediakan berbagai layanan untuk mendukung pengembangan karir dan kompetensi masyarakat.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Service 1 */}
            <Link href="/pelatihan" className="bg-white p-6 rounded-lg border border-slate-200 service-card flex flex-col items-center text-center group">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <GraduationCap size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition">Pelatihan Kerja</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Pendaftaran pelatihan berbasis kompetensi di BLK dan LPK swasta.</p>
            </Link>

            {/* Service 2 */}
            <Link href="/pemagangan" className="bg-white p-6 rounded-lg border border-slate-200 service-card flex flex-col items-center text-center group">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <Briefcase size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-emerald-700 transition">Pemagangan</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Program magang dalam dan luar negeri bersertifikat resmi.</p>
            </Link>

            {/* Service 3 */}
            <Link href="/pemagangan" className="bg-white p-6 rounded-lg border border-slate-200 service-card flex flex-col items-center text-center group">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-5 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                <Plane size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-red-700 transition">IM Japan</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Seleksi dan pelatihan pra-pemberangkatan magang ke Jepang.</p>
            </Link>

            {/* Service 4 */}
            <Link href="#" className="bg-white p-6 rounded-lg border border-slate-200 service-card flex flex-col items-center text-center group">
              <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mb-5 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                <FileCheck2 size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-orange-700 transition">Perizinan LPK</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Layanan pelaporan dan perizinan untuk Lembaga Pelatihan Kerja.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. STATISTIK */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-700 mb-1">1,240+</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Peserta Terlatih</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-700 mb-1">56</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">LPK Terdaftar</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-700 mb-1">82%</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tingkat Penempatan</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-700 mb-1">24</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Program Kejuruan</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BERITA TERKINI */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Berita & Informasi</h2>
            <Link href="/berita" className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1">
              Arsip Berita <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* News Item 1 */}
            <article className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition group">
              <div className="h-48 overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1544531696-60c35eb5220c?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="Pelatihan" />
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 m-3 rounded">Terbaru</div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <Calendar size={12} /> 5 Desember 2025
                </div>
                <h3 className="font-bold text-lg text-slate-800 mb-3 leading-snug group-hover:text-blue-700 transition">
                  Pembukaan Pendaftaran Pelatihan Berbasis Kompetensi Tahap 1
                </h3>
                <p className="text-sm text-slate-500 line-clamp-3 mb-4">
                  Dinas Ketenagakerjaan kembali membuka kesempatan bagi masyarakat untuk mengikuti pelatihan kerja gratis di BLK Kabupaten Bekasi...
                </p>
                <Link href="#" className="text-blue-600 text-sm font-semibold hover:underline">Baca Selengkapnya</Link>
              </div>
            </article>

            {/* News Item 2 */}
            <article className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition group">
              <div className="h-48 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="Magang Jepang" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <Calendar size={12} /> 2 Desember 2025
                </div>
                <h3 className="font-bold text-lg text-slate-800 mb-3 leading-snug group-hover:text-blue-700 transition">
                  Sosialisasi Program Pemagangan ke Jepang (IM Japan)
                </h3>
                <p className="text-sm text-slate-500 line-clamp-3 mb-4">
                  Dalam rangka meningkatkan kompetensi tenaga kerja muda, Disnaker mengadakan sosialisasi program magang ke Jepang...
                </p>
                <Link href="#" className="text-blue-600 text-sm font-semibold hover:underline">Baca Selengkapnya</Link>
              </div>
            </article>

            {/* News Item 3 */}
            <article className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition group">
              <div className="h-48 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="Rapat LPK" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <Calendar size={12} /> 28 November 2025
                </div>
                <h3 className="font-bold text-lg text-slate-800 mb-3 leading-snug group-hover:text-blue-700 transition">
                  Rapat Koordinasi Lembaga Pelatihan Kerja Swasta
                </h3>
                <p className="text-sm text-slate-500 line-clamp-3 mb-4">
                  Kegiatan rutin untuk menyamakan persepsi dan standar mutu pelatihan di seluruh LPK yang terdaftar di Kabupaten Bekasi...
                </p>
                <Link href="#" className="text-blue-600 text-sm font-semibold hover:underline">Baca Selengkapnya</Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}