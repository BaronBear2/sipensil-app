import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'

export default function VisiMisiPage() {
    return (
        <div className="bg-white text-slate-800 antialiased min-h-screen flex flex-col font-sans">
            <PublicNavbar />

            <main className="flex-grow">
                <div className="bg-slate-50 py-12 border-b border-slate-100">
                    <div className="container mx-auto px-4 lg:px-8 text-center">
                        <h1 className="text-3xl font-bold text-slate-800 mb-4">Visi & Misi</h1>
                        <p className="text-slate-500 max-w-2xl mx-auto">Arah dan tujuan pembangunan ketenagakerjaan Kabupaten Bekasi.</p>
                    </div>
                </div>

                <div className="container mx-auto px-4 lg:px-8 py-16">
                    <div className="max-w-4xl mx-auto">

                        {/* Visi */}
                        <div className="mb-16 bg-blue-50/50 p-8 rounded-2xl border border-blue-100">
                            <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center uppercase tracking-wide">Visi</h2>
                            <p className="text-xl md:text-2xl text-center text-slate-700 font-serif italic leading-relaxed">
                                "Terwujudnya Tenaga Kerja Kabupaten Bekasi yang Kompeten, Produktif, Berdaya Saing, dan Sejahtera dalam Hubungan Industrial yang Harmonis."
                            </p>
                        </div>

                        {/* Misi */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center uppercase tracking-wide">Misi</h2>
                            <div className="grid gap-6">
                                {[
                                    "Meningkatkan kualitas dan kompetensi tenaga kerja melalui pelatihan kerja yang berbasis kompetensi dan kebutuhan pasar kerja.",
                                    "Memperluas kesempatan kerja dan pelayanan penempatan tenaga kerja yang transparan dan akuntabel.",
                                    "Menciptakan hubungan industrial yang harmonis, dinamis, dan berkeadilan serta meningkatkan kesejahteraan pekerja.",
                                    "Meningkatkan perlindungan tenaga kerja dan pengawasan ketenagakerjaan.",
                                    "Mewujudkan tata kelola pemerintahan yang baik (Good Governance) dalam pelayanan ketenagakerjaan."
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-4 p-4 border border-slate-100 rounded-lg shadow-sm bg-white hover:shadow-md transition">
                                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                                            {idx + 1}
                                        </div>
                                        <p className="text-slate-600 pt-2">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    )
}
