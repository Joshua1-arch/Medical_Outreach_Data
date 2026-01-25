'use client';

import { useState, useEffect } from 'react';
import { submitRecord } from '../../actions';
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

type FormField = {
    label: string;
    type: string;
    options?: string[];
    required: boolean;
    width?: 'full' | 'half';
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [retrievalCode, setRetrievalCode] = useState('');
    const [formData, setFormData] = useState<Record<string, any>>(initialData);

    // Update formData if initialData changes (e.g. after fetch)
    useEffect(() => {
        if (Object.keys(initialData).length > 0) {
            setFormData(initialData);
        }
    }, [initialData]);

    // Auto-calculate BMI
    useEffect(() => {
        const weight = parseFloat(formData['Weight (kg)']);
        const height = parseFloat(formData['Height (cm)']);

        if (!isNaN(weight) && !isNaN(height) && height > 0) {
            const heightInMeters = height / 100;
            const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

            // Only update if changed to avoid loop
            if (formData['BMI'] !== bmi) {
                setFormData(prev => ({ ...prev, 'BMI': bmi }));
            }
        }
    }, [formData['Weight (kg)'], formData['Height (cm)'], formData['BMI']]);

    const handleInputChange = (label: string, value: any) => {
        setFormData(prev => ({ ...prev, [label]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess('');
        setRetrievalCode('');

        // Validate required fields
        // Note: For Update mode, maybe we relax this? But for now stick to schema.
        const missingFields = formFields.filter(f => f.required && !formData[f.label]);
        if (missingFields.length > 0) {
            setError(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`);
            setIsSubmitting(false);
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

            if (!result.code) {
                // Only clear format if it's a fresh submit (not updating) mechanism, 
                // OR if we want to reset. 
                // But specifically for public "NEW", we show code then reset.
                // For "UPDATE", we might just show success.
                // Let's rely on the parent or user action.
                // Actually, if it's NEW (has code), we keep the code on screen.
            }

            if (!onSubmit) {
                // Default behavior: reset
                setFormData({});
                (e.target as HTMLFormElement).reset();
            }
        } else {
            setError(result.message);
        }

        setIsSubmitting(false);
    };

    const renderField = (field: FormField) => {
        const { label, type, required } = field;
        const commonClasses = "w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors";

        switch (type) {
            case 'textarea':
                return (
                    <textarea
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

                        <form onSubmit={handleSubmit} className="space-y-6">
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

                            <div className="pt-6 border-t border-slate-200">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed font-semibold transition-colors flex items-center justify-center gap-2 shadow-md"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        submitButtonText
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
