import { notFound, redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import Record from '@/models/Record';
import DataEntryForm from './DataEntryForm';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function EnterDataPage({ params }: { params: Promise<{ id: string }> }) {
    await dbConnect();

    const { id } = await params;


    // Validate ObjectId format to prevent CastError
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {

        notFound();
    }

    const event = await Event.findById(id);

    if (!event) {
        notFound();
    }

    // Check if event is approved
    if (event.status !== 'approved') {
        redirect('/dashboard/my-events');
    }

    // Get record count for this event
    const recordCount = await Record.countDocuments({ eventId: id });

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-3xl mx-auto mb-6">
                <Link
                    href="/dashboard/my-events"
                    className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors font-medium"
                >
                    <ArrowLeft size={18} />
                    Back to My Events
                </Link>
            </div>

            <div className="max-w-3xl mx-auto mb-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                    <FileText size={20} className="text-blue-600" />
                    <div>
                        <p className="text-sm font-semibold text-blue-900">Records Entered</p>
                        <p className="text-2xl font-bold text-blue-700">{recordCount}</p>
                    </div>
                </div>
            </div>

            <DataEntryForm
                eventId={event._id.toString()}
                eventTitle={event.title}
                formFields={event.formFields}
            />
        </div>
    );
}
