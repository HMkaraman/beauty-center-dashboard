import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check for session cookie (NextAuth v5 JWT session)
  const sessionToken =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value;
  const isLoggedIn = !!sessionToken;

  const isApiRoute = pathname.startsWith("/api");
  const isPublicRoute =
    pathname.startsWith("/booking") ||
    pathname.startsWith("/api/public") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/portal");
  const isAuthPage = pathname.startsWith("/login");
  const isAdminRoute = pathname.startsWith("/admin");

  // Public and API routes are always allowed
  if (isPublicRoute || isApiRoute) {
    // fall through to subdomain logic
  }
  // Redirect logged-in users away from login page
  else if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
  // Admin routes require auth (role check done server-side)
  else if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }
  // All other routes require authentication
  else if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Extract subdomain (e.g., "salon1.beautycenter.app" -> "salon1")
  const hostname = req.headers.get("host") || "";
  const url = req.nextUrl.clone();
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "localhost:3000";
  let subdomain: string | null = null;

  if (hostname !== baseDomain && hostname !== `www.${baseDomain}`) {
    const baseDomainWithoutPort = baseDomain.replace(
      `:${url.port || ""}`,
      ""
    );
    const hostnameWithoutPort = hostname.replace(`:${url.port}`, "");
    const baseParts = baseDomainWithoutPort.split(".");
    const hostParts = hostnameWithoutPort.split(".");

    if (hostParts.length > baseParts.length) {
      subdomain = hostParts[0];
    }
  }

  // Set tenant slug in headers for downstream API routes
  const response = NextResponse.next();
  if (subdomain) {
    response.headers.set("x-tenant-slug", subdomain);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - api/public (public API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    "/((?!api/auth|api/public|_next/static|_next/image|fonts/|icons/|currency-fonts\\.css|favicon.ico|sitemap.xml|robots.txt|manifest.json).*)",
  ],
};
