'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, UserPlus, CheckCircle, Ticket } from 'lucide-react';
import { SubmitButton } from '@/components/ui/SubmitButton';

export default function SignupPage() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const router = useRouter();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [autoApproved, setAutoApproved] = useState(false);

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center animate-in fade-in zoom-in duration-300">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${autoApproved ? 'bg-green-50' : 'bg-amber-50'}`}>
                        <CheckCircle size={32} className={autoApproved ? 'text-green-600' : 'text-amber-600'} />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-brand-dark mb-3">
                        {autoApproved ? 'Account Activated!' : 'Registration Successful!'}
                    </h2>
                    <p className="text-slate-500 mb-6">
                        {autoApproved
                            ? 'Your invitation code was valid. Your account is now active and ready to use!'
                            : <>Your account has been created and is <strong>awaiting admin approval</strong>.</>
                        }
                    </p>
                    <Link
                        href="/login"
                        className={`inline-block px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg ${autoApproved
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-brand-dark text-white hover:bg-slate-800'
                            }`}
                    >
                        {autoApproved ? 'Log In Now' : 'Go to Login'}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center mb-8">
                    <div className="inline-block p-4 bg-brand-dark rounded-xl mb-4 shadow-lg">
                        <span className="text-3xl font-serif font-bold text-brand-gold">R</span>
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-brand-dark mb-2">Create Account</h1>
                    <p className="text-slate-500">Join the ReachPoint platform</p>
                </div>

                <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
                    <h2 className="text-2xl font-serif font-bold text-brand-dark mb-6">Sign Up</h2>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3">
                            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form action={async (formData) => {
                        setError('');

                        const name = formData.get('name') as string;
                        const email = formData.get('email') as string;
                        const password = formData.get('password') as string;
                        const confirmPassword = formData.get('confirmPassword') as string;
                        const invitationCode = formData.get('invitationCode') as string;

                        // Strict Email Validation (Anti-Injection)
                        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
                        if (!emailRegex.test(email)) {
                            setError('Invalid email format. Please check for typos.');
                            return;
                        }

                        if (password !== confirmPassword) {
                            setError('Passwords do not match');
                            return;
                        }

                        if (password.length < 6) {
                            setError('Password must be at least 6 characters');
                            return;
                        }

                        try {
                            const response = await fetch('/api/auth/register', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    name,
                                    email,
                                    password,
                                    invitationCode: invitationCode || undefined
                                }),
                            });

                            const data = await response.json();

                            if (response.ok) {
                                setAutoApproved(data.autoApproved === true);
                                setSuccess(true);
                            } else {
                                setError(data.message || 'Registration failed');
                            }
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        } catch (err) {
                            setError('An error occurred. Please try again.');
                        }
                    }} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                className="w-full px-4 py-3 bg-slate-50 rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all placeholder:text-slate-400"
                                placeholder="Dr. John Doe"
                            />
                        </div>

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
                            <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                required
                                className="w-full px-4 py-3 bg-slate-50 rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all placeholder:text-slate-400"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700 mb-1">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                required
                                className="w-full px-4 py-3 bg-slate-50 rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all placeholder:text-slate-400"
                                placeholder="••••••••"
                            />
                        </div>


                        <div className="pt-2 border-t border-slate-100">
                            <label htmlFor="invitationCode" className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
                                <Ticket size={14} className="text-brand-gold" />
                                Invitation Code <span className="font-normal text-slate-400">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                id="invitationCode"
                                name="invitationCode"
                                className="w-full px-4 py-3 bg-slate-50 rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all placeholder:text-slate-400 uppercase font-mono tracking-wider"
                                placeholder="XXXX-XXXX-XX"
                            />
                            <p className="text-xs text-slate-400 mt-1">
                                Have an invitation code? Enter it for instant account activation.
                            </p>
                        </div>

                        <SubmitButton className="w-full py-3.5 mt-4 flex items-center justify-center gap-3 bg-brand-dark text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-[0_4px_14px_0_rgba(15,23,42,0.39)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.23)] hover:-translate-y-0.5 active:translate-y-0 text-base">
                            <UserPlus size={20} className="text-brand-gold" /> Sign Up
                        </SubmitButton>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-slate-50">
                        <p className="text-sm text-slate-500">
                            Already have an account?{' '}
                            <Link href="/login" className="text-brand-dark font-bold hover:text-brand-gold transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-brand-gold/10 border border-brand-gold/20 rounded-lg text-center">
                    <p className="text-sm text-brand-dark/80">
                        <strong>Note:</strong> Without an invitation code, your account will need admin approval before you can log in.
                    </p>
                </div>
            </div>
        </div>
    );
}
