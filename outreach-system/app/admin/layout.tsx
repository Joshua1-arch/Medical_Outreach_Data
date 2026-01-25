import { signOut } from "@/auth";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-brand-cream flex-col md:flex-row">
            <AdminSidebar
                onSignOut={async () => {
                    'use server'
                    await signOut();
                }}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4 md:p-8 pt-20 md:pt-8 bg-brand-cream">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
