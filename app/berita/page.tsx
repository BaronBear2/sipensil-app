import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import Link from 'next/link'
import { Calendar, User, ArrowRight } from 'lucide-react'

const dummyNews = [
    {
        id: 1,
        title: "Pembukaan Pendaftaran Pelatihan Berbasis Kompetensi Tahap 1",
        date: "5 Desember 2025",
        author: "Admin Disnaker",
        category: "Pelatihan",
        summary: "Dinas Ketenagakerjaan kembali membuka kesempatan bagi masyarakat untuk mengikuti pelatihan kerja gratis di BLK Kabupaten Bekasi.",
        image: "https://images.unsplash.com/photo-1544531696-60c35eb5220c?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 2,
        title: "Sosialisasi Program Pemagangan ke Jepang (IM Japan)",
        date: "2 Desember 2025",
        author: "Bidang Pelatihan",
        category: "Magang",
        summary: "Dalam rangka meningkatkan kompetensi tenaga kerja muda, Disnaker mengadakan sosialisasi program magang ke Jepang tahun 2025.",
        image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 3,
        title: "Rapat Koordinasi Lembaga Pelatihan Kerja Swasta",
        date: "28 November 2025",
        author: "Admin Disnaker",
        category: "Kelembagaan",
        summary: "Kegiatan rutin untuk menyamakan persepsi dan standar mutu pelatihan di seluruh LPK yang terdaftar di Kabupaten Bekasi.",
        image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 4,
        title: "Job Fair Kabupaten Bekasi 2025 Akan Segera Digelar",
        date: "20 November 2025",
        author: "Admin Disnaker",
        category: "Bursa Kerja",
        summary: "Pemerintah Kabupaten Bekasi melalui Disnaker akan menggelar bursa kerja terbesar tahun ini dengan menghadirkan 50 perusahaan.",
        image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80"
    }
]

export default function BeritaPage() {
    return (
        <div className="bg-white text-slate-800 antialiased min-h-screen flex flex-col font-sans">
            <PublicNavbar />

            <main className="flex-grow">
                <div className="bg-slate-50 py-12 border-b border-slate-100">
                    <div className="container mx-auto px-4 lg:px-8 text-center">
                        <h1 className="text-3xl font-bold text-slate-800 mb-4">Berita & Artikel</h1>
                        <p className="text-slate-500 max-w-2xl mx-auto">Informasi terkini seputar ketenagakerjaan di Kabupaten Bekasi.</p>
                    </div>
                </div>

                <div className="container mx-auto px-4 lg:px-8 py-16">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {dummyNews.map((news) => (
                            <article key={news.id} className="flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition duration-300">
                                <div className="h-56 overflow-hidden relative">
                                    <img src={news.image} alt={news.title} className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                                    <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded">
                                        {news.category}
                                    </div>
                                </div>
                                <div className="p-6 flex-grow flex flex-col">
                                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                                        <div className="flex items-center gap-1"><Calendar size={12} /> {news.date}</div>
                                        <div className="flex items-center gap-1"><User size={12} /> {news.author}</div>
                                    </div>
                                    <h3 className="font-bold text-xl text-slate-800 mb-3 leading-tight hover:text-blue-700 cursor-pointer">
                                        {news.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-grow">
                                        {news.summary}
                                    </p>
                                    <Link href="#" className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:gap-3 transition-all mt-auto">
                                        Baca Selengkapnya <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    )
}
