'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateRecordById, deleteRecord, sendResultEmail } from '@/app/events/actions';
import {
    Share2, Copy, Eye, Download, FileText, Printer, Mail,
    MessageSquare, RotateCw, Edit, Save, Trash2, X, AlertCircle,
    Package, ChevronLeft, ChevronRight, Link as LinkIcon,
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

export default function ResponsesClient({ event, records }: { event: any; records: any[] }) {
    const router = useRouter();
    const formFields: FormField[] = event.formFields || [];

    // ── State ──────────────────────────────────────────────────────────
    const [editingRecord, setEditingRecord] = useState<any>(null);
    const [isUpdatingRecord, setIsUpdatingRecord] = useState(false);
    const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [copied, setCopied] = useState(false);

    const publicUrl =
        typeof window !== 'undefined' ? `${window.location.origin}/e/${event._id}` : `/e/${event._id}`;

    // ── Record actions ─────────────────────────────────────────────────
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
        } catch {
            alert('Failed to send');
        } finally {
            setSendingIds(prev => { const n = new Set(prev); n.delete(recordId); return n; });
        }
    };

    // ── Download: single record PDF ────────────────────────────────────
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

    // ── Download: CSV ──────────────────────────────────────────────────
    const handleDownloadCSV = () => {
        if (!records.length) return alert('No records to download');
        const headers = formFields.map(f => f.label);
        const rows = records.map(rec => {
            return formFields.map(f => {
                let val = rec.data?.[f.label] || '';
                if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
                    val = `"${val.replace(/"/g, '""')}"`;
                }
                return val;
            }).join(',');
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

    // ── Download: Print PDF (all records) ──────────────────────────────
    const handlePrint = () => {
        if (!records.length) return alert('No records to print');
        const printWindow = window.open('', '_blank');
        if (!printWindow) { alert('Please allow popups for printing'); return; }

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
                        height: 46vh;
                        box-sizing: border-box;
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                        page-break-inside: avoid;
                        background: white;
                    }
                    .watermark-container {
                        position: absolute; inset: 0;
                        display: flex; align-items: center; justify-content: center;
                        pointer-events: none; z-index: 0; opacity: 0.08;
                    }
                    .watermark { width: 60%; max-width: 400px; filter: grayscale(100%); }
                    .content { position: relative; z-index: 1; width: 100%; height: 100%; display: flex; flex-direction: column; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px; }
                    .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; font-size: 11px; overflow-y: auto; }
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
                <\/script>
            </body>
            </html>
        `;
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
    };

    // ── Download: Word Doc ─────────────────────────────────────────────
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

    // ── Copy link helper ───────────────────────────────────────────────
    const handleCopy = () => {
        navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ══════════════════════════════════════════════════════════════════
    // RENDER
    // ══════════════════════════════════════════════════════════════════
    return (
        <div className="space-y-6">

            {/* ── Event header + Share card ──────────────────────── */}
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">

                {/* Left: event info */}
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 text-[#fbc037] font-semibold text-sm">
                        <span className="font-mono text-xs text-slate-400">ID:</span>
                        <span className="font-mono text-xs text-slate-500">{event._id}</span>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed max-w-lg">
                        Manage response data and participant intake for the ongoing community health initiative.
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
                            Active
                        </span>
                        {event.isPublic && (
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-100">
                                Public Access
                            </span>
                        )}
                    </div>
                </div>

                {/* Right: Share card */}
                <div className="w-full lg:w-96 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fbc037]/10 text-[#fbc037]">
                            <Share2 size={22} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm">Share Event Link</h3>
                            <p className="text-xs text-slate-400">Distribute this link to participants</p>
                        </div>
                    </div>

                    {!event.isPublic ? (
                        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
                            <AlertCircle size={14} className="shrink-0 mt-0.5" />
                            <span>Public access is disabled. Enable it in <strong>Settings</strong>.</span>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    readOnly
                                    value={publicUrl}
                                    className="w-full h-10 pl-3 pr-8 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600 outline-none truncate"
                                />
                                <LinkIcon size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                            <button
                                onClick={handleCopy}
                                className={`h-10 px-4 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
                                    copied
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-[#fbc037] hover:bg-yellow-400 text-slate-900'
                                }`}
                            >
                                <Copy size={15} />
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                            <Link
                                href={`/e/${event._id}`}
                                target="_blank"
                                className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                            >
                                <Eye size={16} />
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Inventory tracker (optional) ───────────────────── */}
            {event.inventory && event.inventory.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                        <Package size={18} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-end gap-2 mb-1">
                                        <span className={`text-3xl font-bold ${isLow ? 'text-red-700' : 'text-slate-800'}`}>{remaining}</span>
                                        <span className="text-sm text-slate-500 mb-1">/ {item.startingStock} left</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all ${isLow ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${percentage}%` }} />
                                    </div>
                                    {isLow && <p className="text-xs text-red-600 font-bold mt-2 flex items-center gap-1"><AlertCircle size={11} /> Low Stock Warning</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Responses section ──────────────────────────────── */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-slate-900">Collected Responses</h2>
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                            {records.length}
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Refresh */}
                        <button
                            onClick={() => { setIsRefreshing(true); router.refresh(); setTimeout(() => setIsRefreshing(false), 1200); }}
                            className="h-9 w-9 flex items-center justify-center border border-slate-200 bg-white rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                            title="Refresh"
                        >
                            {isRefreshing ? <Spinner size={16} className="text-[#fbc037]" /> : <RotateCw size={16} />}
                        </button>

                        <div className="h-6 w-px bg-slate-200" />

                        <button onClick={handleDownloadCSV} className="h-9 flex items-center gap-2 px-3 rounded-lg bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                            <Download size={16} /> CSV
                        </button>
                        <button onClick={handleDownloadDoc} className="h-9 flex items-center gap-2 px-3 rounded-lg bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                            <FileText size={16} /> Word
                        </button>
                        <button onClick={handlePrint} className="h-9 flex items-center gap-2 px-3 rounded-lg bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                            <Printer size={16} /> Print PDF
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {records.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">
                            <MessageSquare size={40} className="mx-auto mb-3 opacity-40" />
                            <p className="font-semibold text-slate-500">No responses yet.</p>
                            <p className="text-sm mt-1">Responses will appear here once participants submit the form.</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50/80 text-[10px] uppercase font-bold text-slate-400 tracking-widest border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4">Response Date</th>
                                            <th className="px-6 py-4">Retrieval Code</th>
                                            {formFields.slice(0, 3).map((f, i) => (
                                                <th key={i} className="px-6 py-4">{f.label}</th>
                                            ))}
                                            <th className="px-6 py-4">Source</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {records.map((rec) => (
                                            <tr key={rec._id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 text-sm">
                                                            {new Date(rec.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                        <span className="text-xs text-slate-400">
                                                            {new Date(rec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-mono font-bold text-slate-600">
                                                        {rec.retrievalCode || '-'}
                                                    </span>
                                                </td>
                                                {formFields.slice(0, 3).map((f, i) => (
                                                    <td key={i} className="px-6 py-5 text-slate-700 text-sm max-w-[140px] truncate">
                                                        {rec.data?.[f.label] || '-'}
                                                    </td>
                                                ))}
                                                <td className="px-6 py-5">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                                        rec.recordedBy
                                                            ? 'bg-purple-50 text-purple-700 border-purple-100'
                                                            : 'bg-blue-50 text-blue-700 border-blue-100'
                                                    }`}>
                                                        {rec.recordedBy ? 'Staff' : 'Public'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => handleSendResult(rec._id)}
                                                            disabled={sendingIds.has(rec._id)}
                                                            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                                                                rec.resultEmailSent
                                                                    ? 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                                                                    : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                                            }`}
                                                            title={rec.resultEmailSent ? 'Re-send result' : 'Send result email'}
                                                        >
                                                            {sendingIds.has(rec._id)
                                                                ? <Spinner size={11} className={rec.resultEmailSent ? 'text-slate-400' : 'text-emerald-600'} />
                                                                : <Mail size={12} />
                                                            }
                                                            {rec.resultEmailSent ? 'Re-send' : 'Send'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownloadSingleRecord(rec)}
                                                            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                                                            title="Download as PDF"
                                                        >
                                                            <Download size={11} /> PDF
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingRecord(JSON.parse(JSON.stringify(rec)))}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit size={15} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteRecord(rec._id)}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination display */}
                            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                                <p className="text-sm text-slate-500">
                                    Showing <span className="font-bold text-slate-900">1</span> to{' '}
                                    <span className="font-bold text-slate-900">{records.length}</span> of{' '}
                                    <span className="font-bold text-slate-900">{records.length}</span> responses
                                </p>
                                <div className="flex items-center gap-3">
                                    <button className="text-sm font-bold text-slate-300 flex items-center gap-1" disabled>
                                        <ChevronLeft size={16} /> Previous
                                    </button>
                                    <button className="text-sm font-bold text-slate-300 flex items-center gap-1" disabled>
                                        Next <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Edit Record Modal ─────────────────────────────── */}
            {editingRecord && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-bold text-slate-800">Edit Record</h3>
                            <button onClick={() => setEditingRecord(null)} className="text-slate-400 hover:text-slate-700 transition-colors">
                                <X size={22} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6 flex-1 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {formFields.map((field, i) => (
                                    <div key={i} className={field.type === 'textarea' || field.width === 'full' ? 'col-span-1 md:col-span-2' : ''}>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">{field.label}</label>
                                        {field.type === 'textarea' ? (
                                            <textarea
                                                value={editingRecord.data?.[field.label] || ''}
                                                onChange={(e) => setEditingRecord({ ...editingRecord, data: { ...editingRecord.data, [field.label]: e.target.value } })}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#fbc037]/40 focus:border-[#fbc037] outline-none transition-all"
                                                rows={4}
                                            />
                                        ) : field.type === 'select' ? (
                                            <select
                                                value={editingRecord.data?.[field.label] || ''}
                                                onChange={(e) => setEditingRecord({ ...editingRecord, data: { ...editingRecord.data, [field.label]: e.target.value } })}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#fbc037]/40 focus:border-[#fbc037] outline-none transition-all bg-white"
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
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#fbc037]/40 focus:border-[#fbc037] outline-none transition-all"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0">
                            <button onClick={() => setEditingRecord(null)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateRecord}
                                disabled={isUpdatingRecord}
                                className="px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all"
                            >
                                {isUpdatingRecord ? <Spinner className="text-white" size={18} /> : <Save size={18} />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
