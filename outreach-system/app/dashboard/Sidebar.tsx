'use client';
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    PlusCircle,
    CalendarCheck,
    LogOut,
    Menu,
    X,
    ShieldAlert,
    Settings,
    ChevronRight,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    highlight?: boolean;
}

export default function Sidebar({ user, onSignOut }: { user: any; onSignOut: () => Promise<void> }) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const navItems: NavItem[] = [
        { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
        { label: "Create Project", href: "/dashboard/create-event", icon: <PlusCircle size={18} /> },
        { label: "My Projects", href: "/dashboard/my-events", icon: <CalendarCheck size={18} /> },
        { label: "Settings", href: "/dashboard/settings", icon: <Settings size={18} /> },
    ];

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo Header */}
            <div className="relative flex flex-col items-center gap-2 px-6 pt-6 pb-5 border-b border-white/10">
                {/* Mobile close button — top right */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="md:hidden absolute top-3 right-3 text-white/30 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                >
                    <X size={16} />
                </button>

                {/* Logo */}
                <div className="flex items-center justify-center">
                    <Image src="/Reachside1.png" alt="ReachPoint Logo" width={130} height={38} className="object-contain" />
                </div>

                {/* USER PORTAL badge */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/25">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-gold/90">User Portal</span>
                </div>
            </div>

            {/* User Info */}
            <div className="px-4 py-4 mx-3 mt-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-brand-gold font-bold text-sm">
                            {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{user?.name || "User"}</p>
                        <p className="text-white/40 text-xs truncate">{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.15em] px-3 mb-3">Navigation</p>

                {user?.role === 'admin' && (
                    <Link
                        onClick={() => setIsOpen(false)}
                        href="/admin"
                        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-brand-gold bg-brand-gold/10 border border-brand-gold/20 hover:bg-brand-gold/20 transition-all font-semibold text-sm mb-3"
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
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                            ${isActive(item.href)
                                ? 'bg-white text-brand-dark shadow-lg shadow-black/20'
                                : 'text-white/60 hover:text-white hover:bg-white/10'
                            }
                        `}
                    >
                        <span className={`${isActive(item.href) ? 'text-brand-dark' : 'text-white/50 group-hover:text-white'} transition-colors`}>
                            {item.icon}
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {isActive(item.href) && (
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                        )}
                    </Link>
                ))}
            </nav>

            {/* Sign Out */}
            <div className="p-3 border-t border-white/10">
                <button
                    onClick={() => onSignOut()}
                    className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
                >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-brand-dark border-b border-white/10 flex items-center justify-between px-4">
                <div className="flex items-center gap-2.5">
                    <div className="rounded-md px-2 py-0.5 flex items-center justify-center">
                        <Image src="/Reachside1.png" alt="ReachPoint Logo" width={90} height={26} className="object-contain" />
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-white/70 hover:text-white transition-colors p-1"
                >
                    {isOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Desktop Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-brand-dark flex flex-col transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:relative md:translate-x-0 md:flex
            `}>
                <SidebarContent />
            </aside>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
