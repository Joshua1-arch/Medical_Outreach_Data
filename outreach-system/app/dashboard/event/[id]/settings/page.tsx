import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import { redirect, notFound } from 'next/navigation';
import SettingsClient from '../_components/SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) redirect('/login');

    const { id } = await params;

    await dbConnect();

    const event = await Event.findById(id).select('_id title isPublic accessCode createdBy').lean() as any;
    if (!event) notFound();

    if (
        event.createdBy.toString() !== session.user.id &&
        session.user.role !== 'admin'
    ) {
        redirect('/dashboard/my-events');
    }

    return <SettingsClient event={JSON.parse(JSON.stringify(event))} />;
}
