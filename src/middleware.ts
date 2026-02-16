import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get("host") || "";

  // Extract subdomain (e.g., "salon1.beautycenter.app" -> "salon1")
  // In dev, check for localhost patterns like "salon1.localhost:3000"
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
});

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
    "/((?!api/auth|api/public|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
