import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, isLoading, variant = 'primary', className, disabled, ...props }, ref) => {
        const base = "px-4 py-2 rounded-lg transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed border";

        const variants = {
            primary: "bg-brand-dark text-white border-transparent hover:bg-slate-800 shadow-[0_4px_14px_0_rgba(15,23,42,0.39)]",
            secondary: "bg-white text-slate-700 border-slate-200 hover:border-brand-gold hover:shadow-sm",
            ghost: "bg-transparent text-slate-600 border-transparent hover:bg-slate-100",
            danger: "bg-red-500 text-white border-transparent hover:bg-red-600"
        };

        const loadingIconColor = variant === 'primary' || variant === 'danger' ? 'text-white' : 'text-brand-gold';

        return (
            <button
                ref={ref}
                className={`${base} ${variants[variant]} ${className || ''}`}
                disabled={isLoading || disabled}
                {...props}
            >
                {isLoading ? <Spinner className={loadingIconColor} /> : children}
            </button>
        );
    }
);

Button.displayName = "Button";
