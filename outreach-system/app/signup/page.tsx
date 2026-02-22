'use client';

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import {
    AlertCircle, CheckCircle, UserCircle, Mail, Lock,
    ShieldCheck, ChevronDown, Ticket, UserPlus, HeartPulse,
    Users, BarChart3,
} from 'lucide-react';
import { SubmitButton } from '@/components/ui/SubmitButton';

/* ─── Left-panel bullet points ───────────────────────────── */
const PERKS = [
    { icon: HeartPulse, label: 'HIPAA-compliant patient records' },
    { icon: BarChart3,  label: 'Real-time analytics dashboards' },
    { icon: Users,      label: 'Seamless team coordination' },
];

export default function SignupPage() {
    const [error, setError]               = useState('');
    const [success, setSuccess]           = useState(false);
    const [autoApproved, setAutoApproved] = useState(false);

    /* ── Success screen ─────────────────────────────────────── */
    if (success) {
        return (
            <div className="h-screen bg-slate-50 flex items-center justify-center font-sans p-4">
                <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-stone-100 p-10 text-center animate-in fade-in zoom-in duration-300">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${autoApproved ? 'bg-green-50' : 'bg-amber-50'}`}>
                        <CheckCircle size={32} className={autoApproved ? 'text-green-600' : 'text-amber-600'} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">
                        {autoApproved ? 'Account Activated!' : 'Registration Successful!'}
                    </h2>
                    <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                        {autoApproved
                            ? 'Your invitation code was valid. Your account is now active!'
                            : <>Your account is <strong>awaiting admin approval</strong>. You'll be notified by email.</>}
                    </p>
                    <Link
                        href="/login"
                        className={`inline-block px-6 py-3 rounded-lg font-bold text-sm transition-colors shadow-md ${autoApproved
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-[#fbc037] text-slate-900 hover:bg-yellow-400'
                        }`}
                    >
                        {autoApproved ? 'Log In Now' : 'Go to Login'}
                    </Link>
                </div>
            </div>
        );
    }

    /* ── Main signup layout ──────────────────────────────────── */
    return (
        <div className="flex min-h-screen w-full font-sans overflow-x-hidden">

            {/* ════════════════════════════════════════════════
                LEFT  — decorative panel (hidden on mobile)
            ════════════════════════════════════════════════ */}
            <div className="hidden lg:flex w-5/12 xl:w-2/5 relative bg-slate-900 flex-col gap-8 overflow-hidden">
                {/* Background image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://picsum.photos/seed/signupbg/900/1200"
                        alt="Background"
                        className="w-full h-full object-cover opacity-30 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/70 to-[#fbc037]/30" />
                </div>

                {/* Logo */}
                <div className="relative z-10 p-10 pb-0">
                    <div className="inline-flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#fbc037] flex items-center justify-center">
                            <Image src="/Reach.png" alt="Logo" width={24} height={24} className="object-contain" />
                        </div>
                        <span className="text-white font-bold text-lg tracking-tight">ReachPoint</span>
                    </div>
                </div>

                {/* Middle headline */}
                <div className="relative z-10 px-10">
                    <h2 className="text-white text-4xl font-black leading-tight tracking-tight mb-6">
                        Start your <br />
                        <span className="text-[#fbc037]">Medical Journey</span>
                    </h2>
                    <p className="text-slate-300 text-sm leading-relaxed mb-10">
                        Join thousands of medical professionals managing outreach data, events, and patient records — all in one secure platform.
                    </p>

                    {/* Perks */}
                    <ul className="space-y-4">
                        {PERKS.map(({ icon: Icon, label }) => (
                            <li key={label} className="flex items-center gap-3 text-sm text-slate-300">
                                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#fbc037]/15 flex items-center justify-center text-[#fbc037]">
                                    <Icon size={16} />
                                </span>
                                {label}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="flex-1 bg-white flex flex-col">
                {/* Mobile logo */}
                <div className="flex lg:hidden items-center gap-2 px-6 pt-6 mb-2">
                    <Image src="/Reach.png" alt="ReachPoint" width={32} height={32} className="object-contain" />
                    <span className="font-bold text-slate-900 text-lg">ReachPoint</span>
                </div>

                <div className="flex-1 flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
                    <div className="w-full max-w-2xl">

                        {/* Heading */}
                        <div className="mb-8">
                            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-2">
                                Create your account
                            </h1>
                            <p className="text-slate-500 text-base">
                                Fill in your details below to get started with ReachPoint.
                            </p>
                        </div>

                        {/* Error banner */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 border border-red-100">
                                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form
                            action={async (formData) => {
                                setError('');

                                const name             = formData.get('name')             as string;
                                const email            = formData.get('email')            as string;
                                const password         = formData.get('password')         as string;
                                const confirmPassword  = formData.get('confirmPassword')  as string;
                                const invitationCode   = formData.get('invitationCode')   as string;

                                const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
                                if (!emailRegex.test(email)) {
                                    setError('Invalid email format. Please check for typos.');
                                    return;
                                }
                                if (password !== confirmPassword) {
                                    setError('Passwords do not match.');
                                    return;
                                }
                                if (password.length < 6) {
                                    setError('Password must be at least 6 characters.');
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
                                            invitationCode: invitationCode || undefined,
                                        }),
                                    });

                                    const data = await response.json();

                                    if (response.ok) {
                                        setAutoApproved(data.autoApproved === true);
                                        setSuccess(true);
                                    } else {
                                        setError(data.message || 'Registration failed. Please try again.');
                                    }
                                } catch {
                                    setError('An error occurred. Please try again.');
                                }
                            }}
                            className="space-y-6"
                        >
                            {/* Row 1 — Name  +  Email */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label htmlFor="name" className="block text-sm font-semibold text-slate-800">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <UserCircle size={18} />
                                        </span>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            required
                                            placeholder="Dr. Jane Doe"
                                            className="block w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#fbc037] focus:ring-1 focus:ring-[#fbc037] outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="email" className="block text-sm font-semibold text-slate-800">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <Mail size={18} />
                                        </span>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            placeholder="name@hospital.org"
                                            className="block w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#fbc037] focus:ring-1 focus:ring-[#fbc037] outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Row 2 — Password  +  Confirm Password */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label htmlFor="password" className="block text-sm font-semibold text-slate-800">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <Lock size={18} />
                                        </span>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            placeholder="Min. 6 characters"
                                            className="block w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#fbc037] focus:ring-1 focus:ring-[#fbc037] outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-800">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <Lock size={18} />
                                        </span>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            required
                                            placeholder="Repeat password"
                                            className="block w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#fbc037] focus:ring-1 focus:ring-[#fbc037] outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Row 3 — Role  +  Invitation Code */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label htmlFor="role" className="block text-sm font-semibold text-slate-800">
                                        Role
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <ShieldCheck size={18} />
                                        </span>
                                        <select
                                            id="role"
                                            name="role"
                                            defaultValue=""
                                            className="block w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 py-3 text-sm text-slate-900 focus:border-[#fbc037] focus:ring-1 focus:ring-[#fbc037] outline-none transition-all"
                                        >
                                            <option value="" disabled>Select role…</option>
                                            <option value="physician">Physician</option>
                                            <option value="nurse">Nurse</option>
                                            <option value="admin">Administrator</option>
                                            <option value="volunteer">Volunteer</option>
                                        </select>
                                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                            <ChevronDown size={16} />
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="invitationCode" className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                                        <Ticket size={14} className="text-[#fbc037]" />
                                        Invitation Code
                                        <span className="font-normal text-slate-400 text-xs">(optional)</span>
                                    </label>
                                    <input
                                        id="invitationCode"
                                        name="invitationCode"
                                        type="text"
                                        placeholder="XXXX-XXXX-XX"
                                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#fbc037] focus:ring-1 focus:ring-[#fbc037] outline-none uppercase font-mono tracking-widest transition-all"
                                    />
                                </div>
                            </div>

                            {/* Info note */}
                            <p className="text-xs text-slate-400 bg-[#fbc037]/5 border border-[#fbc037]/20 rounded-lg px-4 py-3">
                                💡 <strong className="text-slate-600">No invitation code?</strong> Your account will need admin approval before you can log in. You&apos;ll be notified by email once approved.
                            </p>

                            {/* Submit */}
                            <SubmitButton className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#fbc037] py-3.5 px-6 text-sm font-bold text-slate-900 hover:bg-yellow-400 shadow-md hover:shadow-lg transition-all active:scale-[0.99]">
                                <UserPlus size={18} />
                                Create Account
                            </SubmitButton>

                            {/* Sign in link */}
                            <p className="text-center text-sm text-slate-500 pb-2">
                                Already have an account?{' '}
                                <Link href="/login" className="font-semibold text-[#fbc037] hover:text-yellow-600 transition-colors">
                                    Sign in instead
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
