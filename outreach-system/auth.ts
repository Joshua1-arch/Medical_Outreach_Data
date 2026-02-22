import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { authConfig } from "./auth.config"
import { sendAdminNewUserAlert } from "@/lib/email"

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
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                try {
                    await dbConnect();
                    const existingUser = await User.findOne({ email: user.email });

                    if (!existingUser) {
                        // Create a new pending user for Google signups
                        await User.create({
                            name: user.name,
                            email: user.email,
                            password: 'GOOGLE_SOCIAL_LOGIN', // Placeholder for mandatory field
                            accountStatus: 'pending',
                            role: 'user',
                            profileImage: user.image
                        });

                        // Notify admin about pending Google user (non-blocking)
                        sendAdminNewUserAlert(user.email!, user.name!, 'Google').catch(() => { });

                        // Redirect to the signup page with a success flag
                        return "/signup?success=google";
                    }

                    if (existingUser.accountStatus === 'pending') {
                        return "/signup?success=google";
                    }

                    if (existingUser.accountStatus === 'active') {
                        return true;
                    }

                    return "/login?error=AccessDenied";
                } catch (error) {
                    console.error("Error in Google signIn callback:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            // Initial sign in
            if (account && user) {
                if (account.provider === 'credentials') {
                    token.role = (user as any).role || 'member';
                    token.accountStatus = (user as any).accountStatus || 'active';
                    token.id = user.id;
                    token.provider = 'credentials';
                } else {
                    // Social login: Fetch the real DB user by email to get their _id
                    try {
                        await dbConnect();
                        const dbUser = await User.findOne({ email: user.email }).lean() as any;
                        if (dbUser) {
                            token.id = dbUser._id.toString();
                            token.role = dbUser.role;
                            token.accountStatus = dbUser.accountStatus;
                        } else {
                            // Should theoretically not happen if signIn callback handles creation
                            token.id = user.id; 
                        }
                    } catch (error) {
                        console.error("Error fetching user in social jwt callback:", error);
                        token.id = user.id;
                    }
                    token.provider = account.provider;
                }
            }
            // Subsequent calls
            else if (token?.id) {
                try {
                    await dbConnect();
                    // Basic check to ensure the ID is a valid ObjectId before querying
                    // This prevents the common "Cast to ObjectId failed" error
                    const isValidId = /^[0-9a-fA-F]{24}$/.test(token.id as string);
                    
                    if (!isValidId) {
                        // If it's not a valid ObjectId (e.g. Google UUID), try linking it via email
                        const dbUser = await User.findOne({ email: token.email }).lean() as any;
                        if (dbUser) {
                            token.id = dbUser._id.toString();
                        } else {
                            return null;
                        }
                    }

                    const dbUser = await User.findById(token.id).select('accountStatus role').lean() as any;
                    if (dbUser && dbUser.accountStatus === 'active') {
                        token.accountStatus = dbUser.accountStatus;
                        token.role = dbUser.role;
                    } else {
                        return null;
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
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
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
