'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Building, MapPin, Save, ArrowLeft, ShieldCheck, User, Phone, FileText, AlertTriangle, X, Lock, Info } from 'lucide-react'
import Link from 'next/link'

import Modal from '@/components/ui/Modal'
import Swal from 'sweetalert2'

export default function LpkProfilePage() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Modals
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

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
    operational_pj: '',
    operational_pj_title: '',
    operational_pj_phone: '',

    account_status: 'unverified',
    rejection_message: ''
  })

  // 1. Fetch Data
  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: profile } = await supabase.from('profiles').select('*, profile_lpk(*)').eq('id', user.id).single()
      if (profile) {
        const lpk = profile.profile_lpk || {}
        setFormData({
          ...profile,
          ...lpk, // Override with specific table data
          // Map legacy columns if needed or just use lpk data
          lpk_type: lpk.lpk_type || profile.lpk_type || 'Swasta',
          address_office: lpk.address_office || profile.address_office || '',
          // Ensure controlled inputs
          company_name: lpk.lpk_name || profile.company_name || '',
          vin: lpk.nips || profile.vin || '', // VIN mapped to nips
        })
      }

      // Check for alerts
      const params = new URLSearchParams(window.location.search)
      const alertType = params.get('alert')

      if (alertType === 'first_login' || alertType === 'complete_profile') {
        setShowWelcomeModal(true)
      }

      setLoading(false)
    }
    getData()
  }, [])

  // 2. Handle Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // 3. Handle Simpan
  const handleSave = async () => {
    setShowConfirmModal(false)
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()

    // Update data & Ubah status jadi PENDING
    // 1. Update Base Profile
    const { error: baseError } = await supabase
      .from('profiles')
      .update({
        full_name: formData.company_name, // Sync name to base profile for Admin
        account_status: 'pending',
        rejection_message: null
      })
      .eq('id', user?.id)

    if (baseError) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal update base profil: ' + baseError.message })
      setSaving(false)
      return
    }

    // 2. Upsert LPK Profile
    const { error: detailError } = await supabase
      .from('profile_lpk')
      .upsert({
        user_id: user?.id,
        lpk_name: formData.company_name,
        nips: formData.vin, // Mapping VIN form to NIPS db
        phone: formData.phone,
        address_office: formData.address_office,
        fax: formData.fax,
        email_official: formData.email_official,
        license_number: formData.license_number,
        license_date: formData.license_date ? formData.license_date : null,
        lpk_type: formData.lpk_type,
        director_name: formData.director_name,
        director_phone: formData.director_phone,
        operational_pj: formData.operational_pj,
        operational_pj_title: formData.operational_pj_title,
        operational_pj_phone: formData.operational_pj_phone,
      }, { onConflict: 'user_id' })

    const error = detailError

    if (error) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal: ' + error.message })
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Berhasil disimpan! Silakan lanjut mengisi laporan.',
        timer: 2000,
        showConfirmButton: false
      }).then(() => router.push('/dashboard/lpk'))
    }
    setSaving(false)
  }

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowConfirmModal(true)
  }

  if (loading) return <div className="p-10 text-center text-gray-400 animate-pulse">Memuat profil...</div>

  // Logic Styling
  const inputClass = "w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-200 transition-all text-sm bg-white"
  const labelClass = "block text-xs font-bold text-gray-600 mb-1"

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans animate-fade-in pb-24">
      {/* CONFIRMATION MODAL */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Konfirmasi Simpan">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
            <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
              <Save size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-sm">Simpan Profil LPK</h4>
              <p className="font-bold text-emerald-700">Update Data</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            Data yang Anda simpan akan diverifikasi ulang oleh Dinas Ketenagakerjaan. Status akun akan berubah menjadi <strong>Pending</strong>.
            <br />
            Apakah Anda yakin?
          </p>
          <div className="flex gap-3">
            <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 text-sm transition">
              Batal
            </button>
            <button onClick={handleSave} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 text-sm shadow-lg shadow-emerald-200 transition">
              Ya, Simpan
            </button>
          </div>
        </div>
      </Modal>

      <div className="max-w-4xl mx-auto">

        {/* FIRST TIME WELCOME MODAL */}
        {showWelcomeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg text-center p-8 animate-bounce-small relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600"></div>
              <div className="mb-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                  {new URLSearchParams(window.location.search).get('alert') === 'complete_profile' ? <AlertTriangle size={40} className="text-orange-500" /> : <Building size={40} />}
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {new URLSearchParams(window.location.search).get('alert') === 'complete_profile' ? 'Data Belum Lengkap' : 'Selamat Datang, LPK Baru!'}
                </h2>
                <p className="text-gray-500 mt-2 leading-relaxed">
                  {new URLSearchParams(window.location.search).get('alert') === 'complete_profile'
                    ? 'Anda harus melengkapi profil lembaga (Alamat & Legalitas) sebelum dapat membuat laporan baru.'
                    : (
                      <>
                        Terima kasih telah bergabung di SIPENSIL. <br />
                        Untuk memulai pelaporan, silakan <strong>Lengkapi Profil Lembaga</strong> Anda terlebih dahulu.
                      </>
                    )}
                </p>
              </div>
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-emerald-700 transition shadow-lg w-full"
              >
                Siap, Lengkapi Sekarang
              </button>
            </div>
          </div>
        )}


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
        <form onSubmit={onFormSubmit} className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
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

              <div className="pt-4 border-t mt-4">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Penanggung Jawab Operasional</h4>
                <div className="space-y-4">
                  <div><label className={labelClass}>Nama Penanggung Jawab</label><input name="operational_pj" value={formData.operational_pj || ''} onChange={handleChange} className={inputClass} placeholder="Nama PJ Operasional" /></div>
                  <div><label className={labelClass}>Jabatan</label><input name="operational_pj_title" value={formData.operational_pj_title || ''} onChange={handleChange} className={inputClass} placeholder="Contoh: Manajer Pelatihan" /></div>
                  <div><label className={labelClass}>No. Telepon PJ</label><input name="operational_pj_phone" value={formData.operational_pj_phone || ''} onChange={handleChange} className={inputClass} placeholder="08xxxxxxxxxx" /></div>
                </div>
              </div>
            </div>

          </div>

          {/* FOOTER */}
          <div className="mt-10 pt-6 border-t flex justify-end gap-3">
            <Link href="/dashboard/lpk" className="px-6 py-2 border rounded-lg font-bold text-gray-600 hover:bg-gray-50 text-sm flex items-center justify-center">Batal</Link>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-2 text-sm disabled:bg-gray-400">
              <Save size={18} /> {saving ? 'Menyimpan...' : 'Simpan & Ajukan Verifikasi'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}