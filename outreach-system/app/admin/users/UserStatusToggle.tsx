'use client';

import { useState } from 'react';
import { toggleUserStatus } from '../actions';
import { ShieldAlert } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

interface UserStatusToggleProps {
    userId: string;
    currentStatus: string;
    currentUserRole: string; // To prevent admins from locking themselves out if we add that check later
}

export default function UserStatusToggle({ userId, currentStatus }: UserStatusToggleProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(currentStatus);

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === status) return;

        setIsLoading(true);
        setStatus(newStatus); // Optimistic update

        const result = await toggleUserStatus(userId, newStatus);

        if (!result.success) {
            // Revert on failure
            setStatus(currentStatus);
            alert(result.message);
        }
        setIsLoading(false);
    };

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'suspended': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'rejected': return 'bg-red-50 text-red-700 border-red-100';
            case 'pending': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="relative inline-block">
            {isLoading && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Spinner size={12} className="text-slate-400" />
                </div>
            )}
            <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isLoading}
                className={`
                    appearance-none pl-3 pr-8 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#fbc037]/20 transition-all
                    ${getStatusColor(status)}
                `}
            >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
                <option value="pending">Pending</option>
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6L0.535898 0L7.4641 0L4 6Z" fill="currentColor" />
                </svg>
            </div>
        </div>
    );
}
