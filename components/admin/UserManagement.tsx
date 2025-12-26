'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, ChevronLeft, ChevronRight, Edit2, UserCheck, User, Building, Store, Phone, Users, Trash2, X, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useDebouncedCallback } from 'use-debounce'
import { useState } from 'react'
import { deleteUserAction } from '@/actions/dinas'

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
    const { replace, refresh } = useRouter()

    // State for Modal
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [modal, setModal] = useState<{ type: 'success' | 'error', title: string, message: string } | null>(null)

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

    // Modal Helpers
    const openDeleteModal = (user: any) => {
        setSelectedUser(user)
        setIsDeleteOpen(true)
    }

    const closeDeleteModal = () => {
        setIsDeleteOpen(false)
        setSelectedUser(null)
        setLoading(false)
    }

    const closeModal = () => setModal(null)

    // Execute Delete
    const handleDelete = async () => {
        if (!selectedUser) return
        setLoading(true)

        try {
            const formData = new FormData()
            formData.append('userId', selectedUser.id)

            const res = await deleteUserAction(formData)

            if (res?.error) {
                const isNetworkError = res.error.toLowerCase().includes('fetch') || res.error.toLowerCase().includes('network')
                setModal({
                    type: 'error',
                    title: isNetworkError ? 'Gagal Terhubung' : 'Gagal Menghapus',
                    message: isNetworkError
                        ? 'Terjadi masalah koneksi ke server. Periksa koneksi internet Anda dan coba lagi.'
                        : res.error
                })
                // Close delete modal so the error is visible
                setIsDeleteOpen(false)
            } else {
                setModal({
                    type: 'success',
                    title: 'Berhasil Dihapus',
                    message: `Pengguna ${selectedUser.full_name} berhasil dihapus.`
                })
                closeDeleteModal()
                // Force UI to sync with Server Data to remove zombie rows visual
                refresh()
            }
        } catch (error: any) {
            const isNetworkError = error.message?.toLowerCase().includes('fetch') || error.message?.toLowerCase().includes('network')
            setModal({
                type: 'error',
                title: isNetworkError ? 'Gagal Terhubung' : 'Terjadi Kesalahan',
                message: isNetworkError
                    ? 'Terjadi masalah koneksi ke server. Periksa koneksi internet Anda dan coba lagi.'
                    : error.message || 'Terjadi kesalahan sistem.'
            })
            setIsDeleteOpen(false)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="font-sans">
            {/* HERO SECTION */}
            <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white pt-8 pb-20 px-6 md:px-12 relative overflow-hidden rounded-b-3xl shadow-lg mb-8">
                <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                    <User size={300} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                                <Users size={24} className="text-white" />
                            </div>
                            <span className="font-bold tracking-wider text-red-100 uppercase text-sm">Modul Administrator</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight text-white">
                            Manajemen Pengguna
                        </h1>
                        <p className="text-red-100 font-medium text-lg max-w-xl">
                            Kelola data seluruh pengguna, validasi akun, dan pantau aktivitas user dalam satu tampilan terpadu.
                        </p>
                    </div>

                    {/* Quick Stats or Status */}
                    <div className="flex gap-4">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-center">
                            <h3 className="text-2xl font-bold text-white">{totalCount}</h3>
                            <p className="text-xs text-red-100 uppercase font-bold tracking-wider">Total User</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-center hidden md:block">
                            <h3 className="text-2xl font-bold text-white">{currentPage} / {totalPages}</h3>
                            <p className="text-xs text-red-100 uppercase font-bold tracking-wider">Halaman</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar Section: Tabs & Search (Floating Up) */}
            <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-xl -mt-16 mx-4 md:mx-0 relative z-20 flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
                {/* Custom Tabs */}
                <div className="flex p-1 bg-gray-50 rounded-xl w-full md:w-auto overflow-x-auto relative">
                    <Link
                        href={`${pathname}?role=PENCAKER`}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${currentRole === 'PENCAKER' ? 'bg-white text-red-600 shadow-md ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <User size={18} />
                        <span>Pencaker</span>
                    </Link>
                    <Link
                        href={`${pathname}?role=PERUSAHAAN`}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${currentRole === 'PERUSAHAAN' ? 'bg-white text-red-600 shadow-md ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Store size={18} />
                        <span>Perusahaan</span>
                    </Link>
                    <Link
                        href={`${pathname}?role=LPK`}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${currentRole === 'LPK' ? 'bg-white text-red-600 shadow-md ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Building size={18} />
                        <span>LPK</span>
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-80 mr-2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Cari nama, email, atau NIK..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-100 rounded-xl text-sm transition outline-none font-medium"
                        onChange={(e) => handleSearch(e.target.value)}
                        defaultValue={searchParams.get('q')?.toString()}
                    />
                </div>
            </div>

            {/* Table or Empty State */}
            {users.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <UserCheck size={40} />
                    </div>
                    <h3 className="text-gray-800 font-bold text-lg">Tidak ada data ditemukan</h3>
                    <p className="text-gray-400 text-sm">Coba ubah kata kunci pencarian atau filter.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/50 text-xs font-bold uppercase text-gray-500 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 pl-8">Pengguna</th>
                                    <th className="px-6 py-4">{getSecondColumnHeader()}</th>
                                    <th className="px-6 py-4">Tanggal Daftar</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-4 pl-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-white">
                                                    {currentRole === 'PENCAKER' ? <User size={18} /> :
                                                        currentRole === 'PERUSAHAAN' ? <Store size={18} /> :
                                                            <Building size={18} />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{u.full_name}</div>
                                                    <div className="text-xs text-gray-500">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {currentRole === 'PENCAKER' && (
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs border border-gray-200 text-gray-600">{u.nik || '-'}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Phone size={10} /> {u.phone || '-'}
                                                    </div>
                                                </div>
                                            )}
                                            {currentRole === 'PERUSAHAAN' && (
                                                <div className="space-y-1">
                                                    <div className="font-bold text-gray-700">{u.company_name || '-'}</div>
                                                    <div className="text-xs text-gray-500">NIB: {u.nib || '-'}</div>
                                                </div>
                                            )}
                                            {currentRole === 'LPK' && (
                                                <div className="space-y-1">
                                                    <div className="font-bold text-gray-700">{u.lpk_name || '-'}</div>
                                                    <div className="text-xs text-gray-500">{u.phone || '-'}</div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-bold text-gray-600">
                                                {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                            <div className="text-[10px] text-gray-400">
                                                {new Date(u.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${u.account_status === 'verified'
                                                ? 'bg-green-50 text-green-700 border border-green-200'
                                                : u.account_status === 'rejected'
                                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                                    : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${u.account_status === 'verified' ? 'bg-green-500' :
                                                    u.account_status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                                                    }`} />
                                                {u.account_status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={`/dashboard/dinas/users/${u.id}/edit`}
                                                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-all text-xs font-bold flex items-center gap-2 border border-blue-200"
                                                    title="Edit Data User"
                                                >
                                                    <Edit2 size={12} /> Edit
                                                </Link>
                                                <button
                                                    onClick={() => openDeleteModal(u)}
                                                    className="px-3 py-1.5 bg-white text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all text-xs font-bold flex items-center gap-2 border border-red-200"
                                                    title="Hapus Data User"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
                        <p className="text-xs text-gray-500">
                            Menampilkan halaman <span className="font-bold text-gray-800">{currentPage}</span> dari <span className="font-bold text-gray-800">{totalPages}</span>
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage <= 1}
                                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {isDeleteOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                        <div className="px-6 py-6 text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Pengguna Ini?</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Anda akan menghapus pengguna <span className="font-bold text-gray-800">{selectedUser.full_name}</span>.
                                <br />
                                Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait.
                            </p>

                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={closeDeleteModal}
                                    disabled={loading}
                                    className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-200 flex items-center gap-2"
                                >
                                    {loading ? 'Menghapus...' : 'Hapus User'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STATUS MODAL */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
                        <div className="px-6 py-6 text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${modal.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {modal.type === 'success' ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{modal.title}</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                {modal.message}
                            </p>

                            <button
                                onClick={closeModal}
                                className={`w-full px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg text-white ${modal.type === 'success' ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'}`}
                            >
                                {modal.type === 'success' ? 'Selesai' : 'Tutup'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
