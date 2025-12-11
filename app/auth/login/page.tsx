// app/auth/login/page.tsx
'use client'

import { login } from '@/actions/auth' // Importing the action we created in Phase 4
import { useActionState } from 'react' // Hook to handle form state
import Link from 'next/link'

export default function LoginPage() {
  // useActionState handles the form submission and any errors returned by the server
  // [state, action, pending]
  // We initialize the state with null (no error yet)
  const [state, action, isPending] = useActionState(async (previousState: any, formData: FormData) => {
      const result = await login(formData);
      return result;
  }, null)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">Login to SIPENSIL</h2>
        
        <form action={action} className="space-y-4">
          
          {/* Email Input */}
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

          {/* Password Input */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="********"
            />
          </div>

          {/* Error Message Display */}
          {state?.error && (
            <div className="text-center text-sm text-red-500">
              {state.error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}