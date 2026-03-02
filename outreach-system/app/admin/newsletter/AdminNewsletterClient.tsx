'use client';

import { useState } from 'react';
import { sendNewsletterBlast, removeSubscriber } from '@/app/actions/adminEmail';
import { Send, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';

export default function AdminNewsletterClient({ 
    totalSubscribers, 
    subscribers 
}: { 
    totalSubscribers: number;
    subscribers: { id: string, email: string, subscribedAt: string | null }[];
}) {
    const [subject, setSubject] = useState('');
    const [htmlMessage, setHtmlMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [isRemoving, setIsRemoving] = useState<string | null>(null);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (totalSubscribers === 0) {
            setStatus('error');
            setMessage('You have no subscribers to send to.');
            return;
        }

        if (!confirm(`Are you sure you want to send this to ${totalSubscribers} subscribers?`)) return;

        setStatus('loading');
        setMessage('');

        const res = await sendNewsletterBlast(subject, htmlMessage);
        
        if (res.success) {
            setStatus('success');
            setMessage(res.message);
            setSubject('');
            setHtmlMessage('');
        } else {
            setStatus('error');
            setMessage(res.message);
        }
    };

    const handleRemove = async (id: string, email: string) => {
        if (!confirm(`Are you sure you want to remove ${email} from the subscriber list?`)) return;

        setIsRemoving(id);
        const res = await removeSubscriber(id);
        
        if (res.success) {
            setStatus('success');
            setMessage(`Successfully removed ${email}.`);
        } else {
            setStatus('error');
            setMessage(res.message);
        }
        setIsRemoving(null);
    };

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                <form onSubmit={handleSend} className="space-y-6">
                    <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email Subject
                    </label>
                    <input
                        type="text"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Monthly Outreach Update"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#fbc037]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Message Body (HTML Supported)
                    </label>
                    <textarea
                        required
                        value={htmlMessage}
                        onChange={(e) => setHtmlMessage(e.target.value)}
                        placeholder="<p>Hello Subscribers...</p>"
                        rows={10}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#fbc037] font-mono text-sm"
                    />
                </div>

                {message && (
                    <div className={`p-4 rounded-lg flex items-center gap-3 ${status === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {status === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <span className="font-semibold text-sm">{message}</span>
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                        type="submit"
                        disabled={status === 'loading' || totalSubscribers === 0}
                        className="rounded-lg bg-[#fbc037] px-6 py-3 font-bold text-slate-900 hover:bg-[#fbc037]/90 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {status === 'loading' ? (
                            <>Sending...</>
                        ) : (
                            <>
                                <Send size={18} />
                                Send Newsletter Blast
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Subscriber List</h2>
                <p className="text-sm text-slate-500 mt-1">Manage all users subscribed to the newsletter.</p>
            </div>
                
                {subscribers.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-slate-50/50">
                        No subscribers yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Subscribed At</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {subscribers.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {sub.email}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleRemove(sub.id, sub.email)}
                                                disabled={isRemoving === sub.id}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 font-medium transition-colors disabled:opacity-50"
                                                title="Remove subscriber"
                                            >
                                                {isRemoving === sub.id ? (
                                                    <span className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Trash2 size={16} />
                                                )}
                                                <span className="sr-only sm:not-sr-only sm:text-xs text-sm">Remove</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
