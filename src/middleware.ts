import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/reset-password', '/change-password', '/checkout', '/api/auth', '/api/webhooks', '/api/checkout']
const AUTH_ROUTES   = ['/login', '/register', '/reset-password']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
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

  const { data: { user } } = await supabase.auth.getUser()
  const pathname    = request.nextUrl.pathname
  const isPublic    = PUBLIC_ROUTES.some(r => pathname.startsWith(r))
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r))

  // Sin sesión → login
  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Con sesión → verificar sesión única y must_change_pass
  if (user && !isPublic) {
    const cookieToken = request.cookies.get('session_token')?.value

    if (cookieToken) {
      const { data: sessionRecord } = await supabase
        .from('user_sessions')
        .select('session_token')
        .eq('user_id', user.id)
        .single()

      // Token no coincide → otro dispositivo inició sesión, cerrar esta
      if (sessionRecord && sessionRecord.session_token !== cookieToken) {
        await supabase.auth.signOut()
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('reason', 'session_replaced')
        const res = NextResponse.redirect(url)
        res.cookies.delete('session_token')
        return res
      }
    }

    // Debe cambiar contraseña y no está en esa página
    if (!pathname.startsWith('/change-password')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('must_change_pass')
        .eq('id', user.id)
        .single()

      if (profile?.must_change_pass) {
        const url = request.nextUrl.clone()
        url.pathname = '/change-password'
        return NextResponse.redirect(url)
      }
    }

    // Admin: verificar is_admin para rutas /admin
    if (pathname.startsWith('/admin')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    }
  }

  // Logueado intentando ir a login → dashboard
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
