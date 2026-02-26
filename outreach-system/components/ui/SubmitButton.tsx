'use client';

import { useFormStatus } from 'react-dom';
import { Spinner } from '@/components/ui/Spinner';
import { ButtonHTMLAttributes } from 'react';

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    spinnerClassName?: string;
}

export function SubmitButton({ children, className, spinnerClassName, disabled, ...props }: SubmitButtonProps) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending || disabled}
            className={className || `flex items-center justify-center gap-2 bg-brand-dark text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold shadow-md`}
            {...props}
        >
            {pending ? <Spinner size={18} className={spinnerClassName || "text-white"} /> : children}
        </button>
    );
}
