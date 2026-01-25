import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import Record from "@/models/Record";
import { Calendar, FileText, Activity, X } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

async function getUserStats(userId: string) {
    await dbConnect();
    const myEvents = await Event.countDocuments({ createdBy: userId });
    const approvedEvents = await Event.countDocuments({ createdBy: userId, status: 'approved' });
    const pendingEvents = await Event.countDocuments({ createdBy: userId, status: 'pending' });
    const totalRecords = await Record.countDocuments({ recordedBy: userId });

    return { myEvents, approvedEvents, pendingEvents, totalRecords };
}

export default async function DashboardPage() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return <div>Unauthorized</div>;
    }

    try {
        const stats = await getUserStats(userId);

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-brand-dark">Welcome back, {session?.user?.name}!</h1>
                    <p className="text-slate-500 mt-1">Manage your outreach events and data collection.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-brand-cream text-brand-dark rounded-lg">
                                <Calendar size={24} />
                            </div>
                            <span className="text-2xl font-bold text-brand-dark">{stats.myEvents}</span>
                        </div>
                        <h3 className="text-slate-500 font-medium">My Events</h3>
                        <p className="text-xs text-slate-400 mt-1">Total Created</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-brand-cream text-brand-gold rounded-lg">
                                <Activity size={24} />
                            </div>
                            <span className="text-2xl font-bold text-brand-dark">{stats.approvedEvents}</span>
                        </div>
                        <h3 className="text-slate-500 font-medium">Active Events</h3>
                        <p className="text-xs text-brand-gold mt-1 font-medium">Approved & Ready</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-brand-cream text-orange-500 rounded-lg">
                                <Calendar size={24} />
                            </div>
                            <span className="text-2xl font-bold text-brand-dark">{stats.pendingEvents}</span>
                        </div>
                        <h3 className="text-slate-500 font-medium">Pending Events</h3>
                        <p className="text-xs text-orange-500 mt-1 font-medium">Awaiting Approval</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-brand-cream text-blue-600 rounded-lg">
                                <FileText size={24} />
                            </div>
                            <span className="text-2xl font-bold text-brand-dark">{stats.totalRecords}</span>
                        </div>
                        <h3 className="text-slate-500 font-medium">Records Entered</h3>
                        <p className="text-xs text-slate-400 mt-1">Total Data Points</p>
                    </div>
                </div>

                <div className="bg-brand-dark rounded-xl shadow-lg p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-serif font-bold mb-2 text-brand-gold">Ready to plan your next outreach?</h2>
                        <p className="text-slate-300 mb-6 max-w-xl">Create a new event and define what data you need to collect. Once approved by the admin, you can start recording patient information.</p>
                        <Link href="/dashboard/create-event" className="inline-block px-6 py-3 bg-white text-brand-dark rounded-lg font-semibold hover:bg-brand-gold hover:text-white transition-colors shadow-md">
                            Create New Event
                        </Link>
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
