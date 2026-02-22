import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import {
    Calendar,
    MapPin,
    CheckCircle,
    Clock,
    FileText,
    PlusCircle,
    X,
    ArrowRight,
    Search,
    Layers,
    XCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import RefreshButton from "@/components/ui/RefreshButton";

export const dynamic = 'force-dynamic';

export default async function MyEventsPage() {
    try {
        const session = await auth();
        await dbConnect();

        const events = await Event.find({ createdBy: session?.user?.id }).sort({ createdAt: -1 }).lean() as any[];

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-slate-800">My Projects</h2>
                        <p className="text-slate-500 text-sm mt-0.5">
                            {events.length} project{events.length !== 1 ? 's' : ''} total
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <RefreshButton />
                        <Link
                            href="/dashboard/create-event"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-dark text-white rounded-xl font-semibold text-sm hover:bg-slate-700 transition-all shadow-lg shadow-slate-900/20 flex-shrink-0 group"
                        >
                            <PlusCircle size={16} />
                            New Project
                            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Project Cards */}
                {events.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5">
                        {events.map((event) => (
                            <div
                                key={event._id.toString()}
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                            >
                                {/* Card Top: Image or Colored Strip */}
                                {event.coverImage ? (
                                    <div className="relative w-full h-44 bg-slate-100">
                                        <Image
                                            src={event.coverImage}
                                            alt={event.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                                            <h3 className="text-xl font-bold font-serif text-white drop-shadow-md">{event.title}</h3>
                                            <StatusBadge status={event.status} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-2 bg-gradient-to-r from-brand-dark via-slate-700 to-brand-dark w-full" />
                                )}

                                <div className="p-6">
                                    {/* Title & Status (when no image) */}
                                    {!event.coverImage && (
                                        <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-4">
                                            <h3 className="text-xl font-bold font-serif text-slate-800 flex-1">{event.title}</h3>
                                            <StatusBadge status={event.status} />
                                        </div>
                                    )}

                                    {/* Description */}
                                    {event.description && (
                                        <p className="text-slate-500 text-sm leading-relaxed mb-5 line-clamp-2">
                                            {event.description}
                                        </p>
                                    )}

                                    {/* Meta row */}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-5">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} className="text-brand-gold flex-shrink-0" />
                                            <span>
                                                {new Date(event.date).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        {event.location && (
                                            <div className="flex items-center gap-1.5">
                                                <MapPin size={14} className="text-brand-gold flex-shrink-0" />
                                                <span>{event.location}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5">
                                            <FileText size={14} className="text-brand-gold flex-shrink-0" />
                                            <span>{event.formFields?.length || 0} data fields</span>
                                        </div>
                                    </div>

                                    {/* Fields Tags */}
                                    <div className="mb-5">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-2 flex items-center gap-1.5">
                                            <Layers size={10} />
                                            Collection Fields
                                        </p>
                                        {(!event.formFields || event.formFields.length === 0) ? (
                                            <p className="text-sm text-slate-400 italic">No fields configured yet.</p>
                                        ) : (
                                            <div className="flex flex-wrap gap-1.5">
                                                {event.formFields.map((field: any, idx: number) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-600 font-medium flex items-center gap-1"
                                                    >
                                                        {field.label}
                                                        <span className="text-slate-300">·</span>
                                                        <span className="text-slate-400 uppercase text-[9px]">{field.type}</span>
                                                        {field.required && <span className="text-red-400 ml-0.5 font-bold">*</span>}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Bottom Actions */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-slate-50">
                                        {event.status === 'approved' ? (
                                            <Link
                                                href={`/dashboard/event/${event._id}/builder`}
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-dark text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors shadow-md group"
                                            >
                                                <FileText size={16} />
                                                Manage Event
                                                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                            </Link>
                                        ) : event.status === 'rejected' ? (
                                            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl">
                                                <XCircle size={15} className="text-red-500 flex-shrink-0" />
                                                <div>
                                                    <span className="text-xs font-bold text-red-800 block">Event Rejected</span>
                                                    <span className="text-xs text-red-600/80">This submission was not approved. You may create a new event.</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-amber-50 border border-amber-100 rounded-xl">
                                                <Clock size={14} className="text-amber-500 flex-shrink-0" />
                                                <div>
                                                    <span className="text-xs font-bold text-amber-800 block">Awaiting Admin Review</span>
                                                    <span className="text-xs text-amber-600/80">Approval required before data collection</span>
                                                </div>
                                            </div>
                                        )}
                                        <span className="text-xs text-slate-400">
                                            Created {new Date(event.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 py-20 text-center">
                        <div className="w-16 h-16 bg-brand-dark rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-slate-900/20">
                            <Search size={26} className="text-brand-gold" />
                        </div>
                        <h3 className="text-xl font-serif font-bold text-slate-800 mb-2">No projects found</h3>
                        <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm">
                            Create your first research project to start collecting vital health data from participants.
                        </p>
                        <Link
                            href="/dashboard/create-event"
                            className="inline-flex items-center gap-2 px-7 py-3 bg-brand-dark text-white rounded-xl font-semibold hover:bg-slate-700 transition-colors shadow-lg group"
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
                <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X size={28} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Connection Error</h2>
                <p className="max-w-md mx-auto mb-4 text-slate-500 text-sm">
                    Could not connect to the database. This is usually caused by network issues or an unwhitelisted IP in MongoDB Atlas.
                </p>
                <div className="text-xs bg-slate-100 p-4 rounded-xl text-left max-w-lg mx-auto overflow-auto font-mono text-slate-600">
                    {(error as Error).message || "Unknown error"}
                </div>
            </div>
        );
    }
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'approved') {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-bold shadow-lg shadow-emerald-500/30 flex-shrink-0">
                <CheckCircle size={11} />
                Approved
            </span>
        );
    }
    if (status === 'rejected') {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold shadow-lg shadow-red-500/30 flex-shrink-0">
                <XCircle size={11} />
                Rejected
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-bold shadow-lg shadow-amber-500/30 flex-shrink-0">
            <Clock size={11} />
            Pending Review
        </span>
    );
}
