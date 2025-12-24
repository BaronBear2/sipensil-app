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
    currentRole?: string
}

export default function UserManagement({ users, currentPage, totalPages, totalCount, currentRole = 'PENCAKER' }: UserManagementProps) {
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

    // Role-based Header Logic
    const getSecondColumnHeader = () => {
        switch (currentRole) {
            case 'PENCAKER': return 'NIK & Kontak';
            case 'PERUSAHAAN': return 'Perusahaan & NIB';
            case 'LPK': return 'Nama LPK & Kontak';
            default: return 'Detail Info';
        }
    }

    return (
        <div>
            {/* Header Controls (Search and Stats already in page.tsx, but standard Layout here too) */}
            {/* ... Actually page.tsx has SearchInput now. We might duplicate search if we leave it here. 
                But UserManagement is designed as a self-contained table component.
                Let's keep the Search inside here as per previous design, OR remove it if Page handles it.
                The previous file had search inside. 
                However, in page.tsx I added <SearchInput /> above <UserManagement />.
                So I should REMOVE the search bar from here to avoid duplication.
            */}

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
                                    <th className="px-6 py-4">Nama Lengkap / Email</th>
                                    <th className="px-6 py-4">{getSecondColumnHeader()}</th>
                                    <th className="px-6 py-4">Lokasi & Reg</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{u.full_name}</div>
                                            <div className="text-xs text-slate-500">{u.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {currentRole === 'PENCAKER' && (
                                                <>
                                                    <div className="font-bold text-slate-700">{u.nik || '-'}</div>
                                                    <div className="text-xs text-slate-500">{u.phone || '-'}</div>
                                                </>
                                            )}
                                            {currentRole === 'PERUSAHAAN' && (
                                                <>
                                                    <div className="font-bold text-slate-700">{u.company_name || '-'}</div>
                                                    <div className="text-xs text-slate-500">NIB: {u.nib || '-'}</div>
                                                </>
                                            )}
                                            {currentRole === 'LPK' && (
                                                <>
                                                    <div className="font-bold text-slate-700">{u.lpk_name || '-'}</div>
                                                    <div className="text-xs text-slate-500">{u.phone || '-'}</div>
                                                </>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-slate-600">
                                                {u.pob ? <span className="font-bold">{u.pob}, </span> : ''}
                                                {u.dob ? new Date(u.dob).toLocaleDateString('id-ID') : '-'}
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-1">
                                                {new Date(u.created_at).toLocaleDateString()}
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
                                                {(u.account_status !== 'verified' && u.account_status !== 'rejected') && (
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
