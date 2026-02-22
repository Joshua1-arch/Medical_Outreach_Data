
'use client';

import { useState } from 'react';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (formData: FormData) => {
        setStatus('idle');
        const email = formData.get('email');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email }),
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await res.json();

            // Always show success for security, unless server error 500
            if (res.ok) {
                setStatus('success');
                setMessage(data.message);
            } else {
                setStatus('error');
                setMessage(data.message || 'Something went wrong');
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            console.error('Forgot Password Connection Error:', err);
            setStatus('error');
            setMessage('An error occurred. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-brand-dark mb-2">Reset Password</h1>
                    <p className="text-slate-500">Enter your email to receive a reset link</p>
                </div>

                <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
                    {status === 'success' ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Check your inbox</h3>
                            <p className="text-slate-600 mb-6">
                                {message}
                            </p>
                            <Link href="/login" className="inline-flex items-center gap-2 font-bold text-brand-dark hover:text-brand-gold transition-colors">
                                <ArrowLeft size={18} /> Back to Sign In
                            </Link>
                        </div>
                    ) : (
                        <form action={handleSubmit} className="space-y-6">
                            {status === 'error' && (
                                <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3">
                                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                                    <p className="text-sm font-medium">{message}</p>
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 text-slate-400" size={20} />
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all placeholder:text-slate-400"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            <SubmitButton className="w-full py-3 bg-brand-dark text-white rounded-xl hover:bg-slate-800 transition-all font-bold shadow-md">
                                Send Reset Link
                            </SubmitButton>

                            <div className="text-center">
                                <Link href="/login" className="text-sm text-slate-500 hover:text-brand-dark transition-colors flex items-center justify-center gap-2">
                                    <ArrowLeft size={16} /> Back to Sign In
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
