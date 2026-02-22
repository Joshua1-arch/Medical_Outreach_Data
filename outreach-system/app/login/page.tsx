'use client';

import Image from 'next/image';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Mail, Lock, Eye, EyeOff, Globe, Building2 } from 'lucide-react';
import { SubmitButton } from '@/components/ui/SubmitButton';

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="flex h-screen w-full overflow-hidden font-sans">

            {/* ── Left Panel (decorative, desktop only) ── */}
            <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
                {/* BG image + gradient overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://picsum.photos/seed/loginbg/1200/1200"
                        alt="Background"
                        className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/90 to-[#fbc037]/20 mix-blend-multiply" />
                </div>

                {/* Content */}
                <div className="relative z-10 p-12 max-w-lg text-left">
                    <div className="mb-8 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#fbc037] text-slate-900">
                        <Image src="/Reach.png" alt="ReachPoint Logo" width={32} height={32} className="object-contain" />
                    </div>
                    <h1 className="text-white text-5xl font-black leading-tight tracking-tight mb-6">
                        Empowering <br />
                        <span className="text-[#fbc037]">Medical Outreach</span>
                    </h1>
                    <p className="text-slate-300 text-lg font-light leading-relaxed mb-8">
                        Seamlessly manage your outreach data, coordinate events, and connect with communities using ReachPoint&apos;s advanced platform.
                    </p>
                </div>
            </div>

            {/* ── Right Panel (form) ── */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-white relative">

                {/* Mobile-only logo */}
                <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
                    <Image src="/Reach.png" alt="ReachPoint" width={36} height={36} className="object-contain" />
                    <span className="font-bold text-xl text-slate-900">ReachPoint</span>
                </div>

                <div className="w-full max-w-[420px] flex flex-col gap-7">

                    {/* Heading */}
                    <div className="flex flex-col gap-1.5">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Welcome Back</h2>
                        <p className="text-slate-500 text-base">Please enter your details to sign in to your dashboard.</p>
                    </div>

                    {/* Error banner */}
                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3 border border-red-100">
                            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form
                        action={async (formData) => {
                            setError('');

                            const email = formData.get('email') as string;
                            const password = formData.get('password') as string;

                            const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
                            if (!emailRegex.test(email)) {
                                setError('Invalid email format. Please check for typos.');
                                return;
                            }

                            try {
                                const result = await signIn('credentials', {
                                    email,
                                    password,
                                    redirect: false,
                                });

                                if (result?.error) {
                                    if (result.error.includes('Access denied') || result.error.includes('accountStatus') || result.error.includes('pending')) {
                                        setError('Your account is pending admin approval. Please contact an administrator.');
                                    } else {
                                        setError('Invalid credentials or account not approved yet.');
                                    }
                                } else {
                                    router.push('/dashboard');
                                    router.refresh();
                                }
                            } catch {
                                setError('An error occurred. Please try again.');
                            }
                        }}
                        className="flex flex-col gap-5"
                    >
                        {/* Email */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-semibold text-slate-900">
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#fbc037] transition-colors">
                                    <Mail size={20} />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:border-[#fbc037] focus:ring-1 focus:ring-[#fbc037] outline-none sm:text-sm transition-all shadow-sm"
                                    placeholder="name@reachpoint.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-semibold text-slate-900">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#fbc037] transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-10 py-3 text-slate-900 placeholder-slate-400 focus:border-[#fbc037] focus:ring-1 focus:ring-[#fbc037] outline-none sm:text-sm transition-all shadow-sm"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember + Forgot */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-slate-300 text-[#fbc037] focus:ring-[#fbc037]/40 cursor-pointer accent-[#fbc037]"
                                />
                                <label htmlFor="remember" className="text-sm font-medium text-slate-600 cursor-pointer select-none">
                                    Remember for 30 days
                                </label>
                            </div>
                            <Link href="/forgot-password" className="text-sm font-semibold text-[#fbc037] hover:text-yellow-600 transition-colors">
                                Forgot Password?
                            </Link>
                        </div>

                        {/* Submit */}
                        <SubmitButton className="mt-1 w-full flex items-center justify-center rounded-lg bg-[#fbc037] py-3 px-4 text-sm font-bold text-slate-900 hover:bg-yellow-400 shadow-md hover:shadow-lg transition-all active:scale-[0.99]">
                            Log in
                        </SubmitButton>
                    </form>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-3 text-slate-500">Or continue with</span>
                        </div>
                    </div>

                    {/* Social / SSO buttons (visual only — extend as needed) */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
                        >
                            <Globe size={18} /> Google
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
                        >
                            <Building2 size={18} /> SSO
                        </button>
                    </div>

                    {/* Signup link */}
                    <p className="text-center text-sm text-slate-500">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="font-semibold text-[#fbc037] hover:text-yellow-600 transition-colors">
                            Apply for Access
                        </Link>
                    </p>
                </div>

                {/* Footer note */}
                <div className="absolute bottom-6 text-xs text-slate-400">
                    © {new Date().getFullYear()} ReachPoint Systems. All rights reserved.
                </div>
            </div>
        </div>
    );
}
