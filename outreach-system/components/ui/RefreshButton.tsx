'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { RotateCw } from 'lucide-react';

export default function RefreshButton() {
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.refresh();
        setTimeout(() => setIsRefreshing(false), 750);
    };

    return (
        <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:border-brand-gold hover:text-brand-dark transition-all shadow-sm font-medium"
            title="Check for new submissions"
        >
            <RotateCw size={16} className={isRefreshing ? 'animate-spin text-brand-gold' : ''} />
            <span className="hidden sm:inline">Refresh List</span>
        </button>
    );
}
