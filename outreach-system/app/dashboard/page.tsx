import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import Record from "@/models/Record";
import User from "@/models/User";
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
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

async function getUserStats(userId: string) {
    await dbConnect();
    const myEvents = await Event.countDocuments({ createdBy: userId });
    const approvedEvents = await Event.countDocuments({ createdBy: userId, status: 'approved' });
    const pendingEvents = await Event.countDocuments({ createdBy: userId, status: 'pending' });
    const totalRecords = await Record.countDocuments({ recordedBy: userId });

    const user = await User.findById(userId).select('isTrusted role').lean();
    const isTrusted = user?.isTrusted || false;
    const isAdmin = user?.role === 'admin';

    return { myEvents, approvedEvents, pendingEvents, totalRecords, isTrusted, isAdmin };
}

export default async function DashboardPage() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        redirect('/login');
    }

    try {
        const stats = await getUserStats(userId);
        const firstName = session?.user?.name?.split(' ')[0] || 'there';

        const statCards = [
            {
                label: "My Projects",
                value: stats.myEvents,
                sub: "Total Created",
                icon: <Calendar size={20} />,
                color: "bg-violet-500",
                light: "bg-violet-50 text-violet-600",
                trend: "+2 this month",
            },
            {
                label: "Active Projects",
                value: stats.approvedEvents,
                sub: "Approved & Running",
                icon: <Activity size={20} />,
                color: "bg-emerald-500",
                light: "bg-emerald-50 text-emerald-600",
                trend: "Ready to collect",
            },
            {
                label: "Pending Review",
                value: stats.pendingEvents,
                sub: "Awaiting Approval",
                icon: <Clock size={20} />,
                color: "bg-amber-500",
                light: "bg-amber-50 text-amber-600",
                trend: "Under review",
            },
            {
                label: "Records Entered",
                value: stats.totalRecords,
                sub: "Total Data Points",
                icon: <FileText size={20} />,
                color: "bg-blue-500",
                light: "bg-blue-50 text-blue-600",
                trend: "Lifetime total",
            },
        ];

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <h1 className="text-2xl font-serif font-bold text-slate-800">
                                Good morning, {firstName} 👋
                            </h1>
                            {stats.isAdmin && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold border border-purple-200">
                                    <Shield size={12} />
                                    Admin
                                </span>
                            )}
                            {stats.isTrusted && !stats.isAdmin && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                                    <Zap size={12} />
                                    Trusted Creator
                                </span>
                            )}
                        </div>
                        <p className="text-slate-500 text-sm">
                            Here&apos;s an overview of your research activity today.
                        </p>
                    </div>
                    <Link
                        href="/dashboard/create-event"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-dark text-white rounded-xl font-semibold text-sm hover:bg-slate-700 transition-all shadow-lg shadow-slate-900/20 flex-shrink-0 group"
                    >
                        <PlusCircle size={16} />
                        New Project
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>

                {/* Trusted notice */}
                {stats.isTrusted && !stats.isAdmin && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                        <Sparkles size={16} className="text-amber-500 flex-shrink-0" />
                        <span><strong>Auto-Approval Active</strong> — Your projects are published instantly without waiting for admin review.</span>
                    </div>
                )}

                {/* Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((card) => (
                        <div
                            key={card.label}
                            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.light}`}>
                                    {card.icon}
                                </div>
                                <span className="text-3xl font-bold text-slate-800 tabular-nums">
                                    {card.value}
                                </span>
                            </div>
                            <p className="font-semibold text-slate-700 text-sm">{card.label}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{card.trend}</p>
                        </div>
                    ))}
                </div>

                {/* Two column section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* CTA Banner */}
                    <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-brand-dark p-7 flex flex-col justify-between min-h-[200px]">
                        {/* Background decoration */}
                        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-brand-gold/10 blur-2xl pointer-events-none" />
                        <div className="absolute -bottom-12 -left-6 w-40 h-40 rounded-full bg-violet-600/10 blur-2xl pointer-events-none" />
                        <div className="absolute top-4 right-6 opacity-10">
                            <TrendingUp size={120} strokeWidth={1} className="text-white" />
                        </div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-gold/20 border border-brand-gold/30 rounded-full mb-4">
                                <Sparkles size={12} className="text-brand-gold" />
                                <span className="text-brand-gold text-xs font-bold uppercase tracking-wider">Start collecting data</span>
                            </div>
                            <h2 className="text-xl font-serif font-bold text-white mb-2">
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
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-gold text-brand-dark rounded-xl font-bold text-sm hover:bg-yellow-300 transition-colors shadow-lg shadow-yellow-900/20 group"
                            >
                                <PlusCircle size={16} />
                                Create Project
                                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                            <Link
                                href="/dashboard/my-events"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white border border-white/20 rounded-xl font-semibold text-sm hover:bg-white/20 transition-colors"
                            >
                                View All Projects
                            </Link>
                        </div>
                    </div>

                    {/* Quick Stats Panel */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-800 text-sm mb-5 flex items-center gap-2">
                            <Users size={16} className="text-brand-gold" />
                            Quick Insights
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-slate-50">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                    <span className="text-slate-600 text-sm">Approval Rate</span>
                                </div>
                                <span className="font-bold text-slate-800 text-sm">
                                    {stats.myEvents > 0 ? Math.round((stats.approvedEvents / stats.myEvents) * 100) : 0}%
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-slate-50">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                                    <span className="text-slate-600 text-sm">Avg. Records/Project</span>
                                </div>
                                <span className="font-bold text-slate-800 text-sm">
                                    {stats.approvedEvents > 0 ? Math.round(stats.totalRecords / stats.approvedEvents) : 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-slate-50">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                                    <span className="text-slate-600 text-sm">In Review</span>
                                </div>
                                <span className="font-bold text-slate-800 text-sm">{stats.pendingEvents}</span>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-2 h-2 rounded-full bg-violet-400" />
                                    <span className="text-slate-600 text-sm">Account Status</span>
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                    stats.isAdmin
                                        ? 'bg-purple-100 text-purple-700'
                                        : stats.isTrusted
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-slate-100 text-slate-600'
                                }`}>
                                    {stats.isAdmin ? 'Admin' : stats.isTrusted ? 'Trusted' : 'Standard'}
                                </span>
                            </div>
                        </div>

                        <Link
                            href="/dashboard/my-events"
                            className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-brand-dark hover:text-white text-slate-600 rounded-xl text-sm font-semibold transition-all group"
                        >
                            View My Projects
                            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Activity prompt if no projects */}
                {stats.myEvents === 0 && (
                    <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                        <div className="w-16 h-16 bg-brand-dark rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Calendar size={28} className="text-brand-gold" />
                        </div>
                        <h3 className="text-xl font-serif font-bold text-slate-800 mb-2">No projects yet</h3>
                        <p className="text-slate-500 mb-6 max-w-sm mx-auto text-sm">
                            Create your first research project to start collecting vital health data from participants.
                        </p>
                        <Link
                            href="/dashboard/create-event"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-xl font-semibold hover:bg-slate-700 transition-colors shadow-lg group"
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
        console.error("Database connection failed:", error);
        return (
            <div className="p-12 text-center bg-white rounded-2xl border border-red-100 shadow-sm mt-8">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Connection Error</h2>
                <p className="max-w-md mx-auto mb-4 text-slate-500">
                    Could not connect to the database. This is usually caused by network issues or an unwhitelisted IP in MongoDB Atlas.
                </p>
                <div className="text-xs bg-slate-100 p-4 rounded-xl text-left max-w-lg mx-auto overflow-auto font-mono text-slate-600">
                    {(error as Error).message || "Unknown error"}
                </div>
            </div>
        );
    }
}
