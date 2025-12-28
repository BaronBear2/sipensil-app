import UpdatePasswordForm from '@/components/auth/UpdatePasswordForm'
import Image from 'next/image'
import logoSipensil from '@/assets/logo/logo-sipensil.jpeg'

export const dynamic = 'force-dynamic'

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="mb-8 flex flex-col items-center">
                <Image src={logoSipensil} alt="Logo Sipensil" className="h-16 w-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-800">SIPENSIL</h1>
            </div>

            <UpdatePasswordForm />
        </div>
    )
}
