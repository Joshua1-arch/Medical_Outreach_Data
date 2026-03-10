import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const { auth } = NextAuth(authConfig);


const PUBLIC_PATHS = [
    '/',
    '/home',
    '/login',
    '/signup',
    '/auth-error',
    '/maintenance',
    '/guide',
];

const ADMIN_PREFIXES = ['/admin'];

const PROTECTED_PREFIXES = ['/dashboard', '/admin'];


function isPublicPath(pathname: string): boolean {
    if (PUBLIC_PATHS.includes(pathname)) return true;
    // Public event intake forms are always accessible
    if (pathname.startsWith('/e/')) return true;
    // NextAuth internal routes
    if (pathname.startsWith('/api/auth/')) return true;
    return false;
}

export default auth((req: any) => {
    const { nextUrl } = req;
    const pathname: string = nextUrl.pathname;

    // Always forward the pathname header (used by server components)
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-pathname', pathname);
    const next = NextResponse.next({ request: { headers: requestHeaders } });

    const session = req.auth;
    const isLoggedIn: boolean = !!session?.user;
    const isActive: boolean = session?.user?.accountStatus === 'active';
    const isAdmin: boolean = session?.user?.role === 'admin';

    // ── 1. Public paths — always allow through ───────────────────────────────
    if (isPublicPath(pathname)) {
        // If already logged-in and active, bounce away from /login & /signup
        if (isLoggedIn && isActive && (pathname === '/login' || pathname === '/signup')) {
            return NextResponse.redirect(new URL('/dashboard', nextUrl));
        }
        return next;
    }

    // ── 2. Admin routes — must be logged-in, active, AND admin ──────────────
    const needsAdmin = ADMIN_PREFIXES.some(p => pathname.startsWith(p));
    if (needsAdmin) {
        if (!isLoggedIn || !isActive) {
            const loginUrl = new URL('/login', nextUrl);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }
        if (!isAdmin) {
            // Authenticated but not admin — send to dashboard
            return NextResponse.redirect(new URL('/dashboard', nextUrl));
        }
        return next;
    }

    // ── 3. Protected routes — must be logged-in and active ──────────────────
    const needsAuth = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));
    if (needsAuth) {
        if (!isLoggedIn || !isActive) {
            const loginUrl = new URL('/login', nextUrl);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }
        return next;
    }

    // ── 4. Everything else — allow through ──────────────────────────────────
    return next;
});

export const config = {
    matcher: [
        /*
         * Match all request paths EXCEPT:
         * - _next/static  (Next.js static assets)
         * - _next/image   (Next.js image optimisation)
         * - favicon.ico
         * - Any file with an extension served from /public (png, jpg, svg, etc.)
         * - Paystack & other third-party webhook endpoints that must not be gated
         */
        '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf)$).*)',
    ],
};
