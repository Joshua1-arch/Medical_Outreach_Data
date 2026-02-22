'use client';

import { useState, useEffect } from 'react';
import { generateInvitationCodes, getActiveInvitationCodes, getUsedInvitationCodes, deleteInvitationCode } from './actions';
import { Key, Copy, Trash2, RefreshCw, CheckCircle, Plus, Minus, Users } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

interface InvitationCode {
    _id: string;
    code: string;
    createdAt: string;
}

interface UsedInvitationCode {
    _id: string;
    code: string;
    createdAt: string;
    usedAt: string | null;
    usedBy: { name: string; email: string } | null;
}

export default function InvitationCodeManager() {
    const [codes, setCodes] = useState<InvitationCode[]>([]);
    const [usedCodes, setUsedCodes] = useState<UsedInvitationCode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [newCodes, setNewCodes] = useState<string[]>([]);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [showUsed, setShowUsed] = useState(false);

    useEffect(() => { loadCodes(); }, []);

    const loadCodes = async () => {
        setIsLoading(true);
        const [activeResult, usedResult] = await Promise.all([
            getActiveInvitationCodes(),
            getUsedInvitationCodes(),
        ]);
        if (activeResult.success) setCodes(activeResult.codes as InvitationCode[]);
        if (usedResult.success) setUsedCodes(usedResult.codes as UsedInvitationCode[]);
        setIsLoading(false);
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setNewCodes([]);
        const result = await generateInvitationCodes(quantity);
        if (result.success && result.codes) {
            setNewCodes(result.codes);
            loadCodes();
        }
        setIsGenerating(false);
    };

    const handleCopy = async (code: string) => {
        await navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handleCopyAll = async () => {
        await navigator.clipboard.writeText(newCodes.join('\n'));
        setCopiedCode('all');
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handleDelete = async (codeId: string) => {
        if (!confirm('Are you sure you want to delete this invitation code?')) return;
        const result = await deleteInvitationCode(codeId);
        if (result.success) loadCodes();
    };

    const formatTimeAgo = (dateString: string) => {
        const diffMs = Date.now() - new Date(dateString).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">

            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Invite Administrators</h3>
                <button
                    onClick={loadCodes}
                    disabled={isLoading}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                    title="Refresh"
                >
                    {isLoading ? <Spinner size={16} /> : <RefreshCw size={16} />}
                </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
                {/* Generate section */}
                <div className="p-6 space-y-4 border-b border-slate-100">
                    <p className="text-sm text-slate-500 leading-relaxed">Generate secure invitation codes for new staff.</p>

                    {/* Quantity */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Number of Invites</label>
                        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1 || isGenerating}
                                className="size-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 disabled:opacity-40 transition-colors"
                            >
                                <Minus size={16} />
                            </button>
                            <div className="flex-1 text-center font-bold text-lg text-slate-900">{quantity}</div>
                            <button
                                onClick={() => setQuantity(Math.min(50, quantity + 1))}
                                disabled={quantity >= 50 || isGenerating}
                                className="size-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 disabled:opacity-40 transition-colors"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Generate button */}
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full h-12 rounded-xl bg-[#fbc037] text-slate-900 font-bold flex items-center justify-center gap-2 hover:bg-yellow-400 shadow-lg shadow-[#fbc037]/20 transition-all disabled:opacity-60"
                    >
                        {isGenerating ? (
                            <><Spinner className="text-slate-900" size={18} /> Generating…</>
                        ) : (
                            <><Key size={18} /> Generate Invitation Code{quantity > 1 ? 's' : ''}</>
                        )}
                    </button>

                    {/* Newly generated codes flash */}
                    {newCodes.length > 0 && (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                                    ✓ {newCodes.length} Code{newCodes.length > 1 ? 's' : ''} Generated
                                </p>
                                {newCodes.length > 1 && (
                                    <button
                                        onClick={handleCopyAll}
                                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 px-2 py-1 bg-emerald-100 rounded-md transition-colors"
                                    >
                                        {copiedCode === 'all' ? <CheckCircle size={13} /> : <Copy size={13} />}
                                        Copy All
                                    </button>
                                )}
                            </div>
                            <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                {newCodes.map((code, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-white/70 rounded-lg px-3 py-2">
                                        <code className="flex-1 text-xs font-mono font-bold text-emerald-800 tracking-widest">{code}</code>
                                        <button onClick={() => handleCopy(code)} className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded transition-colors">
                                            {copiedCode === code ? <CheckCircle size={13} /> : <Copy size={13} />}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Active codes */}
                <div className="px-6 pt-5 pb-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                        Active Codes ({codes.length})
                    </h4>

                    {isLoading ? (
                        <div className="text-center py-6"><Spinner className="mx-auto text-[#fbc037]" size={22} /></div>
                    ) : codes.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-4">No active codes. Generate one above.</p>
                    ) : (
                        <div className="space-y-2 max-h-52 overflow-y-auto">
                            {codes.map((code) => (
                                <div key={code._id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300 transition-colors group">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="size-2 rounded-full bg-emerald-500 shrink-0"></div>
                                        <code className="font-mono text-xs font-bold text-slate-700 tracking-wider truncate">{code.code}</code>
                                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{formatTimeAgo(code.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        <button onClick={() => handleCopy(code.code)} className="p-1.5 text-slate-400 hover:text-[#fbc037] rounded transition-colors" title="Copy">
                                            {copiedCode === code.code ? <CheckCircle size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                        </button>
                                        <button onClick={() => handleDelete(code._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Used codes (collapsible) */}
                {usedCodes.length > 0 && (
                    <div className="px-6 pb-6 border-t border-slate-100 pt-4">
                        <button
                            onClick={() => setShowUsed(!showUsed)}
                            className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors w-full"
                        >
                            <Users size={12} />
                            Used Codes ({usedCodes.length})
                            <span className="ml-auto">{showUsed ? '▲' : '▼'}</span>
                        </button>

                        {showUsed && (
                            <div className="space-y-2 mt-3 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                                {usedCodes.map((code) => (
                                    <div key={code._id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 opacity-60">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="size-2 rounded-full bg-slate-300 shrink-0"></div>
                                            <code className="font-mono text-xs font-bold text-slate-400 tracking-wider line-through truncate">{code.code}</code>
                                        </div>
                                        <div className="text-right shrink-0 ml-2">
                                            <span className="text-[10px] font-bold uppercase text-slate-400">Used</span>
                                            {code.usedBy && (
                                                <p className="text-[10px] text-slate-400">{code.usedBy.name}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
