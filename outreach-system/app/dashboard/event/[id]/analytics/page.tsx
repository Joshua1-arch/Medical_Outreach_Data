import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AnalyticsClient from './AnalyticsClient';

export const dynamic = 'force-dynamic';

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function AnalyticsPage({ params }: PageProps) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) redirect('/login');

    return <AnalyticsClient eventId={id} />;
}
