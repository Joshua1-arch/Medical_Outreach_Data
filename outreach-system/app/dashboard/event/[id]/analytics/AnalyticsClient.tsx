'use client';

import { useEffect, useState } from 'react';
import { generateSmartInsight } from '@/lib/analytics';
import { generateMedicalReport } from '@/app/dashboard/actions';
import { Button } from '@/components/ui/Button';
import {
    Users, Activity, Clock, Info, Loader2, AlertCircle, Sparkles, Bot, Download
} from 'lucide-react';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import ReactMarkdown from 'react-markdown';

export default function AnalyticsClient({ eventId }: { eventId: string }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // AI State
    const [aiReport, setAiReport] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/events/${eventId}/analytics`);
                const json = await res.json();
                if (json.success) {
                    setData(json);
                } else {
                    setError(json.message);
                }
            } catch (err) {
                setError('Failed to load analytics');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [eventId]);

    const handleAnalyze = async () => {
        if (!data) return;
        setAnalyzing(true);
        // Pass relevant data to AI
        const res = await generateMedicalReport({
            kpis: data.kpis,
            fields: data.fields.map((f: any) => ({
                label: f.label,
                type: f.type,
                stats: f.stats,
                data: f.type === 'categorical' ? f.data : undefined
            }))
        });

        if (res.success && res.report) {
            setAiReport(res.report);
        } else {
            alert(res.message || 'Failed to analyze');
        }
        setAnalyzing(false);
    };

    const handleDownloadReport = () => {
        if (!aiReport) return;
        const blob = new Blob([aiReport], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Medical_Report_${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-emerald-600" size={32} />
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center min-h-[400px] text-red-500 gap-2">
            <AlertCircle size={24} /> {error}
        </div>
    );

    if (!data) return null;

    // Helper for Time Ago
    const timeAgo = (dateStr: string) => {
        if (!dateStr) return 'Never';
        const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    // Color Logic
    const getColor = (name: string, index: number) => {
        const n = name.toLowerCase();
        if (n.includes('positive') || n.includes('reactive')) return '#ef4444'; // Red
        if (n.includes('negative') || n.includes('non-reactive')) return '#22c55e'; // Green

        const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899'];
        return COLORS[index % COLORS.length];
    };

    return (
        <div className="space-y-8">
            {/* ACTION BAR */}
            <div className="flex justify-between items-center">
                <p className="text-slate-500 text-sm">Last updated: Just now</p>
                <Button
                    onClick={handleAnalyze}
                    isLoading={analyzing}
                    className="flex items-center gap-2"
                >
                    <Sparkles size={18} /> Analyze with AI
                </Button>
            </div>

            {/* AI REPORT SECTION */}
            {aiReport && (
                <div className="bg-brand-cream border border-brand-gold/20 rounded-xl p-8 mb-8 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-brand-gold/10 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white text-brand-gold rounded-lg shadow-sm border border-brand-cream">
                                <Bot size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold font-serif text-brand-dark">Chief Medical Officer's Report</h2>
                                <p className="text-sm text-brand-dark/70">AI-generated insights based on aggregate population data.</p>
                            </div>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={handleDownloadReport}
                            title="Download Report"
                        >
                            <Download size={20} /> <span className="hidden sm:inline">Download</span>
                        </Button>
                    </div>
                    <div className="prose prose-indigo max-w-none text-slate-700">
                        <ReactMarkdown>{aiReport}</ReactMarkdown>
                    </div>
                </div>
            )}

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-brand-cream text-brand-dark rounded-lg">
                        <Users size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Patients</p>
                        <h3 className="text-3xl font-serif font-bold text-brand-dark">{data.kpis.totalPatients}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-brand-cream text-brand-gold rounded-lg">
                        <Activity size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Completion Rate</p>
                        <h3 className="text-3xl font-serif font-bold text-brand-dark">{data.kpis.completionRate}%</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-brand-cream text-brand-dark/80 rounded-lg">
                        <Clock size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Last Entry</p>
                        <h3 className="text-2xl font-serif font-bold text-brand-dark">{timeAgo(data.kpis.lastEntry)}</h3>
                    </div>
                </div>
            </div>

            {/* DYNAMIC GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.fields.map((field: any, i: number) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                        <div className="p-5 border-b border-slate-50">
                            <h3 className="font-bold text-slate-800 truncate" title={field.label}>{field.label}</h3>
                            <p className="text-xs text-slate-400 uppercase font-semibold mt-1">{field.type}</p>
                        </div>

                        <div className="p-6 flex-1 flex items-center justify-center min-h-[200px]">
                            {field.type === 'categorical' ? (
                                <div className="w-full h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={field.data}
                                                innerRadius={50}
                                                outerRadius={70}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {field.data.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={getColor(entry.name, index)} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="text-center w-full">
                                    {field.stats ? (
                                        <>
                                            <h2 className="text-4xl font-extrabold text-slate-800 mb-2">
                                                {Math.round(field.stats.average)} <span className="text-sm text-slate-400 font-normal">avg</span>
                                            </h2>
                                            <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden relative">
                                                {/* Visual Range bar placeholder: Width relative to 200 (arbitrary max) or just static visual */}
                                                <div className="bg-emerald-500 h-full w-1/2 mx-auto rounded-full opacity-50"></div>
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-500 mt-2 px-4">
                                                <span>Min: {field.stats.min}</span>
                                                <span>Max: {field.stats.max}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-slate-400">No data collected</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* INSIGHT FOOTER */}
                        <div className="p-4 bg-brand-cream/30 border-t border-slate-100 flex gap-3">
                            <Info className="text-brand-gold flex-shrink-0 mt-0.5" size={16} />
                            <p className="text-sm text-slate-600 leading-snug font-medium">
                                {generateSmartInsight(field)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
