'use client'

import { adminCreateUserAction } from '@/actions/dinas'
import { Save, Lock, User, Briefcase, FileText, Building, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react'
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
            // Append role manual (karena select di luar form kadang) -> Actually form action contains it all if name="role" is there.
            // But 'selectedRole' state is used to render fields.
            // Let's rely on standard formData passing.

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
                // Redirect logic is likely in server action or we can push router here.
                // But native form action usually redirects.
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

                {/* SECTION 1: ACCOUNT & SECURITY */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b pb-2 mb-4">
                        <Lock className="text-gray-400" size={18} />
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Akun Login</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 mb-2">Nama Lengkap / Nama Entitas</label>
                            <input
                                type="text"
                                name="full_name"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="Nama Lengkap User / Nama Perusahaan / Nama LPK"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="email@contoh.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="Min. 6 Karakter"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>
                </div>

                {/* SECTION 2: ROLE DETAILS */}
                {selectedRole === 'PENCAKER' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex items-center gap-2 border-b pb-2 mb-4">
                            <User className="text-gray-400" size={18} />
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Detail Data Pencaker</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal IDs */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">NIK</label>
                                <input
                                    type="text"
                                    name="nik"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    placeholder="16 digit NIK"
                                    maxLength={16}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">No. HP / WhatsApp</label>
                                <input
                                    type="text"
                                    name="phone"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    placeholder="08..."
                                />
                            </div>

                            {/* Birth & Gender */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Jenis Kelamin</label>
                                <select
                                    name="gender"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                                >
                                    <option value="">- Pilih -</option>
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Tempat Lahir</label>
                                    <input
                                        type="text"
                                        name="place_of_birth"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Tanggal Lahir</label>
                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedRole === 'PERUSAHAAN' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex items-center gap-2 border-b pb-2 mb-4">
                            <Briefcase className="text-gray-400" size={18} />
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Detail Perusahaan</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* NOTE: Company Name is handled by full_name usually, but we can allow specific input if needed, 
                                 usually for Perusahaan full_name = company_name. We'll map it in server action. */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">NIB</label>
                                <input
                                    type="text"
                                    name="nib"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Sektor Usaha</label>
                                <input
                                    type="text"
                                    name="sector"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-700 mb-2">Alamat Kantor</label>
                                <textarea
                                    name="address"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Telepon Perusahaan</label>
                                <input
                                    type="text"
                                    name="phone"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">PIC Name</label>
                                <input
                                    type="text"
                                    name="pic_name"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {(selectedRole === 'LPK') && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex items-center gap-2 border-b pb-2 mb-4">
                            <Building className="text-gray-400" size={18} />
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Detail LPK</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* LPK Name is full_name */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">NIPS</label>
                                <input
                                    type="text"
                                    name="nips"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Tipe LPK</label>
                                <select
                                    name="lpk_type"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                                >
                                    <option value="Swasta">Swasta</option>
                                    <option value="Pemerintah">Pemerintah</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-700 mb-2">Alamat Kantor</label>
                                <textarea
                                    name="address"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Telepon LPK</label>
                                <input
                                    type="text"
                                    name="phone"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                        </div>
                    </div>
                )}

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
