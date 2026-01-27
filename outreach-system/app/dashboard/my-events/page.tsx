import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import { Calendar, MapPin, CheckCircle, Clock, FileText, PlusCircle, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import RefreshButton from "@/components/ui/RefreshButton";

export const dynamic = 'force-dynamic';

export default async function MyEventsPage() {
    try {
        const session = await auth();
        await dbConnect();

        const events = await Event.find({ createdBy: session?.user?.id }).sort({ createdAt: -1 });

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-brand-dark">My Projects</h2>
                        <p className="text-slate-500 mt-1">View and manage your research initiatives.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <RefreshButton />
                        <Link
                            href="/dashboard/create-event"
                            className="px-5 py-2.5 bg-brand-dark text-white rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-lg flex items-center gap-2"
                        >
                            <PlusCircle size={18} />
                            Create New Project
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {events.map((event) => (
                        <div key={event._id.toString()} className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">

                            {/* Cover Image */}
                            {event.coverImage ? (
                                <div className="relative w-full h-48 bg-slate-100">
                                    <Image
                                        src={event.coverImage}
                                        alt={event.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-4 left-6 text-white">
                                        <h3 className="text-2xl font-bold font-serif shadow-black drop-shadow-md">{event.title}</h3>
                                    </div>
                                </div>
                            ) : (
                                // Fallback header strip if no image
                                <div className="h-4 bg-brand-dark w-full"></div>
                            )}

                            <div className="p-6">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                                    <div className="flex-1">
                                        {!event.coverImage && (
                                            <h3 className="text-2xl font-bold font-serif text-brand-dark mb-2">{event.title}</h3>
                                        )}

                                        <div className="flex items-center gap-3 mb-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 uppercase tracking-wider
                                                ${event.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}
                                            `}>
                                                {event.status === 'approved' ? (
                                                    <>
                                                        <CheckCircle size={12} /> Approved
                                                    </>
                                                ) : (
                                                    <>
                                                        <Clock size={12} /> Pending Approval
                                                    </>
                                                )}
                                            </span>
                                        </div>

                                        {event.description && (
                                            <p className="text-slate-600 mb-4 leading-relaxed max-w-3xl">{event.description}</p>
                                        )}

                                        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-brand-gold" />
                                                <span className="font-medium text-brand-dark">
                                                    {new Date(event.date).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin size={16} className="text-brand-gold" />
                                                <span className="font-medium text-brand-dark">{event.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FileText size={16} className="text-brand-gold" />
                                                <span>{event.formFields?.length || 0} collection fields</span>
                                            </div>
                                        </div>
                                    </div>

                                    {event.status === 'approved' && (
                                        <div className="flex-shrink-0 pt-2">
                                            <Link
                                                href={`/dashboard/event/${event._id}/builder`}
                                                className="inline-flex px-6 py-3 bg-brand-dark text-white rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-md items-center gap-2"
                                            >
                                                <FileText size={18} />
                                                Form Builder
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Form Fields Preview */}
                                <div className="pt-6 border-t border-slate-50">
                                    <p className="text-xs font-bold text-brand-gold uppercase tracking-widest mb-3">Data Collection Fields</p>
                                    {(!event.formFields || event.formFields.length === 0) ? (
                                        <p className="text-sm text-slate-400 italic">No fields configured yet.</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {event.formFields.map((field: any, idx: number) => (
                                                <span key={idx} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs text-brand-dark flex items-center gap-1.5 font-medium">
                                                    {field.label}
                                                    <span className="text-slate-300">|</span>
                                                    <span className="text-slate-500 uppercase text-[10px]">{field.type}</span>
                                                    {field.required && <span className="text-red-500" title="Required">*</span>}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {event.status === 'pending' && (
                                    <div className="mt-6 p-4 bg-amber-50/50 border border-amber-100 rounded-xl flex items-start gap-3">
                                        <Clock className="text-amber-600 mt-0.5" size={18} />
                                        <div>
                                            <h4 className="text-sm font-bold text-amber-900">Awaiting Analysis</h4>
                                            <p className="text-sm text-amber-800/80 mt-1">
                                                This project proposal is currently under review. Automated or Admin approval is required before data collection can begin.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {events.length === 0 && (
                    <div className="py-20 text-center bg-white rounded-xl border-2 border-slate-100 border-dashed">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <Calendar size={32} />
                        </div>
                        <h3 className="text-xl font-bold font-serif text-brand-dark mb-2">No projects yet</h3>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">Create your first research project to start collecting vital health data.</p>
                        <Link
                            href="/dashboard/create-event"
                            className="inline-block px-8 py-3 bg-brand-dark text-white rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-lg"
                        >
                            Create First Project
                        </Link>
                    </div>
                )}
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
