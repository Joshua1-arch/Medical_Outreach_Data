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
                        <option value="newyear">New Year</option>
                        <option value="halloween">Halloween</option>
                        <option value="valentine">Valentine</option>
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

            <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700">Company Logo</label>
                
                <div className="grid md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Upload Image</label>
                        <input
                            type="file"
                            name="logoFile"
                            accept="image/*"
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-cream file:text-brand-dark hover:file:bg-brand-gold/20"
                        />
                        <p className="text-xs text-slate-400">Recommended size: 200x50px. Max 2MB.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Or Image URL</label>
                        <input
                            type="url"
                            name="logoUrl"
                            defaultValue={initialConfig.logoUrl || '/Reach.png'}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none placeholder:text-slate-400 text-sm"
                            placeholder="https://example.com/logo.png"
                        />
                    </div>
                </div>

                {initialConfig.logoUrl && (
                    <div className="mt-2 p-4 bg-slate-50 rounded-lg border border-slate-200 inline-block">
                        <p className="text-xs text-slate-500 mb-2">Current Logo Preview:</p>
                        <img 
                            src={initialConfig.logoUrl} 
                            alt="Current Logo" 
                            className="h-12 object-contain"
                            onError={(e) => (e.currentTarget.style.display = 'none')} 
                        />
                    </div>
                )}
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

            <div className="space-y-4 pt-6 border-t border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">Social Media Links</h3>
                <p className="text-sm text-slate-500 mb-4">Toggle on/off the social icons you want to display on the homepage.</p>

                <div className="grid grid-cols-1 gap-4">
                    {/* Email */}
                    <div className="p-4 border rounded-xl bg-slate-50 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">📧</span>
                                <span className="font-bold text-slate-700">Email Contact</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="social_email_enabled"
                                    defaultChecked={initialConfig.socialMediaLinks?.email?.enabled}
                                    className="sr-only peer"
                                    onChange={(e) => {
                                        const input = document.getElementById('email-url-input');
                                        if (input) {
                                            if (e.target.checked) input.classList.remove('hidden');
                                            else input.classList.add('hidden');
                                        }
                                    }}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-gold/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                        <div id="email-url-input" className={initialConfig.socialMediaLinks?.email?.enabled ? '' : 'hidden'}>
                            <input
                                type="text"
                                name="social_email_url"
                                defaultValue={initialConfig.socialMediaLinks?.email?.url}
                                placeholder="mailto:contact@example.com"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                            />
                        </div>
                    </div>

                    {/* Twitter / X */}
                    <div className="p-4 border rounded-xl bg-slate-50 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">𝕏</span>
                                <span className="font-bold text-slate-700">X (Twitter)</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="social_twitter_enabled"
                                    defaultChecked={initialConfig.socialMediaLinks?.twitter?.enabled}
                                    className="sr-only peer"
                                    onChange={(e) => {
                                        const input = document.getElementById('twitter-url-input');
                                        if (input) {
                                            if (e.target.checked) input.classList.remove('hidden');
                                            else input.classList.add('hidden');
                                        }
                                    }}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-gold/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                        <div id="twitter-url-input" className={initialConfig.socialMediaLinks?.twitter?.enabled ? '' : 'hidden'}>
                            <input
                                type="url"
                                name="social_twitter_url"
                                defaultValue={initialConfig.socialMediaLinks?.twitter?.url}
                                placeholder="https://x.com/username"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                            />
                        </div>
                    </div>

                    {/* LinkedIn */}
                    <div className="p-4 border rounded-xl bg-slate-50 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xl text-blue-700">in</span>
                                <span className="font-bold text-slate-700">LinkedIn</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="social_linkedin_enabled"
                                    defaultChecked={initialConfig.socialMediaLinks?.linkedin?.enabled}
                                    className="sr-only peer"
                                    onChange={(e) => {
                                        const input = document.getElementById('linkedin-url-input');
                                        if (input) {
                                            if (e.target.checked) input.classList.remove('hidden');
                                            else input.classList.add('hidden');
                                        }
                                    }}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-gold/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                        <div id="linkedin-url-input" className={initialConfig.socialMediaLinks?.linkedin?.enabled ? '' : 'hidden'}>
                            <input
                                type="url"
                                name="social_linkedin_url"
                                defaultValue={initialConfig.socialMediaLinks?.linkedin?.url}
                                placeholder="https://linkedin.com/in/username"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                            />
                        </div>
                    </div>

                    {/* Facebook */}
                    <div className="p-4 border rounded-xl bg-slate-50 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xl text-blue-600">f</span>
                                <span className="font-bold text-slate-700">Facebook</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="social_facebook_enabled"
                                    defaultChecked={initialConfig.socialMediaLinks?.facebook?.enabled}
                                    className="sr-only peer"
                                    onChange={(e) => {
                                        const input = document.getElementById('facebook-url-input');
                                        if (input) {
                                            if (e.target.checked) input.classList.remove('hidden');
                                            else input.classList.add('hidden');
                                        }
                                    }}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-gold/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                        <div id="facebook-url-input" className={initialConfig.socialMediaLinks?.facebook?.enabled ? '' : 'hidden'}>
                            <input
                                type="url"
                                name="social_facebook_url"
                                defaultValue={initialConfig.socialMediaLinks?.facebook?.url}
                                placeholder="https://facebook.com/username"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <SubmitButton />
            </div>
        </form>
    );
}
