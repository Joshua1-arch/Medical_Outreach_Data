
import { Spinner } from '@/components/ui/Spinner';

export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Spinner size={48} className="text-brand-gold" />
        </div>
    );
}
