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

                {/* 1. Kedudukan */}
                <section id="kedudukan" className="py-20">
                    <div className="container mx-auto px-4 lg:px-8">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center justify-center p-3 rounded-xl bg-blue-100 text-blue-600 mb-6">
                                <Target size={32} />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Kedudukan</h2>
                            <div className="w-20 h-1.5 bg-blue-600 rounded-full mx-auto"></div>
                        </div>

                        <div className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-sm border border-slate-200">
                            <ol className="space-y-6 list-decimal list-inside">
                                <li className="text-slate-700 leading-relaxed">
                                    Dinas merupakan unsur pelaksanan Urusan Pemerintahan yang menjadi kewenangan Daerah kabupaten di bidang tenaga kerja dan bidang transmigrasi
                                </li>
                                <li className="text-slate-700 leading-relaxed">
                                    Dinas dipimpin oleh Kepala Dinas yang berkedudukan di bawah dan tanggung jawab kepada Bupati melalui Sekretaris Daerah
                                </li>
                            </ol>
                        </div>
                    </div>
                </section>

                {/* 2. Tugas */}
                <section id="tugas" className="py-20 bg-slate-50">
                    <div className="container mx-auto px-4 lg:px-8">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center justify-center p-3 rounded-xl bg-purple-100 text-purple-600 mb-6">
                                <Workflow size={32} />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Tugas</h2>
                            <div className="w-20 h-1.5 bg-purple-600 rounded-full mx-auto"></div>
                        </div>

                        <div className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-sm border border-slate-200">
                            <p className="text-slate-700 leading-relaxed text-lg">
                                Dinas mempunyai tugas merumuskan, menyelenggarakan, membina, dan mengevaluasi penyusunan dan pelaksanaan kebijakan daerah pada bidang Urusan Ketenagakerjaan.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 3. Fungsi */}
                <section id="fungsi" className="py-20">
                    <div className="container mx-auto px-4 lg:px-8">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center justify-center p-3 rounded-xl bg-emerald-100 text-emerald-600 mb-6">
                                <CheckCircle2 size={32} />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Fungsi</h2>
                            <div className="w-20 h-1.5 bg-emerald-600 rounded-full mx-auto"></div>
                        </div>

                        <div className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-sm border border-slate-200">
                            <p className="text-slate-700 leading-relaxed mb-6">
                                Dalam menyelenggarakan tugas sebagaimana dimaksud Pasal 4, Dinas mempunyai fungsi:
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "perumusan, pengkajian dan penyusunan kebijakan teknis dan regulasi di bidang ketenagakerjaan;",
                                    "pelaksanaan tugas operasional di bidang ketenagakerjaan;",
                                    "penyelenggaran teknis administratif ketatausahaan dan arsip, kepagawaian, kehumasan, pengelolaan barang milik daerah, serta pengelolaan keuangan;",
                                    "pelaksanaan pembinaan, bimbingan teknis, monitoring, evaluasi dan pelaporan di lingkungan Dinas;",
                                    "pelaksanaan koordinasi dan kerja sama dibidang ketenagakerjaan; dan",
                                    "pelaksanaan tugas lain yang diberikan oleh Bupati sesuai dengan tugas dan fungsinya"
                                ].map((fungsi, idx) => (
                                    <li key={idx} className="flex gap-3 text-slate-700">
                                        <span className="font-bold text-emerald-600 shrink-0">{String.fromCharCode(97 + idx)}.</span>
                                        <span>{fungsi}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* 4. Struktur Organisasi */}
                <section id="struktur-organisasi" className="py-20 bg-slate-50">
                    <div className="container mx-auto px-4 lg:px-8">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center justify-center p-3 rounded-xl bg-orange-100 text-orange-600 mb-6">
                                <Users size={32} />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Struktur Organisasi</h2>
                            <div className="w-20 h-1.5 bg-orange-600 rounded-full mx-auto"></div>
                        </div>

                        <div className="max-w-6xl mx-auto bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                            <img
                                src="/assets/gambar/struktur-bagan.png"
                                alt="Struktur Organisasi Dinas Ketenagakerjaan Kabupaten Bekasi"
                                className="w-full h-auto rounded-lg"
                            />
                        </div>
                    </div>
                </section>
            </main>

            <PublicFooter />
        </div>
    )
}
