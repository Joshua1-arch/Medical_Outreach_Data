
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getSiteConfig } from '@/app/admin/settings/actions';
import SiteAppearanceForm from './SiteAppearanceForm';

export default async function SiteAppearancePage() {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
        redirect('/dashboard');
    }

    const config = await getSiteConfig();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold font-serif text-brand-dark mb-2">Site Appearance</h1>
            <p className="text-slate-500 mb-8">Customize global branding, contact info, and theme settings.</p>

            <SiteAppearanceForm initialConfig={config || {}} />
        </div>
    );
}
