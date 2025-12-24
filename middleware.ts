import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Create Supabase client
  const supabase = createMiddlewareClient({ req, res })
  
  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Public routes that don't require auth
  const publicRoutes = ['/login', '/api/webhooks', '/api/cron']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // API routes that need auth
  const isApiRoute = pathname.startsWith('/api') && !isPublicRoute

  // Dashboard routes
  const isDashboardRoute = pathname.startsWith('/dashboard')

  // Redirect to login if accessing protected route without session
  if (!session && (isDashboardRoute || isApiRoute)) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if already logged in and accessing login page
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Redirect root to dashboard or login
  if (pathname === '/') {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    } else {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|logo.svg).*)',
  ],
}
