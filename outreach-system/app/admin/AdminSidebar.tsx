'use client';
import Link from "next/link";
import { LayoutDashboard, Users, CalendarCheck, LogOut, Menu, X, ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function AdminSidebar({ onSignOut }: { onSignOut: () => Promise<void> }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Header Trigger */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 z-40 flex items-center justify-between h-16 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-brand-dark">
                    <span className="w-8 h-8 bg-brand-dark rounded-lg flex items-center justify-center text-brand-gold text-lg font-serif">M</span>
                    MedOutreach
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
                            <span className="w-8 h-8 bg-brand-dark rounded-lg flex items-center justify-center text-brand-gold text-lg">M</span>
                            MedOutreach
                        </h1>
                        <p className="text-xs text-brand-gold mt-1 uppercase tracking-wider font-bold">Super Admin</p>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400">
                        <X />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <Link
                        onClick={() => setIsOpen(false)}
                        href="/admin"
                        className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-brand-dark rounded-md transition-colors font-medium"
                    >
                        <LayoutDashboard size={18} />
                        Overview
                    </Link>

                    <Link
                        onClick={() => setIsOpen(false)}
                        href="/admin/users"
                        className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-brand-dark rounded-md transition-colors font-medium"
                    >
                        <Users size={18} />
                        User Management
                    </Link>


                    <Link
                        onClick={() => setIsOpen(false)}
                        href="/admin/events"
                        className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-brand-dark rounded-md transition-colors font-medium"
                    >
                        <CalendarCheck size={18} />
                        All Events
                    </Link>

                    <Link
                        onClick={() => setIsOpen(false)}
                        href="/admin/blood-bank"
                        className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-red-700 rounded-md transition-colors font-medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart-pulse"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" /></svg>
                        Blood Bank Search
                    </Link>

                    <div className="pt-4 mt-4 border-t border-slate-100">
                        <Link
                            onClick={() => setIsOpen(false)}
                            href="/dashboard"
                            className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-brand-dark transition-colors font-medium text-sm"
                        >
                            <ArrowLeft size={16} />
                            Back to User Portal
                        </Link>
                    </div>
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
