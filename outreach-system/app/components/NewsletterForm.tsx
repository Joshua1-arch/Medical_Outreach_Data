'use client';

import { useState } from 'react';
import { subscribeToNewsletter } from '@/app/actions/newsletter';
import { Turnstile } from '@marsidev/react-turnstile';

export default function NewsletterForm() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [turnstileToken, setTurnstileToken] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!turnstileToken) {
            setStatus('error');
            setMessage('Please complete the security check.');
            return;
        }

        setStatus('loading');
        setMessage('');

        const res = await subscribeToNewsletter(email, turnstileToken);
        
        if (res.success) {
            setStatus('success');
            setMessage(res.message);
            setEmail('');
        } else {
            setStatus('error');
            setMessage(res.message);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                    type="email"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'loading'}
                    className="flex-1 min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#fbc037]"
                />
                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="shrink-0 rounded-lg bg-[#fbc037] px-5 py-2.5 text-sm font-bold text-slate-900 hover:bg-[#fbc037]/90 transition-colors disabled:opacity-70 flex justify-center items-center min-w-[100px]"
                >
                    {status === 'loading' ? 'Sending...' : 'Subscribe'}
                </button>
            </form>
            <div className="mt-3">
                <Turnstile 
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                    onSuccess={(token) => setTurnstileToken(token)}
                    onError={() => {
                        setStatus('error');
                        setMessage('Security check failed. Please try again.');
                    }}
                    onExpire={() => setTurnstileToken('')}
                />
            </div>
            {message && (
                <p className={`mt-2 text-sm font-semibold text-center sm:text-left ${status === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {message}
                </p>
            )}
        </div>
    );
}
