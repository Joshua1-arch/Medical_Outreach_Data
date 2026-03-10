import { DefaultSession } from 'next-auth';

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: string
            accountStatus: string
            isPremium: boolean
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        role: string
        accountStatus: string
        isPremium: boolean
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: string
        accountStatus: string
        isPremium: boolean
    }
}
