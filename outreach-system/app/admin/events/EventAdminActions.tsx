'use client';

import { useState } from 'react';
import { deleteEvent } from '../actions'; // We'll assume update isn't needed inline for now, or we can add a modal later
import { Trash2, Edit, MoreHorizontal, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface EventAdminActionsProps {
    eventId: string;
    eventTitle: string;
}

export default function EventAdminActions({ eventId, eventTitle }: EventAdminActionsProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteEvent(eventId);
        if (result.success) {
            router.refresh();
        } else {
            alert("Failed to delete event: " + result.message);
            setIsDeleting(false);
            setShowConfirm(false);
        }
    };

    if (showConfirm) {
        return (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
                <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    Confirm?
                </span>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-3 py-1 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition-colors flex items-center gap-1"
                >
                    {isDeleting ? <Loader2 size={12} className="animate-spin" /> : "Yes, Delete"}
                </button>
                <button
                    onClick={() => setShowConfirm(false)}
                    disabled={isDeleting}
                    className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Link
                href={`/dashboard/event/${eventId}/builder`}
                className="p-2 text-slate-400 hover:text-brand-dark hover:bg-slate-50 rounded-lg transition-colors"
                title="Edit Event"
            >
                <Edit size={16} />
            </Link>
            <button
                onClick={() => setShowConfirm(true)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Event"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
}
