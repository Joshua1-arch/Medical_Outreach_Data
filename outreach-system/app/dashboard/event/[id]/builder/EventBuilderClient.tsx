'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateEventSchema, updateEventSettings } from '@/app/dashboard/actions';
import { deleteRecord, updateRecordById, sendResultEmail } from '@/app/events/actions';
import {
    LayoutTemplate, Settings, Share2, MessageSquare, Activity,
    PlusCircle, Trash2, Save, Copy, Eye, Lock, Globe, AlertCircle, Edit, X, RotateCw, Download, Package, Mail, Printer, FileText
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
    const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());

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

    const handleSendResult = async (recordId: string) => {
        setSendingIds(prev => { const n = new Set(prev); n.add(recordId); return n; });
        try {
            const result = await sendResultEmail(recordId);
            if (result.success) {
                alert(result.message);
                router.refresh();
            } else {
                alert('Error: ' + result.message);
            }
        } catch (err) {
            alert('Failed to send');
        } finally {
            setSendingIds(prev => { const n = new Set(prev); n.delete(recordId); return n; });
        }
    };

    const handleDownloadSingleRecord = (rec: any) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) { alert('Please allow popups to download'); return; }

        const patientName = rec.data?.['Full Name'] || rec.data?.['Name'] || `Record ${rec.retrievalCode || ''}`.trim();
        const dateStr = new Date(rec.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        const baseUrl = window.location.origin;

        const fieldRows = formFields.map(f => {
            const val = (rec.data?.[f.label] || '—').toString().replace(/\n/g, '<br />');
            const isWide = f.type === 'textarea' || f.width === 'full';
            return `<div class="field ${isWide ? 'full' : ''}"><div class="label">${f.label}</div><div class="value">${val}</div></div>`;
        }).join('');

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${event.title} — ${patientName}</title>
<style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1a1a1a; }
    .header { background: #000; padding: 20px 32px; display: flex; align-items: center; justify-content: space-between; }
    .header img { height: 40px; }
    .accent { height: 4px; background: #fbbf38; }
    .patient-bar { background: #000; color: #fff; padding: 14px 32px; display: flex; justify-content: space-between; align-items: center; margin: 24px 0 0; }
    .patient-bar .lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #fbbf38; margin-bottom: 3px; }
    .patient-bar .val { font-size: 17px; font-weight: 700; }
    .patient-bar .right { text-align: right; }
    .body { padding: 20px 32px 32px; }
    .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #999; margin: 20px 0 10px; border-bottom: 1px solid #e8e8e8; padding-bottom: 6px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; }
    .field { }
    .field.full { grid-column: span 2; }
    .label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #888; margin-bottom: 3px; }
    .value { font-size: 14px; font-weight: 600; color: #000; line-height: 1.5; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; }
    .meta { font-size: 11px; color: #999; margin-top: 28px; text-align: center; border-top: 1px solid #eee; padding-top: 14px; }
    .code-badge { display: inline-block; font-family: monospace; font-size: 13px; font-weight: 700; background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 4px; padding: 2px 8px; }
    @media print { @page { size: A4; margin: 12mm; } body { -webkit-print-color-adjust: exact; } }
</style>
</head>
<body>
    <div class="header">
        <img src="${baseUrl}/Reach.png" alt="ReachPoint" />
        <div style="text-align:right; color:#fff;">
            <div style="font-size:10px; color:#fbbf38; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Date</div>
            <div style="font-size:13px; font-weight:600;">${dateStr}</div>
        </div>
    </div>
    <div class="accent"></div>
    <div class="patient-bar">
        <div>
            <div class="lbl">Patient</div>
            <div class="val">${patientName}</div>
        </div>
        <div class="right">
            <div class="lbl">Event</div>
            <div style="font-size:14px; font-weight:600;">${event.title}</div>
            <div style="margin-top:4px;">
                <span class="lbl" style="margin-right:4px;">Record Code:</span>
                <span class="code-badge">${rec.retrievalCode || 'N/A'}</span>
            </div>
        </div>
    </div>
    <div class="body">
        <div class="section-title">Screening Results</div>
        <div class="grid">${fieldRows}</div>
        <p class="meta">
            Generated by ReachPoint &nbsp;&bull;&nbsp; ${event.title} &nbsp;&bull;&nbsp; ${dateStr}<br />
            <span style="font-size:10px;">This document is for informational purposes only. Please consult a qualified healthcare provider for clinical interpretation.</span>
        </p>
    </div>
    <script>window.onload = function() { setTimeout(function() { window.print(); }, 400); }<\/script>
</body>
</html>`;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
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

    const handlePrint = () => {
        if (!records.length) return alert('No records to print');
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups for printing');
            return;
        }

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
            <title>Print Results - ${event.title}</title>
            <style>
                @media print {
                    @page { size: A4; margin: 10mm; }
                    body { font-family: system-ui, -apple-system, sans-serif; color: #1e293b; -webkit-print-color-adjust: exact; }
                    .page-break { page-break-after: always; }
                    .record-card {
                        position: relative;
                        border: 2px solid #cbd5e1;
                        border-radius: 12px;
                        padding: 24px;
                        margin-bottom: 24px;
                        height: 46vh; /* Fits 2 per A4 page */
                        box-sizing: border-box;
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                        page-break-inside: avoid;
                        background: white;
                    }
                    .watermark-container {
                        position: absolute;
                        inset: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        pointer-events: none;
                        z-index: 0;
                        opacity: 0.08;
                    }
                    .watermark {
                        width: 60%;
                        max-width: 400px;
                        filter: grayscale(100%);
                    }
                    .content {
                        position: relative;
                        z-index: 1;
                        width: 100%;
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        border-bottom: 2px solid #e2e8f0;
                        padding-bottom: 12px;
                        margin-bottom: 16px;
                    }
                    .field-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 12px 24px;
                        font-size: 11px;
                        overflow-y: auto;
                    }
                    .field-full { grid-column: span 2; }
                    .label { font-weight: 700; color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
                    .value { font-weight: 500; color: #0f172a; font-size: 12px; line-height: 1.4; }
                }
                body { margin: 0; }
            </style>
            </head>
            <body>
                ${records.map((rec, i) => `
                    <div class="record-card">
                        <div class="watermark-container">
                            <img src="/Reach.png" class="watermark" />
                        </div>
                        <div class="content">
                            <div class="header">
                                <div>
                                    <h2 style="margin:0; font-size:16px; font-weight:800; text-transform: uppercase; letter-spacing: -0.5px;">${event.title}</h2>
                                    <p style="margin:4px 0 0; font-size:11px; color:#64748b; font-weight: 600;">Response #${i + 1}</p>
                                </div>
                                <div style="text-align:right;">
                                    <div style="font-family:monospace; font-weight:bold; font-size:14px; background: #f1f5f9; padding: 2px 6px; rounded: 4px;">${rec.retrievalCode || 'N/A'}</div>
                                    <div style="font-size:11px; color:#64748b; margin-top: 4px;">${new Date(rec.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div class="field-grid">
                                <div class="field-full">
                                    <div class="label">Date Submitted</div>
                                    <div class="value">${new Date(rec.createdAt).toLocaleString()}</div>
                                </div>
                                ${formFields.map(f => `
                                    <div class="${f.type === 'textarea' || f.width === 'full' ? 'field-full' : ''}">
                                        <div class="label">${f.label}</div>
                                        <div class="value">${(rec.data?.[f.label] || '-').toString().replace(/\n/g, '<br>')}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    ${(i + 1) % 2 === 0 && i !== records.length - 1 ? '<div class="page-break"></div>' : ''}
                `).join('')}
                <script>
                    window.onload = function() { setTimeout(function() { window.print(); window.close(); }, 500); }
                </script>
            </body>
            </html>
        `;
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
    };

    const handleDownloadDoc = () => {
        if (!records.length) return alert('No records to download');

        const content = `
           <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
           <head>
               <meta charset="utf-8">
               <title>${event.title} Results</title>
               <style>
                   body { font-family: Arial, sans-serif; }
                   .record-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; page-break-inside: avoid; border: 1px solid #000; }
                   .record-table td, .record-table th { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 11pt; }
                   .header-row { background-color: #f3f4f6; font-weight: bold; }
                   .label { font-weight: bold; color: #444; width: 30%; background-color: #fafafa; }
                   h1 { font-size: 16pt; color: #333; }
               </style>
           </head>
           <body>
               <h1>${event.title} - All Responses</h1>
               <p>Generated on ${new Date().toLocaleString()}</p>
               <br/>
               ${records.map((rec, i) => `
                   <table class="record-table">
                       <tr class="header-row">
                           <td colspan="2" style="background-color: #e5e7eb;">Response #${i + 1} - ${rec.retrievalCode || 'N/A'}</td>
                       </tr>
                       <tr>
                           <td class="label">Date Submitted</td>
                           <td>${new Date(rec.createdAt).toLocaleString()}</td>
                       </tr>
                       ${formFields.map(f => `
                           <tr>
                               <td class="label">${f.label}</td>
                               <td>${rec.data?.[f.label] || '-'}</td>
                           </tr>
                       `).join('')}
                   </table>
                   <br/>
               `).join('')}
           </body>
           </html>
        `;

        const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}_responses.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/e/${event._id}` : '';

    return (
        <div className="space-y-6">

            {/* TAB CONTENT */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px] p-6">


                {/* BUILDER TAB */}
                {activeTab === 'builder' && (
                    <div className="flex flex-col lg:flex-row h-[calc(100vh-250px)] min-h-[600px]">

                        {/* LEFT SIDEBAR - TOOLBOX (hidden on mobile, shown on lg+) */}
                        <div className="hidden lg:flex w-64 bg-slate-50 border-r border-slate-200 flex-col shrink-0">
                            <div className="flex-1 overflow-y-auto p-4">

                                {/* Template Section */}
                                <div className="mb-5 pb-5 border-b border-slate-200">
                                    <h3 className="font-bold text-slate-700 mb-1 text-sm">Quick Start Templates</h3>
                                    <p className="text-xs text-slate-400 mb-3">Templates are copied into this event.</p>

                                    <button
                                        onClick={async () => {
                                            setIsRefreshing(true);
                                            if (records.length > 0 && !confirm('⚠️ This event has captured data. Changing the form may mismatch old records. Proceed?')) { setIsRefreshing(false); return; }
                                            if (formFields.length > 0 && !confirm('This will replace your current fields. Are you sure?')) { setIsRefreshing(false); return; }
                                            await new Promise(r => setTimeout(r, 400));
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
                                        className="w-full flex items-center gap-2 p-3 bg-brand-cream border border-brand-gold/30 text-brand-dark font-bold rounded-lg hover:bg-brand-gold/10 transition-colors shadow-sm mb-2.5 disabled:opacity-50 text-sm"
                                    >
                                        {isRefreshing ? <Spinner size={16} className="text-brand-gold" /> : <LayoutTemplate size={16} className="text-brand-gold" />}
                                        Medical Template
                                    </button>

                                    <button
                                        onClick={async () => {
                                            setIsRefreshing(true);
                                            if (records.length > 0 && !confirm('⚠️ This event has captured data. Changing the form may mismatch old records. Proceed?')) { setIsRefreshing(false); return; }
                                            if (formFields.length > 0 && !confirm('This will replace your current fields. Are you sure?')) { setIsRefreshing(false); return; }
                                            await new Promise(r => setTimeout(r, 400));
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
                                        className="w-full flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-800 font-bold rounded-lg hover:bg-red-100 transition-colors shadow-sm disabled:opacity-50 text-sm"
                                    >
                                        {isRefreshing ? <Spinner size={16} className="text-red-600" /> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" /></svg>}
                                        Blood Drive Template
                                    </button>
                                </div>

                                <h3 className="font-bold text-slate-700 mb-3 text-sm">Add Element</h3>
                                <div className="space-y-2">
                                    {[
                                        { label: 'Short Text', type: 'text' },
                                        { label: 'Number', type: 'number' },
                                        { label: 'Date', type: 'date' },
                                        { label: 'Long Text', type: 'textarea' },
                                        { label: 'Dropdown', type: 'select' },
                                    ].map(({ label, type }) => (
                                        <button
                                            key={type}
                                            onClick={() => setFormFields([...formFields, {
                                                label: `New ${label}`,
                                                type,
                                                required: false,
                                                width: 'full',
                                                ...(type === 'select' ? { options: ['Option 1', 'Option 2'] } : {})
                                            }])}
                                            className="w-full flex items-center gap-2.5 py-2.5 px-3 bg-white border border-slate-200 rounded-lg hover:border-brand-gold hover:bg-brand-gold/5 transition-all text-left text-sm font-semibold text-slate-600 hover:text-brand-dark"
                                        >
                                            <PlusCircle size={15} className="text-brand-gold shrink-0" />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sticky save button */}
                            <div className="p-4 border-t border-slate-200 bg-slate-50">
                                <button
                                    onClick={saveSchema}
                                    disabled={isSaving}
                                    className="w-full py-2.5 bg-brand-dark text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-bold shadow-md text-sm"
                                >
                                    {isSaving ? <Spinner size={16} className="text-white" /> : <Save size={16} />}
                                    Save Form
                                </button>
                            </div>
                        </div>

                        {/* MAIN CANVAS */}
                        <div className="flex-1 flex flex-col overflow-hidden">

                            {/* Mobile sticky top bar with quick-add + save */}
                            <div className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-10">
                                <div className="flex gap-1.5 overflow-x-auto px-3 py-2.5 scrollbar-hide">
                                    {[
                                        { label: 'Text', type: 'text' },
                                        { label: 'Number', type: 'number' },
                                        { label: 'Date', type: 'date' },
                                        { label: 'Long Text', type: 'textarea' },
                                        { label: 'Dropdown', type: 'select' },
                                    ].map(({ label, type }) => (
                                        <button
                                            key={type}
                                            onClick={() => setFormFields([...formFields, {
                                                label: `New ${label}`,
                                                type,
                                                required: false,
                                                width: 'full',
                                                ...(type === 'select' ? { options: ['Option 1', 'Option 2'] } : {})
                                            }])}
                                            className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-full hover:bg-brand-gold hover:text-white hover:border-brand-gold transition-all"
                                        >
                                            <PlusCircle size={11} /> {label}
                                        </button>
                                    ))}
                                    <button
                                        onClick={saveSchema}
                                        disabled={isSaving}
                                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-brand-dark text-white text-xs font-bold rounded-full hover:bg-slate-700 transition-colors disabled:opacity-50 ml-1"
                                    >
                                        {isSaving ? <Spinner size={11} className="text-white" /> : <Save size={11} />}
                                        Save
                                    </button>
                                </div>
                                {/* Template pills */}
                                <div className="flex gap-1.5 px-3 pb-2">
                                    <button
                                        onClick={async () => {
                                            setIsRefreshing(true);
                                            if (records.length > 0 && !confirm('⚠️ This event has captured data. Proceed?')) { setIsRefreshing(false); return; }
                                            if (formFields.length > 0 && !confirm('Replace current fields?')) { setIsRefreshing(false); return; }
                                            await new Promise(r => setTimeout(r, 400));
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
                                        className="flex-shrink-0 px-3 py-1 bg-brand-cream border border-brand-gold/30 text-brand-dark text-xs font-bold rounded-full"
                                    >
                                        📋 Medical Template
                                    </button>
                                    <button
                                        onClick={async () => {
                                            setIsRefreshing(true);
                                            if (records.length > 0 && !confirm('⚠️ This event has captured data. Proceed?')) { setIsRefreshing(false); return; }
                                            if (formFields.length > 0 && !confirm('Replace current fields?')) { setIsRefreshing(false); return; }
                                            await new Promise(r => setTimeout(r, 400));
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
                                        className="flex-shrink-0 px-3 py-1 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-full"
                                    >
                                        🩸 Blood Drive Template
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable canvas area */}
                            <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-100">
                                <div className="max-w-2xl mx-auto">

                                    {/* Safety Warning Banner */}
                                    {records.length > 0 && (
                                        <div className="mb-4 bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-3">
                                            <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                                            <div>
                                                <h4 className="font-bold text-amber-900 text-sm">Active Event Warning</h4>
                                                <p className="text-amber-700 text-xs mt-0.5">This event has <strong>{records.length} responses</strong>. Editing may cause data mismatches.</p>
                                            </div>
                                        </div>
                                    )}

                                    {formFields.length === 0 ? (
                                        <div className="text-center py-16 border-2 border-dashed border-slate-300 rounded-xl bg-white">
                                            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                                                <PlusCircle size={26} className="text-slate-400" />
                                            </div>
                                            <h3 className="text-base font-bold text-slate-700">Canvas is Empty</h3>
                                            <p className="text-slate-400 text-xs mt-1">Add elements using the panel or quick-add bar above.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            {formFields.map((field, index) => (
                                                <div
                                                    key={index}
                                                    className={`bg-white rounded-xl border border-slate-200 shadow-sm hover:border-brand-gold/40 transition-all ${field.width === 'half' ? 'sm:col-span-1' : 'sm:col-span-2'}`}
                                                >
                                                    {/* Card top bar */}
                                                    <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-50 rounded-t-xl border-b border-slate-100">
                                                        <span className="w-5 h-5 rounded-full bg-brand-gold/20 text-brand-dark text-[10px] font-bold flex items-center justify-center shrink-0">
                                                            {index + 1}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex-1 truncate">
                                                            {field.type === 'textarea' ? 'Long Text' : field.type === 'select' ? 'Dropdown' : field.type === 'number' ? 'Number' : field.type === 'date' ? 'Date' : 'Short Text'}
                                                        </span>
                                                        <div className="flex items-center gap-0.5 shrink-0">
                                                            <button disabled={index === 0} onClick={() => { const f = [...formFields]; [f[index - 1], f[index]] = [f[index], f[index - 1]]; setFormFields(f); }} className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 transition-colors" title="Up">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
                                                            </button>
                                                            <button disabled={index === formFields.length - 1} onClick={() => { const f = [...formFields]; [f[index + 1], f[index]] = [f[index], f[index + 1]]; setFormFields(f); }} className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 transition-colors" title="Down">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                            </button>
                                                            <button onClick={() => { const f = [...formFields]; const c = JSON.parse(JSON.stringify(f[index])); c.label += ' (Copy)'; f.splice(index + 1, 0, c); setFormFields(f); }} className="p-1.5 rounded text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors" title="Duplicate">
                                                                <Copy size={14} />
                                                            </button>
                                                            <button onClick={() => removeField(index)} className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Card body */}
                                                    <div className="p-4 space-y-3">
                                                        <input
                                                            type="text"
                                                            value={field.label}
                                                            onChange={(e) => updateField(index, 'label', e.target.value)}
                                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-gold/40 outline-none font-semibold text-slate-800 placeholder:text-slate-400 text-sm transition-all"
                                                            placeholder="Question label e.g. Full Name"
                                                        />

                                                        <div className="flex flex-wrap gap-2 items-center">
                                                            <select
                                                                value={field.type}
                                                                onChange={(e) => updateField(index, 'type', e.target.value)}
                                                                className="flex-1 min-w-[120px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-brand-gold/40 outline-none"
                                                            >
                                                                <option value="text">Short Text</option>
                                                                <option value="number">Number</option>
                                                                <option value="date">Date</option>
                                                                <option value="textarea">Long Text</option>
                                                                <option value="select">Dropdown</option>
                                                            </select>

                                                            <div className="flex items-center bg-slate-50 rounded-lg p-0.5 border border-slate-200">
                                                                <button onClick={() => updateField(index, 'width', 'half')} className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${field.width === 'half' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-400'}`}>½</button>
                                                                <button onClick={() => updateField(index, 'width', 'full')} className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${!field.width || field.width === 'full' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-400'}`}>Full</button>
                                                            </div>

                                                            <label className="flex items-center gap-1.5 cursor-pointer select-none ml-auto">
                                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${field.required ? 'bg-brand-dark border-brand-dark' : 'border-slate-300 bg-white'}`}>
                                                                    {field.required && <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>}
                                                                </div>
                                                                <input type="checkbox" checked={field.required} onChange={(e) => updateField(index, 'required', e.target.checked)} className="hidden" />
                                                                <span className="text-xs font-semibold text-slate-500">Required</span>
                                                            </label>
                                                        </div>

                                                        {field.type === 'select' && (
                                                            <div>
                                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">Options <span className="font-normal">(comma separated)</span></label>
                                                                <input
                                                                    type="text"
                                                                    value={field.options?.join(', ') || ''}
                                                                    onChange={(e) => updateField(index, 'options', e.target.value.split(',').map(s => s.trim()))}
                                                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 outline-none bg-slate-50"
                                                                    placeholder="Male, Female, Other"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                onClick={addField}
                                                className="col-span-2 w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 hover:border-brand-gold hover:text-brand-dark font-semibold text-sm transition-all flex items-center justify-center gap-2 hover:bg-white"
                                            >
                                                <PlusCircle size={16} /> Add Field
                                            </button>
                                        </div>
                                    )}
                                </div>
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
                                
                                <div className="h-6 w-px bg-slate-200 mx-1"></div>

                                <button
                                    onClick={handlePrint}
                                    className="text-sm bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-brand-dark px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-2"
                                    title="Print Results (PDF)"
                                >
                                    <Printer size={16} /> Print / PDF
                                </button>
                                
                                <button
                                    onClick={handleDownloadDoc}
                                    className="text-sm bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-2"
                                    title="Download Word Doc"
                                >
                                    <FileText size={16} /> Doc
                                </button>

                                <button
                                    onClick={handleDownloadCSV}
                                    className="text-sm bg-brand-cream text-brand-dark border border-brand-gold/30 hover:bg-brand-gold hover:text-white px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-2"
                                >
                                    <Download size={16} /> CSV
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
                                                            onClick={() => handleSendResult(rec._id)}
                                                            disabled={sendingIds.has(rec._id)}
                                                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold transition-colors border ${rec.resultEmailSent
                                                                    ? 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                                                                    : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                                                }`}
                                                            title={rec.resultEmailSent ? "Result already sent. Click to re-send." : "Send Result Email"}
                                                        >
                                                            {sendingIds.has(rec._id) ? <Spinner size={12} className={rec.resultEmailSent ? "text-slate-400" : "text-emerald-600"} /> : <Mail size={12} />}
                                                            {rec.resultEmailSent ? 'Re-send' : 'Send Result'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownloadSingleRecord(rec)}
                                                            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold transition-colors border bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                                                            title="Download as PDF"
                                                        >
                                                            <Download size={12} /> PDF
                                                        </button>
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
