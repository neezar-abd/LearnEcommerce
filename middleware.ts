import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — this is the ONLY place getUser() is called for session refresh.
  // Server Components should use the cached helper in src/lib/session.ts instead.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Inject userId into request header so Server Components can read it
  // without calling getUser() again. This is the key performance optimization.
  const requestHeaders = new Headers(request.headers)
  if (user) {
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-user-email', user.email ?? '')
  } else {
    requestHeaders.delete('x-user-id')
    requestHeaders.delete('x-user-email')
  }

  // Protect specific authenticated routes
  const pathname = request.nextUrl.pathname
  const protectedRoutes = ['/seller', '/buyer', '/cart', '/checkout', '/messages']
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Forward the modified headers to the next handler
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Copy Supabase session cookies onto the final response
  supabaseResponse.cookies.getAll().forEach(cookie => {
    response.cookies.set(cookie.name, cookie.value, cookie)
  })

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - api/payment/webhook (Midtrans webhook — must not be blocked)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/payment/webhook).*)',
  ],
}
