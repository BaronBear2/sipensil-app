import Link from 'next/link';
import { 
  Phone, Mail, Search, LogIn, Menu, ChevronDown, 
  GraduationCap, Briefcase, Plane, FileCheck2, 
  Calendar, ArrowRight, MapPin, Facebook, Instagram, Twitter, Youtube 
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-white text-slate-800 antialiased min-h-screen flex flex-col">

      {/* 1. TOP BAR */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 hidden md:block border-b border-slate-800">
        <div className="container mx-auto px-4 lg:px-8 flex justify-between items-center">
          <div className="flex gap-6 font-medium">
            <span className="flex items-center gap-2 hover:text-white transition">
              <Phone size={14} /> (021) 889977
            </span>
            <span className="flex items-center gap-2 hover:text-white transition">
              <Mail size={14} /> disnaker@bekasikab.go.id
            </span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition">Aksesibilitas</a>
            <span className="text-slate-600">|</span>
            <a href="#" className="hover:text-white transition">Peta Situs</a>
            <span className="text-slate-600">|</span>
            <a href="#" className="hover:text-white transition">FAQ</a>
          </div>
        </div>
      </div>

      {/* 2. NAVBAR */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo Area */}
            <div className="flex items-center gap-3 group cursor-pointer">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Lambang_Kabupaten_Bekasi.png/618px-Lambang_Kabupaten_Bekasi.png" 
                alt="Logo Pemkab" 
                className="h-10 w-auto" 
              />
              <div className="border-l border-slate-300 h-8 mx-1"></div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-slate-800 leading-none tracking-tight group-hover:text-blue-700 transition">SIPENSIL</span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1">Dinas Ketenagakerjaan</span>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600">
              <Link href="/" className="px-4 py-2 rounded-md bg-blue-50 text-blue-700 font-semibold">Beranda</Link>
              
              <div className="relative group">
                <button className="px-4 py-2 rounded-md hover:bg-slate-50 hover:text-blue-700 flex items-center gap-1 transition">
                  Profil <ChevronDown size={14} />
                </button>
                {/* Dropdown */}
                <div className="absolute top-full left-0 w-48 bg-white shadow-lg rounded-md border border-slate-100 hidden group-hover:block py-2 mt-1 origin-top-left animate-fade-in">
                  <a href="#" className="block px-4 py-2 hover:bg-slate-50 text-slate-700">Tentang Kami</a>
                  <a href="#" className="block px-4 py-2 hover:bg-slate-50 text-slate-700">Visi & Misi</a>
                  <a href="#" className="block px-4 py-2 hover:bg-slate-50 text-slate-700">Struktur Organisasi</a>
                </div>
              </div>

              <a href="#" className="px-4 py-2 rounded-md hover:bg-slate-50 hover:text-blue-700 transition">Pelatihan</a>
              <a href="#" className="px-4 py-2 rounded-md hover:bg-slate-50 hover:text-blue-700 transition">Pemagangan</a>
              <a href="#" className="px-4 py-2 rounded-md hover:bg-slate-50 hover:text-blue-700 transition">Berita</a>
            </div>

            {/* Action Button */}
            <div className="flex items-center gap-3">
              <button className="hidden md:flex p-2 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-full transition">
                <Search size={20} />
              </button>
              
              {/* CONNECTED TO YOUR LOGIN PAGE */}
              <Link href="/auth/login" className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-md font-medium text-sm transition shadow-sm flex items-center gap-2">
                <LogIn size={16} /> Masuk
              </Link>
              
              <button className="lg:hidden text-slate-600 p-2">
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 3. HERO SECTION */}
      <header className="relative h-[500px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1920&q=80" 
            alt="Background Office" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-slate-900/70"></div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block py-1 px-3 rounded bg-blue-600/20 border border-blue-400/30 text-blue-100 text-xs font-semibold mb-4 backdrop-blur-sm">
              PORTAL PELAYANAN SATU PINTU
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
              Membangun SDM Kompeten <br/>
              <span className="text-blue-400">Siap Kerja & Berdaya Saing</span>
            </h1>
            <p className="text-lg text-slate-200 mb-8 max-w-2xl font-light leading-relaxed">
              Akses mudah pendaftaran pelatihan kerja, sertifikasi kompetensi, dan informasi lowongan magang resmi dari Dinas Ketenagakerjaan.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/auth/register" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-semibold transition shadow-md border border-transparent">
                Daftar Sekarang
              </Link>
              <a href="#" className="bg-transparent hover:bg-white/10 text-white px-8 py-3 rounded-md font-semibold transition border border-white">
                Panduan Layanan
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* 4. LAYANAN PUBLIK */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">Layanan Utama</h2>
            <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full"></div>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">Kami menyediakan berbagai layanan untuk mendukung pengembangan karir dan kompetensi masyarakat.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Service 1 */}
            <a href="#" className="bg-white p-6 rounded-lg border border-slate-200 service-card flex flex-col items-center text-center group">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <GraduationCap size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition">Pelatihan Kerja</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Pendaftaran pelatihan berbasis kompetensi di BLK dan LPK swasta.</p>
            </a>

            {/* Service 2 */}
            <a href="#" className="bg-white p-6 rounded-lg border border-slate-200 service-card flex flex-col items-center text-center group">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <Briefcase size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-emerald-700 transition">Pemagangan</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Program magang dalam dan luar negeri bersertifikat resmi.</p>
            </a>

            {/* Service 3 */}
            <a href="#" className="bg-white p-6 rounded-lg border border-slate-200 service-card flex flex-col items-center text-center group">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-5 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                <Plane size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-red-700 transition">IM Japan</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Seleksi dan pelatihan pra-pemberangkatan magang ke Jepang.</p>
            </a>

            {/* Service 4 */}
            <a href="#" className="bg-white p-6 rounded-lg border border-slate-200 service-card flex flex-col items-center text-center group">
              <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mb-5 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                <FileCheck2 size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-orange-700 transition">Perizinan LPK</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Layanan pelaporan dan perizinan untuk Lembaga Pelatihan Kerja.</p>
            </a>
          </div>
        </div>
      </section>

      {/* 5. STATISTIK */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-700 mb-1">1,240+</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Peserta Terlatih</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-700 mb-1">56</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">LPK Terdaftar</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-700 mb-1">82%</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tingkat Penempatan</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-700 mb-1">24</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Program Kejuruan</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BERITA TERKINI */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Berita & Informasi</h2>
            <a href="#" className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1">
              Arsip Berita <ArrowRight size={14} />
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* News Item 1 */}
            <article className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition group">
              <div className="h-48 overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1544531696-60c35eb5220c?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="Pelatihan" />
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 m-3 rounded">Terbaru</div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <Calendar size={12} /> 5 Desember 2025
                </div>
                <h3 className="font-bold text-lg text-slate-800 mb-3 leading-snug group-hover:text-blue-700 transition">
                  Pembukaan Pendaftaran Pelatihan Berbasis Kompetensi Tahap 1
                </h3>
                <p className="text-sm text-slate-500 line-clamp-3 mb-4">
                  Dinas Ketenagakerjaan kembali membuka kesempatan bagi masyarakat untuk mengikuti pelatihan kerja gratis di BLK Kabupaten Bekasi...
                </p>
                <a href="#" className="text-blue-600 text-sm font-semibold hover:underline">Baca Selengkapnya</a>
              </div>
            </article>

            {/* News Item 2 */}
            <article className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition group">
              <div className="h-48 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="Magang Jepang" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <Calendar size={12} /> 2 Desember 2025
                </div>
                <h3 className="font-bold text-lg text-slate-800 mb-3 leading-snug group-hover:text-blue-700 transition">
                  Sosialisasi Program Pemagangan ke Jepang (IM Japan)
                </h3>
                <p className="text-sm text-slate-500 line-clamp-3 mb-4">
                  Dalam rangka meningkatkan kompetensi tenaga kerja muda, Disnaker mengadakan sosialisasi program magang ke Jepang...
                </p>
                <a href="#" className="text-blue-600 text-sm font-semibold hover:underline">Baca Selengkapnya</a>
              </div>
            </article>

            {/* News Item 3 */}
            <article className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition group">
              <div className="h-48 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="Rapat LPK" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <Calendar size={12} /> 28 November 2025
                </div>
                <h3 className="font-bold text-lg text-slate-800 mb-3 leading-snug group-hover:text-blue-700 transition">
                  Rapat Koordinasi Lembaga Pelatihan Kerja Swasta
                </h3>
                <p className="text-sm text-slate-500 line-clamp-3 mb-4">
                  Kegiatan rutin untuk menyamakan persepsi dan standar mutu pelatihan di seluruh LPK yang terdaftar di Kabupaten Bekasi...
                </p>
                <a href="#" className="text-blue-600 text-sm font-semibold hover:underline">Baca Selengkapnya</a>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 border-t border-slate-800 mt-auto">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Kolom 1 */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Lambang_Kabupaten_Bekasi.png/618px-Lambang_Kabupaten_Bekasi.png" alt="Logo" className="h-10 w-auto opacity-80 grayscale hover:grayscale-0 transition" />
                <div>
                  <span className="block font-bold text-xl text-white">SIPENSIL</span>
                  <span className="text-xs uppercase tracking-wider">Dinas Ketenagakerjaan</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-6 max-w-sm">
                Sistem Informasi Pendaftaran dan Pencatatan Pelatihan Kompetensi, Wirausaha, dan Pengembangan Karir Terpadu.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-slate-400 hover:text-white transition"><Facebook size={20} /></a>
                <a href="#" className="text-slate-400 hover:text-white transition"><Instagram size={20} /></a>
                <a href="#" className="text-slate-400 hover:text-white transition"><Twitter size={20} /></a>
                <a href="#" className="text-slate-400 hover:text-white transition"><Youtube size={20} /></a>
              </div>
            </div>

            {/* Kolom 2 */}
            <div>
              <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wide">Tautan Cepat</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition">Beranda</a></li>
                <li><a href="#" className="hover:text-white transition">Profil Dinas</a></li>
                <li><a href="#" className="hover:text-white transition">Pelatihan BLK</a></li>
                <li><a href="#" className="hover:text-white transition">Pasar Kerja</a></li>
                <li><a href="#" className="hover:text-white transition">Unduhan</a></li>
              </ul>
            </div>

            {/* Kolom 3 */}
            <div>
              <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wide">Kontak Kami</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex gap-3 items-start">
                  <MapPin className="shrink-0 mt-1" size={16} />
                  <span>Komplek Perkantoran Pemkab Bekasi, Desa Sukamahi, Kec. Cikarang Pusat.</span>
                </li>
                <li className="flex gap-3 items-center">
                  <Phone className="shrink-0" size={16} />
                  <span>(021) 889977</span>
                </li>
                <li className="flex gap-3 items-center">
                  <Mail className="shrink-0" size={16} />
                  <span>disnaker@bekasikab.go.id</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
            <p>&copy; 2025 Dinas Ketenagakerjaan Kabupaten Bekasi. Hak Cipta Dilindungi Undang-Undang.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}