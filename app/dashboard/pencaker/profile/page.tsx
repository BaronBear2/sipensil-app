'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { User, MapPin, Upload, Save, ArrowLeft, ShieldCheck, Lock, Edit, FileText, AlertTriangle, X } from 'lucide-react'
import Link from 'next/link'
import StatusModal from '@/components/ui/StatusModal'

// ... (Same Imports)

export default function ProfilePage() {
   const supabase = createClient()
   const router = useRouter()

   // State UI
   const [loading, setLoading] = useState(true)
   const [saving, setSaving] = useState(false)
   const [isEditing, setIsEditing] = useState(false)
   const [showConfirm, setShowConfirm] = useState(false)
   const [hasPendingApp, setHasPendingApp] = useState(false)

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
      pob: '',
      dob: '',
      gender: 'Laki-laki',
      education: 'SMA/SMK',
      address_ktp: '',
      address_dom: '',
      account_status: 'unverified',
      rejection_message: ''
   })

   const [sameAddress, setSameAddress] = useState(false)

   // 1. FETCH DATA SAAT LOAD
   useEffect(() => {
      const getData = async () => {
         const { data: { user } } = await supabase.auth.getUser()
         if (!user) { router.push('/auth/login'); return }

         const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

         if (profile) {
            setFormData(profile)

            // Cek Pending Applications (Training OR IM Japan)
            const { count: trainingCount } = await supabase
               .from('training_registrations')
               .select('*', { count: 'exact', head: true })
               .eq('user_id', user.id)
               .eq('status', 'PENDING')

            const { count: imCount } = await supabase
               .from('im_japan_registrations')
               .select('*', { count: 'exact', head: true })
               .eq('user_id', user.id)
               .eq('status', 'PENDING') // Assuming status column exists and uses 'PENDING'

            if ((trainingCount && trainingCount > 0) || (imCount && imCount > 0)) {
               setHasPendingApp(true)
               setIsEditing(false)
            }
         }
         setLoading(false)
      }
      getData()
   }, [])

   // 2. LOGIC FORM
   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target
      setFormData(prev => ({ ...prev, [name]: value }))

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
      // Tampilkan Modal Konfirmasi
      setShowConfirm(true)
   }

   const executeSave = async () => {
      setSaving(true)
      setShowConfirm(false)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Logic: Simpan data TANPA mentrigger verifikasi admin (Status: Unverified)
      // Admin baru akan verifikasi saat user Apply Training / IM Japan
      const { error } = await supabase
         .from('profiles')
         .update({
            ...formData,
            account_status: formData.account_status === 'verified' ? 'unverified' : (formData.account_status || 'unverified'),
            rejection_message: null,
            last_data_update: new Date()
         })
         .eq('id', user.id)

      if (error) {
         setStatusModal({
            isOpen: true,
            type: 'error',
            message: 'Gagal menyimpan: ' + error.message
         })
      } else {
         // Refresh state lokal agar UI update otomatis
         setFormData(prev => ({ ...prev, account_status: 'unverified' }))
         setIsEditing(false)
         setStatusModal({
            isOpen: true,
            type: 'success',
            message: 'Data Berhasil Disimpan! Silakan lanjutkan pendaftaran pelatihan.'
         })
      }
      setSaving(false)
   }

   // Logic Styling
   const inputClass = (active: boolean) => `w-full px-4 py-2 border rounded-lg outline-none transition-all text-sm ${active ? 'bg-white border-blue-300 focus:ring-2 focus:ring-blue-200' : 'bg-gray-50 border-transparent text-gray-700 cursor-not-allowed'}`
   const labelClass = "block text-xs font-bold text-gray-600 mb-1"

   // Logic Status Color
   const getStatusColor = (status: string) => {
      if (status === 'verified') return 'bg-green-50 text-green-700 border-green-200'
      // Pending status visual might still be useful if we use it, but logic relies on Application status now
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
                  <Link href="/dashboard/pencaker" className="text-gray-400 hover:text-gray-600"><X size={24} /></Link>
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
                  {!isEditing && !hasPendingApp && (
                     <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 shadow-sm transition-all text-gray-700 text-xs">
                        <Edit size={14} /> Edit Data
                     </button>
                  )}
                  {!isEditing && hasPendingApp && (
                     <span className="flex items-center gap-1 text-xs opacity-80 font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded"><Lock size={12} /> Profil Dikunci (Ada Pendaftaran Aktif)</span>
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
                        <div><label className={labelClass}>Tempat Lahir</label><input disabled={!isEditing} name="pob" value={formData.pob || ''} onChange={handleChange} className={inputClass(isEditing)} /></div>
                        <div><label className={labelClass}>Tanggal Lahir</label><input disabled={!isEditing} type="date" name="dob" value={formData.dob || ''} onChange={handleChange} className={inputClass(isEditing)} /></div>
                     </div>

                     <div>
                        <label className={labelClass}>Jenis Kelamin</label>
                        <select disabled={!isEditing} name="gender" value={formData.gender || 'Laki-laki'} onChange={handleChange} className={inputClass(isEditing)}>
                           <option value="Laki-laki">Laki-laki</option>
                           <option value="Perempuan">Perempuan</option>
                        </select>
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

                     {/* UPLOAD DOKUMEN (UI MATCHING SCRIPT ASLI) */}
                     <h3 className="font-bold text-gray-800 border-b pb-2 mt-8 flex items-center gap-2"><Upload size={18} /> Berkas Dokumen</h3>
                     <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                           <div className="flex items-center gap-3"><FileText size={18} className="text-blue-600" /><span className="text-sm font-medium">Scan KTP</span></div>
                           {isEditing ? <input type="file" className="text-[10px] w-24" /> : <span className="text-xs text-green-600 font-bold">Terupload</span>}
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                           <div className="flex items-center gap-3"><FileText size={18} className="text-blue-600" /><span className="text-sm font-medium">Ijazah Terakhir</span></div>
                           {isEditing ? <input type="file" className="text-[10px] w-24" /> : <span className="text-xs text-green-600 font-bold">Terupload</span>}
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                           <div className="flex items-center gap-3"><FileText size={18} className="text-blue-600" /><span className="text-sm font-medium">Pas Foto 3x4</span></div>
                           {isEditing ? <input type="file" className="text-[10px] w-24" /> : <span className="text-xs text-green-600 font-bold">Terupload</span>}
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
            {showConfirm && (
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
            )}

         </div>
      </div>
   )
}