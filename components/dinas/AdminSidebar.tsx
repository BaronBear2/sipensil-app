'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Home, Users, ClipboardList, Building, FileText, Settings, LogOut, ChevronDown, ChevronRight, GraduationCap, FileCheck, Layers } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import logoSipensil from '@/assets/logo/logo-sipensil.jpeg'

// Define Recursive Menu Type
type ThemeColor = 'red' | 'blue' | 'green' | 'orange'

type MenuItem = {
    name: string
    href?: string
    icon?: any
    children?: MenuItem[]
    theme?: ThemeColor // Optional theme override
}

const MENU_ITEMS: MenuItem[] = [
    { name: 'Dashboard', href: '/dashboard/dinas', icon: Home, theme: 'red' },
    {
        name: 'Menu Pencaker',
        icon: Users,
        theme: 'blue',
        children: [
            {
                name: 'Pelatihan BLK',
                // icon: GraduationCap, // Optional sub-icon
                children: [
                    { name: 'Verifikasi Pending', href: '/dashboard/dinas/verifikasi-pencaker?status=pending' },
                    { name: 'Data Pelatihan BLK', href: '/dashboard/dinas/pelatihan' },
                    { name: 'Pencaker yang sedang mengikuti pelatihan', href: '/dashboard/dinas/peserta' }, // Filter logic to be added
                    {
                        name: 'Riwayat Verifikasi',
                        children: [
                            { name: 'Pencaker yang pernah diterima', href: '/dashboard/dinas/verifikasi-pencaker?status=verified' },
                            { name: 'Pencaker yang pernah ditolak', href: '/dashboard/dinas/verifikasi-pencaker?status=rejected' },
                        ]
                    }
                ]
            },
            {
                name: 'IM-Japan',
                children: [
                    { name: 'Verifikasi Pending', href: '/dashboard/dinas/im-japan?status=pending' },
                    { name: 'Edit Persyaratan Permohonan', href: '/dashboard/dinas/im-japan/requirements' },
                    { name: 'Data Permohonan', href: '/dashboard/dinas/im-japan?status=approved' }, // Placeholder param
                    {
                        name: 'Riwayat Verifikasi',
                        children: [
                            { name: 'Permohonan yang pernah diterima', href: '/dashboard/dinas/im-japan?status=approved' },
                            { name: 'Permohonan yang pernah ditolak', href: '/dashboard/dinas/im-japan?status=rejected' },
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
        theme: 'green',
        children: [
            {
                name: 'Laporan Periodik 6 Bulan',
                children: [
                    { name: 'Verifikasi Pending', href: '/dashboard/dinas/lpk?status=pending' },
                    { name: 'Data Laporan', href: '/dashboard/dinas/lpk?status=approved' },
                    {
                        name: 'Riwayat Verifikasi',
                        children: [
                            { name: 'Laporan yang pernah diterima', href: '/dashboard/dinas/lpk?status=approved' },
                            { name: 'Laporan yang pernah ditolak', href: '/dashboard/dinas/lpk?status=rejected' },
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
        theme: 'orange',
        children: [
            {
                name: 'Pencatatan Peserta Magang',
                children: [
                    { name: 'Verifikasi Pending', href: '/dashboard/dinas/pemagangan?status=pending' },
                    { name: 'Data Pencatatan', href: '/dashboard/dinas/pemagangan?status=approved' },
                    {
                        name: 'Riwayat Verifikasi',
                        children: [
                            { name: 'Pencatatan yang pernah diterima', href: '/dashboard/dinas/pemagangan?status=approved' },
                            { name: 'Pencatatan yang pernah ditolak', href: '/dashboard/dinas/pemagangan?status=rejected' },
                        ]
                    }
                ]
            },
            { name: 'Data Akun Perusahaan', href: '/dashboard/dinas/users?role=PERUSAHAAN' }
        ]
    },
    { name: 'Manajemen User', href: '/dashboard/dinas/users', icon: Settings, theme: 'red' },
]

// Helpers for Activity Check
const isItemActive = (targetHref: string | undefined, pathname: string, searchParams: any): boolean => {
    if (!targetHref) return false

    const [targetPath, targetQuery] = targetHref.split('?')

    // 1. Path must match EXACTLY
    if (pathname !== targetPath) return false

    // 2. If target has query params, they MUST match exactly with current searchParams
    if (targetQuery) {
        const targetParams = new URLSearchParams(targetQuery)
        for (const [key, value] of targetParams.entries()) {
            if (searchParams.get(key) !== value) {
                return false
            }
        }
    }

    return true
}

const checkRecursiveActive = (menuItem: MenuItem, pathname: string, searchParams: any): boolean => {
    if (menuItem.children) {
        return menuItem.children.some(child => checkRecursiveActive(child, pathname, searchParams))
    }
    return isItemActive(menuItem.href, pathname, searchParams)
}


export default function AdminSidebar() {
    const router = useRouter()
    const supabase = createClient()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [openMenuName, setOpenMenuName] = useState<string | null>(null)
    const [isMobileOpen, setIsMobileOpen] = useState(false) // Mobile Menu State

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    // Auto-open top level menu on load
    useEffect(() => {
        const activeItem = MENU_ITEMS.find(item => checkRecursiveActive(item, pathname, searchParams))
        if (activeItem) {
            setOpenMenuName(activeItem.name)
        }
    }, [pathname, searchParams])

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileOpen(false)
    }, [pathname, searchParams])

    const handleToggle = (name: string) => {
        setOpenMenuName(prev => prev === name ? null : name)
    }

    return (
        <>
            {/* MOBILE HEADER (Visible only on small screens) */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-50 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <Image src={logoSipensil} alt="Logo Sipensil" className="h-8 w-auto" />
                    <span className="font-bold text-gray-800">SIPENSIL</span>
                </div>
                <button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                    <Layers size={24} />
                </button>
            </div>

            {/* BACKDROP (Visible only when mobile menu is open) */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 min-h-screen flex flex-col 
                transform transition-transform duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:sticky md:top-0 md:h-screen
            `}>
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
                        <SidebarItem
                            key={index}
                            item={item}
                            isOpen={openMenuName === item.name}
                            onToggle={() => handleToggle(item.name)}
                        />
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
        </>
    )
}

// Theme Styles Map
const THEME_STYLES = {
    red: {
        activeBg: 'bg-red-50',
        activeText: 'text-red-700',
        iconActive: 'text-red-600',
        hoverBg: 'hover:bg-red-50',
        bullet: 'bg-red-400'
    },
    blue: {
        activeBg: 'bg-blue-50',
        activeText: 'text-blue-700',
        iconActive: 'text-blue-600',
        hoverBg: 'hover:bg-blue-50',
        bullet: 'bg-blue-400'
    },
    green: {
        activeBg: 'bg-green-50',
        activeText: 'text-green-700',
        iconActive: 'text-green-600',
        hoverBg: 'hover:bg-green-50',
        bullet: 'bg-green-400'
    },
    orange: {
        activeBg: 'bg-orange-50',
        activeText: 'text-orange-700',
        iconActive: 'text-orange-600',
        hoverBg: 'hover:bg-orange-50',
        bullet: 'bg-orange-400'
    },
}

interface SidebarItemProps {
    item: MenuItem
    depth?: number
    isOpen?: boolean
    onToggle?: () => void
    inheritedTheme?: ThemeColor // Theme passed down from parent
}

function SidebarItem({ item, depth = 0, isOpen = false, onToggle, inheritedTheme = 'red' }: SidebarItemProps) {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Internal state for children accordion
    const [openChildName, setOpenChildName] = useState<string | null>(null)

    // Determine current theme (Self override OR inherited)
    const currentTheme = item.theme || inheritedTheme
    const themeStyle = THEME_STYLES[currentTheme] || THEME_STYLES['red']

    // Auto-expand children if parent is opened or path matches
    useEffect(() => {
        if (item.children) {
            const activeChild = item.children.find(child => checkRecursiveActive(child, pathname, searchParams))
            if (activeChild) {
                setOpenChildName(activeChild.name)
            }
        }
    }, [pathname, searchParams, item.children])


    const isCurrentActive = isItemActive(item.href, pathname, searchParams)

    const handleChildToggle = (name: string) => {
        setOpenChildName(prev => prev === name ? null : name)
    }

    if (item.children) {
        // Parent Item (Menu Group)
        return (
            <div className="space-y-1">
                <button
                    onClick={onToggle}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all 
                        ${isCurrentActive ? `${themeStyle.activeBg} ${themeStyle.activeText}` : `text-gray-600 ${themeStyle.hoverBg} hover:text-gray-900`}
                        ${depth > 0 ? 'text-xs my-0.5' : ''}
                    `}
                    style={{ paddingLeft: `${16 + (depth * 12)}px` }}
                >
                    <div className="flex items-center gap-3">
                        {item.icon && <item.icon size={18} className={isCurrentActive ? themeStyle.iconActive : 'text-gray-400'} />}
                        <span>{item.name}</span>
                    </div>
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                {isOpen && (
                    <div className="space-y-1 relative">
                        {item.children.map((child, idx) => (
                            <SidebarItem
                                key={idx}
                                item={child}
                                depth={depth + 1}
                                isOpen={openChildName === child.name}
                                onToggle={() => handleChildToggle(child.name)}
                                inheritedTheme={currentTheme} // Pass down theme
                            />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    // Leaf Item (Link)
    return (
        <Link
            href={item.href || '#'}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all
                ${isCurrentActive ? `${themeStyle.activeBg} ${themeStyle.activeText} shadow-sm` : `text-gray-500 ${themeStyle.hoverBg} hover:text-gray-900`}
                ${depth > 0 ? 'text-xs my-0.5' : ''}
            `}
            style={{ paddingLeft: `${16 + (depth * 12)}px` }}
        >
            {item.icon && <item.icon size={18} className={isCurrentActive ? themeStyle.iconActive : 'text-gray-400'} />}
            {!item.icon && depth > 1 && <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isCurrentActive ? themeStyle.bullet : 'bg-gray-300'}`}></span>}
            {item.name}
        </Link>
    )
}
