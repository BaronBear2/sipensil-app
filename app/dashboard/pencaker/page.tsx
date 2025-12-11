import { createClient } from '@/utils/supabase/server'
import { logout } from '@/actions/auth'
import Image from 'next/image' // Next.js optimized image

export default async function PencakerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Fetch available trainings
  const { data: trainings } = await supabase
    .from('blk_trainings')
    .select('*')
    .order('start_date', { ascending: true })

  // 2. Fetch my applications (to see what I already applied for)
  const { data: myRegistrations } = await supabase
    .from('training_registrations')
    .select('training_id, status')
    .eq('user_id', user?.id)

  // Helper to check if applied
  const getStatus = (trainingId: string) => {
    const reg = myRegistrations?.find(r => r.training_id === trainingId)
    return reg ? reg.status : null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* 🟢 Modern Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-green-600">SIPENSIL</span>
              <span className="ml-2 text-sm text-gray-500 hidden md:block">| Portal Pencaker</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.user_metadata.full_name}</p>
                <p className="text-xs text-gray-500">Job Seeker</p>
              </div>
              <form action={logout}>
                <button className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* 🖼️ Hero Section */}
      <div className="bg-green-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Find Your New Skill</h1>
          <p className="text-green-100 max-w-2xl">
            Explore free certified training programs provided by the government to boost your career.
          </p>
        </div>
      </div>

      {/* 📦 Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <h2 className="text-xl font-bold text-gray-800 mb-6">Available Training Programs</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainings?.map((training) => {
            const status = getStatus(training.id)
            
            return (
              <div key={training.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
                {/* Card Image */}
                <div className="relative h-48 w-full bg-gray-200">
                  {training.image_url ? (
                    <img 
                      src={training.image_url} 
                      alt={training.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                  )}
                  {status && (
                    <div className="absolute top-2 right-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                        status === 'APPROVED' ? 'bg-green-500 text-white' : 
                        status === 'REJECTED' ? 'bg-red-500 text-white' : 
                        'bg-yellow-400 text-yellow-900'
                      }`}>
                        {status}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                      {training.batch_name}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{training.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
                    {training.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>📅 {new Date(training.start_date).toLocaleDateString()}</span>
                    <span>👥 {training.capacity} Seats</span>
                  </div>

                  {/* Action Button */}
                  {status ? (
                    <button disabled className="w-full py-2 rounded-lg bg-gray-100 text-gray-400 font-medium cursor-not-allowed">
                      Applied
                    </button>
                  ) : (
                    // We will wrap this in a Server Action form next
                    <button className="w-full py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition shadow-sm">
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}