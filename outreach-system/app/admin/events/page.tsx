import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import { approveEvent, rejectEvent } from "../actions";
import { Check, Calendar, MapPin, CheckCircle, Image as ImageIcon, X, Layout, Users, Clock, ArrowRight } from "lucide-react";
import Image from "next/image";
import RefreshButton from "@/components/ui/RefreshButton";
import EventAdminActions from "./EventAdminActions";

export const dynamic = 'force-dynamic';

export default async function PendingEventsPage() {
    try {
        await dbConnect();
        const events = await Event.find({}).populate('createdBy', 'name email').sort({ createdAt: -1 });

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Outreach Campaigns</h2>
                        <p className="text-sm text-slate-500 mt-0.5">Review, approve, and manage all medical outreach projects.</p>
                    </div>
                    <RefreshButton />
                </div>

                <div className="grid grid-cols-1 gap-5">
                    {events.map((event) => (
                        <div key={event._id.toString()} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row">
                            
                            {/* Visual Side */}
                            <div className="w-full md:w-64 relative bg-slate-50 shrink-0">
                                {event.coverImage ? (
                                    <Image src={event.coverImage} alt={event.title} fill className="object-cover transition-transform group-hover:scale-105" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-slate-200">
                                        <Layout size={40} />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm
                                        ${event.status === 'approved' ? 'bg-emerald-500 text-white' : 
                                          event.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}
                                    `}>
                                        {event.status}
                                    </span>
                                </div>
                            </div>

                            {/* Content Side */}
                            <div className="flex-1 p-6 md:p-8 flex flex-col">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="space-y-1 max-w-2xl">
                                        <h3 className="text-xl font-bold text-slate-900 leading-tight">{event.title}</h3>
                                        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                                            {event.description || "No description provided for this outreach project."}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl">
                                        <div className="size-8 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-100 shrink-0">
                                            {event.createdBy?.name?.charAt(0) || <Users size={12} />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Lead Organizer</p>
                                            <p className="text-xs font-bold text-slate-800 truncate">{event.createdBy?.name || "System"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Rationale Grid */}
                                {(event.reason || event.purpose) && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 py-5 px-6 bg-[#f8f7f5] rounded-2xl border border-slate-100">
                                        {event.purpose && (
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Objective</p>
                                                <p className="text-xs text-slate-600 leading-relaxed font-medium">{event.purpose}</p>
                                            </div>
                                        )}
                                        {event.reason && (
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Impact Rationale</p>
                                                <p className="text-xs text-slate-600 leading-relaxed font-medium">{event.reason}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Meta Footer */}
                                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-6">
                                    <div className="flex flex-wrap items-center gap-6">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Calendar size={14} className="text-[#fbc037]" />
                                            <span className="text-xs font-bold">{new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <MapPin size={14} className="text-[#fbc037]" />
                                            <span className="text-xs font-bold">{event.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Layout size={14} className="text-[#fbc037]" />
                                            <span className="text-xs font-bold">{event.formFields?.length || 0} Data Fields</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {event.status === 'pending' ? (
                                            <div className="flex items-center gap-2">
                                                <form action={async () => {
                                                    'use server';
                                                    await approveEvent(event._id.toString());
                                                }}>
                                                    <button className="h-9 px-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-500/20">
                                                        <Check size={14} /> Approve
                                                    </button>
                                                </form>
                                                <form action={async () => {
                                                    'use server';
                                                    await rejectEvent(event._id.toString());
                                                }}>
                                                    <button className="h-9 px-4 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 transition-all font-bold text-xs flex items-center gap-1.5">
                                                        <X size={14} /> Reject
                                                    </button>
                                                </form>
                                            </div>
                                        ) : (
                                            <div className={`h-9 px-4 rounded-xl font-bold text-xs flex items-center gap-2 
                                                ${event.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}
                                            `}>
                                                {event.status === 'approved' ? <CheckCircle size={14} /> : <X size={14} />}
                                                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                            </div>
                                        )}
                                        <div className="h-8 w-px bg-slate-200 mx-1" />
                                        <EventAdminActions eventId={event._id.toString()} eventTitle={event.title} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {events.length === 0 && (
                        <div className="p-20 text-center bg-[#f8f7f5] rounded-3xl border-2 border-dashed border-slate-200">
                            <div className="size-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <Layout size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">No campaigns found</h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">When organizers propose new medical outreach events, they will appear here for review.</p>
                        </div>
                    )}
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
                <p className="max-w-md mx-auto mb-4 text-sm">
                    Could not connect to the database. Please try refreshing the page.
                </p>
            </div>
        );
    }
}
