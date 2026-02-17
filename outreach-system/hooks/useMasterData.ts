'use client';

import { useState, useEffect } from 'react';


// Hook definition
interface MasterDataMap {
    [key: string]: string[];
}

export function useMasterData(category?: string) {
    const [data, setData] = useState<MasterDataMap>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchInitial() {
            try {
                // If category specified, we fetch just that one, or all
                // For simplicity, let's fetch ALL master data on first load and cache it in context or just state.
                // Ideally, this should be in a specific API route.
                
                // Since we don't have a public API route for this yet, we should create one.
                // Or use server actions if this is a server component?
                // But this hook is for client components (forms).
                
                const response = await fetch('/api/master-data');
                if (!response.ok) throw new Error('Failed to fetch master data');
                
                const json = await response.json();
                
                // Transform array of { category, options } to map
                const map: MasterDataMap = {};
                json.forEach((item: any) => {
                    map[item.category] = item.options;
                });

                if (isMounted) {
                    setData(map);
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError('Failed to load data list');
                    setLoading(false);
                }
            }
        }

        fetchInitial();

        return () => { isMounted = false; };
    }, []);

    if (category) {
        return { 
            options: data[category] || [], 
            loading, 
            error 
        };
    }

    return { data, loading, error };
}
