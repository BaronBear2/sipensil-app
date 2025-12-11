import { createClient } from '@/utils/supabase/server'
import { logout } from '@/actions/auth'

// This page is Server-Side Rendered (SSR), so it fetches data fresh every time
export default async function SuperAdminDashboard() {
  const supabase = await createClient()

  // 1. Get the current logged-in Super Admin
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Fetch ALL user profiles from the database
  // (Our RLS policy from Phase 2 allows this only for Super Admins)
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header Section */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Welcome back, {user?.user_metadata.full_name}</p>
        </div>
        
        <form action={logout}>
          <button className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition">
            Sign Out
          </button>
        </form>
      </div>

      {/* Statistics Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{profiles?.length || 0}</p>
        </div>
        {/* You can add more cards here for specific roles later */}
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">All Registered Accounts</h2>
        </div>
        
        {error && (
          <div className="p-4 text-red-500">Error loading users: {error.message}</div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">Full Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Joined Date</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {profiles?.map((profile) => (
                <tr key={profile.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                    {profile.full_name || 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {profile.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 
                      ${profile.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-800' : 
                        profile.role === 'ADMIN_DINAS' ? 'bg-blue-100 text-blue-800' :
                        profile.role === 'PENCAKER' ? 'bg-green-100 text-green-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {profile.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="text-green-600">Active</span>
                  </td>
                </tr>
              ))}
              
              {(!profiles || profiles.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}