'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * SessionGuard Component
 * 
 * Periodically checks if the user's session is still valid.
 * If the session is invalidated (e.g., account deleted or suspended by admin),
 * it forces a redirect to the login page.
 */
export default function SessionGuard() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Don't check on public pages or login page to avoid loops
        const publicPaths = ['/login', '/register', '/signup', '/maintenance', '/', '/forgot-password', '/reset-password', '/auth-error', '/privacy', '/help'];
        
        if (publicPaths.includes(pathname) || pathname.startsWith('/api') || pathname.startsWith('/e/') || pathname.startsWith('/events/')) {
            // Once we reach a public page, we can clear the logout flag if it exists
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('logging-out');
            }
            return;
        }

        const checkSession = async () => {
            try {
                const response = await fetch('/api/auth/session');
                // NextAuth /api/auth/session returns an empty object {} if no session
                const session = await response.json();
                
                if (!session || Object.keys(session).length === 0) {
                    // Check if this was a deliberate logout
                    const isLoggingOut = sessionStorage.getItem('logging-out');
                    if (isLoggingOut) {
                        // If we are currently logging out, don't trigger the session_expired warning.
                        // The redirect to login is already being handled by the logout action.
                        return;
                    }

                    // Session is invalid or gone unexpectedly
                    window.location.href = '/login?reason=session_expired';
                }
            } catch (error) {
                console.error('Session check failed:', error);
            }
        };

        // Check every 2 minutes for a balance between "immediate" and performance
        // Admin actions are relatively rare, but we want to catch them.
        const interval = setInterval(checkSession, 30000); 

        // Also check on visibility change (when user returns to the tab)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkSession();
            }
        };

        window.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            window.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [pathname, router]);

    return null;
}
