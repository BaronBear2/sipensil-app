import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'

const faqs = [
    {
        q: "Bagaimana cara mendaftar pelatihan kerja di BLK?",
        a: "Anda dapat mendaftar dengan membuat akun sebagai Pencari Kerja (Pencaker) di SIPENSIL. Setelah login, pilih menu 'Pelatihan', cari pelatihan yang diinginkan, dan klik tombol 'Daftar'."
    },
    {
        q: "Apakah pelatihan di BLK dipungut biaya?",
        a: "Tidak. Seluruh pelatihan berbasis APBD/APBN yang diselenggarakan di UPTD BLK Kabupaten Bekasi adalah GRATIS (tidak dipungut biaya apapun)."
    },
    {
        q: "Apa saja persyaratan pendaftaran?",
        a: "Umumnya persyaratan meliputi: KTP Kabupaten Bekasi, ijazah terakhir, pas foto, dan kartu AK-1 (Kartu Kuning). Detail persyaratan dapat dilihat pada halaman detail masing-masing pelatihan."
    },
    {
        q: "Bagaimana jika saya lupa password akun saya?",
        a: "Silakan gunakan fitur 'Lupa Password' pada halaman Login. Link reset password akan dikirimkan ke email yang Anda daftarkan."
    },
    {
        q: "Apakah saya akan langsung disalurkan kerja setelah lulus pelatihan?",
        a: "Disnaker dan BLK berupaya memfasilitasi penempatan kerja melalui kerjasama dengan perusahaan dan info lowongan kerja. Namun, penerimaan kerja sepenuhnya merupakan hak prerogatif perusahaan pengguna."
    }
]

export default function FAQPage() {
    return (
        <div className="bg-white text-slate-800 antialiased min-h-screen flex flex-col font-sans">
            <PublicNavbar />

            <main className="flex-grow">
                <div className="bg-slate-50 py-12 border-b border-slate-100">
                    <div className="container mx-auto px-4 lg:px-8 text-center">
                        <h1 className="text-3xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h1>
                        <p className="text-slate-500 max-w-2xl mx-auto">Pertanyaan yang sering diajukan seputar layanan SIPENSIL.</p>
                    </div>
                </div>

                <div className="container mx-auto px-4 lg:px-8 py-16">
                    <div className="max-w-3xl mx-auto space-y-6">
                        {faqs.map((item, idx) => (
                            <div key={idx} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition">
                                <h3 className="font-bold text-lg text-slate-900 mb-3 flex gap-3">
                                    <span className="text-blue-600">Q:</span>
                                    {item.q}
                                </h3>
                                <p className="text-slate-600 leading-relaxed pl-7 border-l-2 border-slate-100">
                                    {item.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    )
}
