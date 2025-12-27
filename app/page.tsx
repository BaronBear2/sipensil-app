'use client'

import React, { useState } from 'react'
import Link from 'next/link';
import {
  GraduationCap, Briefcase, FileCheck2, ArrowRight,
  UserCircle2, Building2, School
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
              PORTAL RESMI DINAS KETENAGAKERJAAN
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight tracking-tight animate-fade-in-up delay-100">
              Sistem Informasi <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                Pelayanan Sipil & Ketenagakerjaan
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl font-light leading-relaxed animate-fade-in-up delay-200">
              Platform digital terintegrasi untuk mengakses berbagai layanan ketenagakerjaan, mulai dari pelatihan kompetensi, pemagangan, hingga perizinan lembaga pelatihan.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 animate-fade-in-up delay-300">
              <button
                onClick={() => openAuth('REGISTER')}
                className="group bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] border border-blue-500 flex items-center gap-2"
              >
                Buat Akun Sekarang
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. PORTALS SECTION - Focused on Core User Types */}
      <section className="py-24 relative overflow-hidden bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Portal Layanan Terpadu</h2>
            <p className="text-slate-500 text-lg">Pilih layanan yang sesuai dengan kebutuhan Anda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">

            {/* Portal 1: Pencari Kerja */}
            <div className="group bg-white p-8 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 group-hover:rotate-3 shadow-inner">
                <UserCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Pencari Kerja</h3>
              <p className="text-slate-500 leading-relaxed mb-8">
                Tingkatkan kompetensi melalui <strong>Pelatihan BLK</strong> dan ikuti program <strong>Pemagangan</strong> (Dalam Negeri/IM Japan) untuk karir yang lebih baik.
              </p>
              <div className="flex flex-col gap-3 w-full mt-auto">
                <button
                  onClick={() => openAuth('REGISTER')}
                  className="w-full py-3 rounded-xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition flex items-center justify-center gap-2"
                >
                  <GraduationCap size={18} /> Daftar Pelatihan
                </button>
                <div className="text-xs text-slate-400 font-medium">Tersedia: Pelatihan BLK, Magang, IM Japan</div>
              </div>
            </div>

            {/* Portal 2: Perusahaan */}
            <div className="group bg-white p-8 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 group-hover:rotate-3 shadow-inner">
                <Building2 size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Perusahaan</h3>
              <p className="text-slate-500 leading-relaxed mb-8">
                Buka peluang <strong>Pemagangan</strong> di perusahaan Anda dan kelola proses administrasi serta pelaporan (Pencatatan) secara digital.
              </p>
              <div className="flex flex-col gap-3 w-full mt-auto">
                <button
                  onClick={() => openAuth('REGISTER')}
                  className="w-full py-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition flex items-center justify-center gap-2"
                >
                  <Briefcase size={18} /> Daftar Perusahaan
                </button>
                <div className="text-xs text-slate-400 font-medium">Layanan: Pencatatan Pemagangan, Seleksi</div>
              </div>
            </div>

            {/* Portal 3: LPK */}
            <div className="group bg-white p-8 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300 group-hover:rotate-3 shadow-inner">
                <School size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Lembaga Pelatihan (LPK)</h3>
              <p className="text-slate-500 leading-relaxed mb-8">
                Kelola data lembaga, sampaikan <strong>Laporan Semester</strong>, dan perbarui profil akreditasi LPK Anda dengan mudah.
              </p>
              <div className="flex flex-col gap-3 w-full mt-auto">
                <button
                  onClick={() => openAuth('REGISTER')}
                  className="w-full py-3 rounded-xl bg-orange-50 text-orange-700 font-bold hover:bg-orange-100 transition flex items-center justify-center gap-2"
                >
                  <FileCheck2 size={18} /> Portal LPK
                </button>
                <div className="text-xs text-slate-400 font-medium">Fitur: Pelaporan Online, Manajemen Data</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}