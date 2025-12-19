import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import Image from 'next/image'

export default function TentangKamiPage() {
    return (
        <div className="bg-white text-slate-800 antialiased min-h-screen flex flex-col font-sans">
            <PublicNavbar />

            <main className="flex-grow">
                <div className="bg-slate-50 py-12 border-b border-slate-100">
                    <div className="container mx-auto px-4 lg:px-8 text-center">
                        <h1 className="text-3xl font-bold text-slate-800 mb-4">Tentang Kami</h1>
                        <p className="text-slate-500 max-w-2xl mx-auto">Mengenal lebih dekat Dinas Ketenagakerjaan Kabupaten Bekasi.</p>
                    </div>
                </div>

                <div className="container mx-auto px-4 lg:px-8 py-16">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="mb-6">
                                <span className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-2 block">Profil Instansi</span>
                                <h2 className="text-3xl font-bold text-slate-900 leading-tight mb-4">
                                    Dinas Ketenagakerjaan <br />Kabupaten Bekasi
                                </h2>
                                <div className="w-20 h-1.5 bg-blue-600 rounded-full mb-6"></div>
                            </div>

                            <div className="space-y-4 text-slate-600 leading-relaxed">
                                <p>
                                    Dinas Ketenagakerjaan (Disnaker) Kabupaten Bekasi merupakan unsur pelaksana urusan pemerintahan bidang tenaga kerja yang menjadi kewenangan daerah. Disnaker mempunyai tugas membantu Bupati melaksanakan urusan pemerintahan yang menjadi kewenangan daerah di bidang tenaga kerja serta tugas pembantuan yang diberikan kepada daerah.
                                </p>
                                <p>
                                    Kami berkomitmen untuk mewujudkan tenaga kerja yang kompeten, produktif, dan sejahtera melalui berbagai program pelatihan, pemagangan, dan perluasan kesempatan kerja. Selain itu, kami juga berupaya menciptakan hubungan industrial yang harmonis, dinamis, dan berkeadilan.
                                </p>
                                <p>
                                    Melalui sistem informasi **SIPENSIL**, kami berupaya mendekatkan pelayanan kepada masyarakat dengan digitalisasi layanan pendaftaran pelatihan, pencatatan perselisihan, dan layanan ketenagakerjaan lainnya.
                                </p>
                            </div>
                        </div>

                        <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
                                alt="Kantor Disnaker"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply"></div>
                        </div>
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    )
}
