'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Building, MapPin, Save, ArrowLeft, ShieldCheck, User, Phone, Briefcase, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function PerusahaanProfilePage() {
    const supabase = createClient()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // State Data Perusahaan
    const [formData, setFormData] = useState({
        company_name: '',
        nib: '', // Nomor Induk Berusaha
        sector: '', // Sektor Usaha

        address_office: '',
        phone: '',
        email_official: '',

        director_name: '', // Pimpinan Perusahaan
        pic_name: '',      // PJ Pemagangan
        pic_phone: '',

        account_status: 'unverified',
        rejection_message: ''
    })

    // 1. Fetch Data
    useEffect(() => {
        const getData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/auth/login'); return }

            const { data: profile } = await supabase.from('profiles').select('*, profile_perusahaan(*)').eq('id', user.id).single()
            if (profile) {
                const comp = profile.profile_perusahaan || {}
                setFormData({
                    ...profile,
                    ...comp,
                    // Map legacy or explicit
                    company_name: comp.company_name || profile.company_name || '',
                    nib: comp.nib || profile.nib || '',
                    sector: comp.sector || profile.sector || '',
                    address_office: comp.address_office || profile.address_office || '',
                    phone: comp.phone || profile.phone || '',
                    email_official: comp.email_official || profile.email_official || '',
                    director_name: comp.director_name || profile.director_name || '',
                    pic_name: comp.pic_name || profile.pic_name || '',
                    pic_phone: comp.pic_phone || profile.pic_phone || ''
                })
            }
            setLoading(false)
        }
        getData()
    }, [])

    // 2. Handle Change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    // 3. Handle Simpan
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!confirm("Simpan data perusahaan? Status akan berubah menjadi Pending verifikasi.")) return

        setSaving(true)
        const { data: { user } } = await supabase.auth.getUser()

        // Update data & Ubah status jadi PENDING
        // 1. Update Base Profile
        const { error: baseError } = await supabase
            .from('profiles')
            .update({
                company_name: formData.company_name, // Keep for base
                phone: formData.phone,
                account_status: 'pending',
                rejection_message: null
            })
            .eq('id', user?.id)

        if (baseError) {
            alert('Gagal update base profil: ' + baseError.message)
            setSaving(false)
            return
        }

        // 2. Upsert Perusahaan Profile
        const { error: detailError } = await supabase
            .from('profile_perusahaan')
            .upsert({
                user_id: user?.id,
                company_name: formData.company_name,
                nib: formData.nib,
                sector: formData.sector,
                address_office: formData.address_office,
                phone: formData.phone,
                email_official: formData.email_official,
                director_name: formData.director_name,
                pic_name: formData.pic_name,
                pic_phone: formData.pic_phone
            }, { onConflict: 'user_id' })

        const error = detailError

        if (error) {
            alert('Gagal: ' + error.message)
        } else {
            alert('Profil berhasil disimpan! Menunggu verifikasi Dinas.')
            router.push('/dashboard/perusahaan')
        }
        setSaving(false)
    }

    if (loading) return <div className="p-10 text-center text-gray-400">Memuat profil...</div>

    const inputClass = "w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-200 transition-all text-sm bg-white"
    const labelClass = "block text-xs font-bold text-gray-600 mb-1"

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans animate-fade-in">
            <div className="max-w-4xl mx-auto">

                {/* HEADER */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/perusahaan" className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition"><ArrowLeft size={20} /></Link>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Profil Perusahaan</h2>
                            <p className="text-sm text-gray-500">Kelola data identitas dan legalitas perusahaan.</p>
                        </div>
                    </div>

                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 ${formData.account_status === 'verified' ? 'bg-green-50 text-green-700 border-green-200' :
                        formData.account_status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-100 text-gray-600'
                        }`}>
                        <ShieldCheck size={14} /> {formData.account_status.toUpperCase()}
                    </div>
                </div>

                {/* ALERT REJECTED */}
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

                        {/* Identitas Perusahaan */}
                        <div className="space-y-5">
                            <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2"><Briefcase size={18} /> Identitas Perusahaan</h3>

                            <div><label className={labelClass}>Nama Perusahaan</label><input required name="company_name" value={formData.company_name} onChange={handleChange} className={inputClass} placeholder="PT. ..." /></div>
                            <div><label className={labelClass}>NIB (Nomor Induk Berusaha)</label><input required name="nib" value={formData.nib} onChange={handleChange} className={inputClass} placeholder="8120xxxxxxxx" /></div>
                            <div><label className={labelClass}>Sektor Usaha</label><input required name="sector" value={formData.sector} onChange={handleChange} className={inputClass} placeholder="Manufaktur, Jasa, dll" /></div>
                        </div>

                        {/* Lokasi & Kontak */}
                        <div className="space-y-5">
                            <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2"><MapPin size={18} /> Lokasi & Kontak</h3>

                            <div><label className={labelClass}>Alamat Kantor / Pabrik</label><textarea required name="address_office" rows={3} value={formData.address_office} onChange={handleChange} className={inputClass} /></div>
                            <div><label className={labelClass}>Email Resmi</label><input required name="email_official" type="email" value={formData.email_official} onChange={handleChange} className={inputClass} /></div>
                            <div><label className={labelClass}>No. Telepon Kantor</label><input required name="phone" value={formData.phone} onChange={handleChange} className={inputClass} /></div>
                        </div>

                        {/* PIC / Pimpinan */}
                        <div className="space-y-5">
                            <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2"><User size={18} /> Manajemen & PIC</h3>

                            <div><label className={labelClass}>Nama Pimpinan / Direktur</label><input required name="director_name" value={formData.director_name} onChange={handleChange} className={inputClass} /></div>
                            <div><label className={labelClass}>Nama PIC Pemagangan (HRD)</label><input required name="pic_name" value={formData.pic_name} onChange={handleChange} className={inputClass} /></div>
                            <div><label className={labelClass}>No. HP PIC</label><input required name="pic_phone" value={formData.pic_phone} onChange={handleChange} className={inputClass} placeholder="08xxxxxxxx" /></div>
                        </div>

                    </div>

                    <div className="mt-10 pt-6 border-t flex justify-end gap-3">
                        <Link href="/dashboard/perusahaan" className="px-6 py-2 border rounded-lg font-bold text-gray-600 hover:bg-gray-50 text-sm flex items-center justify-center">Batal</Link>
                        <button type="submit" disabled={saving} className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 flex items-center gap-2 text-sm disabled:bg-gray-400 shadow-lg shadow-purple-200">
                            <Save size={18} /> {saving ? 'Menyimpan...' : 'Simpan & Ajukan'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    )
}
