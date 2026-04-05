'use client';

import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import { Spinner } from '@/components/ui/Spinner';

export default function EventGatekeeper({
    eventId,
    maxConcurrentUsers,
    children
}: {
    eventId: string;
    maxConcurrentUsers: number;
    children: React.ReactNode;
}) {
    const [isWaiting, setIsWaiting] = useState(false);
    const [isConnecting, setIsConnecting] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!maxConcurrentUsers || maxConcurrentUsers <= 0) {
            setIsConnecting(false);
            return;
        }

        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
            authEndpoint: '/api/pusher/auth',
        });

        const channel = pusher.subscribe(`presence-event-${eventId}`);

        channel.bind('pusher:subscription_succeeded', (members: any) => {
            if (members.count > maxConcurrentUsers) {
                setIsWaiting(true);
            } else {
                setIsWaiting(false);
            }
            setIsConnecting(false);
        });

        channel.bind('pusher:member_removed', () => {
            // @ts-ignore - access members from channel
            if (channel.members && channel.members.count <= maxConcurrentUsers) {
                setIsWaiting(false);
            }
        });
        
        channel.bind('pusher:subscription_error', () => {
             setError("Failed to connect to the waiting room. Please try again later.");
             setIsConnecting(false);
        });

        return () => {
            channel.unbind_all();
            pusher.unsubscribe(`presence-event-${eventId}`);
            pusher.disconnect();
        };
    }, [eventId, maxConcurrentUsers]);

    if (!maxConcurrentUsers || maxConcurrentUsers <= 0) {
        return <>{children}</>;
    }

    if (error) {
         return (
             <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center border border-red-200 bg-red-50 rounded-xl max-w-md mx-auto mt-12">
                 <p className="text-red-600 font-medium">{error}</p>
             </div>
         );
    }

    if (isConnecting) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center space-y-4">
                 <Spinner size={40} className="text-[#fbc037]" />
                 <p className="text-slate-500 font-medium animate-pulse">Checking room capacity...</p>
            </div>
        );
    }

    if (isWaiting) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
                <div className="bg-white border border-slate-200 shadow-xl rounded-3xl p-8 max-w-md w-full space-y-6">
                    <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                        <div className="absolute inset-0 border-4 border-[#fbc037]/30 rounded-full animate-ping opacity-75"></div>
                        <div className="absolute inset-2 border-4 border-[#fbc037] rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Room at Capacity</h2>
                        <p className="text-slate-500 leading-relaxed text-sm">
                            This event is currently full. You are in the virtual waiting room. 
                            Please keep this page open; you will automatically be let in as soon as a spot opens up.
                        </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-6">
                        <div className="flex items-center justify-center gap-2 text-sm text-slate-600 font-medium">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                            You are actively waiting
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
