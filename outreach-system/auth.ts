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
        const user = await User.findOne({ email }).lean();
        if (user) {
            // Ensure all MongoDB specific objects are converted to plain objects
            const serializedUser = JSON.parse(JSON.stringify({ ...user, id: user._id.toString() }));
            return serializedUser;
        }
        return null;
    } catch (error) {
        throw new Error('Failed to fetch user.');
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.accountStatus = user.accountStatus;
                token.id = user.id;
            }
            else if (token?.id) {
                try {
                    await dbConnect();
                    const dbUser = await User.findById(token.id).select('accountStatus role').lean();
                    if (dbUser) {
                        token.accountStatus = dbUser.accountStatus;
                        token.role = dbUser.role;
                    } else {
                        token.accountStatus = 'rejected';
                    }
                } catch (error) {
                    console.error("Error fetching user in JWT callback:", error);
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
                try {
                    const parsedCredentials = z
                        .object({
                            email: z.string().email().regex(/^[^<>\{\}'";]+$/, "Invalid format"),
                            password: z.string().min(6).regex(/^[^<>\{\}'";]+$/, "Invalid format")
                        })
                        .safeParse(credentials);

                    if (!parsedCredentials.success) {
                        return null; 
                    }

                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);

                    if (!user) return null; 

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (!passwordsMatch) return null; 

                    if (user.accountStatus !== 'active') {
                        return null; 
                    }

                    return user;
                } catch {
                    return null; 
                }
            },
        }),
    ],
});
