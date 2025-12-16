'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, School, Factory, Lock, ShieldCheck } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function RegisterForm({ params }: { params: Promise<{ role: string }> }) {
  const resolvedParams = use(params)
  const role = resolvedParams.role

  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  // State yang disederhanakan untuk Register
  const [formData, setFormData] = useState({
    name: '',
    nik: '', // Khusus Pencaker
    email: '',
    password: '',
    confirmPassword: '', // Verifikasi Password
    // Field LPK/Perusahaan tetap ada di register (sesuai best practice business)
    vin: '',
    nib: '',
    phone: '', // Untuk Admin LPK/Perusahaan (contact person)
    // Field LPK Baru
    operational_pj: '',
    operational_pj_title: '',
    operational_pj_phone: '',
    operational_pj_email: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // 1. Validasi Password
    if (formData.password !== formData.confirmPassword) {
      alert("Password dan Konfirmasi Password tidak sama!")
      setLoading(false)
      return
    }

    // 2. Tentukan Role Database
    const dbRole = role === 'lpk' ? 'ADMIN_LPK' :
      role === 'perusahaan' ? 'ADMIN_PERUSAHAAN' : 'PENCAKER'

    // 3. SIAPKAN METADATA (Ini kuncinya!)
    // Kita bungkus NIK, VIN, Phone, dll disini agar langsung masuk database
    const metadata: any = {
      full_name: formData.name,
      role: dbRole,
      phone: formData.phone, // Nomor HP Admin/HRD
    }

    if (role === 'pencaker') {
      metadata.nik = formData.nik
      // Status NIK & Nama langsung tersimpan, sisanya menyusul di Edit Profile
    } else if (role === 'lpk') {
      // metadata.vin = formData.vin  <-- Removed old vin field usage if replaced or keep if needed?
      // Wait, vin is replaced by license_number in profile? No, VIN is still valid. 
      // But user asked for "Nama LPK", "Nama PJ", etc. VIN is usually separate.
      // Let's keep VIN as it was in the original form if it makes sense, but the new form didn't ask for VIN explicitly in "Halaman Register (LPK)" section of the prompt?
      // The prompt said: "Nama LPK", "Nama PJ", "Jabatan PJ", "No HP PJ", "Email PJ".
      // It did NOT mention VIN in the Register form request.
      // However, the original code had VIN. I should probably keep it or remove it if not asked.
      // The user said: "Buat formulir registrasi dengan kolom isian sebagai berikut: ..."
      // It implies ONLY those fields.
      // However, usually we need a unique ID or VIN.
      // Let's look at the "Halaman Edit Profil LPK" request: "Nomor Registrasi (VIN)" is mentioned there.
      // So VIN is part of the data model. 
      // I will remove VIN from Register form to strictly follow "Buat formulir registrasi dengan kolom isian sebagai berikut"
      // BUT, checking my UI update in Step 72/76... I REMOVED VIN field from the UI.
      // So I should remove it from metadata here too, or just leave it empty.

      metadata.company_name = formData.name
      metadata.operational_pj = formData.operational_pj
      metadata.operational_pj_title = formData.operational_pj_title
      metadata.operational_pj_phone = formData.operational_pj_phone
      metadata.operational_pj_email = formData.operational_pj_email
    } else if (role === 'perusahaan') {
      metadata.nib = formData.nib
      metadata.company_name = formData.name
    }

    // 4. REGISTER SEKALI JALAN (Atomic)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: metadata, // Kirim paket data lengkap disini
      },
    })

    if (authError) {
      alert("Gagal Registrasi: " + authError.message)
    } else {
      // Tidak perlu coding update terpisah lagi, SQL Trigger yang menanganinya.
      alert('Registrasi Berhasil! Silakan Login untuk melengkapi profil Anda.')
      router.push('/auth/verify')
    }

    setLoading(false)
  }

  // --- RENDER FORM ---
  const renderFormContent = () => {
    if (role === 'pencaker') {
      return (
        <div className="space-y-4">
          {/* HANYA 5 FIELD UTAMA SESUAI REQUEST */}
          <div>
            <label className="text-xs font-bold block mb-1">NIK (16 Digit)</label>
            <input required name="nik" type="number" onChange={handleChange} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="3216xxxxxxxxxxxx" />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Nama Lengkap (Sesuai KTP)</label>
            <input required name="name" onChange={handleChange} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nama Lengkap" />
          </div>
        </div>
      )
    }
    else if (role === 'lpk') {
      return (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold block mb-1">Nama LPK</label>
            <input required name="name" onChange={handleChange} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: LPK Maju Jaya" />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Nama Penanggungjawab Operasional LPK</label>
            <input required name="operational_pj" onChange={handleChange} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nama Lengkap PJ Operasional" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1">Jabatan PJ Operasional</label>
              <input required name="operational_pj_title" onChange={handleChange} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: Manager" />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">No. Kontak/HP PJ Operasional</label>
              <input required name="operational_pj_phone" onChange={handleChange} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="08xxxxxxxxxx" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Email PJ Operasional</label>
            <input required name="operational_pj_email" type="email" onChange={handleChange} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="email.pj@contoh.com" />
          </div>
        </div>
      )
    } else {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-xs font-bold block mb-1">Nama Perusahaan</label><input required name="name" onChange={handleChange} className="w-full border rounded p-2 text-sm" /></div>
          <div><label className="text-xs font-bold block mb-1">NIB</label><input required name="nib" onChange={handleChange} className="w-full border rounded p-2 text-sm" /></div>
          <div className="md:col-span-2"><label className="text-xs font-bold block mb-1">No. Telepon HRD</label><input required name="phone" onChange={handleChange} className="w-full border rounded p-2 text-sm" /></div>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex justify-center font-sans">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8">
        <Link href="/auth/register" className="text-gray-500 mb-6 flex items-center gap-2 font-bold hover:text-blue-600 transition-colors">
          <ArrowLeft size={16} /> Kembali
        </Link>

        <div className="flex flex-col items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 capitalize">
            Pendaftaran {role === 'lpk' ? 'LPK' : role === 'perusahaan' ? 'Perusahaan' : 'Pencari Kerja'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Buat akun baru untuk mengakses layanan.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            {renderFormContent()}
          </div>

          {/* Email & Password (Termasuk Verifikasi Password) */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-gray-700"><Lock size={16} /> Akun Login</h4>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold block mb-1">Email</label>
                <input required name="email" type="email" onChange={handleChange} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="nama@email.com" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold block mb-1">Password</label>
                  <input required name="password" type="password" onChange={handleChange} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="******" />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Ulangi Password</label>
                  <input required name="confirmPassword" type="password" onChange={handleChange} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="******" />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg mt-4 hover:bg-blue-700 transition-colors shadow-md disabled:bg-blue-300">
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>
      </div>
    </div>
  )
}