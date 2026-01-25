import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes
  const protectedRoutes = ['/dashboard']
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Admin routes - require admin role
  if (request.nextUrl.pathname.startsWith('/dashboard/admin')) {
    if (!user?.email?.endsWith('@enermax.com.ar')) {
      return NextResponse.redirect(new URL('/dashboard/cliente', request.url))
    }
  }

  // Auth routes redirect to dashboard if logged in
  const authRoutes = ['/login', '/registro']
  const isAuthRoute = authRoutes.some(route =>
    request.nextUrl.pathname === route
  )

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard/cliente', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|sw.js|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
