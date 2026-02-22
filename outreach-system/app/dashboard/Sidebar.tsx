'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    PlusCircle,
    CalendarCheck,
    Settings,
    HelpCircle,
    LogOut,
    Menu,
    X,
    ShieldAlert,
    ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

export default function Sidebar({
    user,
    onSignOut,
}: {
    user: any;
    onSignOut: () => Promise<void>;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const navItems: NavItem[] = [
        { label: 'Dashboard',      href: '/dashboard',              icon: <LayoutDashboard size={19} /> },
        { label: 'Create Project', href: '/dashboard/create-event', icon: <PlusCircle size={19} /> },
        { label: 'My Projects',    href: '/dashboard/my-events',    icon: <CalendarCheck size={19} /> },
    ];

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    const initials =
        user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) ||
        user?.email?.charAt(0).toUpperCase() ||
        'U';

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white border-r border-slate-200">

            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#fbc037]/15 shrink-0">
                    <Image src="/Reach.png" alt="ReachPoint" width={22} height={22} className="object-contain" />
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-900">ReachPoint</span>
                {/* Mobile close */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="md:hidden ml-auto text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                    <X size={18} />
                </button>
            </div>

            {/* User chip */}
            <div className="px-4 py-4">
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#fbc037] flex items-center justify-center shrink-0 overflow-hidden border-2 border-[#fbc037]">
                        {user?.profileImage ? (
                            <img src={user.profileImage} alt={user?.name || 'User'} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-slate-900 text-xs font-bold">{initials}</span>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-2 mt-1">
                    Menu
                </p>

                {/* Admin shortcut */}
                {user?.role === 'admin' && (
                    <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors mb-2"
                    >
                        <ShieldAlert size={18} />
                        <span className="flex-1">Admin Portal</span>
                        <ChevronRight size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                    </Link>
                )}

                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                            isActive(item.href)
                                ? 'bg-[#fbc037]/15 text-slate-900'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                        <span className={isActive(item.href) ? 'text-yellow-700' : 'text-slate-400 group-hover:text-slate-600'}>
                            {item.icon}
                        </span>
                        <span className={isActive(item.href) ? 'font-semibold' : ''}>{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Bottom links */}
            <div className="px-4 pb-5 pt-3 border-t border-slate-100 space-y-1">
                <Link
                    href="/dashboard/settings"
                    onClick={() => setIsOpen(false)}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        pathname.startsWith('/dashboard/settings')
                            ? 'bg-[#fbc037]/15 text-slate-900'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                    <Settings size={19} className="text-slate-400" />
                    Settings
                </Link>
                <Link
                    href="/help"
                    onClick={() => setIsOpen(false)}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        pathname.startsWith('/help')
                            ? 'bg-[#fbc037]/15 text-slate-900'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                    <HelpCircle size={19} className="text-slate-400" />
                    Help Center
                </Link>
                <button
                    onClick={() => onSignOut()}
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                    <LogOut size={19} />
                    Sign Out
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile top bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white flex items-center justify-between px-4 shadow-sm shadow-slate-200/50">
                <div className="flex items-center gap-2">
                    <Image src="/Reach.png" alt="ReachPoint" width={28} height={28} className="object-contain" />
                    <span className="font-bold text-slate-900">ReachPoint</span>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-slate-500 hover:text-slate-900 transition-colors p-1"
                >
                    {isOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Desktop sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:relative md:translate-x-0 md:flex md:shrink-0
            `}>
                <SidebarContent />
            </aside>

            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
