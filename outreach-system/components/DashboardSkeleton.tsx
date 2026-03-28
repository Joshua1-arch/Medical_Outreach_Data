import React from 'react';

export default function DashboardSkeleton() {
    return (
        <div className="w-full animate-pulse space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-3">
                    <div className="h-8 w-64 rounded-lg bg-slate-200"></div>
                    <div className="h-4 w-40 rounded-lg bg-slate-100"></div>
                </div>
                <div className="h-10 w-32 rounded-lg bg-slate-200"></div>
            </div>

            {/* Metrics Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="space-y-2">
                                <div className="h-3 w-16 rounded bg-slate-100"></div>
                                <div className="h-6 w-12 rounded bg-slate-200"></div>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-slate-100"></div>
                        </div>
                        <div className="h-3 w-24 rounded bg-slate-100"></div>
                    </div>
                ))}
            </div>

            {/* Main Content Area Skeleton */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <div className="h-5 w-32 rounded bg-slate-200"></div>
                    <div className="flex space-x-2">
                        <div className="h-8 w-24 rounded bg-slate-100"></div>
                        <div className="h-8 w-24 rounded bg-slate-100"></div>
                    </div>
                </div>
                
                {/* Table Rows Skeleton */}
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex justify-between items-center py-2">
                            <div className="flex space-x-4">
                                <div className="h-10 w-10 rounded bg-slate-100"></div>
                                <div className="space-y-2">
                                    <div className="h-4 w-48 rounded bg-slate-200"></div>
                                    <div className="h-3 w-32 rounded bg-slate-100"></div>
                                </div>
                            </div>
                            <div className="h-6 w-20 rounded-full bg-slate-100"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
