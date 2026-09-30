import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-session";

function redirectTo(request: NextRequest, pathname: string, callbackUrl?: string) {
  const url = new URL(pathname, request.url);
  if (callbackUrl) url.searchParams.set("callbackUrl", callbackUrl);
  return NextResponse.redirect(url);
}

async function handleAdmin(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/admin/login" || pathname === "/api/admin/login";
  const admin = await verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);

  if (pathname === "/admin/login" && admin) return redirectTo(request, "/admin");
  if (isLoginRoute || admin) return NextResponse.next();
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: { code: "unauthorized", message: "Admin authentication required." } }, { status: 401 });
  }
  return redirectTo(request, "/admin/login");
}

async function handleUser(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const role = token?.id ? token.role : undefined;
  const home = role === "tutor" ? "/tutor" : "/student";

  if (pathname === "/login" || pathname === "/signup") {
    return role ? redirectTo(request, home) : NextResponse.next();
  }
  if (!role) return redirectTo(request, "/login", pathname + search);
  const requiredRole = pathname.startsWith("/tutor") ? "tutor" : "student";
  return role === requiredRole ? NextResponse.next() : redirectTo(request, home);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) return handleAdmin(request);
  return handleUser(request);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/student/:path*", "/tutor/:path*", "/login", "/signup"],
};
