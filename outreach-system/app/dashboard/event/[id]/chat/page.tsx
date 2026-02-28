import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminEventChat from '@/app/components/AdminEventChat';

export const dynamic = 'force-dynamic';

export default async function CommandCenterPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();
    if (!session?.user) redirect('/login');

    const { id } = await params;

    return (
        <div className="animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="mb-2">
                    <h2 className="text-xl font-bold text-slate-800">Event Chat</h2>
                    <p className="text-sm text-slate-500">Communicate in real-time with volunteers scanning the public link.</p>
                </div>
                
                <AdminEventChat eventId={id} adminName={session.user.name || "Admin"} />
            </div>
        </div>
    );
}
