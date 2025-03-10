import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check auth condition
  const isAuthRoute = req.nextUrl.pathname.startsWith("/auth")
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/profile") || req.nextUrl.pathname.startsWith("/progress")

  // If accessing auth routes while logged in, redirect to challenges
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/challenges", req.url))
  }

  // If accessing protected routes while not logged in, redirect to login
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/auth/sign-in", req.url))
  }

  return res
}

export const config = {
  matcher: ["/profile/:path*", "/progress/:path*", "/auth/:path*"],
}

