'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Users, CalendarCheck, LogOut, Menu, X,
    ArrowLeft, Settings, Database, BriefcaseMedical, HeartPulse
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'User Management', href: '/admin/users', icon: Users, hasBadge: true },
    { name: 'All Events', href: '/admin/events', icon: CalendarCheck },
    { name: 'Blood Bank Search', href: '/admin/blood-bank', icon: HeartPulse },
];

const SETTINGS_ITEMS = [
    { name: 'Site Appearance', href: '/admin/settings/site-appearance', icon: Settings },
    { name: 'Master Data', href: '/admin/settings/data', icon: Database },
];

export default function AdminSidebar({
    onSignOut,
    deletionRequestCount = 0,
}: {
    onSignOut: () => Promise<void>;
    deletionRequestCount?: number;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (href: string) =>
        href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

    const close = () => setIsOpen(false);

    const NavLink = ({ item }: { item: typeof NAV_ITEMS[0] & { hasBadge?: boolean } }) => {
        const active = isActive(item.href);
        return (
            <Link
                href={item.href}
                onClick={close}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${active
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
            >
                <item.icon size={18} />
                <span className="flex-1">{item.name}</span>
                {item.hasBadge && deletionRequestCount > 0 && (
                    <span className="ml-auto px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full font-bold leading-none animate-pulse">
                        {deletionRequestCount}
                    </span>
                )}
            </Link>
        );
    };

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="p-6 flex items-center gap-3 border-b border-slate-700/50">
                <div className="flex size-9 items-center justify-center rounded-lg bg-[#fbc037] text-slate-900 shrink-0">
                    <BriefcaseMedical size={20} />
                </div>
                <div>
                    <h1 className="text-white font-bold tracking-tight leading-tight">ReachPoint</h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Super Admin</p>
                </div>
                <button onClick={close} className="md:hidden ml-auto text-slate-400 hover:text-white">
                    <X size={20} />
                </button>
            </div>

            {/* Main nav */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => <NavLink key={item.href} item={item} />)}

                {/* Settings divider */}
                <div className="pt-6 pb-2 px-2">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Settings</p>
                </div>

                {SETTINGS_ITEMS.map((item) => <NavLink key={item.href} item={item} />)}

                {/* Back to user portal */}
                <div className="pt-4 mt-2 border-t border-slate-700/40">
                    <Link
                        href="/dashboard"
                        onClick={close}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
                    >
                        <ArrowLeft size={16} />
                        <span>Back to User Portal</span>
                    </Link>
                </div>
            </nav>

            {/* Sign out */}
            <div className="p-4 border-t border-slate-700/50">
                <button
                    onClick={() => {
                        sessionStorage.setItem('logging-out', 'true');
                        onSignOut();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile top bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#1e293b] border-b border-slate-700/50 flex items-center justify-between px-4 z-40">
                <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-[#fbc037] text-slate-900">
                        <BriefcaseMedical size={16} />
                    </div>
                    <span className="text-white font-bold text-sm">ReachPoint</span>
                </div>
                <button onClick={() => setIsOpen(true)} className="text-slate-400 hover:text-white p-1">
                    <Menu size={22} />
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-[#1e293b] flex flex-col
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:relative md:translate-x-0
            `}>
                <SidebarContent />
            </aside>

            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden"
                    onClick={close}
                />
            )}
        </>
    );
}
