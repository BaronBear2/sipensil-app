'use client'

import React, { useState } from 'react'
import Link from 'next/link';
import Image from 'next/image';
import {
  GraduationCap, ArrowRight, UserCircle2
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import AuthModalContent from '@/components/auth/AuthModalContent';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import bannerPemkabbek from '@/assets/logo/Pemkabbek.jpg'

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
      <header className="relative min-h-[450px] flex items-center overflow-hidden pt-20">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <Image
            src={bannerPemkabbek}
            alt="Banner pemKabbek"
            fill
            className="object-cover"
            priority
          />
          {/* Modern Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/95 to-slate-900/80"></div>
          {/* Abstract Shapes Decoration */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-8 pb-8">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 border border-white/10 text-blue-200 text-xs font-bold mb-6 backdrop-blur-md animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              PORTAL RESMI DINAS KETENAGAKERJAAN KABUPATEN BEKASI
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight animate-fade-in-up delay-100">
              Sistem Informasi <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                Pencatatan Pelatihan Kompetensi Softskill & Hardskill
              </span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base md:text-lg text-slate-300 mb-8 max-w-2xl font-light leading-relaxed animate-fade-in-up delay-200">
              Platform digital terintegrasi untuk layanan pelatihan kompetensi ketenagakerjaan, mulai dari proses pendaftaran hingga ujian sertifikasi kompetensi.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 animate-fade-in-up delay-300">
              <button
                onClick={() => openAuth('REGISTER')}
                className="w-full sm:w-auto group bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] border border-blue-500 flex items-center justify-center gap-2"
              >
                Buat Akun Sekarang
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. PORTALS SECTION - Focused on Core User Types */}
      <section className="py-16 relative overflow-hidden bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 tracking-tight">Portal Layanan Terpadu</h2>
            <p className="text-slate-500">Pilih layanan yang sesuai dengan kebutuhan Anda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 max-w-md mx-auto">

            {/* Portal 1: Pencari Kerja */}
            <div className="group bg-white p-8 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 group-hover:rotate-3 shadow-inner">
                <UserCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Pencari Kerja</h3>
              <p className="text-slate-500 leading-relaxed mb-8">
                Tingkatkan kompetensi melalui <strong>Pelatihan BLK</strong> untuk karir yang lebih baik.
              </p>
              <div className="flex flex-col gap-3 w-full mt-auto">
                <button
                  onClick={() => openAuth('REGISTER')}
                  className="w-full py-3 rounded-xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition flex items-center justify-center gap-2"
                >
                  <GraduationCap size={18} /> Daftar Pelatihan
                </button>
                <div className="text-xs text-slate-400 font-medium">Tersedia: Pendaftaran Pelatihan BLK</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}