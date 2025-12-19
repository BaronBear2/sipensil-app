import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'

export default function StrukturOrgPage() {
    return (
        <div className="bg-white text-slate-800 antialiased min-h-screen flex flex-col font-sans">
            <PublicNavbar />

            <main className="flex-grow">
                <div className="bg-slate-50 py-12 border-b border-slate-100">
                    <div className="container mx-auto px-4 lg:px-8 text-center">
                        <h1 className="text-3xl font-bold text-slate-800 mb-4">Struktur Organisasi</h1>
                        <p className="text-slate-500 max-w-2xl mx-auto">Susunan organisasi Dinas Ketenagakerjaan Kabupaten Bekasi.</p>
                    </div>
                </div>

                <div className="container mx-auto px-4 lg:px-8 py-16">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
                        <p className="text-slate-500 mb-8 font-medium">Bagan Struktur Organisasi</p>
                        {/* Placeholder Image - In real app, upload proper chart */}
                        <div className="aspect-[16/9] bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-200">
                            <div className="text-center p-8">
                                <p className="text-slate-400 font-bold text-lg mb-2">Gambar Bagan Struktur Organisasi</p>
                                <p className="text-slate-400 text-sm">(Silakan hubungi Admin untuk memperbarui gambar ini)</p>
                            </div>
                        </div>

                        <div className="mt-12 text-left max-w-3xl mx-auto">
                            <h3 className="text-xl font-bold text-slate-800 mb-4">Pejabat Struktural</h3>
                            <ul className="space-y-4">
                                <li className="flex justify-between border-b border-slate-100 pb-2">
                                    <span className="font-semibold text-slate-700">Kepala Dinas</span>
                                    <span className="text-slate-600">Drs. H. Edi Rochyadi, MM</span>
                                </li>
                                <li className="flex justify-between border-b border-slate-100 pb-2">
                                    <span className="font-semibold text-slate-700">Sekretaris Dinas</span>
                                    <span className="text-slate-600">Nur Hidayah, S.Sos</span>
                                </li>
                                <li className="flex justify-between border-b border-slate-100 pb-2">
                                    <span className="font-semibold text-slate-700">Kabid Penempatan Tenaga Kerja</span>
                                    <span className="text-slate-600">Budi Santoso, SE</span>
                                </li>
                                <li className="flex justify-between border-b border-slate-100 pb-2">
                                    <span className="font-semibold text-slate-700">Kabid Pelatihan & Produktivitas</span>
                                    <span className="text-slate-600">Ratna Sari, M.Pd</span>
                                </li>
                                <li className="flex justify-between border-b border-slate-100 pb-2">
                                    <span className="font-semibold text-slate-700">Kabid Hubungan Industrial</span>
                                    <span className="text-slate-600">Ahmad Fauzi, SH</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    )
}
