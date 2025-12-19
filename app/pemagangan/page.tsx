import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import Link from 'next/link'
import { MapPin, Briefcase, Building2, Calendar } from 'lucide-react'

const dummyInternships = [
    {
        id: 1,
        title: "Program Magang Operator Produksi",
        company: "PT. Manufacturing Indonesia",
        location: "Kawasan MM2100",
        duration: "6 Bulan",
        type: "Dalam Negeri",
        image: "https://images.unsplash.com/photo-1565514020176-02221b2d076f?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 2,
        title: "Magang Konstruksi Bangunan (IM Japan)",
        company: "IM Japan",
        location: "Jepang",
        duration: "3 Tahun",
        type: "Luar Negeri",
        image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 3,
        title: "Magang Staff Administrasi",
        company: "PT. Logistics Solution",
        location: "Jababeka",
        duration: "3 Bulan",
        type: "Dalam Negeri",
        image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 4,
        title: "Caregiver (Perawat Lansia)",
        company: "Hinode Welfare",
        location: "Jepang",
        duration: "3 Tahun",
        type: "Luar Negeri",
        image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80"
    }
]

export default function PemaganganPage() {
    return (
        <div className="bg-white text-slate-800 antialiased min-h-screen flex flex-col font-sans">
            <PublicNavbar />

            <main className="flex-grow">
                <div className="bg-slate-900 py-16 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-900/20"></div>
                    <div className="container mx-auto px-4 relative z-10">
                        <h1 className="text-4xl font-bold mb-4">Program Pemagangan</h1>
                        <p className="text-slate-300 max-w-2xl mx-auto text-lg">
                            Raih pengalaman kerja profesional di perusahaan dalam dan luar negeri melalui program magang resmi.
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 lg:px-8 py-12">

                    <div className="flex flex-wrap gap-4 mb-8">
                        <select className="border rounded-md px-4 py-2 text-sm bg-white">
                            <option>Semua Lokasi</option>
                            <option>Dalam Negeri</option>
                            <option>Luar Negeri (Jepang)</option>
                        </select>
                        <button className="bg-emerald-600 text-white px-6 py-2 rounded-md text-sm font-bold ml-auto">Cari Lowongan</button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {dummyInternships.map((item) => (
                            <div key={item.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row gap-6 items-start group">
                                <div className="w-full sm:w-40 h-32 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                                </div>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border mb-2 inline-block ${item.type === 'Luar Negeri' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                {item.type}
                                            </span>
                                            <h3 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-blue-700">{item.title}</h3>
                                            <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                                                <Building2 size={14} className="text-slate-400" /> {item.company}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 text-xs text-slate-500 border-t pt-3 mt-1">
                                        <div className="flex items-center gap-1"><MapPin size={12} /> {item.location}</div>
                                        <div className="flex items-center gap-1"><Calendar size={12} /> {item.duration}</div>
                                    </div>

                                    <div className="mt-4">
                                        <Link href="#" className="inline-block bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-md font-bold text-xs transition">
                                            Lihat Detail & Daftar
                                        </Link>
                                    </div>
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
