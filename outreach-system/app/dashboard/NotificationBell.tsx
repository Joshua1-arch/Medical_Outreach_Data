'use client';

import { useEffect, useRef, useState } from 'react';
import Pusher from 'pusher-js';
import { Bell, CheckCheck, X, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Notification {
    _id: string;
    type: 'event_approved' | 'event_rejected' | 'milestone';
    title: string;
    message: string;
    eventId?: string;
    isRead: boolean;
    createdAt: string;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

function NotifIcon({ type }: { type: Notification['type'] }) {
    if (type === 'event_approved') return <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0"><Calendar size={14} className="text-emerald-600" /></div>;
    if (type === 'event_rejected') return <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0"><AlertCircle size={14} className="text-red-600" /></div>;
    return <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0"><TrendingUp size={14} className="text-amber-600" /></div>;
}

export default function NotificationBell({ userId }: { userId: string }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const panelRef = useRef<HTMLDivElement>(null);

    // ── Fetch on mount ───────────────────────────────────────────────────────
    useEffect(() => {
        fetch('/api/notifications')
            .then(r => r.json())
            .then(data => {
                setNotifications(data.notifications ?? []);
                setUnreadCount(data.unreadCount ?? 0);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // ── Pusher real-time subscription ────────────────────────────────────────
    useEffect(() => {
        if (!userId) return;

        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
            authEndpoint: '/api/pusher/auth',
        });

        const channel = pusher.subscribe(`private-user-${userId}`);

        channel.bind('new-notification', () => {
            // Re-fetch full list so we have the real DB content
            fetch('/api/notifications')
                .then(r => r.json())
                .then(data => {
                    setNotifications(data.notifications ?? []);
                    setUnreadCount(data.unreadCount ?? 0);
                })
                .catch(console.error);
        });

        return () => {
            pusher.unsubscribe(`private-user-${userId}`);
            pusher.disconnect();
        };
    }, [userId]);

    // ── Close on outside click ───────────────────────────────────────────────
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Mark all as read when panel opens ────────────────────────────────────
    const handleOpen = async () => {
        setOpen(prev => !prev);
        if (!open && unreadCount > 0) {
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            await fetch('/api/notifications', { method: 'PATCH' }).catch(console.error);
        }
    };

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell button */}
            <button
                onClick={handleOpen}
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
                aria-label="Notifications"
            >
                <Bell size={19} />
                {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {open && (
                <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                        <span className="text-sm font-bold text-slate-900">Notifications</span>
                        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={15} />
                        </button>
                    </div>

                    {/* List */}
                    <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-50">
                        {loading ? (
                            <div className="flex items-center justify-center py-10 text-slate-400 text-sm">Loading…</div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2">
                                <Bell size={24} className="text-slate-300" />
                                <p className="text-sm text-slate-400">All caught up!</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n._id}
                                    className={`flex items-start gap-3 px-4 py-3 transition-colors ${n.isRead ? 'bg-white' : 'bg-amber-50/60'}`}
                                >
                                    <NotifIcon type={n.type} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-xs font-bold text-slate-900 leading-snug">{n.title}</p>
                                            {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#fbc037] shrink-0 mt-0.5" />}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-[10px] text-slate-400">{timeAgo(n.createdAt)}</span>
                                            {n.eventId && (
                                                <Link
                                                    href={`/dashboard/event/${n.eventId}`}
                                                    className="text-[10px] font-semibold text-[#fbc037] hover:underline"
                                                    onClick={() => setOpen(false)}
                                                >
                                                    View event →
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50 flex items-center justify-end">
                            <button
                                onClick={async () => {
                                    setUnreadCount(0);
                                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                                    await fetch('/api/notifications', { method: 'PATCH' }).catch(console.error);
                                }}
                                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors"
                            >
                                <CheckCheck size={13} /> Mark all read
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
