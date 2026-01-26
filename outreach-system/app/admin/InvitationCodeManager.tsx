'use client';

import { useState, useEffect } from 'react';
import { generateInvitationCodes, getActiveInvitationCodes, getUsedInvitationCodes, deleteInvitationCode } from './actions';
import { Ticket, Copy, Trash2, RefreshCw, CheckCircle, Plus, Minus, Users } from 'lucide-react';
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
    usedBy: {
        name: string;
        email: string;
    } | null;
}

export default function InvitationCodeManager() {
    const [codes, setCodes] = useState<InvitationCode[]>([]);
    const [usedCodes, setUsedCodes] = useState<UsedInvitationCode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [newCodes, setNewCodes] = useState<string[]>([]);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        loadCodes();
    }, []);

    const loadCodes = async () => {
        setIsLoading(true);
        const [activeResult, usedResult] = await Promise.all([
            getActiveInvitationCodes(),
            getUsedInvitationCodes()
        ]);

        if (activeResult.success) {
            setCodes(activeResult.codes as InvitationCode[]);
        }

        if (usedResult.success) {
            setUsedCodes(usedResult.codes as UsedInvitationCode[]);
        }

        setIsLoading(false);
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setNewCodes([]);

        const result = await generateInvitationCodes(quantity);

        if (result.success && result.codes) {
            setNewCodes(result.codes);
            loadCodes(); // Refresh the list
        }
        setIsGenerating(false);
    };

    const handleCopy = async (code: string) => {
        await navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handleCopyAll = async () => {
        const allCodes = newCodes.join('\n');
        await navigator.clipboard.writeText(allCodes);
        setCopiedCode('all');
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handleDelete = async (codeId: string) => {
        if (!confirm('Are you sure you want to delete this invitation code?')) return;

        const result = await deleteInvitationCode(codeId);
        if (result.success) {
            loadCodes();
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    const incrementQuantity = () => setQuantity(prev => Math.min(prev + 1, 50));
    const decrementQuantity = () => setQuantity(prev => Math.max(prev - 1, 1));

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-brand-gold/20 to-brand-gold/10 rounded-xl">
                        <Ticket className="text-brand-gold" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Invite Users</h3>
                        <p className="text-sm text-slate-500">Generate codes for instant account activation</p>
                    </div>
                </div>
                <button
                    onClick={loadCodes}
                    disabled={isLoading}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    title="Refresh"
                >
                    {isLoading ? <Spinner size={18} /> : <RefreshCw size={18} />}
                </button>
            </div>

            {/* Generate Section */}
            <div className="p-6 bg-slate-50 border-b border-slate-100">
                {/* Quantity Selector */}
                <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-bold text-slate-600">Number of codes to generate:</label>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={decrementQuantity}
                            disabled={quantity <= 1 || isGenerating}
                            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Minus size={16} />
                        </button>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                            min="1"
                            max="50"
                            className="w-16 text-center py-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-brand-gold/50 outline-none"
                        />
                        <button
                            onClick={incrementQuantity}
                            disabled={quantity >= 50 || isGenerating}
                            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full py-3 px-4 bg-brand-dark text-white rounded-lg font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                >
                    {isGenerating ? (
                        <>
                            <Spinner className="text-white" size={18} />
                            Generating {quantity} code{quantity > 1 ? 's' : ''}...
                        </>
                    ) : (
                        <>
                            <Plus size={18} />
                            Generate {quantity} Invitation Code{quantity > 1 ? 's' : ''}
                        </>
                    )}
                </button>

                {/* Newly Generated Codes Display */}
                {newCodes.length > 0 && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-bold text-green-700 uppercase">
                                {newCodes.length} New Code{newCodes.length > 1 ? 's' : ''} Generated!
                            </p>
                            {newCodes.length > 1 && (
                                <button
                                    onClick={handleCopyAll}
                                    className="text-xs font-bold text-green-700 hover:text-green-900 flex items-center gap-1 px-2 py-1 bg-green-100 rounded-md transition-colors"
                                >
                                    {copiedCode === 'all' ? <CheckCircle size={14} /> : <Copy size={14} />}
                                    Copy All
                                </button>
                            )}
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {newCodes.map((code, index) => (
                                <div key={index} className="flex items-center gap-2 bg-white/50 rounded-md p-2">
                                    <code className="flex-1 text-sm font-mono font-bold text-green-800 tracking-widest">
                                        {code}
                                    </code>
                                    <button
                                        onClick={() => handleCopy(code)}
                                        className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
                                        title="Copy to clipboard"
                                    >
                                        {copiedCode === code ? <CheckCircle size={14} /> : <Copy size={14} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-green-600 mt-3">
                            Share these codes via WhatsApp or email for instant signup. Each code can only be used once.
                        </p>
                    </div>
                )}
            </div>

            {/* Active Codes List */}
            <div className="p-6">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
                    Active Codes ({codes.length})
                </h4>

                {isLoading ? (
                    <div className="text-center py-8">
                        <Spinner className="mx-auto text-brand-gold" size={24} />
                    </div>
                ) : codes.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        <Ticket size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No active invitation codes</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {codes.map((code) => (
                            <div
                                key={code._id}
                                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <code className="font-mono font-bold text-slate-700 tracking-wider text-sm">
                                        {code.code}
                                    </code>
                                    <span className="text-xs text-slate-400">
                                        {formatTimeAgo(code.createdAt)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleCopy(code.code)}
                                        className="p-1.5 text-slate-400 hover:text-brand-dark hover:bg-white rounded transition-colors"
                                        title="Copy"
                                    >
                                        {copiedCode === code.code ? (
                                            <CheckCircle size={16} className="text-green-600" />
                                        ) : (
                                            <Copy size={16} />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(code._id)}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Used Codes List */}
            <div className="p-6 border-t border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg">
                        <Users className="text-blue-600" size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-700">
                            Used Codes ({usedCodes.length})
                        </h4>
                        <p className="text-xs text-slate-500">Codes that have been redeemed by users</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-8">
                        <Spinner className="mx-auto text-brand-gold" size={24} />
                    </div>
                ) : usedCodes.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        <Users size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No codes have been used yet</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {usedCodes.map((code) => (
                            <div
                                key={code._id}
                                className="p-4 bg-white rounded-lg border border-slate-200 hover:shadow-sm transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <code className="font-mono font-bold text-slate-700 tracking-wider text-sm">
                                            {code.code}
                                        </code>
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">
                                            USED
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {formatTimeAgo(code.usedAt || code.createdAt)}
                                    </span>
                                </div>

                                {code.usedBy && (
                                    <div className="pl-4 border-l-2 border-blue-200 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-500 uppercase">Name:</span>
                                            <span className="text-sm font-bold text-slate-900">{code.usedBy.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-500 uppercase">Email:</span>
                                            <span className="text-sm text-slate-700">{code.usedBy.email}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
