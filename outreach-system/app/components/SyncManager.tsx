'use client';

import { useEffect, useState } from 'react';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { submitRecord } from '@/app/events/actions';
import { Spinner } from '@/components/ui/Spinner';

export default function SyncManager() {
    const [isOnline, setIsOnline] = useState(true);
    const [unsyncedCount, setUnsyncedCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    // Initial check and listeners
    useEffect(() => {
        // Set initial status
        setIsOnline(navigator.onLine);
        checkStorage();

        const handleOnline = () => {
            setIsOnline(true);
            syncData();
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        const handleStorageChange = () => {
            checkStorage();
        };

        // Custom event triggered by our code when we save offline
        const handleRecordSaved = () => {
            checkStorage();
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('recordSavedOffline', handleRecordSaved);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('recordSavedOffline', handleRecordSaved);
        };
    }, []);

    // Check localStorage for any 'unsynced_records'
    const checkStorage = () => {
        if (typeof window !== 'undefined') {
            const records = JSON.parse(localStorage.getItem('unsynced_records') || '[]');
            setUnsyncedCount(records.length);
        }
    };

    // The sync function
    const syncData = async () => {
        if (isSyncing) return;
        const recordsRaw = localStorage.getItem('unsynced_records');
        if (!recordsRaw) return;

        const records = JSON.parse(recordsRaw);
        if (records.length === 0) return;

        setIsSyncing(true);

        const failedRecords = [];
        let successCount = 0;

        for (const record of records) {
            try {
                // Call the server action
                // record has: { eventId, data, timestamp }
                const result = await submitRecord(record.eventId, record.data);

                if (result.success) {
                    successCount++;
                } else {
                    failedRecords.push(record);
                    console.error("Sync failed for record:", result.message);
                }
            } catch (error) {
                console.error("Sync error:", error);
                failedRecords.push(record);
            }
        }

        // Update storage with truly failed ones
        localStorage.setItem('unsynced_records', JSON.stringify(failedRecords));
        setUnsyncedCount(failedRecords.length);
        setIsSyncing(false);

        if (successCount > 0) {
            // Optional: Trigger a toast or some feedback
            console.log(`Synced ${successCount} records.`);
        }
    };

    // If everything is fine (Online + No unsynced data), don't show anything?
    // The user wants a visible indicator.

    // UI Logic:
    // Online + Synced: Green Cloud
    // Online + Syncing: Spinning Refresh
    // Offline: Red Cloud + Count if > 0

    if (!isOnline) {
        return (
            <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-red-100 text-red-700 rounded-full shadow-lg border border-red-200 animate-in fade-in slide-in-from-bottom-2">
                <CloudOff size={20} />
                <span className="font-bold text-sm">Offline</span>
                {unsyncedCount > 0 && (
                    <span className="ml-1 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {unsyncedCount} Saved
                    </span>
                )}
            </div>
        );
    }

    if (isSyncing) {
        return (
            <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-full shadow-lg border border-blue-200 animate-in fade-in slide-in-from-bottom-2">
                <Spinner size={20} className="text-blue-700" />
                <span className="font-bold text-sm">Syncing...</span>
            </div>
        );
    }

    if (unsyncedCount > 0) {
        return (
            <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-amber-100 text-amber-700 rounded-full shadow-lg border border-amber-200 animate-in fade-in slide-in-from-bottom-2 cursor-pointer" onClick={syncData}>
                <RefreshCw size={20} />
                <span className="font-bold text-sm">Sync Required</span>
                <span className="ml-1 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unsyncedCount}
                </span>
            </div>
        );
    }

    // Default: Online & Synced (Green Cloud) - Maybe hide after a few seconds? 
    // Or keep it small.
    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-full shadow-lg border border-green-200 opacity-75 hover:opacity-100 transition-opacity">
            <Cloud size={20} />
            <span className="font-bold text-sm">Online</span>
        </div>
    );
}
