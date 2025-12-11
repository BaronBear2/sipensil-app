import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold text-red-600">403 - Unauthorized</h1>
      <p className="mt-2 text-gray-600">You do not have permission to view this page.</p>
      <Link href="/auth/login" className="mt-6 text-blue-600 hover:underline">
        Go back to Login
      </Link>
    </div>
  )
}