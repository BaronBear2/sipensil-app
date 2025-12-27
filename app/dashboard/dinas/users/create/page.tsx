import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import CreateUserForm from '@/components/admin/CreateUserForm'

export default function CreateUserPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/dinas/users" className="p-2 bg-white border rounded-xl hover:bg-gray-50 text-gray-600 transition">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Buat Akun Baru</h1>
                    <p className="text-gray-500 text-sm">Tambahkan pengguna baru ke dalam sistem.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                    <h2 className="font-bold text-gray-800">Formulir Pendaftaran</h2>
                    <p className="text-xs text-gray-500 mt-1">
                        Isi data berikut untuk membuat akun baru. Akun akan langsung aktif setelah dibuat.
                    </p>
                </div>

                <CreateUserForm />
            </div>
        </div>
    )
}
