'use client'

import React, { useState, useEffect, memo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Home, Users, ClipboardList, Settings, LogOut, ChevronDown, ChevronRight, Layers } from 'lucide-react'
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
    theme?: ThemeColor
}

const MENU_ITEMS: MenuItem[] = [
    { name: 'Beranda Utama', href: '/', icon: Home, theme: 'red' },
    { name: 'Dashboard', href: '/dashboard/dinas', icon: Home, theme: 'red' },
    { name: 'Menu Pelatihan', href: '/dashboard/dinas/pelatihan', icon: ClipboardList, theme: 'red' },
    { name: 'Manajemen User', href: '/dashboard/dinas/users', icon: Users, theme: 'red' },
    { name: 'Kelola Parameter', href: '/dashboard/dinas/master-data', icon: Settings, theme: 'red' },
]

const isPathActive = (targetHref: string | undefined, currentPathname: string): boolean => {
    if (!targetHref) return false
    const [targetPath] = targetHref.split('?')
    if (targetPath === '/' || targetPath === '/dashboard/dinas') return currentPathname === targetPath
    return currentPathname === targetPath || currentPathname.startsWith(targetPath + '/')
}

const isRecursiveActive = (menuItem: MenuItem, currentPathname: string): boolean => {
    if (menuItem.children) {
        return menuItem.children.some(child => isRecursiveActive(child, currentPathname))
    }
    return isPathActive(menuItem.href, currentPathname)
}

export default function AdminSidebar() {
    const router = useRouter()
    const pathname = usePathname()

    const [openMenuName, setOpenMenuName] = useState<string | null>(null)
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    // Sync active menu with pathname
    useEffect(() => {
        const activeItem = MENU_ITEMS.find(item => isRecursiveActive(item, pathname))
        if (activeItem) {
            setOpenMenuName(activeItem.name)
        }
        setIsMobileOpen(false)
    }, [pathname])

    const handleToggle = (name: string) => {
        setOpenMenuName(prev => prev === name ? null : name)
    }

    return (
        <>
            {/* MOBILE HEADER */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-50 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <Image src={logoSipensil} alt="Logo Sipensil" className="h-8 w-auto" priority />
                    <span className="font-bold text-gray-800">SIPENSIL</span>
                </div>
                <button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                    <Layers size={24} />
                </button>
            </div>

            {/* BACKDROP */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 min-h-screen flex flex-col 
                max-md:transition-transform max-md:duration-200 max-md:ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:sticky md:top-0 md:h-screen
            `}>
                <div className="p-6 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Image src={logoSipensil} alt="Logo Sipensil" className="h-8 w-auto rounded-xl" priority />
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
                            pathname={pathname}
                            isOpen={openMenuName === item.name}
                            onToggle={() => handleToggle(item.name)}
                        />
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100 shrink-0 mb-6">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 w-full transition-colors cursor-pointer"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    )
}

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
    pathname: string
    depth?: number
    isOpen?: boolean
    onToggle?: () => void
    inheritedTheme?: ThemeColor
}

const SidebarItem = memo(function SidebarItem({
    item,
    pathname,
    depth = 0,
    isOpen = false,
    onToggle,
    inheritedTheme = 'red'
}: SidebarItemProps) {
    const currentTheme = item.theme || inheritedTheme
    const themeStyle = THEME_STYLES[currentTheme] || THEME_STYLES['red']
    const isCurrentActive = isPathActive(item.href, pathname)

    if (item.children) {
        return (
            <div className="space-y-1">
                <button
                    onClick={onToggle}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer
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
                                pathname={pathname}
                                depth={depth + 1}
                                isOpen={isRecursiveActive(child, pathname)}
                                inheritedTheme={currentTheme}
                            />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <Link
            href={item.href || '#'}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors
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
})
