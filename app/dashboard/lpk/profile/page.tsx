'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Building, MapPin, Save, ArrowLeft, ShieldCheck, User, Phone, FileText, AlertTriangle, X, Lock } from 'lucide-react'
import Link from 'next/link'

export default function LpkProfilePage() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // State Data Khusus LPK
  const [formData, setFormData] = useState({
    company_name: '', // Nama LPK
    vin: '',          // No. Registrasi / VIN
    full_name: '',    // Nama Penanggung Jawab / PJ Op (Sesuai database, ini field PJ umum)
    phone: '',        // Kontak LPK / PJ
    address_dom: '',  // Alamat LPK (dianggap Alamat Kantor)

    // Field Baru (Sesuai Request)
    address_office: '',
    fax: '',
    email_official: '',
    license_number: '',
    license_date: '',
    lpk_type: 'Swasta', // Default
    director_name: '',
    director_phone: '',

    account_status: 'unverified',
    rejection_message: ''
  })

  // 1. Fetch Data
  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profile) setFormData({
        ...profile,
        // Pastikan field null jadi empty string agar controlled input aman
        address_office: profile.address_office || '',
        fax: profile.fax || '',
        email_official: profile.email_official || '',
        license_number: profile.license_number || '',
        license_date: profile.license_date || '',
        lpk_type: profile.lpk_type || 'Swasta',
        director_name: profile.director_name || '',
        director_phone: profile.director_phone || ''
      })
      setLoading(false)
    }
    getData()
  }, [])

  // 2. Handle Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // 3. Handle Simpan
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirm("Simpan data lembaga? Status akan berubah menjadi Pending verifikasi.")) return

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()

    // Update data & Ubah status jadi PENDING
    const { error } = await supabase
      .from('profiles')
      .update({
        company_name: formData.company_name,
        vin: formData.vin,
        phone: formData.phone, // Kontak LPK/PJ

        // Update Field Baru
        address_office: formData.address_office, // Jika pakai field baru
        address_dom: formData.address_dom, // Backup atau alamat domisili
        fax: formData.fax,
        email_official: formData.email_official,
        license_number: formData.license_number,
        license_date: formData.license_date ? formData.license_date : null,
        lpk_type: formData.lpk_type,
        director_name: formData.director_name,
        director_phone: formData.director_phone,

        account_status: 'pending', // Trigger verifikasi admin
        rejection_message: null
      })
      .eq('id', user?.id)

    if (error) {
      alert('Gagal: ' + error.message)
    } else {
      alert('Berhasil disimpan! Silakan lanjut mengisi laporan.')
      router.push('/dashboard/lpk') // Kembali ke dashboard
    }
    setSaving(false)
  }

  if (loading) return <div className="p-10 text-center text-gray-400">Memuat profil...</div>

  // Logic Styling
  const inputClass = "w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white"
  const labelClass = "block text-xs font-bold text-gray-600 mb-1"

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans animate-fade-in">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/lpk" className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition"><ArrowLeft size={20} /></Link>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Profil Lembaga LPK</h2>
              <p className="text-sm text-gray-500">Lengkapi identitas lembaga sebelum melapor.</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 ${formData.account_status === 'verified' ? 'bg-green-50 text-green-700 border-green-200' :
              formData.account_status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-100 text-gray-600'
            }`}>
            <ShieldCheck size={14} /> {formData.account_status.toUpperCase()}
          </div>
        </div>

        {/* PESAN TOLAK JIKA ADA */}
        {formData.account_status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6 flex gap-3">
            <AlertTriangle className="text-red-500" />
            <div>
              <h4 className="font-bold text-red-800 text-sm">Verifikasi Ditolak</h4>
              <p className="text-red-600 text-sm">"{formData.rejection_message}"</p>
            </div>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Identitas Lembaga */}
            <div className="space-y-5">
              <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2"><Building size={18} /> Identitas Lembaga</h3>

              <div><label className={labelClass}>Nama LPK</label><input required name="company_name" value={formData.company_name || ''} onChange={handleChange} className={inputClass} placeholder="Contoh: LPK Maju Jaya" /></div>
              <div><label className={labelClass}>Nomor Registrasi (VIN)</label><input required name="vin" value={formData.vin || ''} onChange={handleChange} className={inputClass} placeholder="Nomor VIN Kemnaker" /></div>
            </div>

            {/* Alamat Lengkap */}
            <div className="space-y-5">
              <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2"><MapPin size={18} /> Alamat Lengkap</h3>

              <div><label className={labelClass}>Alamat Kantor</label><textarea required name="address_office" rows={3} value={formData.address_office || ''} onChange={handleChange} className={inputClass} placeholder="Jalan, RT/RW, Kecamatan..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>No. Telp</label><input required name="phone" value={formData.phone || ''} onChange={handleChange} className={inputClass} /></div>
                <div><label className={labelClass}>Fax</label><input name="fax" value={formData.fax || ''} onChange={handleChange} className={inputClass} placeholder="-" /></div>
              </div>
              <div><label className={labelClass}>Email Resmi LPK</label><input required name="email_official" type="email" value={formData.email_official || ''} onChange={handleChange} className={inputClass} placeholder="lpk@resmi.com" /></div>
            </div>

            {/* Legalitas */}
            <div className="space-y-5">
              <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2"><FileText size={18} /> Legalitas</h3>

              <div><label className={labelClass}>Nomor Izin / Tanda Daftar / Sertifikat Standar</label><input required name="license_number" value={formData.license_number || ''} onChange={handleChange} className={inputClass} /></div>
              <div><label className={labelClass}>Tanggal Izin</label><input required name="license_date" type="date" value={formData.license_date || ''} onChange={handleChange} className={inputClass} /></div>
              <div>
                <label className={labelClass}>Jenis LPK</label>
                <select name="lpk_type" value={formData.lpk_type} onChange={handleChange} className={inputClass}>
                  <option value="Swasta">Swasta</option>
                  <option value="Pemerintah">Pemerintah</option>
                  <option value="Perusahaan">Perusahaan</option>
                </select>
              </div>
            </div>

            {/* Pimpinan */}
            <div className="space-y-5">
              <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2"><User size={18} /> Pimpinan</h3>

              <div><label className={labelClass}>Nama Kepala / Direktur LPK</label><input required name="director_name" value={formData.director_name || ''} onChange={handleChange} className={inputClass} placeholder="Nama Lengkap" /></div>
              <div><label className={labelClass}>No. Telepon Kepala / Direktur</label><input required name="director_phone" value={formData.director_phone || ''} onChange={handleChange} className={inputClass} placeholder="08xxxxxxxxxx" /></div>
            </div>

          </div>

          {/* FOOTER */}
          <div className="mt-10 pt-6 border-t flex justify-end gap-3">
            <Link href="/dashboard/lpk" className="px-6 py-2 border rounded-lg font-bold text-gray-600 hover:bg-gray-50 text-sm flex items-center justify-center">Batal</Link>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2 text-sm disabled:bg-gray-400">
              <Save size={18} /> {saving ? 'Menyimpan...' : 'Simpan & Ajukan Verifikasi'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}