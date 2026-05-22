'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Home, User, Briefcase, GraduationCap, FileText, Settings, LogOut, ChevronDown, ChevronRight, Menu, X, LayoutDashboard } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import logoSipensil from '@/assets/logo/logo-sipensil.jpeg'
import logoPemkab from '@/assets/logo/logo-pemkabbek.jpeg'

type MenuItem = {
    name: string
    href?: string
    icon?: any
    children?: MenuItem[]
}

const MENU_ITEMS: MenuItem[] = [
    { name: 'Beranda Utama', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard/pencaker', icon: LayoutDashboard },
    { name: 'Profil Saya', href: '/dashboard/pencaker/profile', icon: User },
    // { name: 'Kartu Kuning (AK-1)', href: '/dashboard/pencaker/kartu-kuning', icon: FileText }, 
    {
        name: 'Pelatihan BLK',
        icon: GraduationCap,
        children: [
            { name: 'Katalog Pelatihan', href: '/dashboard/pencaker/programs' },
            { name: 'Pelatihan Saya', href: '/dashboard/pencaker/pelatihan-saya' },
        ]
    },
]

export default function PencakerSidebar() {
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    // Auto-close menu on route change for mobile devices
    React.useEffect(() => {
        setIsMobileOpen(false)
    }, [pathname])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    return (
        <>
            {/* Mobile Toggle */}
            {/* Mobile Toggle */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b flex justify-between items-center px-4 z-50 shadow-sm">
                <div className="flex items-center gap-3">
                    <Image src={logoSipensil} alt="Logo Sipensil" className="h-7 w-auto" priority />
                    <div className="flex flex-col ml-1">
                        <span className="font-bold text-sm text-slate-800 leading-none">SIPENSIL</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Dinas Ketenagakerjaan</span>
                    </div>
                </div>
                <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 text-slate-600 cursor-pointer hover:bg-slate-100 rounded-full transition">
                    {isMobileOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Sidebar Container */}
            <aside className={`
                fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-100 
                flex flex-col z-[90] transition-transform duration-300 transform
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-6 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Image src={logoSipensil} alt="Logo Sipensil" className="h-8 w-auto rounded-xl" priority />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-gray-800 leading-none">SIPENSIL</h1>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Dinas Ketenagakerjaan</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <div className="mb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Menu Utama</div>
                    {MENU_ITEMS.map((item, index) => (
                        <SidebarItem key={index} item={item} />
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100 shrink-0 mb-6">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 w-full transition-all"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Overlay for Mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-[80] md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    )
}

function SidebarItem({ item, depth = 0 }: { item: MenuItem, depth?: number }) {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    // Check if this item is active
    const isActive = (item: MenuItem): boolean => {
        if (item.href) return pathname === item.href || pathname.startsWith(item.href + '/')
        return item.children ? item.children.some(isActive) : false
    }

    React.useEffect(() => {
        if (isActive(item)) {
            setIsOpen(true)
        }
    }, [pathname])

    const isCurrentActive = item.href ? pathname === item.href : false

    if (item.children) {
        return (
            <div className="space-y-1">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all 
                        ${isActive(item) ? 'bg-blue-50 text-blue-800' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                        ${depth > 0 ? 'text-xs my-0.5' : ''}
                    `}
                    style={{ paddingLeft: `${16 + (depth * 12)}px` }}
                >
                    <div className="flex items-center gap-3">
                        {item.icon && <item.icon size={18} className={isActive(item) ? 'text-blue-600' : 'text-gray-400'} />}
                        <span>{item.name}</span>
                    </div>
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                {isOpen && (
                    <div className="space-y-1">
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
                ${isCurrentActive ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                ${depth > 0 ? 'text-xs my-0.5' : ''}
            `}
            style={{ paddingLeft: `${16 + (depth * 12)}px` }}
        >
            {item.icon && <item.icon size={18} className={isCurrentActive ? 'text-blue-600' : 'text-gray-400'} />}
            {!item.icon && depth > 0 && <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isCurrentActive ? 'bg-blue-400' : 'bg-gray-300'}`}></span>}
            {item.name}
        </Link>
    )
}
