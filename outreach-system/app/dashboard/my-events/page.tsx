import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import {
    Calendar,
    MapPin,
    Plus,
    X,
    FolderOpen,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default async function MyEventsPage() {
    try {
        const session = await auth();
        await dbConnect();

        const userId = session?.user?.id;
        const isValidId = userId && /^[0-9a-fA-F]{24}$/.test(userId);

        const events = isValidId 
            ? await Event.find({ createdBy: userId }).sort({ createdAt: -1 }).lean() as any[]
            : [];

        const featuredEvent = events.length > 0 ? events[0] : null;
        const regularEvents = events.length > 0 ? events.slice(1) : [];

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans max-w-7xl mx-auto pb-10">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Outreach Campaigns</h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Manage your upcoming medical outreach events and track participation.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard/create-event"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#fbc037] text-slate-900 rounded-xl font-bold text-sm hover:bg-yellow-400 transition-all shadow-sm flex-shrink-0 group"
                        >
                            <Plus size={18} className="text-slate-900" />
                            Create Campaign
                        </Link>
                    </div>
                </div>

                {events.length === 0 ? (
                    /* Initial Empty State */
                    <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 py-24 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                            <FolderOpen size={28} className="text-[#fbc037]" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">No campaigns yet</h3>
                        <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm">
                            Create your first medical outreach campaign to start collecting vital health data from participants.
                        </p>
                        <Link
                            href="/dashboard/create-event"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#111] text-white rounded-xl font-bold hover:bg-black transition-colors shadow-md group"
                        >
                            <Plus size={18} />
                            Start a new campaign
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Featured Event (Most Recent) */}
                        {featuredEvent && (
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col md:flex-row">
                                {/* left image */}
                                <div className="relative w-full md:w-[45%] lg:w-[40%] h-64 md:h-auto bg-slate-100 flex-shrink-0">
                                    {featuredEvent.coverImage ? (
                                        <Image src={featuredEvent.coverImage} alt={featuredEvent.title} fill className="object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                                            <Image src="/Reach.png" alt="Logo" width={64} height={64} className="opacity-20 grayscale" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="inline-flex gap-1.5 px-3 py-1 bg-white text-[#fbc037] rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wider items-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#fbc037]" />
                                            Featured Event
                                        </span>
                                    </div>
                                </div>
                                
                                {/* right content */}
                                <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{featuredEvent.title}</h2>
                                    </div>
                                    <p className="text-sm text-slate-500 mb-6">{featuredEvent.description || 'Medical Outreach Initiative'}</p>
                                    
                                    <div className="space-y-3 mb-8">
                                        <div className="flex items-center gap-3 text-sm text-slate-600 font-medium tracking-tight">
                                            <Calendar size={18} className="text-[#fbc037]" />
                                            <span>
                                                {new Date(featuredEvent.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-600 font-medium tracking-tight">
                                            <MapPin size={18} className="text-[#fbc037]" />
                                            <span>{featuredEvent.location || 'No location specified'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mt-auto border-t border-slate-100 pt-6">
                                        {featuredEvent.status === 'approved' ? (
                                            <Link href={`/dashboard/event/${featuredEvent._id}/builder`} className="px-6 py-2.5 bg-[#111] text-white rounded-lg text-sm font-bold hover:bg-black transition-colors w-full sm:w-auto text-center">
                                                Manage Event
                                            </Link>
                                        ) : featuredEvent.status === 'rejected' ? (
                                            <div className="px-6 py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-bold w-full sm:w-auto text-center">Event Rejected</div>
                                        ) : (
                                            <div className="px-6 py-2.5 bg-amber-50 text-amber-600 rounded-lg text-sm font-bold w-full sm:w-auto text-center border border-amber-200">Pending Review</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Grid for remaining events */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {regularEvents.map((event) => (
                                <div
                                    key={event._id.toString()}
                                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow relative"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <StatusBadge status={event.status} />
                                    </div>

                                    <h3 className="text-lg font-black text-slate-900 leading-tight mb-1">{event.title}</h3>
                                    <p className="text-xs text-slate-500 mb-5 line-clamp-1">{event.description || 'Medical Outreach Initiative'}</p>

                                    <div className="space-y-2 mb-6 text-xs text-slate-600 font-medium tracking-tight">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-[#fbc037]" />
                                            <span>
                                                {new Date(event.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} className="text-[#fbc037]" />
                                            <span className="truncate">{event.location || 'No location specified'}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-auto pt-4 border-t border-slate-100">
                                        {event.status === 'approved' ? (
                                            <Link href={`/dashboard/event/${event._id}/builder`} className="flex-1 py-2 text-center bg-[#111] text-white rounded-lg text-xs font-bold hover:bg-black transition-colors">
                                                Manage Event
                                            </Link>
                                        ) : event.status === 'rejected' ? (
                                            <div className="flex-1 py-2 text-center bg-slate-100 text-slate-400 rounded-lg text-xs font-bold cursor-not-allowed">
                                                Rejected
                                            </div>
                                        ) : (
                                            <div className="flex-1 py-2 text-center bg-slate-50/80 text-amber-600 border border-amber-200 rounded-lg text-xs font-bold cursor-not-allowed">
                                                Pending Review
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Create New Campaign Tile */}
                            <Link href="/dashboard/create-event" className="flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center hover:bg-white hover:border-[#fbc037] hover:shadow-sm transition-all group min-h-[240px]">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-slate-100 group-hover:scale-110 transition-transform">
                                    <Plus size={24} className="text-[#fbc037]" />
                                </div>
                                <h3 className="text-sm font-black text-slate-900 mb-1">Create New Campaign</h3>
                                <p className="text-xs text-slate-500 font-medium">Start a new outreach event</p>
                            </Link>

                        </div>
                    </>
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
            </div>
        );
    }
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'approved') {
        return (
            <span className="inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                Confirmed
            </span>
        );
    }
    if (status === 'rejected') {
        return (
            <span className="inline-flex items-center px-2.5 py-1 bg-red-50 text-red-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                Cancelled
            </span>
        );
    }
    return (
        <span className="inline-flex items-center px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
            Pending
        </span>
    );
}
