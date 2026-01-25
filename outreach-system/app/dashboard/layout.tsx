import { signOut, auth } from "@/auth";
import Sidebar from "./Sidebar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    return (
        <div className="flex h-screen bg-brand-cream flex-col md:flex-row">
            <Sidebar
                user={session?.user}
                onSignOut={async () => {
                    'use server'
                    await signOut();
                }}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4 md:p-8 pt-20 md:pt-8">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
