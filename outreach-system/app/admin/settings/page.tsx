import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import AdminSettingsClient from './AdminSettingsClient';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
        redirect('/login');
    }

    await dbConnect();
    const user = await User.findById(session.user.id).lean() as any;
    if (!user) redirect('/login');

    return (
        <AdminSettingsClient
            admin={{
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                medicalRole: user.medicalRole || '',
                profileImage: user.profileImage || '',
                timezone: user.timezone || 'UTC',
                exportFormat: user.exportFormat || 'csv',
            }}
        />
    );
}
