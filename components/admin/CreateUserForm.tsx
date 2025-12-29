'use client'

import { adminCreateUserAction } from '@/actions/dinas'
import { Save, Lock, User, Briefcase, FileText, Building, AlertTriangle, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SwalAlert, SwalToast } from '@/utils/swal'

export default function CreateUserForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [selectedRole, setSelectedRole] = useState<string>('PENCAKER')
    const router = useRouter()

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true)

        // Validate password match
        const password = formData.get('password') as string
        const confirm = formData.get('confirm_password') as string

        if (password !== confirm) {
            SwalAlert.fire({ icon: 'error', title: 'Validasi Gagal', text: 'Password dan Konfirmasi Password tidak cocok.' })
            setIsLoading(false)
            return
        }

        try {
            const result = await adminCreateUserAction(formData)

            if (result?.error) {
                const isNetworkError = result.error.toLowerCase().includes('fetch') || result.error.toLowerCase().includes('network')
                SwalAlert.fire({
                    icon: 'error',
                    title: isNetworkError ? 'Gagal Terhubung' : 'Gagal Membuat User',
                    text: isNetworkError ? 'Periksa koneksi internet.' : result.error
                })
            } else {
                SwalToast.fire({ icon: 'success', title: 'User Berhasil Dibuat' })
            }
        } catch (error: any) {
            SwalAlert.fire({ icon: 'error', title: 'Terjadi Kesalahan', text: error.message })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <form action={handleSubmit} className="p-8 space-y-8">
                {/* SECTION: ROLE SELECTION */}
                <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Pilih Role Akun</label>
                    <div className="flex flex-wrap gap-4">
                        {['PENCAKER', 'PERUSAHAAN', 'LPK'].map((role) => (
                            <label key={role} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${selectedRole === role ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value={role}
                                    checked={selectedRole === role}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="font-bold text-gray-700 text-sm">{role === 'PENCAKER' ? 'PENCAKER' : role}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* --- BAGIAN 1: DATA WAJIB (REGISTRASI) --- */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-2">
                        <Lock className="text-slate-500" size={18} />
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Data Wajib (Form Registrasi)</h3>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Common Account Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-700 mb-2">
                                    {selectedRole === 'PENCAKER' ? 'Nama Lengkap (Sesuai KTP)' : selectedRole === 'LPK' ? 'Nama Lembaga (LPK)' : 'Nama Perusahaan'} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="full_name"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    placeholder={selectedRole === 'PENCAKER' ? 'Nama Lengkap User' : selectedRole === 'LPK' ? 'Nama LPK' : 'Nama PT/CV'}
                                    required
                                />
                            </div>

                            {/* Role Specific Mandatory Fields */}
                            {selectedRole === 'PENCAKER' && (
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 mb-2">NIK <span className="text-red-500">*</span></label>
                                    <input type="text" name="nik" required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="16 digit NIK" maxLength={16} />
                                </div>
                            )}

                            {selectedRole === 'PERUSAHAAN' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-2">NIB <span className="text-red-500">*</span></label>
                                        <input type="text" name="nib" required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-2">Telepon HRD <span className="text-red-500">*</span></label>
                                        <input type="text" name="phone" required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                                    </div>
                                </>
                            )}

                            {selectedRole === 'LPK' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-2">Nama PJ Operasional <span className="text-red-500">*</span></label>
                                        <input type="text" name="operational_pj" required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-2">Jabatan PJ <span className="text-red-500">*</span></label>
                                        <input type="text" name="operational_pj_title" required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-2">No. HP PJ <span className="text-red-500">*</span></label>
                                        <input type="text" name="operational_pj_phone" required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                                    </div>
                                </>
                            )}

                            {/* Credentials */}
                            <div className="md:col-span-2 border-t border-dashed my-2"></div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-700 mb-2">Email Login <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    name="email"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    placeholder="email@contoh.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Password <span className="text-red-500">*</span></label>
                                <input
                                    type="password"
                                    name="password"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    placeholder="Min. 6 Karakter"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Konfirmasi Password <span className="text-red-500">*</span></label>
                                <input
                                    type="password"
                                    name="confirm_password"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    placeholder="Ulangi Password"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- BAGIAN 2: DATA OPSIONAL (PROFIL) --- */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-2">
                        <User className="text-slate-500" size={18} />
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Data Tambahan (Edit Profil) - Opsional</h3>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* PENCAKER OPTIONAL */}
                        {selectedRole === 'PENCAKER' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">No. HP / WhatsApp (Pribadi)</label>
                                    <input type="text" name="phone" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="Opsional" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Jenis Kelamin</label>
                                    <select name="gender" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white">
                                        <option value="">- Pilih -</option>
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Tempat Lahir</label>
                                    <input type="text" name="place_of_birth" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Tanggal Lahir</label>
                                    <input type="date" name="date_of_birth" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Agama</label>
                                    <select name="religion" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white">
                                        <option value="">- Pilih -</option>
                                        <option value="Islam">Islam</option>
                                        <option value="Kristen">Kristen</option>
                                        <option value="Katolik">Katolik</option>
                                        <option value="Hindu">Hindu</option>
                                        <option value="Buddha">Buddha</option>
                                        <option value="Konghucu">Konghucu</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Pendidikan Terakhir</label>
                                    <select name="education" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white">
                                        <option value="">- Pilih -</option>
                                        <option value="SD/Sederajat">SD/Sederajat</option>
                                        <option value="SMP/Sederajat">SMP/Sederajat</option>
                                        <option value="SMA/SMK">SMA/SMK</option>
                                        <option value="D3">D3</option>
                                        <option value="S1/D4">S1/D4</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Alamat KTP</label>
                                    <textarea name="address_ktp" rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Alamat Domisili</label>
                                    <textarea name="address_dom" rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                                </div>
                            </div>
                        )}

                        {/* PERUSAHAAN OPTIONAL */}
                        {selectedRole === 'PERUSAHAAN' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Sektor Usaha</label>
                                    <input type="text" name="sector" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Email Resmi (Official)</label>
                                    <input type="email" name="email_official" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Nama Pimpinan / Direktur</label>
                                    <input type="text" name="director_name" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Nama PIC Pemagangan</label>
                                    <input type="text" name="pic_name" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">No. HP PIC</label>
                                    <input type="text" name="pic_phone" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Alamat Kantor</label>
                                    <textarea name="address_office" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" rows={3} />
                                </div>
                            </div>
                        )}

                        {/* LPK OPTIONAL */}
                        {(selectedRole === 'LPK') && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">NIPS</label>
                                    <input type="text" name="nips" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Tipe LPK</label>
                                    <select name="lpk_type" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white">
                                        <option value="Swasta">Swasta</option>
                                        <option value="Pemerintah">Pemerintah</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">No. Izin / Tanda Daftar</label>
                                    <input type="text" name="license_number" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Tanggal Izin</label>
                                    <input type="date" name="license_date" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Fax</label>
                                    <input type="text" name="fax" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Email Resmi LPK</label>
                                    <input type="email" name="email_official" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Nama Kepala / Direktur</label>
                                    <input type="text" name="director_name" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">No. HP Direktur</label>
                                    <input type="text" name="director_phone" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Alamat Kantor</label>
                                    <textarea name="address_office" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" rows={3} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Telepon LPK</label>
                                    <input type="text" name="phone" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-6 border-t flex justify-end gap-3 sticky bottom-0 bg-white p-4 -mx-8 -mb-8 border-t-gray-100 mt-8 z-10">
                    <Link
                        href="/dashboard/dinas/users"
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-600/20"
                    >
                        <Save size={18} /> {isLoading ? 'Menyimpan...' : 'Buat Akun'}
                    </button>
                </div>
            </form>
        </>
    )
}
