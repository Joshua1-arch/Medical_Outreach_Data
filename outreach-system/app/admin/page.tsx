import dbConnect from "@/lib/db";
import User from "@/models/User";
import Event from "@/models/Event";
import { Users, Clock, Calendar, Activity, X } from "lucide-react";
import Link from "next/link";
import ExportDataButton from "./ExportDataButton";
import AuditLogFeed from "./AuditLogFeed";

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

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
                        <p className="text-slate-500 mt-1">Overview of system status and pending actions.</p>
                    </div>
                    <div className="flex-shrink-0">
                        <ExportDataButton />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link href="/admin/users" className="block">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                                    <Clock size={24} />
                                </div>
                                <span className="text-2xl font-bold text-slate-900">{stats.pendingUsers}</span>
                            </div>
                            <h3 className="text-slate-500 font-medium">Pending Approvals</h3>
                            <p className="text-xs text-amber-600 mt-1 font-medium">Action Required</p>
                        </div>
                    </Link>

                    <Link href="/admin/events" className="block">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                    <Calendar size={24} />
                                </div>
                                <span className="text-2xl font-bold text-slate-900">{stats.pendingEvents}</span>
                            </div>
                            <h3 className="text-slate-500 font-medium">Pending Events</h3>
                            <p className="text-xs text-blue-600 mt-1 font-medium">Needs Review</p>
                        </div>
                    </Link>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                <Users size={24} />
                            </div>
                            <span className="text-2xl font-bold text-slate-900">{stats.totalUsers}</span>
                        </div>
                        <h3 className="text-slate-500 font-medium">Total Users</h3>
                        <p className="text-xs text-slate-400 mt-1">Active Platform Usage</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                                <Activity size={24} />
                            </div>
                            <span className="text-2xl font-bold text-slate-900">{stats.totalEvents}</span>
                        </div>
                        <h3 className="text-slate-500 font-medium">Total Events</h3>
                        <p className="text-xs text-slate-400 mt-1">Outreach History</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <AuditLogFeed />

                    {/* Placeholder for future analytics chart or other widgets */}
                    <div className="bg-slate-50 rounded-xl border border-slate-200 border-dashed flex items-center justify-center p-12 text-slate-400 font-medium">
                        Additional System Analytics Coming Soon
                    </div>
                </div>

            </div>
        );
    } catch (error) {
        console.error("Database connection failed:", error);
        return (
            <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-red-100 shadow-sm mt-8">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Connection Error</h2>
                <p className="max-w-md mx-auto mb-4">
                    Could not connect to the database. This is usually caused by network issues or an IP address that hasn't been whitelisted in MongoDB Atlas.
                </p>
                <div className="text-xs bg-slate-100 p-4 rounded text-left max-w-lg mx-auto overflow-auto font-mono text-slate-600">
                    {(error as Error).message || "Unknown error"}
                </div>
            </div>
        );
    }
}
