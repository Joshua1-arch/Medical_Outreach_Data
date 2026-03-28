import React, { Suspense } from 'react';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import Record from '@/models/Record';
import { redirect, notFound } from 'next/navigation';
import ResponsesClient from './_components/ResponsesClient';
import DashboardSkeleton from '@/components/DashboardSkeleton';

export const dynamic = 'force-dynamic';

export default async function EventHubPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) redirect('/login');

    const { id } = await params;

    return (
        <div className="w-full h-full">
            <Suspense fallback={<DashboardSkeleton />}>
                <EventDataFetcher id={id} session={session} />
            </Suspense>
        </div>
    );
}

// Highly optimized isolated heavy data component (Non-Blocking Server Component)
async function EventDataFetcher({ id, session }: { id: string, session: any }) {
    await dbConnect();

    // STEP 1: Execute both Mongoose queries absolutely concurrently.
    // .lean() prevents memory-heavy Mongoose hydrating. 
    // .select("-__v") shaves off unnecessary fields.
    const [event, records] = await Promise.all([
        Event.findById(id).select('-__v').lean(),
        Record.find({ eventId: id })
            .select('-__v')
            .sort({ createdAt: -1 })
            .limit(100)
            .lean()
    ]);

    if (!event) notFound();

    if (
        event.createdBy.toString() !== session.user.id &&
        session.user.role !== 'admin'
    ) {
        redirect('/dashboard/my-events');
    }

    return (
        <ResponsesClient
            event={JSON.parse(JSON.stringify(event))}
            records={JSON.parse(JSON.stringify(records))}
            isPremium={session.user.isPremium ?? false}
            userEmail={session.user.email ?? ''}
            userId={session.user.id}
        />
    );
}
