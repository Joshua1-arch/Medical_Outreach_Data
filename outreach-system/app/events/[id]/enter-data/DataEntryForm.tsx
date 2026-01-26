'use client';

import { useState, useEffect, useCallback } from 'react';
import { submitRecord, searchPatientHistory } from '../../actions';
import { CheckCircle, AlertCircle, RefreshCw, History, Clock, AlertTriangle } from 'lucide-react';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Spinner } from '@/components/ui/Spinner';

type FormField = {
    label: string;
    type: string;
    options?: string[];
    required: boolean;
    width?: 'full' | 'half';
};

type PatientHistory = {
    _id: string;
    eventTitle: string;
    eventDate: string;
    recordDate: string;
    timeAgo: string;
    vitals: Record<string, string>;
};

type Props = {
    eventId: string;
    eventTitle: string;
    formFields: FormField[];
    initialData?: Record<string, any>;
    onSubmit?: (data: any) => Promise<any>;
    submitButtonText?: string;
};

export default function DataEntryForm({ eventId, eventTitle, formFields, initialData = {}, onSubmit, submitButtonText = "Submit Record" }: Props) {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [retrievalCode, setRetrievalCode] = useState('');
    const [formData, setFormData] = useState<Record<string, any>>(initialData);

    // Patient history tracking
    const [patientHistory, setPatientHistory] = useState<PatientHistory[] | null>(null);
    const [isSearchingHistory, setIsSearchingHistory] = useState(false);
    const [historySearched, setHistorySearched] = useState(false);

    // Update formData if initialData changes (e.g. after fetch)
    useEffect(() => {
        if (Object.keys(initialData).length > 0) {
            setFormData(initialData);
        }
    }, [initialData]);

    // Debounced patient history search
    const searchHistory = useCallback(async () => {
        // Check if we have enough identifying info
        const hasName = Object.entries(formData).some(([key, value]) =>
            key.toLowerCase().includes('name') && value && String(value).trim().length > 2
        );
        const hasPhone = Object.entries(formData).some(([key, value]) =>
            (key.toLowerCase().includes('phone') || key.toLowerCase().includes('mobile')) && value
        );
        const hasGender = Object.entries(formData).some(([key, value]) =>
            (key.toLowerCase().includes('gender') || key.toLowerCase().includes('sex')) && value
        );

        if (hasName && (hasPhone || hasGender)) {
            setIsSearchingHistory(true);
            try {
                const result = await searchPatientHistory(formData, eventId);
                if (result.success && result.found && result.history) {
                    setPatientHistory(result.history as PatientHistory[]);
                } else {
                    setPatientHistory(null);
                }
                setHistorySearched(true);
            } catch (err) {
                console.error('History search error:', err);
            }
            setIsSearchingHistory(false);
        }
    }, [formData, eventId]);

    // Trigger history search when identifying fields change
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!historySearched && Object.keys(formData).length > 0) {
                searchHistory();
            }
        }, 800); // Debounce 800ms

        return () => clearTimeout(timer);
    }, [formData, searchHistory, historySearched]);


    // Auto-calculate BMI
    useEffect(() => {
        const weight = parseFloat(formData['Weight (kg)'] || formData['Weight']);
        const height = parseFloat(formData['Height (cm)'] || formData['Height']);

        if (!isNaN(weight) && !isNaN(height) && height > 0) {
            const heightInMeters = height / 100;
            const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

            // Only update if changed to avoid loop
            if (formData['BMI'] !== bmi) {
                setFormData(prev => ({ ...prev, 'BMI': bmi }));
            }
        }
    }, [formData]);

    // Blood Donation Compatibility Logic
    const [compatibility, setCompatibility] = useState<{ fit: boolean | null, recipients: string[] } | null>(null);

    useEffect(() => {
        const group = formData['Blood Group'];
        const rh = formData['Rhesus'];

        if (group && rh) {
            // Calculate Recipients
            const isRhPos = rh === 'Positive';
            let recipients: string[] = [];

            // Logic:
            // O- : Universal -> All
            // O+ : O+, A+, B+, AB+
            // A- : A-, A+, AB-, AB+
            // A+ : A+, AB+
            // B- : B-, B+, AB-, AB+
            // B+ : B+, AB+
            // AB- : AB-, AB+
            // AB+ : AB+ Only

            if (group === 'O') {
                if (!isRhPos) recipients = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
                else recipients = ['O+', 'A+', 'B+', 'AB+'];
            } else if (group === 'A') {
                if (!isRhPos) recipients = ['A-', 'A+', 'AB-', 'AB+'];
                else recipients = ['A+', 'AB+'];
            } else if (group === 'B') {
                if (!isRhPos) recipients = ['B-', 'B+', 'AB-', 'AB+'];
                else recipients = ['B+', 'AB+'];
            } else if (group === 'AB') {
                if (!isRhPos) recipients = ['AB-', 'AB+'];
                else recipients = ['AB+'];
            }

            // Check Fitness (Basic checks if fields exist)
            let fit = true;
            const pcv = parseFloat(formData['PCV']);
            const weight = parseFloat(formData['Weight (kg)'] || formData['Weight']);
            const hiv = formData['HIV'];
            const hbsag = formData['HBsAg'];

            // Only mark as strictly UNFIT if we know for sure.
            // If fields are missing, we can't say for sure, but prompt asks "Fit to Donate? [Check other fields]"

            if (!isNaN(pcv) && pcv < 38) fit = false;
            if (!isNaN(weight) && weight < 50) fit = false;
            if (hiv === 'Reactive') fit = false;
            if (hbsag === 'Reactive') fit = false;

            setCompatibility({ fit, recipients });
        } else {
            setCompatibility(null);
        }
    }, [formData]);

    const handleInputChange = (label: string, value: any) => {
        setFormData(prev => ({ ...prev, [label]: value }));
        // Reset history search when identifying fields change
        if (label.toLowerCase().includes('name') ||
            label.toLowerCase().includes('phone') ||
            label.toLowerCase().includes('gender')) {
            setHistorySearched(false);
            setPatientHistory(null);
        }
    };

    const handleAction = async () => {
        setError('');
        setSuccess('');
        setRetrievalCode('');

        // Validate required fields
        const missingFields = formFields.filter(f => f.required && !formData[f.label]);
        if (missingFields.length > 0) {
            setError(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`);
            return;
        }

        let result;
        if (onSubmit) {
            result = await onSubmit(formData);
        } else {
            try {
                result = await submitRecord(eventId, formData);
            } catch (err) {
                // Network error or server unreachable
                console.error("Submission error:", err);

                // Fallback to offline save
                const unsynced = JSON.parse(localStorage.getItem('unsynced_records') || '[]');
                unsynced.push({
                    eventId,
                    data: formData,
                    timestamp: Date.now()
                });
                localStorage.setItem('unsynced_records', JSON.stringify(unsynced));

                // Dispatch event for SyncManager
                window.dispatchEvent(new Event('recordSavedOffline'));

                result = { success: true, message: 'Saved offline! Will sync when online.' };
                // We fake success so form clears
            }
        }

        if (result.success) {
            setSuccess(result.message);
            if (result.code) setRetrievalCode(result.code);

            if (!onSubmit) {
                // Default behavior: reset
                setFormData({});
                setPatientHistory(null);
                setHistorySearched(false);
            }
        } else {
            setError(result.message);
        }
    };

    const renderField = (field: FormField) => {
        const { label, type, required } = field;
        const commonClasses = "w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors";

        switch (type) {
            case 'textarea':
                return (
                    <textarea
                        name={label}
                        rows={3}
                        required={required}
                        className={commonClasses}
                        onChange={(e) => handleInputChange(label, e.target.value)}
                        value={formData[label] || ''}
                    />
                );
            case 'select':
                return (
                    <select
                        name={label}
                        required={required}
                        className={commonClasses}
                        onChange={(e) => handleInputChange(label, e.target.value)}
                        value={formData[label] || ''}
                    >
                        <option value="">Select...</option>
                        {field.options?.map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                        ))}
                    </select>
                );
            case 'number':
                return (
                    <input
                        name={label}
                        type="number"
                        required={required}
                        className={commonClasses}
                        onChange={(e) => handleInputChange(label, e.target.value)}
                        value={formData[label] || ''}
                    />
                );
            case 'date':
                return (
                    <input
                        name={label}
                        type="date"
                        required={required}
                        className={commonClasses}
                        onChange={(e) => handleInputChange(label, e.target.value)}
                        value={formData[label] || ''}
                    />
                );
            default:
                return (
                    <input
                        name={label}
                        type="text"
                        required={required}
                        className={commonClasses}
                        onChange={(e) => handleInputChange(label, e.target.value)}
                        value={formData[label] || ''}
                    />
                );
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800 mb-1">{eventTitle}</h1>
                    <p className="text-slate-500">Enter patient data for this event.</p>
                </div>

                {success ? (
                    <div className="py-8 text-center bg-green-50 rounded-xl border border-green-100">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Success!</h2>
                        <p className="text-slate-600 mb-6">{success}</p>

                        {retrievalCode && (
                            <div className="mb-8 p-4 bg-white border-2 border-dashed border-emerald-200 rounded-lg inline-block text-left max-w-sm">
                                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1 text-center">Retrieval Code</p>
                                <div className="text-3xl font-mono font-bold text-slate-800 text-center tracking-wider selection:bg-emerald-100">
                                    {retrievalCode}
                                </div>
                                <p className="text-xs text-slate-400 mt-2 text-center">
                                    Write this code down to update this record later.
                                </p>
                            </div>
                        )}

                        <div className="flex justify-center">
                            <button
                                onClick={() => {
                                    setSuccess('');
                                    setRetrievalCode('');
                                    setFormData({}); // Clear form for next entry
                                }}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold shadow-md"
                            >
                                <RefreshCw className="w-4 h-4" />
                                {retrievalCode ? 'Register Next Patient' : 'Continue'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-800">
                                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Patient History Card */}
                        {isSearchingHistory && (
                            <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
                                <Spinner size={18} className="text-slate-500" />
                                <span className="text-slate-600 text-sm">Checking for patient history...</span>
                            </div>
                        )}

                        {patientHistory && patientHistory.length > 0 && (
                            <div className="mb-6 p-5 bg-amber-50 border-2 border-amber-200 rounded-xl animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="p-2 bg-amber-100 rounded-lg">
                                        <AlertTriangle size={20} className="text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-amber-800">⚠️ Patient History Found</h3>
                                        <p className="text-sm text-amber-700">
                                            This patient was seen {patientHistory.length} time{patientHistory.length > 1 ? 's' : ''} before
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {patientHistory.map((record, index) => (
                                        <div key={record._id} className="bg-white/80 rounded-lg p-4 border border-amber-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock size={14} className="text-amber-600" />
                                                <span className="text-sm font-semibold text-slate-700">{record.timeAgo}</span>
                                                <span className="text-slate-400">•</span>
                                                <span className="text-sm text-slate-600">{record.eventTitle}</span>
                                            </div>

                                            {Object.keys(record.vitals).length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.entries(record.vitals).map(([label, value]) => (
                                                        <span
                                                            key={label}
                                                            className="px-2 py-1 bg-amber-100/50 border border-amber-200 rounded text-xs font-medium text-amber-800"
                                                        >
                                                            <strong>{label}:</strong> {value}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
                                    <History size={12} />
                                    Compare with today's readings to track progress
                                </p>
                            </div>
                        )}

                        <form action={handleAction} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {formFields.map((field, index) => (
                                    <div
                                        key={index}
                                        className={field.width === 'half' ? 'col-span-1' : 'col-span-1 md:col-span-2'}
                                    >
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide text-[0.75rem]">
                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        {renderField(field)}
                                    </div>
                                ))}
                            </div>

                            {/* Compatibility Card - Real-time Feedback */}
                            {compatibility && (
                                <div className={`mt-8 p-6 rounded-xl border-2 transition-all animate-in fade-in slide-in-from-bottom-4 ${compatibility.fit ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-full flex items-center justify-center shrink-0 ${compatibility.fit ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                            {compatibility.fit ? <CheckCircle size={28} /> : <AlertCircle size={28} />}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`text-lg font-bold mb-1 ${compatibility.fit ? 'text-emerald-800' : 'text-red-800'}`}>
                                                {compatibility.fit ? 'Likely Fit to Donate' : 'Check Deferral Criteria'}
                                            </h3>
                                            <p className={`text-sm mb-4 ${compatibility.fit ? 'text-emerald-700' : 'text-red-700'}`}>
                                                {compatibility.fit
                                                    ? 'Based on current entries, this donor meets the basic criteria.'
                                                    : 'Warning: One or more vitals or screening results indicate the donor may be unfit.'}
                                            </p>

                                            <div className="bg-white/60 rounded-lg p-4 border border-black/5">
                                                <div className="flex items-center gap-2 mb-2 font-semibold text-slate-700">
                                                    <span className="text-xl">🩸</span>
                                                    <span>Compatible Recipients</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {compatibility.recipients.map((r, i) => (
                                                        <span key={i} className="px-3 py-1 bg-white border border-slate-200 shadow-sm rounded-full text-sm font-bold text-slate-700">
                                                            {r}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 border-t border-slate-200">
                                <SubmitButton className="w-full px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed font-semibold transition-colors flex items-center justify-center gap-2 shadow-md">
                                    {submitButtonText}
                                </SubmitButton>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div >
    );
}
