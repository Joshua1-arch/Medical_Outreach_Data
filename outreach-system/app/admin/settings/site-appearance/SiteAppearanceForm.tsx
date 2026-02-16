'use client';

import { useState } from 'react';
import { updateSiteConfig } from '@/app/admin/settings/actions';
import { Button } from '@/components/ui/Button';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full bg-brand-dark text-white hover:bg-slate-800"
        >
            {pending ? 'Saving...' : 'Save Changes'}
        </Button>
    );
}

export default function SiteAppearanceForm({ initialConfig }: { initialConfig: any }) {
    const [message, setMessage] = useState('');

    const handleSubmit = async (formData: FormData) => {
        const result = await updateSiteConfig(formData);
        if (result.success) {
            setMessage('Configuration updated successfully!');
            // Ideally trigger refresh or revalidate
        } else {
            setMessage('Error: ' + result.message);
        }
    };

    return (
        <form action={handleSubmit} className="space-y-6 max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-slate-100">
            {message && (
                <div className={`p-3 rounded-lg text-sm font-medium ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {message}
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Theme Mode</label>
                    <select
                        name="themeMode"
                        defaultValue={initialConfig.themeMode || 'default'}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none"
                    >
                        <option value="default">Default</option>
                        <option value="christmas">Christmas</option>
                        <option value="easter">Easter</option>
                    </select>
                </div>

                <div className="space-y-2 flex items-center justify-between border p-3 rounded-lg">
                    <label className="text-sm font-bold text-slate-700">Holiday Mode (Is Active)</label>
                    <input
                        type="checkbox"
                        name="isActive"
                        defaultChecked={initialConfig.isActive}
                        className="w-5 h-5 accent-brand-gold"
                    />
                </div>

                <div className="space-y-2 flex items-center justify-between border border-red-200 bg-red-50 p-3 rounded-lg">
                    <label className="text-sm font-bold text-red-700">Maintenance Mode (Shut Down Site)</label>
                    <input
                        type="checkbox"
                        name="maintenanceMode"
                        defaultChecked={initialConfig.maintenanceMode}
                        className="w-5 h-5 accent-red-600"
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Primary Color</label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            name="primaryColor"
                            defaultValue={initialConfig.primaryColor || '#0f172a'}
                            className="h-10 w-10 rounded border border-slate-200 cursor-pointer"
                        />
                        <input
                            type="text"
                            name="primaryColorText"
                            defaultValue={initialConfig.primaryColor || '#0f172a'}
                            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                        // This text input is just for display/copy, the color input sends the value or we can sync them with JS but standard HTML form sends both if named differently.
                        // Actually, I'll rely on the color picker for the value.
                        />
                    </div>

                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Secondary Color</label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            name="secondaryColor"
                            defaultValue={initialConfig.secondaryColor || '#fbbf24'}
                            className="h-10 w-10 rounded border border-slate-200 cursor-pointer"
                        />
                        <input
                            type="text"
                            defaultValue={initialConfig.secondaryColor || '#fbbf24'}
                            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Logo URL</label>
                <input
                    type="url"
                    name="logoUrl"
                    defaultValue={initialConfig.logoUrl || '/Reach.png'}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none placeholder:text-slate-400"
                    placeholder="https://example.com/logo.png"
                />
                <p className="text-xs text-slate-500">Enter a public URL for your logo image.</p>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">WhatsApp Number</label>
                <input
                    type="text"
                    name="whatsappNumber"
                    defaultValue={initialConfig.whatsappNumber || '+2349126461386'}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none"
                    placeholder="+1234567890"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Announcement Banner</label>
                <textarea
                    name="announcementBanner"
                    defaultValue={initialConfig.announcementBanner}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none h-24 resize-none"
                    placeholder="Enter an optional announcement message to display at the top of the site..."
                />
            </div>

            <div className="pt-4">
                <SubmitButton />
            </div>
        </form>
    );
}
