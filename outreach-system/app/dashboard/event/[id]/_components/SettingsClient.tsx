'use client';

import { useState } from 'react';
import { updateEventSettings } from '@/app/dashboard/actions';
import { Globe, Lock, Save, Eye, Copy, AlertCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import Link from 'next/link';

export default function SettingsClient({ event }: { event: any }) {
    const [isPublic, setIsPublic] = useState(event.isPublic || false);
    const [accessCode, setAccessCode] = useState(event.accessCode || '');
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const publicUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/e/${event._id}`
        : `/e/${event._id}`;

    const saveSettings = async () => {
        setIsSaving(true);
        const result = await updateEventSettings(event._id, isPublic, accessCode);
        setIsSaving(false);
        setSaved(true);
        alert(result.message);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">

            {/* Access control card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                    <h2 className="font-bold text-slate-900">Security &amp; Access</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Control who can access and submit to your form.</p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Public toggle */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl transition-colors ${isPublic ? 'bg-[#fbc037]/10 text-[#fbc037]' : 'bg-slate-100 text-slate-400'}`}>
                                <Globe size={22} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800 text-sm">Public Access Link</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Allow anyone with the link to submit data</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#fbc037] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#fbc037]/20" />
                        </label>
                    </div>

                    {/* Public URL preview (shown when enabled) */}
                    {isPublic && (
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Public Form URL</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 font-mono text-xs text-slate-600 truncate bg-white border border-slate-200 px-3 py-2 rounded-lg">
                                    {publicUrl}
                                </div>
                                <button
                                    onClick={() => { navigator.clipboard.writeText(publicUrl); alert('Copied!'); }}
                                    className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                                >
                                    <Copy size={14} />
                                </button>
                                <Link
                                    href={`/e/${event._id}`}
                                    target="_blank"
                                    className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                                >
                                    <Eye size={14} />
                                </Link>
                            </div>
                        </div>
                    )}

                    <div className="border-t border-slate-100 pt-5">
                        {/* Password protection */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 rounded-xl transition-colors ${accessCode ? 'bg-[#fbc037]/10 text-[#fbc037]' : 'bg-slate-100 text-slate-400'}`}>
                                <Lock size={22} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800 text-sm">Access Code</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Optional code required to submit the form</p>
                            </div>
                        </div>
                        <input
                            type="text"
                            value={accessCode}
                            onChange={(e) => setAccessCode(e.target.value)}
                            placeholder="e.g. EVENT2025 (leave blank for no code)"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#fbc037]/30 focus:border-[#fbc037] outline-none transition-all bg-slate-50 focus:bg-white text-sm"
                        />
                        {accessCode && (
                            <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                                <AlertCircle size={11} />
                                Participants will need to enter this code before accessing the form.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Save button */}
            <div className="flex justify-end">
                <button
                    onClick={saveSettings}
                    disabled={isSaving}
                    className={`inline-flex items-center gap-2 h-11 px-8 rounded-xl font-bold text-sm transition-all shadow-sm ${
                        saved
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-60'
                    }`}
                >
                    {isSaving ? <Spinner size={17} className="text-white" /> : <Save size={17} />}
                    {saved ? 'Saved!' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
}
