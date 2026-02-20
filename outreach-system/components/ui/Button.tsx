import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Spinner } from './Spinner';
import { useSiteConfig } from '@/app/context/SiteConfigProvider';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, isLoading, variant = 'primary', className, disabled, ...props }, ref) => {
        const base = "px-4 py-2 rounded-lg transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed border";

        const { themeMode } = useSiteConfig() || { themeMode: 'default' };

        const holidayStyles = {
            christmas: "bg-red-700 hover:bg-red-800 border-green-800 border-b-4 text-white shadow-lg",
            easter: "bg-pink-400 hover:bg-pink-500 text-white border-yellow-300 border-2 rounded-2xl",
            newyear: "bg-indigo-900 hover:bg-indigo-800 text-yellow-100 border-yellow-500 border shadow-[0_0_15px_rgba(234,179,8,0.5)]",
            halloween: "bg-orange-600 hover:bg-orange-700 text-black font-bold border-black border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
            valentine: "bg-pink-600 hover:bg-pink-700 text-white border-pink-300 border shadow-pink-200/50 shadow-lg",
            default: "bg-brand-dark text-white border-transparent hover:bg-slate-800 shadow-[0_4px_14px_0_rgba(15,23,42,0.39)]"
        };
        
        // Helper to get primary style based on theme
        const getPrimaryStyle = () => {
             // @ts-ignore
            if (themeMode && themeMode !== 'default' && holidayStyles[themeMode]) {
                 // @ts-ignore
                return holidayStyles[themeMode];
            }
            return holidayStyles.default;
        };

        const variants = {
            primary: getPrimaryStyle(),
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
                {isLoading ? <Spinner className={loadingIconColor} /> : (
                    <>
                        {themeMode === 'christmas' && variant === 'primary' && (
                            <span className="animate-pulse mr-1">❄️</span>
                        )}
                        {themeMode === 'easter' && variant === 'primary' && (
                            <span className="animate-bounce mr-1 delay-100">🐰</span>
                        )}
                        {themeMode === 'newyear' && variant === 'primary' && (
                            <span className="animate-ping absolute top-0 right-0 opacity-20 text-yellow-300">✨</span>
                        )}
                        {themeMode === 'halloween' && variant === 'primary' && (
                            <span className="animate-bounce mr-1">👻</span>
                        )}
                        {themeMode === 'valentine' && variant === 'primary' && (
                            <span className="animate-pulse mr-1 text-pink-200">❤️</span>
                        )}
                        {children}
                        {themeMode === 'christmas' && variant === 'primary' && (
                            <span className="animate-pulse ml-1 delay-75">❄️</span>
                        )}
                        {themeMode === 'newyear' && variant === 'primary' && (
                            <span className="mr-1">🎆</span>
                        )}
                         {themeMode === 'halloween' && variant === 'primary' && (
                            <span className="ml-1 animate-pulse text-orange-400">🎃</span>
                        )}
                    </>
                )}
            </button>
        );
    }
);

Button.displayName = "Button";
