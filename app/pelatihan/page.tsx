import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import Link from 'next/link'
import { Calendar, Users, Clock, MapPin } from 'lucide-react'

// Dummy Data
const dummyTrainings = [
    {
        id: 1,
        title: "Teknisi AC Split (Air Conditioner)",
        provider: "BLK Kabupaten Bekasi",
        category: "Teknik Pendingin",
        duration: "240 JP",
        date: "15 Jan 2026",
        quota: 16,
        image: "https://images.unsplash.com/photo-1581092921461-eab62e97a783?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 2,
        title: "Operator Komputer Muda (Office)",
        provider: "LPK Cipta Karya",
        category: "TIK",
        duration: "180 JP",
        date: "20 Jan 2026",
        quota: 20,
        image: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 3,
        title: "Las SMAW 3G",
        provider: "BLK Kabupaten Bekasi",
        category: "Teknik Las",
        duration: "320 JP",
        date: "01 Feb 2026",
        quota: 16,
        image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 4,
        title: "Tata Boga: Roti dan Kue",
        provider: "BLK Kabupaten Bekasi",
        category: "Processing",
        duration: "140 JP",
        date: "05 Feb 2026",
        quota: 16,
        image: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 5,
        title: "Desain Grafis (Photoshop & Corel)",
        provider: "LPK Multimedia Center",
        category: "TIK",
        duration: "200 JP",
        date: "10 Feb 2026",
        quota: 20,
        image: "https://images.unsplash.com/photo-1626785774573-4b799312c95d?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 6,
        title: "Otomotif Sepeda Motor",
        provider: "BLK Kabupaten Bekasi",
        category: "Otomotif",
        duration: "280 JP",
        date: "15 Feb 2026",
        quota: 16,
        image: "https://images.unsplash.com/photo-1558981806-ec527fa84c3d?auto=format&fit=crop&w=600&q=80"
    }
]

export default function PelatihanPage() {
    return (
        <div className="bg-white text-slate-800 antialiased min-h-screen flex flex-col font-sans">
            <PublicNavbar />

            <main className="flex-grow">
                <div className="bg-slate-900 py-16 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-900/20"></div>
                    <div className="container mx-auto px-4 relative z-10">
                        <h1 className="text-4xl font-bold mb-4">Daftar Pelatihan Kerja</h1>
                        <p className="text-slate-300 max-w-2xl mx-auto text-lg">
                            Tingkatkan kompetensi Anda melalui berbagai program pelatihan kerja gratis di BLK dan pelatihan mandiri di LPK Swasta.
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 lg:px-8 py-12">

                    {/* Filter Section (Dummy) */}
                    <div className="flex flex-wrap gap-4 mb-8">
                        <select className="border rounded-md px-4 py-2 text-sm bg-white">
                            <option>Semua Kategori</option>
                            <option>TIK</option>
                            <option>Otomotif</option>
                            <option>Teknik Las</option>
                        </select>
                        <select className="border rounded-md px-4 py-2 text-sm bg-white">
                            <option>Semua Lokasi</option>
                            <option>BLK Bekasi</option>
                            <option>LPK Swasta</option>
                        </select>
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-bold ml-auto">Cari Pelatihan</button>
                    </div>

                    {/* Grid */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {dummyTrainings.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition group">
                                <div className="h-48 overflow-hidden relative">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-blue-700 text-xs font-bold px-2 py-1 rounded shadow-sm">
                                        {item.category}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-lg text-slate-900 mb-2 leading-snug group-hover:text-blue-700">{item.title}</h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 ">
                                        <MapPin size={14} /> {item.provider}
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-2 text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg">
                                        <div className="flex items-center gap-2"><Clock size={14} className="text-blue-500" /> {item.duration}</div>
                                        <div className="flex items-center gap-2"><Calendar size={14} className="text-emerald-500" /> {item.date}</div>
                                        <div className="flex items-center gap-2 col-span-2"><Users size={14} className="text-orange-500" /> Kuota: {item.quota} Orang</div>
                                    </div>

                                    <Link href="#" className="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold text-sm transition">
                                        Lihat Detail
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </main>

            <PublicFooter />
        </div>
    )
}
