'use client'

import { useState } from 'react'
import { X, Save, User, Phone, CreditCard } from 'lucide-react'
import { adminUpdateUserAction } from '@/actions/dinas'

interface EditUserModalProps {
    user: any
    onClose: () => void
}

export default function EditUserModal({ user, onClose }: EditUserModalProps) {
    const [loading, setLoading] = useState(false)

    // Helper to close on background click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose()
    }

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up">
                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <User className="text-blue-600" size={20} /> Edit Data Pencaker
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form action={async (formData) => {
                    setLoading(true)
                    await adminUpdateUserAction(formData)
                    setLoading(false)
                    onClose() // Close modal logic needs reload usually, action revalidates path
                    // We might need a way to refresh the parent list without full reload if we were fancy
                    // For now, revalidatePath happening on server will update data if we refresh page or router refresh
                    // But client component needs a router.refresh() or window.location.reload()
                    window.location.reload()
                }}>
                    <input type="hidden" name="userId" value={user.id} />

                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Lengkap</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-slate-400" size={16} />
                                <input
                                    name="full_name"
                                    defaultValue={user.full_name}
                                    className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">NIK (Nomor Induk Kependudukan)</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-3 text-slate-400" size={16} />
                                <input
                                    name="nik"
                                    defaultValue={user.nik}
                                    className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nomor Telepon / WA</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 text-slate-400" size={16} />
                                <input
                                    name="phone"
                                    defaultValue={user.phone}
                                    className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    required
                                />
                            </div>
                        </div>

                        {/* Additional Info display only */}
                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs text-slate-500">
                            <div>
                                <span className="block font-bold">Tempat Lahir</span>
                                {user.pob || '-'}
                            </div>
                            <div>
                                <span className="block font-bold">Tanggal Lahir</span>
                                {user.dob ? new Date(user.dob).toLocaleDateString('id-ID') : '-'}
                            </div>
                            <div>
                                <span className="block font-bold">Email</span>
                                {user.email || '-'}
                            </div>
                            <div>
                                <span className="block font-bold">Status Saat Ini</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-block mt-1 ${user.account_status === 'verified' ? 'bg-green-100 text-green-700' :
                                        user.account_status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {user.account_status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 font-bold text-sm bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <span className="animate-spin text-white">⏳</span> : <Save size={16} />}
                            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
