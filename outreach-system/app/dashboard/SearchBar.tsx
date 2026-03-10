'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

/**
 * Global dashboard search bar.
 * On submit (Enter or click) it navigates to /dashboard/my-events?q=<term>.
 * The input is pre-filled if ?q= is already present in the URL.
 */
export default function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') ?? '');

    // Keep input in sync when navigating between pages
    useEffect(() => {
        setQuery(searchParams.get('q') ?? '');
    }, [searchParams]);

    const submit = () => {
        const trimmed = query.trim();
        if (trimmed) {
            router.push(`/dashboard/my-events?q=${encodeURIComponent(trimmed)}`);
        } else {
            router.push('/dashboard/my-events');
        }
    };

    const clear = () => {
        setQuery('');
        router.push('/dashboard/my-events');
    };

    return (
        <div className="relative w-full max-w-sm hidden sm:block">
            {/* Search icon */}
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search size={17} />
            </div>

            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="Search projects, records…"
                className="block w-full rounded-lg border-none bg-slate-50 py-2 pl-9 pr-8 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#fbc037]/50"
            />

            {/* Clear button — only visible when there is a value */}
            {query && (
                <button
                    type="button"
                    onClick={clear}
                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Clear search"
                >
                    <X size={14} />
                </button>
            )}
        </div>
    );
}
