import { Loader2, LucideProps } from 'lucide-react';

interface SpinnerProps extends LucideProps { }

export function Spinner({ className, ...props }: SpinnerProps) {
    return <Loader2 className={`animate-spin ${className || ''}`} {...props} />;
}
