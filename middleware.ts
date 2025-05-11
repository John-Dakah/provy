import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Get the session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if the user is authenticated
  const isAuthenticated = !!session

  // Get the pathname
  const { pathname } = req.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/reset-password", "/verify-email", "/"]

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // If the user is not authenticated and the route is not public, redirect to login
  if (!isAuthenticated && !isPublicRoute) {
    const redirectUrl = new URL("/login", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If the user is authenticated and trying to access login/register, redirect to dashboard
  if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
    const redirectUrl = new URL("/dashboard", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If the user is authenticated, check if email is verified
  if (isAuthenticated && !isPublicRoute) {
    const emailVerified = session.user?.email_confirmed_at || session.user?.user_metadata?.email_verified === true

    // If email is not verified, redirect to verification page
    if (!emailVerified) {
      const redirectUrl = new URL(`/verify-email?email=${session.user.email}`, req.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

// Specify which routes this middleware should run on
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
}
