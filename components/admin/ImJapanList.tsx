'use client'

import Link from 'next/link'
import { Eye, CheckCircle } from 'lucide-react'

// Define the interface for the props relative to what the parent page passes
interface ImJapanListProps {
    registrations: any[]
}

export default function ImJapanList({ registrations }: ImJapanListProps) {
    if (!registrations || registrations.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                <p>Tidak ada data ditemukan.</p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border rounded-lg">
                <thead className="bg-gray-100 text-xs font-bold uppercase text-gray-700">
                    <tr>
                        <th className="px-4 py-3">Pelamar</th>
                        <th className="px-4 py-3">Batch</th>
                        <th className="px-4 py-3">Dokumen</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {registrations.map((item: any) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                            <td className="px-4 py-3">
                                <div className="font-bold text-gray-900">{item.user?.full_name || 'Tanpa Nama'}</div>
                                <div className="text-xs text-gray-500 font-mono">{item.user?.nik || '-'}</div>
                            </td>
                            <td className="px-4 py-3">
                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">
                                    {item.batch || 'Batch -'}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <FileIcon count={item.documents ? Object.keys(item.documents).length : 0} />
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <BadgeStatus status={item.status} />
                            </td>
                            <td className="px-4 py-3 text-center">
                                <Link
                                    href={`/dashboard/dinas/im-japan/${item.id}`}
                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition border shadow-sm
                                        ${item.status === 'PENDING'
                                            ? 'bg-red-600 text-white hover:bg-red-700 border-transparent'
                                            : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'
                                        }`}
                                >
                                    {item.status === 'PENDING' ? (
                                        <>Verifikasi</>
                                    ) : (
                                        <><Eye size={12} /> Detail</>
                                    )}
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function BadgeStatus({ status }: { status: string }) {
    if (status === 'VERIFIED' || status === 'APPROVED') {
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 flex w-fit items-center gap-1"><CheckCircle size={10} /> Diterima</span>
    }
    if (status === 'REJECTED') {
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Ditolak</span>
    }
    return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">Menunggu</span>
}

function FileIcon({ count }: { count: number }) {
    return (
        <span className="flex items-center gap-1">
            📄 {count} File
        </span>
    )
}
