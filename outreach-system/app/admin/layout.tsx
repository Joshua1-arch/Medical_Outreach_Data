import { signOut } from "@/auth";
import AdminSidebar from "./AdminSidebar";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    let deletionRequestCount = 0;
    try {
        await dbConnect();
        deletionRequestCount = await User.countDocuments({ deletionRequested: true });
    } catch {
        // non-fatal — sidebar still renders without the badge
    }

    return (
        <div className="flex h-screen bg-[#f8f7f5] flex-col md:flex-row">
            <AdminSidebar
                deletionRequestCount={deletionRequestCount}
                onSignOut={async () => {
                    'use server'
                    await signOut({ redirectTo: '/login' });
                }}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4 md:p-8 pt-20 md:pt-8 bg-[#f8f7f5]">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );

}

