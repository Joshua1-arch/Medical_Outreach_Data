export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }: any) {
            const isLoggedIn = !!auth?.user;
            const isApproved = auth?.user?.accountStatus === 'active';
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') || nextUrl.pathname.startsWith('/admin');

            if (isOnDashboard) {
                if (isLoggedIn && isApproved) return true;
                return false; // Redirect unauthenticated or unapproved users to login page
            } else if (isLoggedIn && isApproved && nextUrl.pathname === '/login') {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role;
                token.accountStatus = user.accountStatus;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (token) {
                session.user.role = token.role;
                session.user.accountStatus = token.accountStatus;
                session.user.id = token.id;
            }
            return session;
        },
    },
    providers: [],
};
