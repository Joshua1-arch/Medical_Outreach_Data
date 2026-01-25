'use client';

import { useState } from 'react';
import DataEntryForm from '@/app/events/[id]/enter-data/DataEntryForm';
import { Lock, ArrowRight, ShieldCheck, UserPlus, RefreshCw, Search, Loader2 } from 'lucide-react';
import { getRecordByCode, updateRecordByCode } from '@/app/events/actions';

export default function PublicEventClient({ event }: { event: any }) {
    const hasPassword = !!event.accessCode;
    const [isUnlocked, setIsUnlocked] = useState(!hasPassword);
    const [passwordInput, setPasswordInput] = useState('');
    const [error, setError] = useState('');

    // Multi-Stage Logic
    const [entryMode, setEntryMode] = useState<'new' | 'update'>('new');
    const [retrievalCodeInput, setRetrievalCodeInput] = useState('');
    const [retrievalError, setRetrievalError] = useState('');
    const [isFetchingInfo, setIsFetchingInfo] = useState(false);
    const [recordToUpdate, setRecordToUpdate] = useState<any>(null);

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordInput === event.accessCode) {
            setIsUnlocked(true);
            setError('');
        } else {
            setError('Incorrect access code');
        }
    };

    const handleFetchRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!retrievalCodeInput) return;

        setIsFetchingInfo(true);
        setRetrievalError('');
        setRecordToUpdate(null);

        const result = await getRecordByCode(retrievalCodeInput.trim().toUpperCase());

        if (result.success) {
            setRecordToUpdate(result.data);
        } else {
            setRetrievalError(result.message || 'Record not found. Check the code.');
        }
        setIsFetchingInfo(false);
    };

    if (!isUnlocked) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock size={32} />
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900 mb-2">{event.title}</h1>
                    <p className="text-slate-500 mb-8">This event is protected. Please enter the access code provided by the organizer.</p>

                    <form onSubmit={handleUnlock} className="space-y-4">
                        <input
                            type="text"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            className="w-full px-4 py-3 text-center text-lg tracking-widest border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none uppercase"
                            placeholder="ACCESS CODE"
                        />
                        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                        <button
                            type="submit"
                            className="w-full py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-semibold flex items-center justify-center gap-2"
                        >
                            Unlock Event <ArrowRight size={18} />
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-3xl mx-auto mb-8">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wide mb-4">
                        <ShieldCheck size={14} /> Secure Data Collection
                    </div>
                </div>

                {/* MODE SWITCHER */}
                <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex mb-8">
                    <button
                        onClick={() => { setEntryMode('new'); setRecordToUpdate(null); }}
                        className={`flex-1 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${entryMode === 'new' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <UserPlus size={16} /> New Patient
                    </button>
                    <button
                        onClick={() => { setEntryMode('update'); }}
                        className={`flex-1 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${entryMode === 'update' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <RefreshCw size={16} /> Update Record
                    </button>
                </div>

                {/* NEW MODE */}
                {entryMode === 'new' && (
                    <DataEntryForm
                        eventId={event._id}
                        eventTitle={event.title}
                        formFields={event.formFields || []}
                        submitButtonText="Register Patient"
                    />
                )}

                {/* UPDATE MODE */}
                {entryMode === 'update' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        {!recordToUpdate ? (
                            <div className="p-8 text-center">
                                <h2 className="text-xl font-bold text-slate-800 mb-2">Continue Existing Record</h2>
                                <p className="text-slate-500 mb-6">Enter the Retrieval Code provided during registration.</p>

                                <form onSubmit={handleFetchRecord} className="max-w-sm mx-auto space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
                                        <input
                                            type="text"
                                            value={retrievalCodeInput}
                                            onChange={(e) => setRetrievalCodeInput(e.target.value.toUpperCase())}
                                            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none uppercase font-mono tracking-widest text-lg"
                                            placeholder="ENTER CODE (e.g. A7X92B)"
                                        />
                                    </div>
                                    {retrievalError && <p className="text-red-500 text-sm font-medium">{retrievalError}</p>}
                                    <button
                                        type="submit"
                                        disabled={isFetchingInfo}
                                        className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isFetchingInfo ? <Loader2 className="animate-spin" /> : 'Find Record'}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="bg-indigo-50 px-8 py-4 border-b border-indigo-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-indigo-800 font-medium">
                                        <span className="bg-white px-2 py-0.5 rounded border border-indigo-200 text-xs font-mono uppercase">{recordToUpdate.retrievalCode}</span>
                                        <span>Editing Record</span>
                                    </div>
                                    <button onClick={() => setRecordToUpdate(null)} className="text-xs text-indigo-600 hover:text-indigo-900 underline">Change</button>
                                </div>
                                <div className="p-2 md:p-0"> {/* Padding adjustment */}
                                    <DataEntryForm
                                        eventId={event._id}
                                        eventTitle={event.title}
                                        formFields={event.formFields || []}
                                        initialData={recordToUpdate.data}
                                        submitButtonText="Update Record"
                                        onSubmit={async (data) => {
                                            return await updateRecordByCode(recordToUpdate.retrievalCode, data);
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-12 text-center text-slate-400 text-sm">
                Powered by MedOutreach
            </div>
        </div>
    );
}
