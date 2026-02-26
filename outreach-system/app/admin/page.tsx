import dbConnect from "@/lib/db";
import User from "@/models/User";
import Event from "@/models/Event";
import { Users, ShieldCheck, Calendar, Zap, X, TrendingUp, Download } from "lucide-react";
import Link from "next/link";
import AuditLogFeed from "./AuditLogFeed";
import InvitationCodeManager from "./InvitationCodeManager";

export const dynamic = 'force-dynamic';

async function getStats() {
    await dbConnect();
    const pendingUsers = await User.countDocuments({ accountStatus: 'pending' });
    const totalUsers = await User.countDocuments({});
    const pendingEvents = await Event.countDocuments({ status: 'pending' });
    const totalEvents = await Event.countDocuments({});
    return { pendingUsers, totalUsers, pendingEvents, totalEvents };
}

export default async function AdminDashboardPage() {
    try {
        const stats = await getStats();

        const statCards = [
            {
                label: 'Pending Approvals',
                value: stats.pendingUsers.toLocaleString(),
                trend: 'Action Required',
                trendUp: false,
                icon: ShieldCheck,
                href: '/admin/users',
                accent: 'blue',
                iconBg: 'bg-blue-50',
                iconColor: 'text-blue-500',
                border: 'border-l-blue-500',
                trendColor: 'text-blue-600',
            },
            {
                label: 'Pending Events',
                value: stats.pendingEvents.toLocaleString(),
                trend: 'Needs Review',
                trendUp: false,
                icon: Calendar,
                href: '/admin/events',
                accent: 'yellow',
                iconBg: 'bg-yellow-50',
                iconColor: 'text-yellow-500',
                border: 'border-l-yellow-500',
                trendColor: 'text-yellow-600',
            },
            {
                label: 'Total Users',
                value: stats.totalUsers.toLocaleString(),
                trend: 'Active Platform Usage',
                trendUp: true,
                icon: Users,
                href: '/admin/users',
                accent: 'emerald',
                iconBg: 'bg-emerald-50',
                iconColor: 'text-emerald-500',
                border: 'border-l-emerald-500',
                trendColor: 'text-emerald-600',
            },
            {
                label: 'Total Events',
                value: stats.totalEvents.toLocaleString(),
                trend: 'Lifetime Metrics',
                trendUp: true,
                icon: Zap,
                href: '/admin/events',
                accent: 'purple',
                iconBg: 'bg-purple-50',
                iconColor: 'text-purple-500',
                border: 'border-l-purple-500',
                trendColor: 'text-purple-600',
            },
        ];

        return (
            <div className="space-y-8">

                {/* ── Page Header ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
                        <p className="text-sm text-slate-500 mt-0.5">Welcome back, Administrator.</p>
                    </div>
                    <a
                        href="/api/admin/export"
                        target="_blank"
                        download
                        className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[#fbc037] text-slate-900 text-sm font-bold hover:bg-yellow-400 shadow-sm shadow-[#fbc037]/30 transition-all"
                    >
                        <Download size={16} />
                        Export All Data
                    </a>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {statCards.map((stat) => (
                        <Link
                            key={stat.label}
                            href={stat.href}
                            className={`relative bg-white rounded-2xl border border-slate-200 border-l-4 ${stat.border} p-6 shadow-sm hover:shadow-md transition-all group`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                    <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                                    <p className={`text-xs font-bold flex items-center gap-1 ${stat.trendColor}`}>
                                        {stat.trendUp && <TrendingUp size={11} />}
                                        {stat.trend}
                                    </p>
                                </div>
                                <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${stat.iconBg} ${stat.iconColor} group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={22} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* ── Activity + Invite ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Activity log — 8 cols */}
                    <div className="lg:col-span-8">
                        <AuditLogFeed />
                    </div>

                    {/* Invitation manager — 4 cols */}
                    <div className="lg:col-span-4">
                        <InvitationCodeManager />
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Database connection failed:", error);
        return (
            <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-red-100 shadow-sm mt-8">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Connection Error</h2>
                <p className="max-w-md mx-auto mb-4">
                    Could not connect to the database. This is usually caused by network issues or an IP address that hasn't been whitelisted in MongoDB Atlas.
                </p>
            </div>
        );
    }
}
