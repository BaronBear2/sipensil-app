'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, ClipboardList, Building, FileText, Settings, LogOut, CheckCircle, GraduationCap } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const isActive = (path: string) => {
        if (path === '/dashboard/dinas' && pathname === '/dashboard/dinas') return true
        if (path !== '/dashboard/dinas' && pathname.startsWith(path)) return true
        return false
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    const menuItems = [
        { name: 'Dashboard', href: '/dashboard/dinas', icon: Home },
        { name: 'Verifikasi Pencaker', href: '/dashboard/dinas/verifikasi-pencaker', icon: CheckCircle },
        { name: 'Program IM Japan', href: '/dashboard/dinas/im-japan', icon: ClipboardList },
        { name: 'Laporan LPK', href: '/dashboard/dinas/lpk', icon: Building },
        { name: 'Perjanjian Pemagangan', href: '/dashboard/dinas/pemagangan', icon: FileText },
        { name: 'Data Pelatihan BLK', href: '/dashboard/dinas/pelatihan', icon: GraduationCap },
        { name: 'Data Peserta', href: '/dashboard/dinas/peserta', icon: Users },
        { name: 'Manajemen User', href: '/dashboard/dinas/users', icon: Settings },
    ]

    return (
        <aside className="w-64 bg-white border-r border-gray-100 min-h-screen hidden md:flex flex-col sticky top-0 h-screen">
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                        <Users size={20} />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-800 leading-none">SIPENSIL</h1>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Admin Dinas</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <div className="mb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Menu Utama</div>
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive(item.href)
                                ? 'bg-blue-50 text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <item.icon size={18} className={isActive(item.href) ? 'text-blue-600' : 'text-gray-400'} />
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
