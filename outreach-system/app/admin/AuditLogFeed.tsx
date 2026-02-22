import dbConnect from "@/lib/db";
import AuditLog from "@/models/AuditLog";
import {
    User as UserIcon, Calendar, Activity, Trash2, CheckCircle,
    UserPlus, RefreshCw, FileText, Edit
} from 'lucide-react';
import User from "@/models/User";
import Link from "next/link";

function formatActionName(action: string) {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

function getIconStyle(action: string): { icon: React.ElementType; bg: string; color: string } {
    if (action.includes('USER_APPROVED') || action.includes('APPROVE')) return { icon: CheckCircle, bg: 'bg-green-100', color: 'text-green-600' };
    if (action.includes('USER') && action.includes('CREAT')) return { icon: UserPlus, bg: 'bg-blue-100', color: 'text-blue-600' };
    if (action.includes('USER')) return { icon: UserIcon, bg: 'bg-blue-100', color: 'text-blue-600' };
    if (action.includes('EVENT')) return { icon: Calendar, bg: 'bg-yellow-100', color: 'text-yellow-600' };
    if (action.includes('DELETE') || action.includes('DELET')) return { icon: Trash2, bg: 'bg-red-100', color: 'text-red-600' };
    if (action.includes('REPORT')) return { icon: FileText, bg: 'bg-purple-100', color: 'text-purple-600' };
    if (action.includes('UPDATE') || action.includes('EDIT')) return { icon: Edit, bg: 'bg-amber-100', color: 'text-amber-600' };
    if (action.includes('SYSTEM') || action.includes('REFRESH')) return { icon: RefreshCw, bg: 'bg-emerald-100', color: 'text-emerald-600' };
    return { icon: Activity, bg: 'bg-slate-100', color: 'text-slate-500' };
}

export default async function AuditLogFeed() {
    await dbConnect();
    const _ = User; // ensure model is registered for population

    const logs = await AuditLog.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('performedBy', 'name email');

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">System Activity Log</h3>
                <Link
                    href="/admin/users"
                    className="text-sm font-bold text-[#fbc037] hover:underline"
                >
                    View Full Log
                </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/70 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                            <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Performed By</th>
                            <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                            <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">
                                    No activity recorded yet.
                                </td>
                            </tr>
                        ) : (
                            logs.map((log: any) => {
                                const { icon: Icon, bg, color } = getIconStyle(log.action);
                                const date = new Date(log.createdAt);
                                return (
                                    <tr key={log._id.toString()} className="hover:bg-slate-50/50 transition-colors">
                                        {/* Action */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${bg} ${color}`}>
                                                    <Icon size={16} />
                                                </div>
                                                <span className="font-bold text-slate-700 whitespace-nowrap">
                                                    {formatActionName(log.action)}
                                                </span>
                                            </div>
                                        </td>

                                        {/* User */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="size-8 rounded-full bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold shrink-0 uppercase">
                                                    {log.performedBy?.name?.charAt(0) ?? '?'}
                                                </div>
                                                <span className="font-medium text-slate-600 whitespace-nowrap">
                                                    {log.performedBy?.name || 'System'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700 whitespace-nowrap text-xs">
                                                    {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
                                                    {date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Details expandable */}
                                        <td className="px-6 py-4">
                                            {log.details && Object.keys(log.details).length > 0 ? (
                                                <details className="text-xs cursor-pointer group">
                                                    <summary className="text-slate-400 hover:text-[#fbc037] font-bold transition-colors list-none">
                                                        View
                                                    </summary>
                                                    <pre className="mt-2 bg-slate-50 p-2 rounded border border-slate-100 overflow-x-auto text-[10px] text-slate-600 max-w-xs">
                                                        {JSON.stringify(log.details, null, 2)}
                                                    </pre>
                                                </details>
                                            ) : (
                                                <span className="text-slate-300 text-xs">—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
