import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import { approveEvent } from "../actions";
import { Check, Calendar, MapPin, CheckCircle, Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";
import RefreshButton from "@/components/ui/RefreshButton";
import EventAdminActions from "./EventAdminActions";

export const dynamic = 'force-dynamic';

export default async function PendingEventsPage() {
    try {
        await dbConnect();
        const events = await Event.find({}).populate('createdBy', 'name email').sort({ createdAt: -1 });

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-brand-dark">Event Approval Queue</h2>
                        <p className="text-slate-500 mt-1">Review and approve outreach proposals.</p>
                    </div>
                    <RefreshButton />
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {events.map((event) => (
                        <div key={event._id.toString()} className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">

                            {/* Thumbnail */}
                            <div className="flex-shrink-0 w-full md:w-48 h-32 bg-slate-100 rounded-lg overflow-hidden relative border border-slate-200">
                                {event.coverImage ? (
                                    <Image src={event.coverImage} alt={event.title} fill className="object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-slate-300">
                                        <ImageIcon size={32} />
                                    </div>
                                )}
                                <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                    ${event.status === 'approved' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}
                                `}>
                                    {event.status}
                                </div>
                            </div>

                            <div className="flex-1 space-y-3">
                                <div>
                                    <h3 className="text-xl font-serif font-bold text-brand-dark">{event.title}</h3>
                                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">{event.description || "No description provided."}</p>
                                </div>

                                {(event.reason || event.purpose) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-brand-cream/50 rounded-lg text-sm border border-brand-cream">
                                        {event.purpose && (
                                            <div>
                                                <span className="font-bold text-brand-dark block text-xs uppercase tracking-wider mb-1">Purpose/Goal</span>
                                                <p className="text-slate-600">{event.purpose}</p>
                                            </div>
                                        )}
                                        {event.reason && (
                                            <div>
                                                <span className="font-bold text-brand-dark block text-xs uppercase tracking-wider mb-1">Reason/Rationale</span>
                                                <p className="text-slate-600">{event.reason}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 pt-2 border-t border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-brand-gold" />
                                        {new Date(event.date).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} className="text-brand-gold" />
                                        {event.location}
                                    </div>
                                    <div className="text-slate-400">
                                        Data Collection Fields: <span className="text-slate-700 font-bold">{event.formFields?.length || 0}</span>
                                    </div>
                                    <div className="text-slate-400 ml-auto">
                                        Proposed By: <span className="text-brand-dark font-bold">{event.createdBy?.name || "Unknown"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Column */}
                            <div className="flex-shrink-0 flex flex-col items-end justify-between gap-4 border-l border-slate-50 pl-4 min-w-[140px]">
                                {event.status === 'pending' ? (
                                    <form action={async () => {
                                        'use server';
                                        await approveEvent(event._id.toString());
                                    }} className="w-full">
                                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-gold transition-colors font-bold shadow-sm text-sm">
                                            <Check size={16} />
                                            Approve
                                        </button>
                                    </form>
                                ) : (
                                    <div className="w-full flex items-center justify-center text-green-600 gap-2 font-bold px-4 py-2 bg-green-50 rounded-lg border border-green-100">
                                        <CheckCircle size={18} />
                                        <span className="text-sm">Approved</span>
                                    </div>
                                )}

                                <div className="w-full flex justify-end">
                                    <EventAdminActions eventId={event._id.toString()} eventTitle={event.title} />
                                </div>
                            </div>
                        </div>
                    ))}

                    {events.length === 0 && (
                        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 border-dashed">
                            <p className="text-slate-500 font-medium">No events found in the system.</p>
                        </div>
                    )}
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
