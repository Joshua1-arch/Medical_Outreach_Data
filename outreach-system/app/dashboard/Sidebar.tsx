'use client';
import Link from "next/link";
import { LayoutDashboard, PlusCircle, CalendarCheck, LogOut, Menu, X, ShieldAlert, Settings } from "lucide-react";
import { useState } from "react";

export default function Sidebar({ user, onSignOut }: { user: any, onSignOut: () => Promise<void> }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Header Trigger */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 z-40 flex items-center justify-between h-16 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-brand-dark">
                    <span className="w-8 h-8 bg-brand-dark rounded-lg flex items-center justify-center text-brand-gold text-lg font-serif">R</span>
                    ReachPoint
                </div>
                <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 p-1">
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Sidebar Drawer */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:relative md:translate-x-0
            `}>
                <div className="p-6 border-b border-slate-100 flex justify-between items-center h-[88px] md:h-auto">
                    <div>
                        <h1 className="text-xl font-bold text-brand-dark flex items-center gap-2 font-serif">
                            <span className="w-8 h-8 bg-brand-dark rounded-lg flex items-center justify-center text-brand-gold text-lg">R</span>
                            ReachPoint
                        </h1>
                        <p className="text-xs text-brand-gold mt-1 uppercase tracking-wider font-bold">User Portal</p>
                        <p className="text-xs text-slate-400 mt-2 truncate max-w-[200px]">{user?.email}</p>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400">
                        <X />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <Link
                        onClick={() => setIsOpen(false)}
                        href="/dashboard"
                        className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-brand-dark rounded-md transition-colors font-medium"
                    >
                        <LayoutDashboard size={18} />
                        Dashboard
                    </Link>

                    {user?.role === 'admin' && (
                        <>
                        <Link
                            onClick={() => setIsOpen(false)}
                            href="/admin"
                            className="flex items-center gap-3 px-3 py-2 text-brand-gold bg-slate-50 hover:bg-slate-100 rounded-md transition-colors font-medium"
                        >
                            <ShieldAlert size={18} />
                            Admin Portal
                        </Link>
                        
                        <Link
                            onClick={() => setIsOpen(false)}
                            href="/admin/settings/site-appearance"
                            className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-brand-dark rounded-md transition-colors font-medium"
                        >
                            <Settings size={18} />
                            Site Appearance
                        </Link>
                        </>
                    )}

                    <Link
                        onClick={() => setIsOpen(false)}
                        href="/dashboard/create-event"
                        className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-brand-dark rounded-md transition-colors font-medium"
                    >
                        <PlusCircle size={18} />
                        Create Project
                    </Link>

                    <Link
                        onClick={() => setIsOpen(false)}
                        href="/dashboard/my-events"
                        className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-brand-dark rounded-md transition-colors font-medium"
                    >
                        <CalendarCheck size={18} />
                        My Projects
                    </Link>

                    <Link
                        onClick={() => setIsOpen(false)}
                        href="/dashboard/settings"
                        className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-brand-dark rounded-md transition-colors font-medium"
                    >
                        <Settings size={18} />
                        Settings
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={() => onSignOut()}
                        className="flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-50 w-full rounded-md transition-colors font-medium"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
