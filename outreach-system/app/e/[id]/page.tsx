import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import PublicEventClient from "./PublicEventClient";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function PublicEventPage({ params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;

    // Validate ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return notFound();

    const event = await Event.findById(id);
    if (!event) return notFound();

    if (!event.isPublic) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center p-8 max-w-md">
                    <div className="w-16 h-16 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-xl font-bold text-slate-800 mb-2">Private Event</h1>
                    <p className="text-slate-500">
                        This event is currently set to private. Please contact the administrator for access.
                    </p>
                </div>
            </div>
        );
    }

    const clientEvent = JSON.parse(JSON.stringify(event));
    if (clientEvent.accessCode) {
        clientEvent.hasAccessCode = true;
        delete clientEvent.accessCode;
    }

    return <PublicEventClient event={clientEvent} />
}
