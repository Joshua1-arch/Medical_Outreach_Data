import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, LayoutTemplate, MessageSquare, Settings } from 'lucide-react';
import EventNavTabs from './_components/EventNavTabs';

export default async function EventLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) {
    const session = await auth();
    if (!session?.user) redirect('/login');

    const { id } = await params;

    try {
        await dbConnect();
        const event = await Event.findById(id).select('title status createdBy').lean() as any;
        if (!event) notFound();

        // Authorization
        if (
            event.createdBy.toString() !== session.user.id &&
            session.user.role !== 'admin'
        ) {
            redirect('/dashboard/my-events');
        }

        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                {/* ── Sticky Tab Header ─────────────────────────── */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    {/* Title bar */}
                    <div className="flex items-center gap-4 px-6 pt-5 pb-4 border-b border-slate-100">
                        <Link
                            href="/dashboard/my-events"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
                        >
                            <ArrowLeft size={16} />
                        </Link>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Event Manager</p>
                            <h1 className="text-lg font-bold text-slate-900 truncate">{event.title}</h1>
                        </div>
                        <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                            event.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                            {event.status}
                        </span>
                    </div>

                    {/* Nav tabs — client component so usePathname works */}
                    <EventNavTabs eventId={id} />
                </div>

                {/* ── Page content ───────────────────────────────── */}
                {children}
            </div>
        );
    } catch {
        redirect('/dashboard/my-events');
    }
}
