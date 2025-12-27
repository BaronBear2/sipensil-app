'use client'

import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import { CheckCircle2, Target, Users, Workflow } from 'lucide-react'

export default function ProfilDinasPage() {
    return (
        <div className="bg-white text-slate-800 antialiased min-h-screen flex flex-col font-sans">
            <PublicNavbar />

            <main className="flex-grow">
                {/* Header */}
                <div className="bg-slate-900 text-white py-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-900/20"></div>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
                        <span className="text-blue-400 font-bold tracking-widest uppercase text-sm mb-3 block">Profil Instansi</span>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Dinas Ketenagakerjaan</h1>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg">Mewujudkan tenaga kerja yang kompeten, produktif, dan berdaya saing di Kabupaten Bekasi.</p>
                    </div>
                </div>

                {/* 1. Visi & Misi */}
                <section id="visi-misi" className="py-20">
                    <div className="container mx-auto px-4 lg:px-8">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center justify-center p-3 rounded-xl bg-blue-100 text-blue-600 mb-6">
                                <Target size={32} />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Visi & Misi</h2>
                            <div className="w-20 h-1.5 bg-blue-600 rounded-full mx-auto"></div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                                <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm">V</span>
                                    Visi
                                </h3>
                                <p className="text-slate-600 leading-relaxed italic text-lg">
                                    "Terwujudnya Tenaga Kerja yang Kompeten, Produktif, dan Sejahtera dalam Hubungan Industrial yang Harmonis."
                                </p>
                            </div>
                            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                                <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm">M</span>
                                    Misi
                                </h3>
                                <ul className="space-y-4">
                                    {[
                                        "Meningkatkan kompetensi dan produktivitas tenaga kerja melalui pelatihan kerja.",
                                        "Memperluas kesempatan kerja dan pelayanan penempatan tenaga kerja.",
                                        "Mewujudkan hubungan industrial yang harmonis, dinamis, dan berkeadilan.",
                                        "Meningkatkan perlindungan dan kesejahteraan tenaga kerja."
                                    ].map((misi, idx) => (
                                        <li key={idx} className="flex gap-3 text-slate-600">
                                            <CheckCircle2 size={20} className="text-blue-500 shrink-0 mt-0.5" />
                                            <span>{misi}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Tugas & Fungsi */}
                <section id="tugas-fungsi" className="py-20 bg-slate-50">
                    <div className="container mx-auto px-4 lg:px-8">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center justify-center p-3 rounded-xl bg-purple-100 text-purple-600 mb-6">
                                <Workflow size={32} />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Tugas & Fungsi</h2>
                            <div className="w-20 h-1.5 bg-purple-600 rounded-full mx-auto"></div>
                        </div>

                        <div className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-sm border border-slate-200">
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Tugas Pokok</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Fungsi</h3>
                                <ul className="grid md:grid-cols-2 gap-4">
                                    {[
                                        "Perumusan kebijakan teknis bidang ketenagakerjaan.",
                                        "Pelaksanaan pelayanan umum di bidang ketenagakerjaan.",
                                        "Pembinaan dan pelaksanaan tugas di bidang pelatihan dan produktivitas.",
                                        "Pembinaan dan pelaksanaan tugas di bidang penempatan tenaga kerja.",
                                        "Pembinaan dan pelaksanaan tugas di bidang hubungan industrial.",
                                        "Pelaksanaan administrasi dinas."
                                    ].map((fungsi, idx) => (
                                        <li key={idx} className="flex gap-3 text-slate-600 text-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"></div>
                                            <span>{fungsi}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Struktur Organisasi */}
                <section id="struktur-organisasi" className="py-20">
                    <div className="container mx-auto px-4 lg:px-8">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center justify-center p-3 rounded-xl bg-orange-100 text-orange-600 mb-6">
                                <Users size={32} />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Struktur Organisasi</h2>
                            <div className="w-20 h-1.5 bg-orange-600 rounded-full mx-auto"></div>
                        </div>

                        <div className="max-w-5xl mx-auto bg-slate-900 rounded-3xl p-8 md:p-16 flex items-center justify-center min-h-[400px] border border-slate-800 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                            <div className="text-center relative z-10">
                                <p className="text-slate-400 mb-4 uppercase tracking-widest text-sm">Bagan Struktur Organisasi</p>
                                <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">Coming Soon</h3>
                                <p className="text-slate-500 max-w-lg mx-auto">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Struktur organisasi sedang dalam proses pembaruan data.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <PublicFooter />
        </div>
    )
}
