'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, LayoutTemplate, Settings, Activity } from 'lucide-react';

export default function EventNavTabs({ eventId }: { eventId: string }) {
    const pathname = usePathname();

    const base = `/dashboard/event/${eventId}`;

    const tabs = [
        { label: 'Responses', href: base, icon: MessageSquare },
        { label: 'Form Builder', href: `${base}/builder`, icon: LayoutTemplate },
        { label: 'Settings', href: `${base}/settings`, icon: Settings },
        { label: 'Analytics', href: `${base}/analytics`, icon: Activity },
        { label: 'Chat', href: `${base}/chat`, icon: MessageSquare },
    ];

    return (
        <nav className="flex items-center gap-1 px-4 pb-0 w-full overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
                // Exact match for hub, prefix match for sub-pages
                const isActive =
                    tab.href === base
                        ? pathname === base
                        : pathname.startsWith(tab.href);

                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-bold transition-all whitespace-nowrap ${
                            isActive
                                ? 'border-[#fbc037] text-slate-900'
                                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                        }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </Link>
                );
            })}
        </nav>
    );
}
