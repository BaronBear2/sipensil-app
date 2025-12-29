'use client'

import { adminUpdateUserAction } from '@/actions/dinas'
import { Save, Lock, User, Briefcase, FileText, Building, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { SwalAlert, SwalToast } from '@/utils/swal'

interface EditUserFormProps {
    profile: any
    role: string
    roleData: any
}

export default function EditUserForm({ profile, role, roleData }: EditUserFormProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleUpdate = async (formData: FormData) => {
        setIsLoading(true)

        try {
            const result = await adminUpdateUserAction(formData)

            if (result?.error) {
                SwalAlert.fire({ icon: 'error', title: 'Gagal Update', text: result.error })
            } else {
                SwalToast.fire({ icon: 'success', title: 'Data Berhasil Diupdate' })
            }
        } catch (error: any) {
            SwalAlert.fire({ icon: 'error', title: 'Terjadi Kesalahan', text: error.message || 'Error tidak diketahui' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <form action={handleUpdate} className="p-8 space-y-8">
                <input type="hidden" name="userId" value={profile.id} />
                <input type="hidden" name="role" value={role} />

                {/* SECTION 1: ACCOUNT & SECURITY */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b pb-2 mb-4">
                        <Lock className="text-gray-400" size={18} />
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Akun & Keamanan</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2">Email (Read Only)</label>
                            <input
                                type="email"
                                defaultValue={profile.email}
                                className="w-full px-4 py-2.5 bg-gray-100 border rounded-xl text-gray-500 text-sm font-bold cursor-not-allowed"
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">Ganti Password (Opsional)</label>
                            <input
                                type="password"
                                name="password"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="Isi untuk mereset password user"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Biarkan kosong jika tidak ingin mengubah password.</p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 mb-2">Nama Lengkap</label>
                            <input
                                type="text"
                                name="full_name"
                                defaultValue={profile.full_name || ''}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 mb-2">Status Akun</label>
                            <select
                                name="account_status"
                                defaultValue={profile.account_status || 'pending'}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                            >
                                <option value="pending">Pending / Unverified</option>
                                <option value="verified">Verified (Aktif)</option>
                                <option value="rejected">Rejected (Ditolak)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: ROLE DETAILS */}
                {role === 'PENCAKER' && (
                    <div className="space-y-4">
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
                                    defaultValue={roleData.nik || ''}
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
                                    defaultValue={roleData.phone || ''}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>

                            {/* Birth & Gender */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Jenis Kelamin</label>
                                <select
                                    name="gender"
                                    defaultValue={roleData.gender || ''}
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
                                        defaultValue={roleData.place_of_birth || ''}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Tanggal Lahir</label>
                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        defaultValue={roleData.date_of_birth || ''}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    />
                                </div>
                            </div>

                            {/* Addresses */}
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Alamat KTP</label>
                                    <textarea
                                        name="address_ktp"
                                        defaultValue={roleData.address_ktp || ''}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Alamat Domisili</label>
                                    <textarea
                                        name="address_dom"
                                        defaultValue={roleData.address_dom || ''}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* Education & Skills */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Pendidikan Terakhir</label>
                                <select
                                    name="education"
                                    defaultValue={roleData.education || ''}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                                >
                                    <option value="">- Pilih -</option>
                                    <option value="SD">SD</option>
                                    <option value="SMP">SMP</option>
                                    <option value="SMA/SMK">SMA/SMK</option>
                                    <option value="D3">D3</option>
                                    <option value="S1">S1</option>
                                    <option value="S2">S2</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Jurusan</label>
                                <input
                                    type="text"
                                    name="major"
                                    defaultValue={roleData.major || ''}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-700 mb-2">Keahlian (Skills)</label>
                                <input
                                    type="text"
                                    name="skills"
                                    defaultValue={roleData.skills || ''}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    placeholder="Contoh: Las, Menjahit, Komputer"
                                />
                            </div>
                        </div>

                        {/* Documents Section */}
                        <div className="flex items-center gap-2 border-b pb-2 mb-4 mt-6">
                            <FileText className="text-gray-400" size={18} />
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Dokumen & Berkas</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {['ktp_url', 'ijazah_url', 'photo_url', 'curriculum_vitae'].map((field) => (
                                <div key={field}>
                                    <label className="block text-xs font-bold text-gray-700 mb-2 capitalize">
                                        {field.replace('_url', '').replace('_', ' ')} (URL)
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            name={field}
                                            defaultValue={roleData[field] || ''}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                            placeholder={`Link to ${field.replace('_url', '')}`}
                                        />
                                        {roleData[field] && (
                                            <Link
                                                href={roleData[field]}
                                                target="_blank"
                                                className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition"
                                                title="Buka Berkas"
                                            >
                                                <FileText size={18} />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {role === 'PERUSAHAAN' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b pb-2 mb-4">
                            <Briefcase className="text-gray-400" size={18} />
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Detail Perusahaan</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Nama Perusahaan</label>
                                <input
                                    type="text"
                                    name="company_name"
                                    defaultValue={roleData.company_name || ''}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">NIB</label>
                                <input
                                    type="text"
                                    name="nib"
                                    defaultValue={roleData.nib || ''}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Sektor Usaha</label>
                                <input
                                    type="text"
                                    name="sector"
                                    defaultValue={roleData.sector || ''}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Email Perusahaan</label>
                                <input
                                    type="email"
                                    name="email_official"
                                    defaultValue={roleData.email_official || ''}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-700 mb-2">Alamat Perusahaan</label>
                                <textarea
                                    name="address"
                                    defaultValue={roleData.address_office || ''}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    rows={3}
                                />
                            </div>

                            {/* Contacts */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Telepon Perusahaan</label>
                                <input
                                    type="text"
                                    name="phone"
                                    defaultValue={roleData.phone || ''}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Nama Direktur</label>
                                <input
                                    type="text"
                                    name="director_name"
                                    defaultValue={roleData.director_name || ''}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Nama PIC (Person In Charge)</label>
                                <input
                                    type="text"
                                    name="pic_name"
                                    defaultValue={roleData.pic_name || ''}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Telepon PIC</label>
                                <input
                                    type="text"
                                    name="pic_phone"
                                    defaultValue={roleData.pic_phone || ''}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {(role === 'LPK') && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b pb-2 mb-4">
                            <Building className="text-gray-400" size={18} />
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Detail LPK</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-700 mb-2">Nama LPK</label>
                                <input
                                    type="text"
                                    name="lpk_name"
                                    defaultValue={roleData.lpk_name || ''}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">NIPS</label>
                                <input
                                    type="text"
                                    name="nips"
                                    defaultValue={roleData.nips || ''}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Tipe LPK</label>
                                <select
                                    name="lpk_type"
                                    defaultValue={roleData.lpk_type || 'Swasta'}
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
                                    defaultValue={roleData.address_office || ''}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    rows={3}
                                />
                            </div>

                            {/* Contacts */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Telepon LPK</label>
                                <input
                                    type="text"
                                    name="phone"
                                    defaultValue={roleData.phone || ''}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Email LPK</label>
                                <input
                                    type="email"
                                    name="email_official"
                                    defaultValue={roleData.email_official || ''}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>

                            {/* Licensing */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Nomor Izin (VIN)</label>
                                <input
                                    type="text"
                                    name="license_number"
                                    defaultValue={roleData.license_number || ''}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Tanggal Izin</label>
                                <input
                                    type="date"
                                    name="license_date"
                                    defaultValue={roleData.license_date || ''}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>

                            {/* Directors */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Nama Direktur</label>
                                <input
                                    type="text"
                                    name="director_name"
                                    defaultValue={roleData.director_name || ''}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">No. HP Direktur</label>
                                <input
                                    type="text"
                                    name="director_phone"
                                    defaultValue={roleData.director_phone || ''}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>

                            {/* Operator / PJ */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Nama Operator / PJ</label>
                                <input
                                    type="text"
                                    name="operational_pj"
                                    defaultValue={roleData.operational_pj || ''}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">No. HP Operator / PJ</label>
                                <input
                                    type="text"
                                    name="operational_pj_phone"
                                    defaultValue={roleData.operational_pj_phone || ''}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="pt-6 border-t flex justify-end gap-3 sticky bottom-0 bg-white p-4 -mx-8 -mb-8 border-t-gray-100 mt-8">
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
                        <Save size={18} /> {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        </>
    )
}
