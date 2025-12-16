'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, ChevronLeft, ChevronRight, Edit2, ShieldCheck, ShieldAlert, UserCheck } from 'lucide-react'
import { AutoVerifyButton } from './AdminButtons'
import EditUserModal from './EditUserModal'
import { useDebouncedCallback } from 'use-debounce'

interface UserManagementProps {
    users: any[]
    currentPage: number
    totalPages: number
    totalCount: number
}

export default function UserManagement({ users, currentPage, totalPages, totalCount }: UserManagementProps) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()

    // State for Edit Modal
    const [editingUser, setEditingUser] = useState<any>(null)

    // Handle Search with Debounce
    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set('q', term)
        } else {
            params.delete('q')
        }
        params.set('page', '1') // Reset to page 1 on search
        replace(`${pathname}?${params.toString()}`)
    }, 300)

    // Handle Pagination
    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', page.toString())
        replace(`${pathname}?${params.toString()}`)
    }

    return (
        <div>
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h3 className="font-bold text-slate-700 text-lg flex items-center gap-2">
                        <UserCheck size={20} className="text-green-600" /> Master Data Pencaker
                    </h3>
                    <p className="text-sm text-slate-500">Total {totalCount} pencaker terdaftar</p>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                        className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition"
                        placeholder="Cari nama atau NIK..."
                        onChange={(e) => handleSearch(e.target.value)}
                        defaultValue={searchParams.get('q')?.toString()}
                    />
                </div>
            </div>

            {/* Table or Empty State */}
            {users.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <p className="text-slate-400 font-bold">Tidak ada data ditemukan.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-600 border-b">
                                <tr>
                                    <th className="px-6 py-4">Nama Lengkap / NIK</th>
                                    <th className="px-6 py-4">Kontak</th>
                                    <th className="px-6 py-4">Lokasi & Lahir</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{u.full_name}</div>
                                            <div className="text-xs text-slate-500 font-mono mt-0.5 tracking-wide bg-slate-100 inline-block px-1 rounded">{u.nik}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-slate-600">{u.phone}</div>
                                            <div className="text-xs text-slate-400">{u.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-slate-600">
                                                <span className="font-bold">{u.pob}</span>, {u.dob ? new Date(u.dob).toLocaleDateString('id-ID') : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.account_status === 'verified' ? 'bg-green-100 text-green-700 ring-1 ring-green-600/20' :
                                                    u.account_status === 'rejected' ? 'bg-red-100 text-red-700 ring-1 ring-red-600/20' :
                                                        'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-600/20'
                                                }`}>
                                                {u.account_status === 'verified' ? <ShieldCheck size={10} /> : <ShieldAlert size={10} />}
                                                {u.account_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setEditingUser(u)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Edit Data"
                                                >
                                                    <Edit2 size={16} />
                                                </button>

                                                {/* Fallback AutoVerify if weird status */}
                                                {u.account_status !== 'verified' && (
                                                    <AutoVerifyButton userId={u.id} />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <p className="text-xs text-slate-500">
                            Halaman <span className="font-bold">{currentPage}</span> dari <span className="font-bold">{totalPages}</span>
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage <= 1}
                                className="p-2 bg-white border rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                                className="p-2 bg-white border rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {editingUser && (
                <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} />
            )}
        </div>
    )
}
