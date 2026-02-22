
'use client';

import { useState, use } from 'react';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
    // Correctly unwrap params using React.use() or await in async component
    // Since this is a client component, we use the `use` hook concept or just access it if passed as prop?
    // In Next.js 15, params is a promise.
    const { token } = use(params);

    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (formData: FormData) => {
        setStatus('idle');
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setStatus('error');
            setMessage('Password must be at least 6 characters');
            return;
        }

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ token, newPassword: password }),
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage('Your password has been reset successfully.');
            } else {
                setStatus('error');
                setMessage(data.message || 'Failed to reset password');
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            console.error('Reset Password Connection Error:', err);
            setStatus('error');
            setMessage('An error occurred. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-brand-dark mb-2">New Password</h1>
                    <p className="text-slate-500">Enter your new secure password below</p>
                </div>

                <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
                    {status === 'success' ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Password Updated!</h3>
                            <p className="text-slate-600 mb-6">
                                You can now log in with your new password.
                            </p>
                            <Link href="/login" className="block w-full py-3 bg-brand-dark text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-md">
                                Sign In
                            </Link>
                        </div>
                    ) : (
                        <form action={handleSubmit} className="space-y-5">
                            {status === 'error' && (
                                <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3">
                                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                                    <p className="text-sm font-medium">{message}</p>
                                </div>
                            )}

                            <div>
                                <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-1">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 text-slate-400" size={20} />
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all placeholder:text-slate-400"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700 mb-1">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 text-slate-400" size={20} />
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all placeholder:text-slate-400"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <SubmitButton className="w-full py-3 bg-brand-dark text-white rounded-xl hover:bg-slate-800 transition-all font-bold shadow-md">
                                Set New Password
                            </SubmitButton>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
