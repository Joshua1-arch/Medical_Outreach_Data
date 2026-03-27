'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/useDashboardStore';
import { prefetchDashboard } from '@/app/actions/prefetchDashboard';

export default function BackgroundHydrator() {
    const isHydrated = useDashboardStore((state) => state.isHydrated);
    const updateStore = useDashboardStore((state) => state.updateStore);

    useEffect(() => {
        if (isHydrated) return; // Prevent re-hydration

        const hydrate = async () => {
            const result = await prefetchDashboard();
            if (result.success && result.data) {
                updateStore(result.data);
            }
        };

        // Aggressively defer execution until the browser's main thread is idle
        // If requestIdleCallback is unsupported (like in Safari), fallback to a basic setTimeout
        if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(() => hydrate(), { timeout: 2000 });
        } else {
            setTimeout(hydrate, 500);
        }
    }, [isHydrated, updateStore]);

    return null; // Silent render component
}
