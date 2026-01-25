import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AnalyticsClient from './AnalyticsClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function AnalyticsPage({ params }: PageProps) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) redirect('/auth/login');

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href={`/dashboard/event/${id}/builder`}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                >
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Event Analytics</h1>
                    <p className="text-slate-500">Real-time insights and data visualization</p>
                </div>
            </div>

            <AnalyticsClient eventId={id} />
        </div>
    );
}
