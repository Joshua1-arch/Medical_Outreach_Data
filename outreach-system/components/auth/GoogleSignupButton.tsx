'use client';

import { signIn } from 'next-auth/react';
import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';

interface GoogleSignupButtonProps {
    disabled?: boolean;
    isLogin?: boolean;
}

export default function GoogleSignupButton({ disabled = false, isLogin = false }: GoogleSignupButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleAuth = async () => {
        setIsLoading(true);
        try {
            await signIn('google', { prompt: 'select_account' });
        } catch (error) {
            console.error("Google sign in error", error);
            setIsLoading(false);
        }
    };

    return (
        <button
            disabled={disabled || isLoading}
            onClick={handleGoogleAuth}
            type="button"
            className={`
                flex items-center justify-center gap-3 w-full rounded-xl border py-3.5 px-6 text-sm font-bold transition-all active:scale-[0.98]
                ${!(disabled || isLoading)
                    ? 'bg-white border-slate-200 text-slate-900 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:shadow-md' 
                    : 'bg-slate-100 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                }
            `}
        >
            {isLoading ? (
                <Spinner size={20} className="text-slate-400" />
            ) : (
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 48 48" 
                    aria-hidden="true" 
                    className={!(disabled || isLoading) ? '' : 'grayscale opacity-50'}
                >
                    <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
                    <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
                    <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
                    <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
                </svg>
            )}
            <span className="flex items-center gap-2">
                {isLogin ? 'Continue with Google' : 'Sign Up with Google'}
                {!isLogin && !(disabled || isLoading) && <ShieldCheck size={16} className="text-emerald-500 animate-in fade-in zoom-in duration-300" />}
            </span>
        </button>
    );
}
