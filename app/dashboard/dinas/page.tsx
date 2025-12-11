import { createClient } from '@/utils/supabase/server'
import { logout } from '@/actions/auth'
import { verifyUser } from '@/actions/dinas' // We will create this next

export default async function AdminDinasDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch users who are PENDING verification
  // We exclude Super Admins and other Admin Dinas from this list
  const { data: pendingUsers } = await supabase
    .from('profiles')
    .select('*')
    .eq('status', 'PENDING')
    .neq('role', 'SUPER_ADMIN')
    .neq('role', 'ADMIN_DINAS')
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">Admin Dinas Dashboard</h1>
          <p className="text-gray-600">Verification Center</p>
        </div>
        <form action={logout}><button className="rounded bg-gray-800 px-4 py-2 text-white">Logout</button></form>
      </div>

      <div className="rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4 bg-blue-50">
          <h2 className="text-lg font-medium text-blue-900">
            Pending Verifications ({pendingUsers?.length || 0})
          </h2>
        </div>
        
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pendingUsers?.map((u) => (
              <tr key={u.id}>
                <td className="px-6 py-4 font-medium text-gray-900">{u.full_name}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex rounded-full bg-yellow-100 px-2 text-xs font-semibold text-yellow-800">
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4">
                  {/* The Verification Button Form */}
                  <form action={verifyUser}>
                    <input type="hidden" name="userId" value={u.id} />
                    <button className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700 text-xs font-bold shadow-sm">
                      VERIFY NOW
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {pendingUsers?.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">All caught up! No pending users.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}