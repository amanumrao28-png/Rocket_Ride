import { NextRequest, NextResponse } from "next/server";
import { getSession, SESSION_COOKIE_NAME } from "@/services/auth/serverAuth";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = getSession(token);

  // =========================================================================
  // 1. MANAGER ROUTE PROTECTION
  // =========================================================================
  const isManagerRoute =
    pathname.startsWith("/manager") &&
    pathname !== "/manager/login" &&
    pathname !== "/manager/signup";

  if (isManagerRoute) {
    // If not authenticated as MANAGER
    if (!session || session.role !== "MANAGER") {
      // If logged in as customer, redirect to customer portal
      if (session && session.role === "CUSTOMER") {
        return NextResponse.redirect(new URL("/customer/track", request.url));
      }

      // Otherwise redirect to manager login with return-to
      const returnTo = encodeURIComponent(`${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(
        new URL(`/manager/login?returnTo=${returnTo}`, request.url)
      );
    }
  }

  // =========================================================================
  // 2. CUSTOMER ROUTE PROTECTION
  // Protected customer routes: /customer/submit-claim, /customer/track, /customer/my-claims
  // =========================================================================
  const isProtectedCustomerRoute =
    pathname.startsWith("/customer/submit-claim") ||
    pathname.startsWith("/customer/track") ||
    pathname.startsWith("/customer/my-claims");

  if (isProtectedCustomerRoute) {
    // If not authenticated as CUSTOMER
    if (!session || session.role !== "CUSTOMER") {
      // If logged in as manager, redirect to manager dashboard
      if (session && session.role === "MANAGER") {
        return NextResponse.redirect(new URL("/manager", request.url));
      }

      // Otherwise redirect to customer login with return-to
      const returnTo = encodeURIComponent(`${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(
        new URL(`/customer/login?returnTo=${returnTo}`, request.url)
      );
    }
  }

  // =========================================================================
  // 3. AUTOMATIC REDIRECTION FOR AUTHENTICATED USERS ON LOGIN/SIGNUP PAGES
  // =========================================================================
  const isAuthPage =
    pathname === "/customer/login" ||
    pathname === "/customer/signup" ||
    pathname === "/manager/login" ||
    pathname === "/manager/signup";

  if (isAuthPage && session) {
    if (session.role === "MANAGER") {
      return NextResponse.redirect(new URL("/manager", request.url));
    }
    if (session.role === "CUSTOMER") {
      const returnToParam = searchParams.get("returnTo");
      const destination = returnToParam ? decodeURIComponent(returnToParam) : "/customer/track";
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/manager/:path*",
    "/customer/:path*",
  ],
};
