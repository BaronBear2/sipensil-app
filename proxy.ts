// proxy.ts (formerly middleware.ts)
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// ⚠️ Note: Function name changed from 'middleware' to 'proxy'
export async function proxy(request: NextRequest) {
  
  // 1. Run the Supabase helper to refresh the session
  const { user, response } = await updateSession(request)

  // 2. Define the current path
  const path = request.nextUrl.pathname

  // 3. Protect Dashboard Routes
  if (path.startsWith('/dashboard')) {
    
    // A. Not logged in? -> Redirect to Login
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // B. Get User Role
    const userRole = user.user_metadata?.role || 'PENCAKER'

    // C. Role-Based Access Control (RBAC)
    if (path.startsWith('/dashboard/super-admin') && userRole !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    
    if (path.startsWith('/dashboard/dinas') && userRole !== 'ADMIN_DINAS') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    if (path.startsWith('/dashboard/lpk') && userRole !== 'ADMIN_LPK') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    if (path.startsWith('/dashboard/perusahaan') && userRole !== 'ADMIN_PERUSAHAAN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  // 4. Continue
  return response
}

// Configuration (Matches everything except static files and auth pages)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/|api/).*)',
  ],
}