import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import Record from "@/models/Record";
import EventBuilderClient from "./EventBuilderClient";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, X } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const { id } = await params;

    try {
        await dbConnect();

        const event = await Event.findById(id);
        if (!event) notFound();

        // Authorization
        if (event.createdBy.toString() !== session.user.id && session.user.role !== 'admin') {
            redirect("/dashboard/my-events");
        }

        if (event.status !== 'approved' && session.user.role !== 'admin') {
            return (
                <div className="max-w-2xl mx-auto py-12 text-center">
                    <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock size={40} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Review in Progress</h1>
                    <p className="text-slate-600 mb-6">
                        This event is currently pending Admin approval. You will be able to design the form once it is approved.
                    </p>
                    <Link
                        href="/dashboard/my-events"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-100 font-medium text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                        <ArrowLeft size={18} /> Back to Dashboard
                    </Link>
                </div>
            );
        }

        // Fetch records (limit 100 for performance, or pagination later)
        const records = await Record.find({ eventId: id }).sort({ createdAt: -1 }).limit(100);

        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/dashboard/my-events" className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{event.title}</h1>
                        <p className="text-sm text-slate-500">Event Manager</p>
                    </div>
                    <div className="ml-auto">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">
                            Approved
                        </span>
                    </div>
                </div>

                <EventBuilderClient event={JSON.parse(JSON.stringify(event))} records={JSON.parse(JSON.stringify(records))} />
            </div>
        );
    } catch (error) {
        console.error("Database connection failed:", error);
        return (
            <div className="max-w-xl mx-auto mt-20 p-12 text-center text-slate-500 bg-white rounded-xl border border-red-100 shadow-sm">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Connection Error</h2>
                <p className="mb-4">
                    Could not connect to the database to load the event.
                </p>
                <div className="text-xs bg-slate-100 p-4 rounded text-left overflow-auto font-mono text-slate-600">
                    {(error as Error).message || "Unknown error"}
                </div>
                <div className="mt-6">
                    <Link href="/dashboard/my-events" className="text-brand-dark hover:underline flex items-center justify-center gap-2">
                        <ArrowLeft size={16} /> Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }
}
