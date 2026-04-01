import React, { Suspense } from 'react';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import Record from '@/models/Record';
import { redirect, notFound } from 'next/navigation';
import ResponsesClient from './_components/ResponsesClient';
import DashboardSkeleton from '@/components/DashboardSkeleton';

export const dynamic = 'force-dynamic';

export default async function EventHubPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams?: Promise<{ page?: string; limit?: string }> }) {
    const session = await auth();
    if (!session?.user) redirect('/login');

    const { id } = await params;
    
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const page = parseInt(resolvedSearchParams.page || '1', 10);
    const limit = parseInt(resolvedSearchParams.limit || '50', 10);

    return (
        <div className="w-full h-full">
            <Suspense fallback={<DashboardSkeleton />}>
                <EventDataFetcher id={id} session={session} page={page} limit={limit} />
            </Suspense>
        </div>
    );
}

// Highly optimized isolated heavy data component (Non-Blocking Server Component)
async function EventDataFetcher({ id, session, page, limit }: { id: string, session: any, page: number, limit: number }) {
    await dbConnect();

    const skip = (page - 1) * limit;

    // STEP 1: Execute both Mongoose queries absolutely concurrently.
    // .lean() prevents memory-heavy Mongoose hydrating. 
    // .select("-__v") shaves off unnecessary fields.
    const [event, records, totalCount] = await Promise.all([
        Event.findById(id).select('-__v').lean(),
        Record.find({ eventId: id })
            .select('-__v')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Record.countDocuments({ eventId: id })
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
            totalCount={totalCount}
            currentPage={page}
            totalPages={Math.ceil(totalCount / limit)}
        />
    );
}
