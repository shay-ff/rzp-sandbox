import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const authed = req.cookies.get("rzp-authed")?.value === "true";

  const isLoginPage = req.nextUrl.pathname === "/login";
  const isAuthRoute = req.nextUrl.pathname === "/api/auth";

  if (isLoginPage || isAuthRoute) return NextResponse.next();
  if (!authed) return NextResponse.redirect(new URL("/login", req.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};