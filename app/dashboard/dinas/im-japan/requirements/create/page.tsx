import { createClient } from '@/utils/supabase/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import CreateImJapanRequirementForm from './CreateImJapanRequirementForm'

export default async function CreateImJapanRequirementPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/dinas/im-japan/requirements" className="p-2 rounded-full hover:bg-gray-100 transition">
                    <ArrowLeft size={24} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Tambah Persyaratan Dokumen</h1>
                    <p className="text-gray-500 text-sm">Tambahkan dokumen baru yang wajib diunggah peserta.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
                <CreateImJapanRequirementForm />
            </div>
        </div>
    )
}
