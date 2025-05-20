import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
    // Get token from cookies
    const authToken = req.cookies.get('authToken')?.value;

    // Try to get NextAuth token
    const nextAuthToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Protected routes
    const path = req.nextUrl.pathname;
    const protectedRoutes = ['/dashboard', '/settings', '/profile', '/kanban'];

    if (protectedRoutes.includes(path)) {
        // If no token found in either system, redirect to login
        if (!authToken && !nextAuthToken) {
            console.log('No auth token found, redirecting to login');
            // Add a query parameter to indicate an authentication error
            const loginUrl = new URL('/login', req.url);
            loginUrl.searchParams.set('session', 'expired');
            return NextResponse.redirect(loginUrl);
        }

        // If authenticated with either system, proceed
        return NextResponse.next();
    }

    // Handle login page when database is down
    if (path === '/login') {
        // Pass through to login page which will handle database errors
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard', '/settings', '/profile', '/kanban'],
}; 