import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { authConfig } from "./auth.config"

async function getUser(email: string) {
    try {
        await dbConnect();
        const user = await User.findOne({ email });
        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user }) {
            // Initial sign in
            if (user) {
                token.role = user.role;
                token.accountStatus = user.accountStatus;
                token.id = user.id;
            }
            // Subsequent calls - check DB for status updates
            else if (token?.id) {
                try {
                    await dbConnect();
                    const dbUser = await User.findById(token.id).select('accountStatus role');
                    if (dbUser) {
                        token.accountStatus = dbUser.accountStatus;
                        token.role = dbUser.role;
                    } else {
                        // User deleted
                        token.accountStatus = 'rejected';
                    }
                } catch (error) {
                    console.error("Error fetching user in JWT callback:", error);
                    // On error, keep existing token data to avoid lockout during blips, 
                    // or fail safe? Keeping existing is better UX for transient errors.
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role as string;
                session.user.accountStatus = token.accountStatus as string;
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);

                    if (!user) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) {
                        // Logic: Users cannot log in if status is 'pending' or 'suspended'
                        if (user.accountStatus !== 'active') {
                            return null;
                        }
                        return user;
                    }
                }
                return null;
            },
        }),
    ],
});
