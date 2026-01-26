'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateEventSchema, updateEventSettings } from '@/app/dashboard/actions';
import { deleteRecord, updateRecordById } from '@/app/events/actions';
import {
    LayoutTemplate, Settings, Share2, MessageSquare, Activity,
    PlusCircle, Trash2, Save, Copy, Eye, Lock, Globe, AlertCircle, Edit, X, RotateCw, Download, Package
} from 'lucide-react';
import Link from 'next/link';
import { Spinner } from '@/components/ui/Spinner';

type FormField = {
    label: string;
    type: string;
    options?: string[];
    required: boolean;
    width?: 'full' | 'half';
};

export default function EventBuilderClient({ event, records }: { event: any, records: any[] }) {
    const [activeTab, setActiveTab] = useState('builder');
    const [formFields, setFormFields] = useState<FormField[]>(event.formFields || []);
    const [isSaving, setIsSaving] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const router = useRouter();

    // Settings State
    const [isPublic, setIsPublic] = useState(event.isPublic || false);
    const [accessCode, setAccessCode] = useState(event.accessCode || '');

    // Record Editing Logic
    const [editingRecord, setEditingRecord] = useState<any>(null);
    const [isUpdatingRecord, setIsUpdatingRecord] = useState(false);

    const handleUpdateRecord = async () => {
        if (!editingRecord) return;
        setIsUpdatingRecord(true);
        const result = await updateRecordById(editingRecord._id, editingRecord.data);
        if (result.success) {
            alert('Record updated successfully');
            setEditingRecord(null);
            window.location.reload();
        } else {
            alert('Failed to update: ' + result.message);
        }
        setIsUpdatingRecord(false);
    };

    const handleDeleteRecord = async (id: string) => {
        if (!confirm('Are you sure you want to delete this response?')) return;
        const result = await deleteRecord(id);
        if (result.success) {
            window.location.reload();
        } else {
            alert('Failed to delete');
        }
    };

    // Builder Logic
    const addField = () => {
        setFormFields([...formFields, { label: '', type: 'text', required: false, width: 'full' }]);
    };

    const removeField = (index: number) => {
        setFormFields(formFields.filter((_, i) => i !== index));
    };

    const updateField = (index: number, key: keyof FormField, value: any) => {
        const updated = [...formFields];
        updated[index] = { ...updated[index], [key]: value };
        setFormFields(updated);
    };

    const saveSchema = async () => {
        setIsSaving(true);
        const result = await updateEventSchema(event._id, formFields);
        alert(result.message);
        setIsSaving(false);
    };

    const saveSettings = async () => {
        setIsSaving(true);
        const result = await updateEventSettings(event._id, isPublic, accessCode);
        alert(result.message);
        setIsSaving(false);
    };

    const handleDownloadCSV = () => {
        if (!records.length) return alert('No records to download');

        // Headers: Only form fields
        const headers = formFields.map(f => f.label);

        const rows = records.map(rec => {
            // Values: Only form data
            const fieldValues = formFields.map(f => {
                let val = rec.data?.[f.label] || '';
                if (typeof val === 'string') {
                    // Escape quotes and wrap in quotes if contains comma/newline
                    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
                        val = `"${val.replace(/"/g, '""')}"`;
                    }
                }
                return val;
            });

            return fieldValues.join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${event.title.replace(/[^a-z0-9]/gi, '_')}_responses.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/e/${event._id}` : '';

    return (
        <div className="space-y-6">
            {/* Header Tabs */}
            {/* ... */}

            {/* IN RENDER - RESPONSES TAB */}
            {/* ... */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800">Collected Responses</h2>
                <button
                    onClick={handleDownloadCSV}
                    className="text-sm bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 font-medium transition-colors flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                    Download CSV
                </button>
            </div>
            {/* Inventory Tracker Card */}
            {event.inventory && event.inventory.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {event.inventory.map((item: any, i: number) => {
                        const used = records.length;
                        const remaining = item.startingStock - used;
                        const percentage = Math.max(0, (remaining / item.startingStock) * 100);
                        const isLow = percentage < 20;

                        return (
                            <div key={i} className={`bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between ${isLow ? 'border-red-200 bg-red-50' : 'border-slate-200'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-slate-700">{item.itemName}</h4>
                                        <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Stock Level</p>
                                    </div>
                                    <div className={`p-2 rounded-lg ${isLow ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        <Package size={20} />
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <div className="flex items-end gap-2 mb-1">
                                        <span className={`text-3xl font-bold ${isLow ? 'text-red-700' : 'text-slate-800'}`}>{remaining}</span>
                                        <span className="text-sm text-slate-500 mb-1">/ {item.startingStock} left</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${isLow ? 'bg-red-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    {isLow && <p className="text-xs text-red-600 font-bold mt-2 flex items-center gap-1"><AlertCircle size={12} /> Low Stock Warning</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="flex items-center gap-6 overflow-x-auto pb-px scrollbar-hide">
                <button
                    onClick={() => setActiveTab('builder')}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 font-serif font-bold transition-all whitespace-nowrap ${activeTab === 'builder' ? 'border-brand-gold text-brand-dark' : 'border-transparent text-slate-500 hover:text-brand-dark'}`}
                >
                    <LayoutTemplate size={18} /> Form Builder
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 font-serif font-bold transition-all whitespace-nowrap ${activeTab === 'settings' ? 'border-brand-gold text-brand-dark' : 'border-transparent text-slate-500 hover:text-brand-dark'}`}
                >
                    <Settings size={18} /> Settings
                </button>
                <button
                    onClick={() => setActiveTab('responses')}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 font-serif font-bold transition-all whitespace-nowrap ${activeTab === 'responses' ? 'border-brand-gold text-brand-dark' : 'border-transparent text-slate-500 hover:text-brand-dark'}`}
                >
                    <MessageSquare size={18} /> Responses <span className="text-xs bg-brand-cream px-2 py-0.5 rounded-full text-brand-dark border border-brand-gold/20">{records.length}</span>
                </button>
                <button
                    onClick={() => setActiveTab('share')}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 font-serif font-bold transition-all whitespace-nowrap ${activeTab === 'share' ? 'border-brand-gold text-brand-dark' : 'border-transparent text-slate-500 hover:text-brand-dark'}`}
                >
                    <Share2 size={18} /> Share
                </button>
                <Link
                    href={`/dashboard/event/${event._id}/analytics`}
                    className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-slate-500 hover:text-brand-gold font-serif font-bold transition-colors whitespace-nowrap"
                >
                    <Activity size={18} /> Analytics
                </Link>
            </div>


            {/* TAB CONTENT */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px] p-6">


                {/* BUILDER TAB */}
                {activeTab === 'builder' && (
                    <div className="flex flex-col-reverse lg:flex-row h-[calc(100vh-250px)] min-h-[600px]">
                        {/* LEFT SIDEBAR - TOOLBOX */}
                        <div className="w-full lg:w-64 bg-slate-50 border-t lg:border-t-0 lg:border-r border-slate-200 p-4 overflow-y-auto shrink-0 max-h-[250px] lg:max-h-full">


                            {/* Template Section */}
                            <div className="mb-6 pb-6 border-b border-slate-200">
                                <h3 className="font-bold text-slate-700 mb-3 px-2">Quick Start Templates</h3>
                                <p className="text-xs text-slate-500 mb-4 px-2">
                                    Templates are <strong>copied</strong> into this event. Changing proper templates later won't affect this event.
                                </p>

                                <button
                                    onClick={async () => {
                                        setIsRefreshing(true);
                                        if (records.length > 0) {
                                            if (!confirm('⚠️ WARNING: This event already has captured data. Changing the form structure now may mismatch old records. Are you sure you want to proceed?')) {
                                                setIsRefreshing(false);
                                                return;
                                            }
                                        }

                                        if (formFields.length > 0) {
                                            if (!confirm('This will replace your current fields. Are you sure?')) {
                                                setIsRefreshing(false);
                                                return;
                                            }
                                        }

                                        // Simulate a small delay for better UX feel (or real async load if needed)
                                        await new Promise(r => setTimeout(r, 500));

                                        setFormFields([
                                            { label: 'Full Name', type: 'text', required: true, width: 'full' },
                                            { label: 'Age', type: 'number', required: true, width: 'half' },
                                            { label: 'Sex', type: 'select', options: ['Male', 'Female'], required: true, width: 'half' },
                                            { label: 'Phone Number', type: 'text', required: false, width: 'full' },
                                            { label: 'Systolic BP (mmHg)', type: 'number', required: false, width: 'half' },
                                            { label: 'Diastolic BP (mmHg)', type: 'number', required: false, width: 'half' },
                                            { label: 'Weight (kg)', type: 'number', required: false, width: 'half' },
                                            { label: 'Height (cm)', type: 'number', required: false, width: 'half' },
                                            { label: 'BMI', type: 'number', required: false, width: 'full' },
                                            { label: 'Temperature (C)', type: 'number', required: false, width: 'half' },
                                            { label: 'Malaria RDT', type: 'select', options: ['Positive', 'Negative', 'Not Done'], required: false, width: 'half' },
                                            { label: 'Remarks', type: 'textarea', required: false, width: 'full' }
                                        ]);
                                        setIsRefreshing(false);
                                    }}
                                    disabled={isRefreshing}
                                    className="w-full flex items-center gap-2 p-3 bg-brand-cream border border-brand-gold/30 text-brand-dark font-serif font-bold rounded-lg hover:bg-brand-gold/10 transition-colors shadow-sm mb-3 disabled:opacity-50"
                                >
                                    {isRefreshing ? <Spinner size={18} className="text-brand-gold" /> : <LayoutTemplate size={18} className="text-brand-gold" />}
                                    {isRefreshing ? 'Loading...' : 'Load Medical Template'}
                                </button>

                                <button
                                    onClick={async () => {
                                        setIsRefreshing(true);
                                        if (records.length > 0) {
                                            if (!confirm('⚠️ WARNING: This event already has captured data. Changing the form structure now may mismatch old records. Are you sure you want to proceed?')) {
                                                setIsRefreshing(false);
                                                return;
                                            }
                                        }

                                        if (formFields.length > 0) {
                                            if (!confirm('This will replace your current fields. Are you sure?')) {
                                                setIsRefreshing(false);
                                                return;
                                            }
                                        }

                                        await new Promise(r => setTimeout(r, 500));

                                        setFormFields([
                                            { label: 'Full Name', type: 'text', required: true, width: 'full' },
                                            { label: 'Age', type: 'number', required: true, width: 'half' },
                                            { label: 'Sex', type: 'select', options: ['Male', 'Female'], required: true, width: 'half' },
                                            { label: 'PCV', type: 'number', required: true, width: 'half' },
                                            { label: 'Weight (kg)', type: 'number', required: true, width: 'half' },
                                            { label: 'HBsAg', type: 'select', options: ['Non-Reactive', 'Reactive'], required: true, width: 'half' },
                                            { label: 'HIV', type: 'select', options: ['Non-Reactive', 'Reactive'], required: true, width: 'half' },
                                            { label: 'Blood Group', type: 'select', options: ['A', 'B', 'AB', 'O'], required: true, width: 'half' },
                                            { label: 'Rhesus', type: 'select', options: ['Positive', 'Negative'], required: true, width: 'half' },
                                            { label: 'Remarks', type: 'textarea', required: false, width: 'full' }
                                        ]);
                                        setIsRefreshing(false);
                                    }}
                                    disabled={isRefreshing}
                                    className="w-full flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-800 font-serif font-bold rounded-lg hover:bg-red-100 transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {isRefreshing ? <Spinner size={18} className="text-red-600" /> : <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" /></svg>}
                                    {isRefreshing ? 'Loading...' : 'Load Blood Drive Template'}
                                </button>
                            </div>

                            <h3 className="font-bold text-slate-700 mb-4 px-2">Form Elements</h3>
                            <div className="space-y-3">
                                <button onClick={() => setFormFields([...formFields, { label: 'New Text Question', type: 'text', required: true }])} className="w-full flex items-center gap-3 p-3 bg-white border border-slate-200 shadow-sm rounded-lg hover:border-brand-gold hover:text-brand-dark transition-all text-left group">
                                    <div className="p-1.5 bg-brand-cream rounded group-hover:bg-brand-gold group-hover:text-white transition-colors"><LayoutTemplate size={16} /></div>
                                    <span className="text-sm font-bold text-slate-600 group-hover:text-brand-dark">Short Text</span>
                                </button>
                                <button onClick={() => setFormFields([...formFields, { label: 'New Number Question', type: 'number', required: true }])} className="w-full flex items-center gap-3 p-3 bg-white border border-slate-200 shadow-sm rounded-lg hover:border-brand-gold hover:text-brand-dark transition-all text-left group">
                                    <div className="p-1.5 bg-brand-cream rounded group-hover:bg-brand-gold group-hover:text-white transition-colors"><LayoutTemplate size={16} /></div>
                                    <span className="text-sm font-bold text-slate-600 group-hover:text-brand-dark">Number</span>
                                </button>
                                <button onClick={() => setFormFields([...formFields, { label: 'New Date Field', type: 'date', required: true }])} className="w-full flex items-center gap-3 p-3 bg-white border border-slate-200 shadow-sm rounded-lg hover:border-brand-gold hover:text-brand-dark transition-all text-left group">
                                    <div className="p-1.5 bg-brand-cream rounded group-hover:bg-brand-gold group-hover:text-white transition-colors"><LayoutTemplate size={16} /></div>
                                    <span className="text-sm font-bold text-slate-600 group-hover:text-brand-dark">Date</span>
                                </button>
                                <button onClick={() => setFormFields([...formFields, { label: 'New Long Text', type: 'textarea', required: false }])} className="w-full flex items-center gap-3 p-3 bg-white border border-slate-200 shadow-sm rounded-lg hover:border-brand-gold hover:text-brand-dark transition-all text-left group">
                                    <div className="p-1.5 bg-brand-cream rounded group-hover:bg-brand-gold group-hover:text-white transition-colors"><LayoutTemplate size={16} /></div>
                                    <span className="text-sm font-bold text-slate-600 group-hover:text-brand-dark">Long Text</span>
                                </button>
                                <button onClick={() => setFormFields([...formFields, { label: 'New Dropdown', type: 'select', options: ['Option 1', 'Option 2'], required: true }])} className="w-full flex items-center gap-3 p-3 bg-white border border-slate-200 shadow-sm rounded-lg hover:border-brand-gold hover:text-brand-dark transition-all text-left group">
                                    <div className="p-1.5 bg-brand-cream rounded group-hover:bg-brand-gold group-hover:text-white transition-colors"><LayoutTemplate size={16} /></div>
                                    <span className="text-sm font-bold text-slate-600 group-hover:text-brand-dark">Dropdown</span>
                                </button>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-200">
                                <button
                                    onClick={saveSchema}
                                    disabled={isSaving}
                                    className="w-full py-2.5 bg-brand-dark text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-bold shadow-md"
                                >
                                    {isSaving ? <Spinner size={16} className="text-white" /> : <Save size={16} />}
                                    Save Form
                                </button>
                            </div>
                        </div>


                        {/* RIGHT MAIN STAGE - CANVAS */}
                        <div className="flex-1 bg-slate-100 p-4 lg:p-8 overflow-y-auto w-full">
                            <div className="max-w-3xl mx-auto">

                                {/* Safety Warning Banner */}
                                {records.length > 0 && (
                                    <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                                        <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                                        <div>
                                            <h4 className="font-bold text-amber-900 text-sm">Active Event Warning</h4>
                                            <p className="text-amber-800 text-xs mt-1">
                                                This event already has <strong>{records.length} collected responses</strong>.
                                                Editing the form questions now may cause data inconsistency (e.g., old answers may not match new labels).
                                                Proceed with caution.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {formFields.length === 0 ? (
                                    <div className="text-center py-20 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                            <PlusCircle size={24} className="text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-700">Canvas is Empty</h3>
                                        <p className="text-slate-500 text-sm mt-1">Click an element on the left (or top on mobile) to add it.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {formFields.map((field, index) => (
                                            <div
                                                key={index}
                                                className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-5 group hover:border-emerald-400 hover:shadow-md transition-all ${field.width === 'half' ? 'col-span-1' : 'col-span-1 md:col-span-2'}`}
                                            >
                                                <div className="flex flex-col lg:flex-row items-start gap-4 h-full">

                                                    {/* Drag Handles / Position Controls - Mobile Optimized */}
                                                    <div className="flex lg:flex-col gap-1 pt-2 w-full lg:w-auto justify-end lg:justify-start border-b lg:border-b-0 border-slate-100 pb-2 lg:pb-0 mb-2 lg:mb-0">
                                                        <button
                                                            disabled={index === 0}
                                                            onClick={() => {
                                                                const newFields = [...formFields];
                                                                [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
                                                                setFormFields(newFields);
                                                            }}
                                                            className="p-1 px-3 lg:px-1 bg-slate-50 lg:bg-transparent rounded lg:rounded-none text-slate-400 hover:text-emerald-600 disabled:opacity-30 transition-colors"
                                                            title="Move Up"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-270 lg:rotate-0"><path d="m18 15-6-6-6 6" /></svg>
                                                        </button>
                                                        <button
                                                            disabled={index === formFields.length - 1}
                                                            onClick={() => {
                                                                const newFields = [...formFields];
                                                                [newFields[index + 1], newFields[index]] = [newFields[index], newFields[index + 1]];
                                                                setFormFields(newFields);
                                                            }}
                                                            className="p-1 px-3 lg:px-1 bg-slate-50 lg:bg-transparent rounded lg:rounded-none text-slate-400 hover:text-emerald-600 disabled:opacity-30 transition-colors"
                                                            title="Move Down"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-270 lg:rotate-0"><path d="m6 9 6 6 6-6" /></svg>
                                                        </button>
                                                    </div>

                                                    <div className="flex-1 space-y-4 w-full">
                                                        {/* Label & Type Row */}
                                                        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                                                            <input
                                                                type="text"
                                                                value={field.label}
                                                                onChange={(e) => updateField(index, 'label', e.target.value)}
                                                                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-gold outline-none font-bold text-brand-dark transition-colors placeholder:text-slate-400 w-full"
                                                                placeholder="Enter question title..."
                                                            />
                                                            <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-lg border border-slate-200 self-start md:self-auto">
                                                                <span className="text-xs font-semibold text-slate-500 uppercase px-2">{field.type}</span>
                                                            </div>
                                                        </div>

                                                        {field.type === 'select' && (
                                                            <div className="pl-1">
                                                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Options</label>
                                                                <input
                                                                    type="text"
                                                                    value={field.options?.join(', ') || ''}
                                                                    onChange={(e) => updateField(index, 'options', e.target.value.split(',').map(s => s.trim()))}
                                                                    className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md focus:border-brand-gold outline-none"
                                                                    placeholder="Option 1, Option 2, Option 3"
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="flex flex-wrap items-center justify-between pt-2 gap-4">
                                                            <div className="flex items-center gap-4">
                                                                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none hover:text-brand-dark transition-colors">
                                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${field.required ? 'bg-brand-dark border-brand-dark text-white' : 'border-slate-300 bg-white'}`}>
                                                                        {field.required && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>}
                                                                    </div>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={field.required}
                                                                        onChange={(e) => updateField(index, 'required', e.target.checked)}
                                                                        className="hidden"
                                                                    />
                                                                    Required
                                                                </label>

                                                                {/* WIDTH TOGGLE */}
                                                                <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                                                                    <button
                                                                        onClick={() => updateField(index, 'width', 'half')}
                                                                        className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${field.width === 'half' ? 'bg-white text-brand-dark shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                                                                    >
                                                                        50%
                                                                    </button>
                                                                    <button
                                                                        onClick={() => updateField(index, 'width', 'full')}
                                                                        className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${!field.width || field.width === 'full' ? 'bg-white text-brand-dark shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                                                                    >
                                                                        100%
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 ml-auto">
                                                                <button
                                                                    onClick={() => {
                                                                        const newFields = [...formFields];
                                                                        const fieldToCopy = JSON.parse(JSON.stringify(formFields[index]));
                                                                        fieldToCopy.label = `${fieldToCopy.label} (Copy)`;
                                                                        newFields.splice(index + 1, 0, fieldToCopy);
                                                                        setFormFields(newFields);
                                                                    }}
                                                                    className="text-slate-400 hover:text-blue-500 px-2 py-1 transition-colors"
                                                                    title="Duplicate"
                                                                >
                                                                    <Copy size={16} />
                                                                </button>

                                                                <button
                                                                    onClick={() => removeField(index)}
                                                                    className="text-slate-400 hover:text-red-500 px-2 py-1 transition-colors"
                                                                    title="Remove"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <div className="max-w-2xl mx-auto space-y-8">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 mb-6">Security & Access</h2>

                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${isPublic ? 'bg-brand-cream text-brand-gold' : 'bg-slate-200 text-slate-500'}`}>
                                            <Globe size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800">Public Access Link</h3>
                                            <p className="text-sm text-slate-500">Allow anyone with the link to submit data</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={isPublic}
                                            onChange={(e) => setIsPublic(e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-gold/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-dark"></div>
                                    </label>
                                </div>

                                <div className="border-t border-slate-200 pt-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`p-2 rounded-lg ${accessCode ? 'bg-brand-cream text-brand-gold' : 'bg-slate-200 text-slate-500'}`}>
                                            <Lock size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800">Password Protection</h3>
                                            <p className="text-sm text-slate-500">Optional access code required to view form</p>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        value={accessCode}
                                        onChange={(e) => setAccessCode(e.target.value)}
                                        placeholder="Enter secure access code (e.g. EVENT2024)"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold outline-none transition-all focus:border-brand-gold"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={saveSettings}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                            >
                                {isSaving ? <Spinner size={18} className="text-white" /> : <Save size={18} />}
                                Save Settings
                            </button>
                        </div>
                    </div>
                )}

                {/* RESPONSES TAB */}
                {activeTab === 'responses' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-800">Collected Responses</h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setIsRefreshing(true);
                                        router.refresh();
                                        setTimeout(() => setIsRefreshing(false), 1000);
                                    }}
                                    className="p-2 text-slate-500 hover:text-brand-dark hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                                    title="Refresh Data"
                                >
                                    {isRefreshing ? <Spinner size={18} className="text-brand-gold" /> : <RotateCw size={18} />}
                                </button>
                                <button
                                    onClick={handleDownloadCSV}
                                    className="text-sm bg-brand-cream text-brand-dark border border-brand-gold/30 hover:bg-brand-gold hover:text-white px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-2"
                                >
                                    <Download size={16} /> Download CSV
                                </button>
                            </div>
                        </div>

                        {records.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No responses yet.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Time</th>
                                            <th className="px-4 py-3 font-semibold">Code</th>
                                            {/* Render headings based on form schema if available, otherwise generic */}
                                            {formFields.slice(0, 4).map((f, i) => (
                                                <th key={i} className="px-4 py-3 font-semibold">{f.label}</th>
                                            ))}
                                            <th className="px-4 py-3 font-semibold">User</th>
                                            <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {records.map((rec) => (
                                            <tr key={rec._id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 text-slate-500">
                                                    {new Date(rec.createdAt).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 font-mono font-bold text-brand-dark">
                                                    {rec.retrievalCode || '-'}
                                                </td>
                                                {formFields.slice(0, 4).map((f, i) => (
                                                    <td key={i} className="px-4 py-3">
                                                        {rec.data?.[f.label] || '-'}
                                                    </td>
                                                ))}
                                                <td className="px-4 py-3 text-slate-500">
                                                    {rec.recordedBy ? 'Staff' : 'Public'}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setEditingRecord(JSON.parse(JSON.stringify(rec)))}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteRecord(rec._id)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* SHARE TAB */}
                {activeTab === 'share' && (
                    <div className="max-w-xl mx-auto text-center space-y-8 py-8">
                        <div className="w-20 h-20 bg-brand-cream text-brand-gold rounded-full flex items-center justify-center mx-auto mb-6">
                            <Share2 size={40} />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Share Your Event Form</h2>
                            <p className="text-slate-500 mt-2">Send this link to volunteers or patients to collect data.</p>
                        </div>

                        {!isPublic ? (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
                                <AlertCircle className="w-5 h-5 inline-block mr-2 -mt-0.5" />
                                <strong>Warning:</strong> Public access is currently disabled. Enable it in the <strong>Settings</strong> tab.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-lg border border-slate-200">
                                    <div className="flex-1 text-left px-2 font-mono text-sm text-slate-600 truncate">
                                        {publicUrl}
                                    </div>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(publicUrl);
                                            alert('Copied to clipboard!');
                                        }}
                                        className="p-2 hover:bg-white rounded-md transition-colors"
                                        title="Copy Link"
                                    >
                                        <Copy size={18} />
                                    </button>
                                    <Link href={`/e/${event._id}`} target="_blank" className="p-2 hover:bg-white rounded-md transition-colors text-emerald-600">
                                        <Eye size={18} />
                                    </Link>
                                </div>

                                {accessCode && (
                                    <div className="inline-block px-4 py-1 bg-slate-100 rounded-full text-sm font-medium text-slate-600">
                                        Access Code: <span className="text-slate-900">{accessCode}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* EDIT RECORD MODAL */}
            {
                editingRecord && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h3 className="text-xl font-bold text-slate-800">Edit Record</h3>
                                <button onClick={() => setEditingRecord(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>


                            <div className="p-8 space-y-6 flex-1 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {formFields.map((field, i) => (
                                        <div key={i} className={field.type === 'textarea' || field.width === 'full' ? 'col-span-1 md:col-span-2' : 'col-span-1'}>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">{field.label}</label>
                                            {field.type === 'textarea' ? (
                                                <textarea
                                                    value={editingRecord.data?.[field.label] || ''}
                                                    onChange={(e) => setEditingRecord({ ...editingRecord, data: { ...editingRecord.data, [field.label]: e.target.value } })}
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all"
                                                    rows={4}
                                                />
                                            ) : field.type === 'select' ? (
                                                <select
                                                    value={editingRecord.data?.[field.label] || ''}
                                                    onChange={(e) => setEditingRecord({ ...editingRecord, data: { ...editingRecord.data, [field.label]: e.target.value } })}
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all bg-white"
                                                >
                                                    <option value="">Select Option</option>
                                                    {field.options?.map((opt, idx) => (
                                                        <option key={idx} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                                                    value={editingRecord.data?.[field.label] || ''}
                                                    onChange={(e) => setEditingRecord({ ...editingRecord, data: { ...editingRecord.data, [field.label]: e.target.value } })}
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 z-10">
                                <button
                                    onClick={() => setEditingRecord(null)}
                                    className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateRecord}
                                    disabled={isUpdatingRecord}
                                    className="px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all hover:translate-y-[-1px]"
                                >
                                    {isUpdatingRecord ? <Spinner className="text-white" size={18} /> : <Save size={18} />}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
