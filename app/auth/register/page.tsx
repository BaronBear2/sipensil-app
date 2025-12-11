// app/auth/register/page.tsx
'use client'

import { signup } from '@/actions/auth'
import { useActionState } from 'react' 
import Link from 'next/link'

export default function RegisterPage() {
  const [state, action, isPending] = useActionState(async (previousState: any, formData: FormData) => {
    const result = await signup(formData);
    return result;
  }, null)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">Create Account</h2>
        
        <form action={action} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
            <input
              name="fullName"
              type="text"
              required
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="user@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="******"
            />
          </div>

          {/* Role Dropdown */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Register As</label>
            <select
              name="role"
              required
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none bg-white"
            >
              <option value="" disabled selected>Select your role...</option>
              <option value="PENCAKER">Pencaker (Job Seeker)</option>
              <option value="ADMIN_DINAS">Admin Dinas</option>
              <option value="ADMIN_LPK">Admin LPK</option>
              <option value="ADMIN_PERUSAHAAN">Admin Perusahaan</option>
            </select>
          </div>

          {/* Error Message */}
          {state?.error && (
            <div className="text-center text-sm text-red-500">
              {state.error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isPending ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}