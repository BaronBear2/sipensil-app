'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, History, User, LogOut, Briefcase, FileBarChart, AlertCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LpkSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    // V5.5-07: Fix Active State Bug. Exclusive check for root dashboard.
    const isActive = (href: string) => {
        if (href === '/dashboard/lpk') return pathname === href
        return pathname.startsWith(href)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    const menuItems = [
        { name: 'Dashboard', href: '/dashboard/lpk', icon: Home },
        { name: 'Profil Lembaga', href: '/dashboard/lpk/profile', icon: User },
        // V5.5-04 & 05: Remove Ketersediaan, Rename Penempatan to Semester
        { name: 'Laporan Semester', href: '/dashboard/lpk/laporan', icon: Briefcase },
        // V5.5-06: Add Rejected Menu
        { name: 'Laporan Semester Ditolak', href: '/dashboard/lpk/laporan-ditolak', icon: AlertCircle },
        { name: 'Riwayat Laporan', href: '/dashboard/lpk/riwayat', icon: History },
    ]

    return (
        <aside className="w-64 bg-white border-r border-gray-100 min-h-screen hidden md:flex flex-col sticky top-0 h-screen">
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-800 leading-none">SIPENSIL</h1>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Admin LPK</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive(item.href)
                                ? 'bg-blue-50 text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <item.icon size={18} />
                        {item.name}
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
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
