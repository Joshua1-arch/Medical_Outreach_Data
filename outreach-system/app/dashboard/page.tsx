import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import Record from '@/models/Record';
import User from '@/models/User';
import {
    Calendar,
    FileText,
    Activity,
    X,
    Zap,
    Shield,
    PlusCircle,
    ArrowRight,
    CheckCircle,
    Clock,
    TrendingUp,
    Users,
    Sparkles,
    MapPin,
    MoreVertical,
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getUserStats(userId: string) {
    await dbConnect();

    // Defensive check: if userId is not a valid ObjectId string, 
    // Mongoose queries will fail with a CastError.
    const isValidId = /^[0-9a-fA-F]{24}$/.test(userId);
    if (!isValidId) {
        return { 
            myEvents: 0, 
            approvedEvents: 0, 
            pendingEvents: 0, 
            totalRecords: 0, 
            recentEvents: [], 
            isTrusted: false, 
            isAdmin: false 
        };
    }

    const [myEvents, approvedEvents, pendingEvents, totalRecords, recentEvents, user] = await Promise.all([
        Event.countDocuments({ createdBy: userId }),
        Event.countDocuments({ createdBy: userId, status: 'approved' }),
        Event.countDocuments({ createdBy: userId, status: 'pending' }),
        Record.countDocuments({ recordedBy: userId }),
        Event.find({ createdBy: userId })
            .sort({ createdAt: -1 })
            .limit(4)
            .select('title status location createdAt')
            .lean(),
        User.findById(userId).select('isTrusted role').lean(),
    ]);

    const isTrusted = user?.isTrusted || false;
    const isAdmin = user?.role === 'admin';

    return { myEvents, approvedEvents, pendingEvents, totalRecords, recentEvents, isTrusted, isAdmin };
}

/* ── Status badge helper ── */
function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; dot: string; pill: string }> = {
        approved: { label: 'Approved',  dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
        pending:  { label: 'Pending',   dot: 'bg-amber-400',   pill: 'bg-amber-50  text-amber-700  border-amber-100'   },
        rejected: { label: 'Rejected',  dot: 'bg-red-400',     pill: 'bg-red-50    text-red-700    border-red-100'     },
    };
    const cfg = map[status] ?? { label: status, dot: 'bg-slate-400', pill: 'bg-slate-50 text-slate-600 border-slate-200' };
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${cfg.pill}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

export default async function DashboardPage() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) redirect('/login');

    try {
        const stats = await getUserStats(userId);
        const firstName = session?.user?.name?.split(' ')[0] || 'there';

        const statCards = [
            {
                label: 'My Projects',
                value: stats.myEvents,
                sub: 'Total Created',
                icon: <Calendar size={22} />,
                iconBg: 'bg-violet-50 text-violet-600',
                trend: '+2 this month',
            },
            {
                label: 'Active Projects',
                value: stats.approvedEvents,
                sub: 'Approved & Running',
                icon: <Activity size={22} />,
                iconBg: 'bg-emerald-50 text-emerald-600',
                trend: 'Ready to collect',
            },
            {
                label: 'Pending Review',
                value: stats.pendingEvents,
                sub: 'Awaiting Approval',
                icon: <Clock size={22} />,
                iconBg: 'bg-amber-50 text-amber-600',
                trend: 'Under review',
            },
            {
                label: 'Records Entered',
                value: stats.totalRecords,
                sub: 'Total Data Points',
                icon: <FileText size={22} />,
                iconBg: 'bg-blue-50 text-blue-600',
                trend: 'Lifetime total',
            },
        ];

        return (
            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* ── Page Header ──────────────────────────────── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <h2 className="text-2xl font-bold text-slate-900">
                                Good morning, {firstName} 
                            </h2>
                            {stats.isAdmin && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold border border-purple-200">
                                    <Shield size={11} /> Admin
                                </span>
                            )}
                            {stats.isTrusted && !stats.isAdmin && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                                    <Zap size={11} /> Trusted Creator
                                </span>
                            )}
                        </div>
                        <p className="text-slate-500 text-sm">Here&apos;s an overview of your research activity today.</p>
                    </div>
                    <Link
                        href="/dashboard/create-event"
                        className="inline-flex items-center gap-2 rounded-lg bg-[#fbc037] px-5 py-2.5 text-sm font-bold text-slate-900 shadow-sm hover:bg-yellow-400 transition-colors flex-shrink-0 group"
                    >
                        <PlusCircle size={17} />
                        New Project
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>

                {/* Trusted notice */}
                {stats.isTrusted && !stats.isAdmin && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                        <Sparkles size={16} className="text-amber-500 shrink-0" />
                        <span><strong>Auto-Approval Active</strong> — Your projects are published instantly without waiting for admin review.</span>
                    </div>
                )}

                {/* ── Stat Cards ───────────────────────────────── */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((card) => (
                        <div
                            key={card.label}
                            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{card.label}</p>
                                    <h3 className="mt-1.5 text-3xl font-bold text-slate-900 tabular-nums">{card.value}</h3>
                                </div>
                                <div className={`flex h-11 w-11 items-center justify-center rounded-full ${card.iconBg}`}>
                                    {card.icon}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="flex items-center text-sm font-medium text-emerald-600">
                                    <TrendingUp size={13} className="mr-1" />
                                    {card.trend}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Two column: CTA Banner + Quick Insights ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* CTA Banner */}
                    <div className="lg:col-span-2 relative overflow-hidden rounded-xl bg-slate-900 p-7 flex flex-col justify-between min-h-[200px]">
                        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-[#fbc037]/10 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-14 -left-8 w-44 h-44 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
                        <div className="absolute top-4 right-6 opacity-10">
                            <TrendingUp size={120} strokeWidth={1} className="text-white" />
                        </div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#fbc037]/20 border border-[#fbc037]/30 rounded-full mb-4">
                                <Sparkles size={12} className="text-[#fbc037]" />
                                <span className="text-[#fbc037] text-xs font-bold uppercase tracking-wider">Start collecting data</span>
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">
                                Ready to launch your next project?
                            </h2>
                            <p className="text-white/60 text-sm leading-relaxed max-w-md">
                                {stats.isTrusted || stats.isAdmin
                                    ? 'Create a new project and start collecting data immediately — your projects are auto-approved!'
                                    : 'Create a project, define your data fields, and the admin will review it before you begin collecting.'}
                            </p>
                        </div>

                        <div className="relative z-10 mt-6 flex flex-wrap gap-3">
                            <Link
                                href="/dashboard/create-event"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#fbc037] text-slate-900 rounded-lg font-bold text-sm hover:bg-yellow-400 transition-colors group"
                            >
                                <PlusCircle size={16} />
                                Create Project
                                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                            <Link
                                href="/dashboard/my-events"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg font-semibold text-sm hover:bg-white/20 transition-colors"
                            >
                                View All Projects
                            </Link>
                        </div>
                    </div>

                    {/* Quick Insights */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 text-sm mb-5 flex items-center gap-2">
                            <Users size={16} className="text-[#fbc037]" />
                            Quick Insights
                        </h3>
                        <div className="space-y-0 divide-y divide-slate-50">
                            {[
                                {
                                    color: 'bg-emerald-400', label: 'Approval Rate',
                                    value: `${stats.myEvents > 0 ? Math.round((stats.approvedEvents / stats.myEvents) * 100) : 0}%`,
                                },
                                {
                                    color: 'bg-blue-400', label: 'Avg. Records / Project',
                                    value: stats.approvedEvents > 0 ? Math.round(stats.totalRecords / stats.approvedEvents) : 0,
                                },
                                {
                                    color: 'bg-amber-400', label: 'In Review',
                                    value: stats.pendingEvents,
                                },
                                {
                                    color: 'bg-violet-400', label: 'Account Status',
                                    value: stats.isAdmin ? 'Admin' : stats.isTrusted ? 'Trusted' : 'Standard',
                                    badge: true,
                                    badgeCls: stats.isAdmin
                                        ? 'bg-purple-100 text-purple-700'
                                        : stats.isTrusted
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-slate-100 text-slate-600',
                                },
                            ].map(({ color, label, value, badge, badgeCls }) => (
                                <div key={label} className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-2 h-2 rounded-full ${color}`} />
                                        <span className="text-slate-600 text-sm">{label}</span>
                                    </div>
                                    {badge ? (
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeCls}`}>{value}</span>
                                    ) : (
                                        <span className="font-bold text-slate-800 text-sm">{value}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                        <Link
                            href="/dashboard/my-events"
                            className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-600 rounded-lg text-sm font-semibold transition-all group"
                        >
                            View My Projects
                            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* ── Recent Projects Table ─────────────────────── */}
                {stats.recentEvents.length > 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <h3 className="text-base font-bold text-slate-900">Recent Projects</h3>
                            <Link
                                href="/dashboard/my-events"
                                className="text-sm font-medium text-yellow-700 hover:text-[#fbc037] hover:underline transition-colors"
                            >
                                View All
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-400 font-semibold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3">Project Name</th>
                                        <th className="px-6 py-3">Location</th>
                                        <th className="px-6 py-3">Created</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {stats.recentEvents.map((event: any) => (
                                        <tr key={event._id?.toString()} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                                        <Calendar size={17} />
                                                    </div>
                                                    <span className="font-medium text-slate-900 truncate max-w-[200px]">
                                                        {event.title}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin size={14} className="shrink-0" />
                                                    <span>{event.location || '—'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                                {event.createdAt
                                                    ? new Date(event.createdAt).toLocaleDateString('en-GB', {
                                                          day: 'numeric', month: 'short', year: 'numeric',
                                                      })
                                                    : '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={event.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/dashboard/event/${event._id?.toString()}`}
                                                    className="text-slate-400 hover:text-yellow-700 transition-colors"
                                                >
                                                    <MoreVertical size={18} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-t border-slate-100 px-6 py-3 bg-white">
                            <p className="text-sm text-slate-400">
                                Showing <span className="font-semibold text-slate-700">{stats.recentEvents.length}</span> of{' '}
                                <span className="font-semibold text-slate-700">{stats.myEvents}</span> projects
                            </p>
                        </div>
                    </div>
                ) : (
                    /* Empty state */
                    <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
                        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Calendar size={28} className="text-[#fbc037]" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No projects yet</h3>
                        <p className="text-slate-500 mb-6 max-w-sm mx-auto text-sm">
                            Create your first research project to start collecting vital health data from participants.
                        </p>
                        <Link
                            href="/dashboard/create-event"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#fbc037] text-slate-900 rounded-lg font-bold hover:bg-yellow-400 transition-colors shadow-sm group"
                        >
                            <PlusCircle size={18} />
                            Create First Project
                            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error('Database connection failed:', error);
        return (
            <div className="p-12 text-center bg-white rounded-xl border border-red-100 shadow-sm mt-8">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Connection Error</h2>
                <p className="max-w-md mx-auto mb-4 text-slate-500 text-sm">
                    Could not connect to the database. This is usually caused by an unwhitelisted IP in MongoDB Atlas.
                </p>
            </div>
        );
    }
}
