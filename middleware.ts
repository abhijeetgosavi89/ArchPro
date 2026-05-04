import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        // Additional middleware logic if needed
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized({ token, req }) {
                const { pathname } = req.nextUrl;
                // Admin routes require ADMIN role
                if (pathname.startsWith('/admin')) {
                    return token?.role === 'ADMIN';
                }
                // All other routes are accessible
                return true;
            },
        },
        pages: {
            signIn: '/auth/signin',
        },
    }
);

export const config = {
    matcher: ['/admin/:path*'],
};
