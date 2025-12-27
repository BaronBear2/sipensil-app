'use client'

import React, { useState } from 'react'
import Link from 'next/link';
import {
  GraduationCap, Briefcase, Plane, FileCheck2,
  Calendar, ArrowRight, CheckCircle2, TrendingUp, Users, Building2
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
    <div className="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col font-sans selection:bg-blue-500/20 selection:text-blue-700">

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

      {/* 1. HERO SECTION */}
      <header className="relative min-h-[600px] flex items-center overflow-hidden pt-20">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1920&q=80"
            alt="Background Office"
            className="w-full h-full object-cover"
          />
          {/* Modern Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-900/40"></div>
          {/* Abstract Shapes Decoration */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-10">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 border border-white/10 text-blue-200 text-xs font-bold mb-8 backdrop-blur-md animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              PORTAL PELAYANAN SATU PINTU
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight tracking-tight animate-fade-in-up delay-100">
              Membangun SDM <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                Kompeten & Berdaya Saing
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl font-light leading-relaxed animate-fade-in-up delay-200">
              Akses mudah pendaftaran pelatihan kerja, sertifikasi kompetensi, dan informasi lowongan magang resmi dari Dinas Ketenagakerjaan Kabupaten Bekasi.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 animate-fade-in-up delay-300">
              <button
                onClick={() => openAuth('REGISTER')}
                className="group bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] border border-blue-500 flex items-center gap-2"
              >
                Daftar Sekarang
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <Link href="/faq" className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-xl font-bold transition-all backdrop-blur-sm border border-white/10 hover:border-white/20">
                Panduan Layanan
              </Link>
            </div>

            {/* Mini Stats */}
            <div className="mt-16 flex items-center gap-8 text-slate-400 text-sm animate-fade-in-up delay-400 border-t border-white/10 pt-8">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-400" />
                <span>Resmi Dinas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-400" />
                <span>Gratis / Bersubsidi</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-400" />
                <span>Sertifikat BNSP</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. SERVICES SECTION - "Floating Cards" */}
      <section className="py-24 relative overflow-hidden">
        {/* Decorative Bg */}
        <div className="absolute rounded-full bg-blue-100 blur-3xl w-96 h-96 -left-20 top-20 opacity-50"></div>

        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Layanan Unggulan</h2>
            <p className="text-slate-500 text-lg">Kami menyediakan ekosistem layanan lengkap untuk mendukung perjalanan karir Anda dari awal hingga sukses.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Service 1 */}
            <Link href="/pelatihan" className="group bg-white p-8 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 group-hover:rotate-3 shadow-inner">
                <GraduationCap size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition">Pelatihan Kerja</h3>
              <p className="text-slate-500 leading-relaxed mb-4">Pendaftaran pelatihan berbasis kompetensi di BLK dan LPK swasta.</p>
              <span className="text-blue-600 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                Daftar Pelatihan <ArrowRight size={14} />
              </span>
            </Link>

            {/* Service 2 */}
            <Link href="/pemagangan" className="group bg-white p-8 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 group-hover:rotate-3 shadow-inner">
                <Briefcase size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-emerald-600 transition">Pemagangan</h3>
              <p className="text-slate-500 leading-relaxed mb-4">Program magang dalam dan luar negeri bersertifikat resmi perusahaan.</p>
              <span className="text-emerald-600 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                Cari Lowongan <ArrowRight size={14} />
              </span>
            </Link>

            {/* Service 3 */}
            <Link href="/pemagangan" className="group bg-white p-8 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300 group-hover:rotate-3 shadow-inner">
                <Plane size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-red-600 transition">IM Japan</h3>
              <p className="text-slate-500 leading-relaxed mb-4">Seleksi dan pelatihan intensif pra-pemberangkatan magang ke Jepang.</p>
              <span className="text-red-600 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                Info Seleksi <ArrowRight size={14} />
              </span>
            </Link>

            {/* Service 4 */}
            <Link href="#" className="group bg-white p-8 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300 group-hover:rotate-3 shadow-inner">
                <FileCheck2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-orange-600 transition">Perizinan LPK</h3>
              <p className="text-slate-500 leading-relaxed mb-4">Layanan terpadu pelaporan dan perizinan operasional LPK.</p>
              <span className="text-orange-600 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                Portal LPK <ArrowRight size={14} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. STATISTICS STRIP */}
      <section className="py-20 bg-slate-900 border-y border-slate-800 relative overflow-hidden">
        {/* Pattern styling can be added via CSS or SVG */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="text-center group">
              <div className="inline-flex p-3 rounded-full bg-slate-800 text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2 tracking-tight">1,240+</div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Peserta Terlatih</div>
            </div>
            <div className="text-center group">
              <div className="inline-flex p-3 rounded-full bg-slate-800 text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <Building2 size={24} />
              </div>
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2 tracking-tight">56</div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">LPK Terdaftar</div>
            </div>
            <div className="text-center group">
              <div className="inline-flex p-3 rounded-full bg-slate-800 text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp size={24} />
              </div>
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2 tracking-tight">82%</div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Penempatan Kerja</div>
            </div>
            <div className="text-center group">
              <div className="inline-flex p-3 rounded-full bg-slate-800 text-orange-400 mb-4 group-hover:scale-110 transition-transform">
                <Briefcase size={24} />
              </div>
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2 tracking-tight">24</div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Program Kejuruan</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. NEWS SECTION */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Berita & Informasi</h2>
              <p className="text-slate-500">Update terbaru seputar ketenagakerjaan dan pelatihan.</p>
            </div>
            <Link href="/berita" className="group flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-5 py-2.5 rounded-full transition-colors">
              Lihat Semua <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* News Item 1 */}
            <article className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="h-56 overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1544531696-60c35eb5220c?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="Pelatihan" />
                <div className="absolute top-4 right-4 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wide">Terbaru</div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-3">
                  <Calendar size={14} className="text-blue-500" /> 5 Desember 2025
                </div>
                <h3 className="font-bold text-xl text-slate-800 mb-3 leading-snug group-hover:text-blue-600 transition-colors">
                  Pembukaan Pendaftaran Pelatihan Berbasis Kompetensi Tahap 1
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
                  Dinas Ketenagakerjaan kembali membuka kesempatan bagi masyarakat untuk mengikuti pelatihan kerja gratis di BLK Kabupaten Bekasi...
                </p>
                <Link href="#" className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Baca Selengkapnya <ArrowRight size={16} />
                </Link>
              </div>
            </article>

            {/* News Item 2 */}
            <article className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="h-56 overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="Magang Jepang" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-3">
                  <Calendar size={14} className="text-blue-500" /> 2 Desember 2025
                </div>
                <h3 className="font-bold text-xl text-slate-800 mb-3 leading-snug group-hover:text-blue-600 transition-colors">
                  Sosialisasi Program Pemagangan ke Jepang (IM Japan)
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
                  Dalam rangka meningkatkan kompetensi tenaga kerja muda, Disnaker mengadakan sosialisasi program magang ke Jepang...
                </p>
                <Link href="#" className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Baca Selengkapnya <ArrowRight size={16} />
                </Link>
              </div>
            </article>

            {/* News Item 3 */}
            <article className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="h-56 overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="Rapat LPK" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-3">
                  <Calendar size={14} className="text-blue-500" /> 28 November 2025
                </div>
                <h3 className="font-bold text-xl text-slate-800 mb-3 leading-snug group-hover:text-blue-600 transition-colors">
                  Rapat Koordinasi Lembaga Pelatihan Kerja Swasta
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
                  Kegiatan rutin untuk menyamakan persepsi dan standar mutu pelatihan di seluruh LPK yang terdaftar di Kabupaten Bekasi...
                </p>
                <Link href="#" className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Baca Selengkapnya <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}