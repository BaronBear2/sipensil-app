import CreateUserForm from '@/components/admin/CreateUserForm'
import PageHeader from '@/components/ui/PageHeader'

export default function CreateUserPage() {
    return (
        <div className="space-y-6">
            <PageHeader 
                title="Buat Akun Baru"
                description="Tambahkan pengguna baru ke dalam sistem."
                backLink="/dashboard/dinas/users"
            />
            <div className="max-w-3xl mx-auto space-y-6 px-4">

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
        </div>
    )
}
