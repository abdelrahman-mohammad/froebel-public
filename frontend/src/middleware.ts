import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Protected routes that require authentication
 * Users without valid access_token cookie will be redirected to login
 */
const PROTECTED_PATHS = [
    "/settings",
    "/library",
    "/editor",
    "/profile",
    "/courses/create",
    "/courses/edit",
];

/**
 * Auth pages that authenticated users should not access
 * Users with valid access_token cookie will be redirected to home
 */
const AUTH_PAGES = ["/login", "/register", "/forgot-password"];

/**
 * Check if a path matches any of the protected paths
 * Supports both exact matches and prefix matches (e.g., /editor/*)
 */
function isProtectedPath(pathname: string): boolean {
    return PROTECTED_PATHS.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`)
    );
}

/**
 * Check if a path is an auth page
 */
function isAuthPage(pathname: string): boolean {
    return AUTH_PAGES.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get access token from HttpOnly cookie
    const accessToken = request.cookies.get("access_token");
    const hasValidToken = !!accessToken?.value;

    // Redirect unauthenticated users away from protected routes
    if (isProtectedPath(pathname) && !hasValidToken) {
        const loginUrl = new URL("/login", request.url);
        // Store the intended destination for redirect after login
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from auth pages
    if (isAuthPage(pathname) && hasValidToken) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - api routes
         */
        "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
    ],
};
