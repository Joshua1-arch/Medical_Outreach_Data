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
                <img 
                    src="https://authjs.dev/img/providers/google.svg" 
                    width={20} 
                    height={20} 
                    alt="Google logo" 
                    className={!(disabled || isLoading) ? '' : 'grayscale opacity-50'}
                />
            )}
            <span className="flex items-center gap-2">
                {isLogin ? 'Continue with Google' : 'Sign Up with Google'}
                {!isLogin && !(disabled || isLoading) && <ShieldCheck size={16} className="text-emerald-500 animate-in fade-in zoom-in duration-300" />}
            </span>
        </button>
    );
}
