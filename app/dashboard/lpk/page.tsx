import { createClient } from '@/utils/supabase/server'
import { logout } from '@/actions/auth'

export default async function LpkDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-red-600">LPK Dashboard</h1>
      <p>Welcome, {user?.user_metadata.full_name}</p>
      <p>Role: {user?.user_metadata.role}</p>

      <form action={logout}>
        <button className="mt-4 bg-gray-800 text-white px-4 py-2 rounded">Logout</button>
      </form>
    </div>
  )
}