'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Home, Users, ClipboardList, Building, FileText, Settings, LogOut, ChevronDown, ChevronRight, GraduationCap, FileCheck, Layers } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import logoSipensil from '@/assets/logo/logo-sipensil.jpeg'

// Define Recursive Menu Type
type MenuItem = {
    name: string
    href?: string
    icon?: any
    children?: MenuItem[]
}

const MENU_ITEMS: MenuItem[] = [
    { name: 'Dashboard', href: '/dashboard/dinas', icon: Home },
    {
        name: 'Menu Pencaker',
        icon: Users,
        children: [
            {
                name: 'Pelatihan BLK',
                // icon: GraduationCap, // Optional sub-icon
                children: [
                    { name: 'Verifikasi Pending', href: '/dashboard/dinas/verifikasi-pencaker?status=pending' },
                    { name: 'Data Pelatihan BLK', href: '/dashboard/dinas/pelatihan' },
                    { name: 'Data Pencaker Saat Ini', href: '/dashboard/dinas/peserta' }, // Filter logic to be added
                    {
                        name: 'Riwayat Verifikasi',
                        children: [
                            { name: 'Pencaker Diterima', href: '/dashboard/dinas/verifikasi-pencaker?status=verified' },
                            { name: 'Pencaker Ditolak', href: '/dashboard/dinas/verifikasi-pencaker?status=rejected' },
                        ]
                    }
                ]
            },
            {
                name: 'IM-Japan',
                children: [
                    { name: 'Verifikasi Pending', href: '/dashboard/dinas/im-japan?status=pending' },
                    { name: 'Edit Persyaratan', href: '/dashboard/dinas/im-japan/requirements' },
                    { name: 'Berkas Diterima', href: '/dashboard/dinas/im-japan?status=verified&view=files' }, // Placeholder param
                    {
                        name: 'Riwayat Verifikasi',
                        children: [
                            { name: 'Permohonan Diterima', href: '/dashboard/dinas/im-japan?status=verified' },
                            { name: 'Permohonan Ditolak', href: '/dashboard/dinas/im-japan?status=rejected' },
                        ]
                    }
                ]
            },
            { name: 'Data Akun Pencaker', href: '/dashboard/dinas/users?role=PENCAKER' }
        ]
    },
    {
        name: 'Menu LPK',
        icon: Building,
        children: [
            {
                name: 'Laporan Periodik 6 Bulan',
                children: [
                    { name: 'Verifikasi Pending', href: '/dashboard/dinas/lpk?status=pending' },
                    { name: 'Laporan Diterima', href: '/dashboard/dinas/lpk?status=approved' },
                    {
                        name: 'Riwayat Verifikasi',
                        children: [
                            { name: 'Laporan Diterima', href: '/dashboard/dinas/lpk?status=approved' },
                            { name: 'Laporan Ditolak', href: '/dashboard/dinas/lpk?status=rejected' },
                        ]
                    }
                ]
            },
            { name: 'Data Akun LPK', href: '/dashboard/dinas/users?role=LPK' }
        ]
    },
    {
        name: 'Menu Perusahaan',
        icon: FileText,
        children: [
            {
                name: 'Pencatatan Peserta Magang',
                children: [
                    { name: 'Verifikasi Pending', href: '/dashboard/dinas/pemagangan?status=pending' },
                    { name: 'Pencatatan Diterima', href: '/dashboard/dinas/pemagangan?status=approved' },
                    {
                        name: 'Riwayat Verifikasi',
                        children: [
                            { name: 'Pencatatan Diterima', href: '/dashboard/dinas/pemagangan?status=approved' },
                            { name: 'Pencatatan Ditolak', href: '/dashboard/dinas/pemagangan?status=rejected' },
                        ]
                    }
                ]
            },
            { name: 'Data Akun Perusahaan', href: '/dashboard/dinas/users?role=PERUSAHAAN' }
        ]
    },
    { name: 'Manajemen User', href: '/dashboard/dinas/users', icon: Settings },
]

export default function AdminSidebar() {
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    return (
        <aside className="w-64 bg-white border-r border-gray-100 min-h-screen hidden md:flex flex-col sticky top-0 h-screen overflow-hidden">
            <div className="p-6 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Image src={logoSipensil} alt="Logo Sipensil" className="h-8 w-auto" />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-800 leading-none">SIPENSIL</h1>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Admin Dinas</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <div className="mb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Menu Utama</div>
                {MENU_ITEMS.map((item, index) => (
                    <SidebarItem key={index} item={item} />
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100 shrink-0">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 w-full transition-all"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </aside>
    )
}

function SidebarItem({ item, depth = 0 }: { item: MenuItem, depth?: number }) {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    // Check if this item or any descendants are active
    const isActive = (item: MenuItem): boolean => {
        if (item.href) {
            // Precise check for query params if present in href
            if (item.href.includes('?')) {
                // If href has params, check if full path matches including params
                // Note: pathname alone doesn't have query params. We can just check start for now or use useSearchParams
                // Simplified: Check if pathname starts with the base path
                const [basePath, paramString] = item.href.split('?')
                // Since we can't easily check actual query params here without useSearchParams hook overhead,
                // we'll rely on pathname match.
                // However, for sidebar expansion, generic pathname match is robust.
                return pathname === basePath
            }
            return pathname === item.href
        }
        return item.children ? item.children.some(isActive) : false
    }

    // Auto-expand if active child exists
    React.useEffect(() => {
        if (isActive(item)) {
            setIsOpen(true)
        }
    }, [pathname])

    const isCurrentActive = item.href ? (
        item.href.includes('?')
            ? pathname === item.href.split('?')[0] // Rough match for now
            : pathname === item.href
    ) : false

    if (item.children) {
        return (
            <div className="space-y-1">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all 
                        ${isCurrentActive ? 'bg-red-50 text-red-800' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                        ${depth > 0 ? 'text-xs my-0.5' : ''}
                    `}
                    style={{ paddingLeft: `${16 + (depth * 12)}px` }}
                >
                    <div className="flex items-center gap-3">
                        {item.icon && <item.icon size={18} className={isCurrentActive ? 'text-red-600' : 'text-gray-400'} />}
                        <span>{item.name}</span>
                    </div>
                    {/* Use "v" style chevron as requested */}
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                {isOpen && (
                    <div className="space-y-1 relative">
                        {/* Recursive Render */}
                        {item.children.map((child, idx) => (
                            <SidebarItem key={idx} item={child} depth={depth + 1} />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <Link
            href={item.href || '#'}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all
                ${isCurrentActive ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                ${depth > 0 ? 'text-xs my-0.5' : ''}
            `}
            style={{ paddingLeft: `${16 + (depth * 12)}px` }}
        >
            {item.icon && <item.icon size={18} className={isCurrentActive ? 'text-red-600' : 'text-gray-400'} />}
            {!item.icon && depth > 1 && <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isCurrentActive ? 'bg-red-400' : 'bg-gray-300'}`}></span>}
            {item.name}
        </Link>
    )
}

