'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, UserPlus, CheckCircle } from 'lucide-react';
import { SubmitButton } from '@/components/ui/SubmitButton';

export default function SignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center animate-in fade-in zoom-in duration-300">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-4">
                        <CheckCircle size={32} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-brand-dark mb-3">Registration Successful!</h2>
                    <p className="text-slate-500 mb-6">
                        Your account has been created and is <strong>awaiting admin approval</strong>.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block px-6 py-3 bg-brand-dark text-white rounded-lg hover:bg-slate-800 font-semibold transition-colors shadow-lg"
                    >
                        Go to Login
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
                        <span className="text-3xl font-serif font-bold text-brand-gold">M</span>
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-brand-dark mb-2">Create Account</h1>
                    <p className="text-slate-500">Join the Medical Outreach platform</p>
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
                                body: JSON.stringify({ name, email, password }),
                            });

                            const data = await response.json();

                            if (response.ok) {
                                setSuccess(true);
                            } else {
                                setError(data.message || 'Registration failed');
                            }
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

                        <SubmitButton className="w-full py-3 mt-4">
                            <UserPlus size={18} /> Sign Up
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
                        <strong>Note:</strong> Your account will need to be approved by an administrator before you can log in.
                    </p>
                </div>
            </div>
        </div>
    );
}
