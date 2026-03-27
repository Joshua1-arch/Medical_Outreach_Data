import { auth } from '@/auth';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';
import NotificationBell from './NotificationBell';
import BackgroundHydrator from '@/components/BackgroundHydrator';
import { Suspense } from 'react';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const sessionUser = session?.user;

    // Fetch full user from DB so we have profileImage
    let profileImage = '';
    try {
        await dbConnect();
        const dbUser = await User.findById(sessionUser?.id).lean() as any;
        profileImage = dbUser?.profileImage || '';
    } catch {
        // non-fatal — falls back to initials
    }

    const initials =
        sessionUser?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) ||
        sessionUser?.email?.charAt(0).toUpperCase() ||
        'U';

    // Merge profileImage into the user object passed to the sidebar
    const user = sessionUser ? { ...sessionUser, profileImage } : sessionUser;

    return (
        <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans">
            <BackgroundHydrator />

            {/* Sidebar */}
            <Sidebar user={user} />

            {/* Right column: header + scrollable content */}
            <div className="flex flex-1 flex-col h-full overflow-hidden">

                {/* Top header */}
                <header className="hidden md:flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 md:px-8 z-10">

                    {/* Search */}
                    <Suspense fallback={
                        <div className="relative w-full max-w-sm hidden sm:block">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <span className="w-4 h-4 rounded bg-slate-200 animate-pulse" />
                            </div>
                            <div className="block w-full rounded-lg bg-slate-100 py-2 pl-9 pr-3 h-9 animate-pulse" />
                        </div>
                    }>
                        <SearchBar />
                    </Suspense>

                    {/* Right actions */}
                    <div className="flex items-center gap-3 ml-auto">
                        {/* Notification Bell */}
                        <NotificationBell userId={sessionUser?.id ?? ''} />

                        <div className="h-7 w-px bg-slate-200" />

                        {/* User chip */}
                        <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-full bg-[#fbc037] flex items-center justify-center shrink-0 overflow-hidden border-2 border-[#fbc037]">
                                {profileImage ? (
                                    <img src={profileImage} alt={sessionUser?.name || 'User'} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-slate-900 text-xs font-bold">{initials}</span>
                                )}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-semibold text-slate-900 leading-none">{sessionUser?.name || 'User'}</p>
                                <p className="text-xs text-slate-400 capitalize mt-0.5">{sessionUser?.role || 'member'}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable page content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-5 pt-20 md:pt-6 md:p-8">
                        <div className="max-w-6xl mx-auto">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
