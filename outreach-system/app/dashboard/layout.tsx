import { signOut, auth } from "@/auth";
import Sidebar from "./Sidebar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    return (
        <div className="flex h-screen bg-[#F0F2F5] overflow-hidden">
            <Sidebar
                user={session?.user}
                onSignOut={async () => {
                    'use server'
                    await signOut();
                }}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="min-h-full p-5 pt-20 md:pt-6 md:p-8">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
