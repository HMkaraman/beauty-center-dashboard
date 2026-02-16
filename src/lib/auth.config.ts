import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isApiRoute = nextUrl.pathname.startsWith("/api");
      const isPublicRoute =
        nextUrl.pathname.startsWith("/booking") ||
        nextUrl.pathname.startsWith("/api/public") ||
        nextUrl.pathname.startsWith("/register") ||
        nextUrl.pathname.startsWith("/portal");
      const isAuthPage = nextUrl.pathname.startsWith("/login");

      if (isPublicRoute || isApiRoute) return true;

      // Check admin routes - only owners can access
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      if (isAdminRoute) {
        if (!isLoggedIn) return false;
        const role = (auth?.user as Record<string, unknown>)?.role as string;
        if (role !== "owner") return false;
        return true;
      }

      // Redirect logged-in users away from the login page
      if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      // All other routes require authentication
      if (!isLoggedIn) return false;

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.tenantId = (user as unknown as Record<string, unknown>).tenantId as string;
        token.role = (user as unknown as Record<string, unknown>).role as string;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as Record<string, unknown>).tenantId = token.tenantId;
        (session.user as unknown as Record<string, unknown>).role = token.role;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
