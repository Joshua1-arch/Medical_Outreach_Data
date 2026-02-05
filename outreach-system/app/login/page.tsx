'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, LogIn } from 'lucide-react';
import { SubmitButton } from '@/components/ui/SubmitButton';

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState('');

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center mb-8">
                    <div className="inline-block p-4 bg-brand-dark rounded-xl mb-4 shadow-lg">
                        <span className="text-3xl font-serif font-bold text-brand-gold">R</span>
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-brand-dark mb-2">ReachPoint</h1>
                    <p className="text-slate-500">Secure Professional Access</p>
                </div>

                <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
                    <h2 className="text-2xl font-serif font-bold text-brand-dark mb-6">Sign In</h2>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3">
                            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}


                    <form action={async (formData) => {
                        setError('');

                        const email = formData.get('email') as string;
                        const password = formData.get('password') as string;

                        try {
                            const result = await signIn('credentials', {
                                email,
                                password,
                                redirect: false,
                            });

                            if (result?.error) {
                                setError('Invalid credentials or account not approved yet.');
                            } else {
                                router.push('/dashboard');
                                router.refresh();
                            }
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        } catch (err) {
                            setError('An error occurred. Please try again.');
                        }
                    }} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                className="w-full px-4 py-3 bg-slate-50 rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all placeholder:text-slate-400"
                                placeholder="name@clinic.com"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                                    Password
                                </label>
                                <Link href="/forgot-password" className="text-xs text-slate-400 hover:text-brand-dark">Forgot?</Link>
                            </div>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                required
                                className="w-full px-4 py-3 bg-slate-50 rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all placeholder:text-slate-400"
                                placeholder="••••••••"
                            />
                        </div>

                        <SubmitButton className="w-full py-3.5 flex items-center justify-center gap-3 bg-brand-dark text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-[0_4px_14px_0_rgba(15,23,42,0.39)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.23)] hover:-translate-y-0.5 active:translate-y-0 text-base">
                            <LogIn size={20} className="text-brand-gold" /> Sign In
                        </SubmitButton>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-slate-50">
                        <p className="text-sm text-slate-500">
                            No account yet?{' '}
                            <Link href="/signup" className="text-brand-dark font-bold hover:text-brand-gold transition-colors">
                                Apply for Access
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
