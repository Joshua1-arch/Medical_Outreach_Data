'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit?: number;
}

export default function PaginationControls({
    currentPage,
    totalPages,
    totalCount,
    limit = 50,
}: PaginationControlsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createPageURL = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams?.toString() || '');
        params.set('page', pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            router.push(createPageURL(currentPage - 1));
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            router.push(createPageURL(currentPage + 1));
        }
    };

    const startItem = totalCount > 0 ? (currentPage - 1) * limit + 1 : 0;
    const endItem = Math.min(currentPage * limit, totalCount);

    if (totalCount === 0) return null;

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 bg-white">
            <p className="text-sm text-slate-500 font-medium">
                Showing <span className="font-bold text-slate-900">{startItem}</span> to{' '}
                <span className="font-bold text-slate-900">{endItem}</span> of{' '}
                <span className="font-bold text-slate-900">{totalCount}</span> results
            </p>
            <div className="flex items-center gap-3">
                <button
                    onClick={handlePrevious}
                    disabled={currentPage <= 1}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                    <ChevronLeft size={16} className="-ml-1 text-slate-500" />
                    Previous
                </button>
                
                <div className="hidden sm:flex items-center justify-center px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg shadow-inner">
                    <span className="text-sm font-semibold text-slate-700">
                        Page <span className="text-slate-900">{currentPage}</span> of <span className="text-slate-900">{totalPages}</span>
                    </span>
                </div>

                <button
                    onClick={handleNext}
                    disabled={currentPage >= totalPages}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                    Next
                    <ChevronRight size={16} className="-mr-1 text-slate-500" />
                </button>
            </div>
        </div>
    );
}
