import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import Record from '@/models/Record';
import { redirect, notFound } from 'next/navigation';
import ResponsesClient from './_components/ResponsesClient';

export const dynamic = 'force-dynamic';

export default async function EventHubPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) redirect('/login');

    const { id } = await params;

    await dbConnect();

    const event = await Event.findById(id);
    if (!event) notFound();

    if (
        event.createdBy.toString() !== session.user.id &&
        session.user.role !== 'admin'
    ) {
        redirect('/dashboard/my-events');
    }

    const records = await Record.find({ eventId: id }).sort({ createdAt: -1 }).limit(100);

    return (
        <ResponsesClient
            event={JSON.parse(JSON.stringify(event))}
            records={JSON.parse(JSON.stringify(records))}
        />
    );
}
