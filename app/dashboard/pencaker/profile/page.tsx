'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { User, MapPin, Upload, Save, ArrowLeft, ShieldCheck, Lock, Edit, FileText, AlertTriangle, X } from 'lucide-react'
import Link from 'next/link'
import StatusModal from '@/components/ui/StatusModal'

function ProfileContent() {
   const supabase = createClient()
   const router = useRouter()

   // State UI
   const [loading, setLoading] = useState(true)
   const [saving, setSaving] = useState(false)
   const [isEditing, setIsEditing] = useState(false)
   const [showConfirm, setShowConfirm] = useState(false)

   // State for Status Popup
   const [statusModal, setStatusModal] = useState<{
      isOpen: boolean
      type: 'success' | 'error'
      message: string
   }>({
      isOpen: false,
      type: 'success',
      message: ''
   })

   // State Data
   const [formData, setFormData] = useState({
      full_name: '',
      nik: '',
      email: '',
      phone: '',
      place_of_birth: '',
      date_of_birth: '',
      gender: 'Laki-laki',
      religion: 'Islam',
      education: 'SMA/SMK',
      major: '',
      skills: '',
      field_of_work: '',
      address_ktp: '',
      address_dom: '',
      account_status: 'unverified',
      rejection_message: '',
      ktp_url: '',
      ijazah_url: '',
      photo_url: ''
   })

   const [sameAddress, setSameAddress] = useState(false)

   const searchParams = useSearchParams()

   // 1. FETCH DATA SAAT LOAD
   useEffect(() => {
      const getData = async () => {
         const { data: { user } } = await supabase.auth.getUser()
         if (!user) { router.push('/auth/login'); return }

         const { data: profile } = await supabase
            .from('profiles')
            .select('*, profile_pencaker(*)')
            .eq('id', user.id)
            .single()

         if (profile) {
            const pencaker = profile.profile_pencaker || {}
            setFormData({
               full_name: profile.full_name || '',
               email: profile.email || '',
               account_status: profile.account_status || 'unverified',
               rejection_message: profile.rejection_message || '',
               nik: pencaker.nik || '',
               phone: pencaker.phone || '',
               gender: pencaker.gender || 'Laki-laki',
               place_of_birth: pencaker.place_of_birth || '',
               date_of_birth: pencaker.date_of_birth || '',
               address_ktp: pencaker.address_ktp || '',
               address_dom: pencaker.address_dom || '',
               religion: pencaker.religion || 'Islam',
               education: pencaker.education || 'SMA/SMK',
               major: pencaker.major || '',
               skills: pencaker.skills || '',
               field_of_work: pencaker.field_of_work || '',
               ktp_url: pencaker.ktp_url || '',
               ijazah_url: pencaker.ijazah_url || '',
               photo_url: profile.photo_url || ''
            })

            // ... rest of checking logic
            if (searchParams.get('action') === 'edit') {
               setIsEditing(true)
               setStatusModal({ isOpen: true, type: 'error', message: 'Harap lengkapi/perbarui data profil Anda terlebih dahulu sebelum mendaftar.' })
            }
         }
         setLoading(false)
      }
      getData()
   }, [searchParams])

   // 2. LOGIC FORM & UPLOAD
   const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, files } = e.target as HTMLInputElement

      if (files && files.length > 0) {
         // REAL STORAGE INTEGRATION
         const file = files[0]

         // Validation File Size (Max 2MB)
         if (file.size > 2 * 1024 * 1024) {
            setStatusModal({ isOpen: true, type: 'error', message: 'Ukuran file maksimal 2MB' })
            return
         }

         setSaving(true) // Show loading indicator

         // Determine bucket based on field name
         let bucket: 'avatars' | 'documents' = 'documents' // Default
         if (name === 'photo_url') bucket = 'avatars'

         try {
            // Dynamic import to avoid SSR issues if any, though standard import works 
            const { uploadFile } = await import('@/utils/supabase/storage')
            const { url, error } = await uploadFile(file, bucket, bucket) // path_prefix same as bucket name for organization

            if (error) {
               setStatusModal({ isOpen: true, type: 'error', message: 'Gagal upload: ' + error })
            } else if (url) {
               setFormData(prev => ({ ...prev, [name]: url }))
               // Optional: Show success toast
            }
         } catch (err) {
            console.error(err)
            setStatusModal({ isOpen: true, type: 'error', message: 'Terjadi kesalahan saat upload' })
         } finally {
            setSaving(false)
         }

      } else {
         setFormData(prev => ({ ...prev, [name]: value }))
      }

      // Auto-copy Address jika checkbox aktif
      if (name === 'address_ktp' && sameAddress) {
         setFormData(prev => ({ ...prev, address_dom: value }))
      }
   }

   const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked
      setSameAddress(checked)
      if (checked) {
         setFormData(prev => ({ ...prev, address_dom: prev.address_ktp }))
      }
   }

   // 3. LOGIC SIMPAN
   const handleSaveClick = (e: React.FormEvent) => {
      e.preventDefault()

      // VALIDATION
      // VALIDATION (Strict V5.5: All fields including uploads)
      const required = [
         'full_name', 'nik', 'place_of_birth', 'date_of_birth', 'gender', 'religion',
         'education', 'phone', 'address_ktp', 'address_dom',
         'ktp_url', 'ijazah_url', 'photo_url'
      ]

      const friendlyNames: { [key: string]: string } = {
         full_name: 'Nama Lengkap',
         nik: 'NIK',
         place_of_birth: 'Tempat Lahir',
         date_of_birth: 'Tanggal Lahir',
         gender: 'Jenis Kelamin',
         religion: 'Agama',
         education: 'Pendidikan Terakhir',
         phone: 'Nomor WhatsApp',
         address_ktp: 'Alamat KTP',
         address_dom: 'Alamat Domisili',
         ktp_url: 'Scan KTP',
         ijazah_url: 'Ijazah Terakhir',
         photo_url: 'Pas Foto'
      }

      const empty = required.filter(field => !formData[field as keyof typeof formData])

      if (empty.length > 0) {
         const emptyNames = empty.map(field => friendlyNames[field] || field)
         setStatusModal({
            isOpen: true,
            type: 'error',
            message: `Mohon lengkapi data wajib! Belum diisi: ${emptyNames.join(', ')}`
         })
         return
      }

      if (formData.nik.length !== 16) {
         setStatusModal({ isOpen: true, type: 'error', message: 'NIK harus 16 digit!' })
         return
      }

      setShowConfirm(true)
   }

   const executeSave = async () => {
      setSaving(true)
      setShowConfirm(false)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Update Base Profile (Sync Photo & Name)
      const { error: baseError } = await supabase
         .from('profiles')
         .update({
            full_name: formData.full_name,
            // Sync photo_url to base profile as well so it shows in navbar/avatar
            photo_url: formData.photo_url,
            account_status: formData.account_status === 'verified' ? 'unverified' : (formData.account_status || 'unverified'),
            rejection_message: null,
            last_data_update: new Date().toISOString()
         })
         .eq('id', user.id)

      if (baseError) {
         setStatusModal({ isOpen: true, type: 'error', message: 'Gagal update profil dasar: ' + baseError.message })
         setSaving(false)
         return
      }

      // 2. Upsert into profile_pencaker
      const { error: detailError } = await supabase
         .from('profile_pencaker')
         .upsert({
            user_id: user.id,
            nik: formData.nik,
            phone: formData.phone,
            place_of_birth: formData.place_of_birth,
            date_of_birth: formData.date_of_birth,
            gender: formData.gender,
            religion: formData.religion,
            education: formData.education,
            address_ktp: formData.address_ktp,
            address_dom: formData.address_dom,
            ktp_url: formData.ktp_url,
            ijazah_url: formData.ijazah_url,
            photo_url: formData.photo_url
         })


      const error = detailError

      if (error) {
         setStatusModal({
            isOpen: true,
            type: 'error',
            message: 'Gagal menyimpan data detail: ' + error.message
         })
      } else {
         setStatusModal({
            isOpen: true,
            type: 'success',
            message: 'Data Berhasil Disimpan!'
         })

         setTimeout(() => {
            router.push('/dashboard/pencaker')
            router.refresh()
         }, 1500)
      }
      setSaving(false)
   }

   // Logic Styling
   const inputClass = (active: boolean) => `w-full px-4 py-2 border rounded-lg outline-none transition-all text-sm ${active ? 'bg-white border-blue-300 focus:ring-2 focus:ring-blue-200' : 'bg-gray-50 border-transparent text-gray-700 cursor-not-allowed'}`
   const labelClass = "block text-xs font-bold text-gray-600 mb-1"

   // Logic Status Color
   const getStatusColor = (status: string) => {
      if (status === 'verified') return 'bg-green-50 text-green-700 border-green-200'
      if (status === 'pending') return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      return 'bg-gray-50 text-gray-700 border-gray-200'
   }

   if (loading) return <div className="p-10 text-center text-gray-500">Memuat data profil...</div>

   return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans animate-fade-in pb-20">

         <StatusModal
            isOpen={statusModal.isOpen}
            onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
            type={statusModal.type}
            message={statusModal.message}
         />

         <div className="max-w-5xl mx-auto">

            {/* HEADER & STATUS BAR */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mb-6">
               {/* Top Bar */}
               <div className="bg-white p-6 border-b flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <Link href="/dashboard/pencaker" className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition"><ArrowLeft size={20} /></Link>
                     <div>
                        <h2 className="text-xl font-bold text-gray-800">Profil Saya</h2>
                        <p className="text-sm text-gray-500">Kelola informasi data diri dan berkas Anda.</p>
                     </div>
                  </div>
                  <Link href="/dashboard/pencaker" className="text-gray-400 hover:text-gray-600 hidden"><X size={24} /></Link>
               </div>

               {/* Status Bar */}
               <div className={`px-6 py-4 text-sm font-bold flex flex-col md:flex-row justify-between items-center border-b ${getStatusColor(formData.account_status || 'unverified')}`}>
                  <div className="flex items-center gap-2 mb-2 md:mb-0">
                     <ShieldCheck size={18} />
                     <span>STATUS AKUN: {(formData.account_status || 'UNVERIFIED').toUpperCase()}</span>
                     {formData.account_status === 'rejected' && (
                        <span className="ml-2 text-xs bg-red-200 text-red-800 px-2 py-1 rounded">Cek Alasan Ditolak</span>
                     )}
                  </div>

                  {/* Tombol Edit Logic */}
                  {!isEditing && (
                     <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 shadow-sm transition-all text-gray-700 text-xs">
                        <Edit size={14} /> Edit Data
                     </button>
                  )}
                  {isEditing && (
                     <span className="flex items-center gap-1 text-xs text-blue-600"><Edit size={12} /> Mode Edit Aktif</span>
                  )}
               </div>

               {/* Pesan Penolakan (Jika Ada) */}
               {formData.account_status === 'rejected' && formData.rejection_message && (
                  <div className="bg-red-50 p-4 border-b border-red-100 flex gap-3 items-start">
                     <AlertTriangle className="text-red-500 shrink-0" size={20} />
                     <div>
                        <h4 className="text-red-800 font-bold text-sm">Verifikasi Ditolak</h4>
                        <p className="text-red-600 text-sm mt-1">"{formData.rejection_message}"</p>
                        <p className="text-red-500 text-xs mt-2">Silakan perbaiki data di bawah ini lalu klik Simpan untuk mengajukan ulang.</p>
                     </div>
                  </div>
               )}
            </div>

            {/* FORM UTAMA */}
            <form onSubmit={handleSaveClick} className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                  {/* KOLOM KIRI: DATA PRIBADI */}
                  <div className="space-y-6">
                     <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2"><User size={18} /> Data Pribadi</h3>

                     <div><label className={labelClass}>Nama Lengkap (Sesuai KTP)</label><input disabled={!isEditing} name="full_name" value={formData.full_name || ''} onChange={handleChange} className={inputClass(isEditing)} /></div>
                     <div><label className={labelClass}>NIK (16 Digit)</label><input disabled={!isEditing} name="nik" type="number" value={formData.nik || ''} onChange={handleChange} className={inputClass(isEditing)} /></div>
                     <div><label className={labelClass}>Email (Permanen)</label><input disabled value={formData.email || ''} className="w-full px-4 py-2 border rounded-lg bg-gray-200 text-gray-500 text-sm cursor-not-allowed" /></div>

                     <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelClass}>Tempat Lahir</label><input disabled={!isEditing} name="place_of_birth" value={formData.place_of_birth || ''} onChange={handleChange} className={inputClass(isEditing)} placeholder="Kota Lahir (Wajib)" /></div>
                        <div><label className={labelClass}>Tanggal Lahir</label><input disabled={!isEditing} type="date" name="date_of_birth" value={formData.date_of_birth || ''} onChange={handleChange} className={inputClass(isEditing)} /></div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className={labelClass}>Agama</label>
                           <select disabled={!isEditing} name="religion" value={formData.religion || 'Islam'} onChange={handleChange} className={inputClass(isEditing)}>
                              <option value="Islam">Islam</option>
                              <option value="Kristen">Kristen</option>
                              <option value="Katolik">Katolik</option>
                              <option value="Hindu">Hindu</option>
                              <option value="Buddha">Buddha</option>
                              <option value="Konghucu">Konghucu</option>
                           </select>
                        </div>
                        <div>
                           <label className={labelClass}>Jenis Kelamin</label>
                           <select disabled={!isEditing} name="gender" value={formData.gender || 'Laki-laki'} onChange={handleChange} className={inputClass(isEditing)}>
                              <option value="Laki-laki">Laki-laki</option>
                              <option value="Perempuan">Perempuan</option>
                           </select>
                        </div>
                     </div>

                     <div>
                        <label className={labelClass}>Pendidikan Terakhir</label>
                        <select disabled={!isEditing} name="education" value={formData.education || 'SMA/SMK'} onChange={handleChange} className={inputClass(isEditing)}>
                           <option>SD/Sederajat</option>
                           <option>SMP/Sederajat</option>
                           <option>SMA/SMK</option>
                           <option>D3</option>
                           <option>S1/D4</option>
                        </select>
                     </div>
                  </div>

                  {/* KOLOM KANAN: KONTAK & DOKUMEN */}
                  <div className="space-y-6">
                     <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2"><MapPin size={18} /> Kontak & Alamat</h3>

                     <div><label className={labelClass}>Nomor WhatsApp</label><input disabled={!isEditing} name="phone" type="tel" value={formData.phone || ''} onChange={handleChange} className={inputClass(isEditing)} /></div>

                     <div><label className={labelClass}>Alamat Sesuai KTP</label><textarea disabled={!isEditing} name="address_ktp" rows={3} value={formData.address_ktp || ''} onChange={handleChange} className={inputClass(isEditing)} /></div>

                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <input type="checkbox" id="sameAddress" disabled={!isEditing} checked={sameAddress} onChange={handleCheckbox} className="rounded text-blue-600" />
                           <label htmlFor="sameAddress" className={`text-xs cursor-pointer ${!isEditing ? 'text-gray-400' : 'text-gray-600'}`}>Domisili sama dengan KTP</label>
                        </div>
                        <label className={labelClass}>Alamat Domisili</label>
                        <textarea disabled={!isEditing || sameAddress} name="address_dom" rows={3} value={formData.address_dom || ''} onChange={handleChange} className={inputClass(isEditing && !sameAddress)} />
                     </div>

                     {/* UPLOAD DOKUMEN */}
                     <h3 className="font-bold text-gray-800 border-b pb-2 mt-8 flex items-center gap-2"><Upload size={18} /> Berkas Dokumen</h3>
                     <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                           <div className="flex items-center gap-3"><FileText size={18} className="text-blue-600" /><span className="text-sm font-medium">Scan KTP</span></div>
                           {isEditing ? <input type="file" name="ktp_url" onChange={handleChange} className="text-[10px] w-24" /> : <span className={`text-xs font-bold ${formData.ktp_url ? 'text-green-600' : 'text-red-500'}`}>{formData.ktp_url ? 'Terupload' : 'Belum Upload'}</span>}
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                           <div className="flex items-center gap-3"><FileText size={18} className="text-blue-600" /><span className="text-sm font-medium">Ijazah Terakhir</span></div>
                           {isEditing ? <input type="file" name="ijazah_url" onChange={handleChange} className="text-[10px] w-24" /> : <span className={`text-xs font-bold ${formData.ijazah_url ? 'text-green-600' : 'text-red-500'}`}>{formData.ijazah_url ? 'Terupload' : 'Belum Upload'}</span>}
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                           <div className="flex items-center gap-3"><FileText size={18} className="text-blue-600" /><span className="text-sm font-medium">Pas Foto 3x4</span></div>
                           {isEditing ? <input type="file" name="photo_url" onChange={handleChange} className="text-[10px] w-24" /> : <span className={`text-xs font-bold ${formData.photo_url ? 'text-green-600' : 'text-red-500'}`}>{formData.photo_url ? 'Terupload' : 'Belum Upload'}</span>}
                        </div>
                     </div>
                     <p className="text-[10px] text-gray-500 italic">*Format: JPG/PNG/PDF. Maks 2MB.</p>
                  </div>
               </div>

               {/* FOOTER ACTION */}
               {isEditing && (
                  <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-end gap-3 max-w-5xl mx-auto shadow-[0_-5px_10px_rgba(0,0,0,0.05)] z-50 animate-slide-up">
                     <button type="button" onClick={() => { setIsEditing(false); window.location.reload() }} className="px-6 py-2 border rounded-lg font-bold text-gray-600 hover:bg-gray-50 text-sm">
                        Batal Edit
                     </button>
                     <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2 text-sm disabled:bg-blue-400">
                        <Save size={18} /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                     </button>
                  </div>
               )}
            </form>

            {/* MODAL KONFIRMASI */}
            {
               showConfirm && (
                  <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-fade-in">
                     <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                           <AlertTriangle className="text-blue-500" size={24} />
                           <h3 className="text-lg font-bold text-gray-800">Simpan Perubahan?</h3>
                        </div>
                        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                           Data Anda akan diajukan kembali untuk verifikasi Admin Dinas.
                           Selama proses verifikasi (Status: Pending), Anda <strong>tidak dapat mengedit data</strong>.
                        </p>
                        <div className="flex justify-end gap-3">
                           <button onClick={() => setShowConfirm(false)} className="px-4 py-2 border rounded-lg text-gray-600 font-bold text-sm hover:bg-gray-50">Batal</button>
                           <button onClick={executeSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700">Ya, Lanjutkan</button>
                        </div>
                     </div>
                  </div>
               )
            }

         </div >
      </div >
   )
}

export default function ProfilePage() {
   return (
      <Suspense fallback={<div className="p-10 text-center text-gray-500">Memuat profil...</div>}>
         <ProfileContent />
      </Suspense>
   )
}